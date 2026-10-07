import { millisecondsPerNote } from './audioSequence.mjs';
import { PracticeTimeline } from './practiceTimeline.mjs';
import { renderNotePcm } from './notePcm.mjs';

const LEAD = 0.1;
const STOP_FADE = 0.012;
const IDLE_DELAY_MS = 50;
const VOLUMES = { hat: 0.08, kick: 0.48, snare: 0.45, click: 0.3 };
const renderedKey = (key, rate, duration, volume) => `${key}:${rate}:${duration === undefined ? 'full' : Math.round(duration * 1e6)}:${volume}`;

export class NativeAudioTransport {
  constructor(AudioContext, AudioManager, callbacks) {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.8;
    this.masterGain.connect(this.context.destination);
    this.audioManager = AudioManager;
    this.sessionReady = null;
    this.callbacks = callbacks;
    this.buffers = new Map();
    this.rendered = new Map();
    this.sources = new Map();
    this.timers = new Set();
    this.timeline = new PracticeTimeline();
    this.idleTimer = null;
    this.idleSuspension = Promise.resolve();
    this.active = false;
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
      const volume = config.accompaniment === 'drums' ? 0.64 : 0.92;
      for (const note of config.plan.notes) this.prepared(`guitar:${note.sample}`, volume, duration, note.playbackRate);
    }
  }

  configure(config, resetPosition = false) {
    this.prepare(config);
    this.config = config;
    if (this.active) this.timeline.configure(config, this.context.currentTime, resetPosition);
    else if (resetPosition) this.audibleIndex = 0;
  }

  get nextBeat() { return this.timeline.nextBeat; }
  get nextNote() { return this.timeline.nextNote; }
  get countBeats() { return this.timeline.countBeats; }
  get origin() { return this.timeline.anchorTime; }

  buffer(key, when, volume, duration, rate = 1) {
    const buffer = this.prepared(key, volume, duration, rate);
    if (!buffer) return;
    const source = this.context.createBufferSource();
    const release = this.context.createGain();
    release.gain.value = 1;
    source.buffer = buffer;
    source.connect(release);
    release.connect(this.masterGain);
    source.onEnded = () => {
      this.sources.delete(source);
      source.onEnded = null;
      source.disconnect();
      release.disconnect();
    };
    source.start(when);
    this.sources.set(source, { release, when, end: when + buffer.duration, key });
  }

  visual(task, when) {
    const timer = setTimeout(() => { this.timers.delete(timer); task(); }, Math.max(0, (when - this.context.currentTime) * 1000));
    this.timers.add(timer);
  }

  start(count = true) {
    if (this.active) return;
    this.cancelIdleSuspension();
    this.active = true;
    this.timeline.start(this.context.currentTime + LEAD, this.config, count, this.audibleIndex);
    this.callbacks.onNote(null);
    this.tick();
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
        this.visual(() => { if (!config.notesEnabled) this.callbacks.onNote(null); }, time);
      } else if (event.kind === 'beat') {
        if (event.count || config.accompaniment === 'metronome') this.buffer('drum:click', time, VOLUMES.click);
        else if (config.accompaniment === 'drums') {
          this.buffer('drum:hat', time, VOLUMES.hat);
          if ((event.beat - this.timeline.countBeats) % 4 === 0) this.buffer('drum:kick', time, VOLUMES.kick);
          if ((event.beat - this.timeline.countBeats) % 4 === 2) this.buffer('drum:snare', time, VOLUMES.snare);
        }
        this.visual(() => this.callbacks.onCount?.(event.count), time);
      } else if (event.kind === 'note') {
        this.buffer(`guitar:${event.note.sample}`, time, config.accompaniment === 'drums' ? 0.64 : 0.92, event.duration, event.note.playbackRate);
        this.visual(() => { this.audibleIndex = event.index + 1; this.callbacks.onNote(event.note); }, time);
      } else if (event.kind === 'end') {
        this.visual(() => { this.stop(); this.callbacks.onEnded(); }, time);
      }
    }
  }

  cancel() {
    clearInterval(this.scheduler);
    this.scheduler = null;
    this.fadeVoices(this.context.currentTime);
    this.timers.forEach(clearTimeout);
    this.timers.clear();
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
    this.stop();
    this.cancelIdleSuspension();
    await this.idleSuspension;
    await this.context.close();
    this.sources.clear();
    this.rendered.clear();
  }
}
