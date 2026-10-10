import { millisecondsPerNote } from './audioSequence.mjs';
import { PracticeTimeline } from './practiceTimeline.mjs';
import { renderNotePcm } from './notePcm.mjs';
import { clampVolume, DRUM_LEVELS, MASTER_VOLUME, NOTE_LEVEL } from './audioMix.mjs';

const LEAD = 0.1;
const STOP_FADE = 0.012;
const IDLE_DELAY_MS = 50;
const VOLUMES = DRUM_LEVELS;
const renderedKey = (key, rate, duration, volume) => `${key}:${rate}:${duration === undefined ? 'full' : Math.round(duration * 1e6)}:${volume}`;
const displayFrames = {
  request: callback => typeof globalThis.requestAnimationFrame === 'function'
    ? globalThis.requestAnimationFrame(callback) : setTimeout(callback, 16),
  cancel: id => typeof globalThis.cancelAnimationFrame === 'function'
    ? globalThis.cancelAnimationFrame(id) : clearTimeout(id),
};

export class NativeAudioTransport {
  constructor(AudioContext, AudioManager, callbacks, frames = displayFrames) {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = MASTER_VOLUME;
    this.masterGain.connect(this.context.destination);
    this.notesGain = this.context.createGain();
    this.accompanimentGain = this.context.createGain();
    this.volumeRamps = new Map();
    for (const gain of [this.notesGain, this.accompanimentGain]) {
      gain.gain.value = 1;
      gain.connect(this.masterGain);
      this.volumeRamps.set(gain, { from: 1, to: 1, start: 0, end: 0 });
    }
    this.audioManager = AudioManager;
    this.sessionReady = null;
    this.callbacks = callbacks;
    this.buffers = new Map();
    this.rendered = new Map();
    this.sources = new Map();
    this.frames = frames;
    this.visualEvents = [];
    this.visualNote = null;
    this.visualNoteEnd = -Infinity;
    this.visualCount = 0;
    this.visualRun = 0;
    this.visualFrame = null;
    this.timeline = new PracticeTimeline();
    this.idleTimer = null;
    this.idleSuspension = Promise.resolve();
    this.active = false;
    this.tapRun = 0;
    this.closed = false;
    this.audibleIndex = 0;
    this.config = { plan: { notes: [] }, loop: true, tempo: 100, noteRate: 'quarter', notesEnabled: true, accompaniment: 'off', countIn: true };
  }

  async preload(entries, config = this.config) {
    await Promise.all(entries.map(async ([key, source]) => {
      if (!this.buffers.has(key)) this.buffers.set(key, await this.context.decodeAudioData(source));
    }));
    this.prepare(config);
  }

  async load(entries, config = this.config) {
    this.cancelIdleSuspension();
    this.sessionReady ??= this.audioManager.setAudioSessionActivity(true);
    await this.sessionReady;
    // If a previous Stop is already suspending the driver, finish that first
    // so its completion cannot suspend the next playback run.
    await this.idleSuspension;
    await this.context.resume();
    await this.preload(entries, config);
  }

  prepared(key, volume, duration, rate = 1) {
    const original = this.buffers.get(key);
    if (!original) return null;
    const id = renderedKey(key, rate, duration, volume);
    if (!this.rendered.has(id)) {
      this.rendered.set(id, renderNotePcm(this.context, original, rate, duration, volume));
      if (this.rendered.size > 100) this.rendered.delete(this.rendered.keys().next().value);
    }
    return this.rendered.get(id);
  }

  prepare(config) {
    for (const [key, volume] of Object.entries(VOLUMES)) this.prepared(`drum:${key}`, volume);
    if (config.notesEnabled) {
      const duration = millisecondsPerNote(config.tempo, config.noteRate) / 1000;
      const volume = NOTE_LEVEL;
      for (const note of config.plan.notes) this.prepared(`guitar:${note.sample}`, volume, duration, note.playbackRate);
    }
  }

  configure(config, resetPosition = false) {
    this.prepare(config);
    this.config = config;
    this.setVolumes(config);
    if (this.active) this.timeline.configure(config, this.context.currentTime, resetPosition);
    else if (resetPosition) this.audibleIndex = 0;
  }

  setVolumes(config) {
    const now = this.context.currentTime;
    for (const [gain, value] of [[this.notesGain, config.notesVolume], [this.accompanimentGain, config.accompanimentVolume]]) {
      const target = clampVolume(value);
      const previous = this.volumeRamps.get(gain);
      if (target === previous.to) continue;
      const fraction = previous.end <= previous.start ? 1 : Math.max(0, Math.min(1, (now - previous.start) / (previous.end - previous.start)));
      const current = previous.from + (previous.to - previous.from) * fraction;
      gain.gain.cancelScheduledValues(now);
      if (!this.active && this.sources.size === 0) {
        gain.gain.setValueAtTime(target, now);
        this.volumeRamps.set(gain, { from: target, to: target, start: now, end: now });
      } else {
        // Preserve the current interpolated level when replacing a live ramp.
        gain.gain.setValueAtTime(current, now);
        gain.gain.linearRampToValueAtTime(target, now + 0.02);
        this.volumeRamps.set(gain, { from: current, to: target, start: now, end: now + 0.02 });
      }
    }
  }

  get nextBeat() { return this.timeline.nextBeat; }
  get nextNote() { return this.timeline.nextNote; }
  get countBeats() { return this.timeline.countBeats; }
  get origin() { return this.timeline.anchorTime; }

  async tapClick() {
    if (this.closed || !this.buffers.has('drum:click')) return;
    const run = this.tapRun;
    this.cancelIdleSuspension();
    if (!this.active) {
      this.sessionReady ??= this.audioManager.setAudioSessionActivity(true);
      await this.sessionReady;
      await this.idleSuspension;
      if (run !== this.tapRun || this.closed) return;
      if (this.context.state !== 'running') await this.context.resume();
    }
    if (run !== this.tapRun || this.closed) return;
    // An immediate one-shot uses the existing click buffer without starting
    // or re-anchoring the practice timeline or updating its visual count.
    const duration = this.buffer('drum:click', this.context.currentTime, VOLUMES.click);
    if (!this.active && duration !== null) {
      this.cancelIdleSuspension();
      this.idleTimer = setTimeout(() => {
        this.idleTimer = null;
        if (!this.active) this.idleSuspension = this.context.suspend().catch(() => {});
      }, duration * 1000 + IDLE_DELAY_MS);
    }
  }

  buffer(key, when, volume, duration, rate = 1) {
    const buffer = this.prepared(key, volume, duration, rate);
    if (!buffer) return null;
    const source = this.context.createBufferSource();
    const release = this.context.createGain();
    release.gain.value = 1;
    source.buffer = buffer;
    source.connect(release);
    release.connect(key.startsWith('guitar:') ? this.notesGain : this.accompanimentGain);
    source.onEnded = () => {
      this.sources.delete(source);
      source.onEnded = null;
      source.disconnect();
      release.disconnect();
    };
    source.start(when);
    this.sources.set(source, { release, when, end: when + buffer.duration, key });
    return buffer.duration;
  }

  syncVisuals() {
    if (!this.active) return;
    const now = this.context.currentTime;
    let note = this.visualNote;
    let count = this.visualCount;
    // A delayed frame catches up directly to the sounding note. Never replay
    // obsolete highlights, or let a JS timer advance ahead of the audio clock.
    while (this.visualEvents.length && this.visualEvents[0].time <= now) {
      const event = this.visualEvents.shift();
      if (event.kind === 'note') {
        note = event.note;
        this.visualNoteEnd = event.end;
        this.audibleIndex = event.index + 1;
      } else if (event.kind === 'beat') count = event.count > 0 ? 5 - event.count : 0;
      else if (event.kind === 'change' && event.fadeNotes) note = null;
      else if (event.kind === 'end') {
        this.stop();
        this.callbacks.onEnded();
        return;
      }
    }
    if (now >= this.visualNoteEnd) note = null;
    if (note !== this.visualNote) { this.visualNote = note; this.callbacks.onNote(note); }
    if (count !== this.visualCount) { this.visualCount = count; this.callbacks.onCount?.(count); }
  }

  startVisuals() {
    const run = ++this.visualRun;
    const frame = () => {
      if (!this.active || run !== this.visualRun) return;
      this.syncVisuals();
      if (this.active && run === this.visualRun) this.visualFrame = this.frames.request(frame);
    };
    this.visualFrame = this.frames.request(frame);
  }

  start(count = true) {
    if (this.active) return;
    this.cancelIdleSuspension();
    this.active = true;
    this.timeline.start(this.context.currentTime + LEAD, this.config, count, this.audibleIndex);
    this.callbacks.onNote(null);
    this.tick();
    this.startVisuals();
    this.scheduler = setInterval(() => this.tick(), 40);
  }

  fadeVoices(when, predicate = () => true) {
    this.sources.forEach((voice, source) => {
      const { release, when: start, end, key, fadeAt = Infinity } = voice;
      if (!predicate(key) || end <= when || fadeAt <= when) return;
      voice.fadeAt = when;
      if (start <= when) {
        // An earlier stop can replace a future release, but an ongoing release
        // must never jump back to full volume when Stop follows Pause.
        release.gain.cancelScheduledValues(when);
        release.gain.setValueAtTime(1, when);
        release.gain.linearRampToValueAtTime(0, when + STOP_FADE);
        source.stop(when + STOP_FADE + 0.005);
      } else source.stop(when);
    });
  }

  tick() {
    if (!this.active) return;
    const now = this.context.currentTime;
    for (const event of this.timeline.events(now, now + 0.25)) {
      const { time, config } = event;
      if (event.kind === 'change') {
        this.fadeVoices(time, key => key.startsWith('guitar:') ? event.fadeNotes : config.accompaniment !== 'drums');
        this.visualEvents.push(event);
      } else if (event.kind === 'beat') {
        if (event.count || config.accompaniment === 'metronome') this.buffer('drum:click', time, VOLUMES.click);
        else if (config.accompaniment === 'drums') {
          this.buffer('drum:hat', time, VOLUMES.hat);
          if ((event.beat - this.timeline.countBeats) % 4 === 0) this.buffer('drum:kick', time, VOLUMES.kick);
          if ((event.beat - this.timeline.countBeats) % 4 === 2) this.buffer('drum:snare', time, VOLUMES.snare);
        }
        this.visualEvents.push(event);
      } else if (event.kind === 'note') {
        const duration = this.buffer(`guitar:${event.note.sample}`, time, NOTE_LEVEL, event.duration, event.note.playbackRate);
        if (duration !== null) this.visualEvents.push({ ...event, end: time + duration });
      } else if (event.kind === 'end') {
        this.visualEvents.push(event);
      }
    }
  }

  cancel() {
    this.tapRun++;
    clearInterval(this.scheduler);
    this.scheduler = null;
    this.fadeVoices(this.context.currentTime);
    this.visualRun++;
    if (this.visualFrame !== null) this.frames.cancel(this.visualFrame);
    this.visualFrame = null;
    this.visualEvents.length = 0;
    this.visualNote = null;
    this.visualNoteEnd = -Infinity;
    this.visualCount = 0;
    this.callbacks.onNote(null);
    this.callbacks.onCount?.(0);
  }

  cancelIdleSuspension() {
    clearTimeout(this.idleTimer);
    this.idleTimer = null;
  }

  pause() {
    this.active = false;
    this.timeline.active = false;
    this.cancel();
    this.audibleIndex = 0;
    this.cancelIdleSuspension();
    // Let the release reach silence before retiring the real-time output.
    this.idleTimer = setTimeout(() => {
      this.idleTimer = null;
      if (!this.active) this.idleSuspension = this.context.suspend().catch(() => {});
    }, IDLE_DELAY_MS);
  }
  stop() { this.pause(); }
  async close() {
    this.closed = true;
    this.stop();
    this.cancelIdleSuspension();
    await this.idleSuspension;
    await this.context.close();
    this.sources.clear();
    this.rendered.clear();
  }
}
