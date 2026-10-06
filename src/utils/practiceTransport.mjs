import { millisecondsPerBeat, millisecondsPerNote } from "./audioSequence.mjs";
import { playbackNoteAt } from "./positionPlayback.mjs";

const LEAD = 0.1;
const VOLUMES = { hat: 0.12, kick: 0.58, snare: 0.52 };

// The audio clock owns timing; timers only mirror the audible note in the UI.
export class NativeAudioTransport {
  constructor(AudioContext, AudioManager, callbacks) {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.58;
    this.masterGain.connect(this.context.destination);
    this.sessionReady = AudioManager.setAudioSessionActivity(true);
    this.callbacks = callbacks;
    this.buffers = new Map();
    this.sources = new Map();
    this.timers = new Set();
    this.scheduler = null;
    this.active = false;
    this.audibleIndex = 0;
    this.config = { plan: { notes: [] }, loop: true, tempo: 100, noteRate: "quarter", notesEnabled: true, accompaniment: "off", countIn: true };
  }

  async load(entries) {
    await this.sessionReady;
    await this.context.resume();
    await Promise.all(entries.map(async ([key, source]) => {
      if (!this.buffers.has(key)) this.buffers.set(key, await this.context.decodeAudioData(source));
    }));
  }

  configure(config, resetPosition = false) {
    this.config = config;
    if (resetPosition) this.audibleIndex = 0;
    if (this.active) {
      this.cancel();
      this.start(false, true);
    }
  }

  buffer(key, when, volume, duration, rate = 1) {
    const buffer = this.buffers.get(key);
    if (!buffer) return;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    source.playbackRate.value = rate;
    const length = Math.min(duration ?? buffer.duration / rate, buffer.duration / rate);
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(volume, when + 0.004);
    gain.gain.setValueAtTime(volume, Math.max(when + 0.004, when + length - 0.035));
    gain.gain.linearRampToValueAtTime(0, when + length);
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(when);
    source.stop(when + length + 0.005);
    this.sources.set(source, gain);
    this.visual(() => { this.sources.delete(source); source.disconnect(); gain.disconnect(); }, when + length + 0.1);
  }

  visual(task, when) {
    const timer = setTimeout(() => { this.timers.delete(timer); task(); }, Math.max(0, (when - this.context.currentTime) * 1000));
    this.timers.add(timer);
  }

  start(count = true, preserveClock = false) {
    this.active = true;
    this.ending = false;
    this.index = this.audibleIndex;
    this.beat = 0;
    const now = this.context.currentTime + LEAD;
    const beatSeconds = millisecondsPerBeat(this.config.tempo) / 1000;
    const previousOrigin = this.origin;
    this.origin = preserveClock && previousOrigin !== undefined ? previousOrigin : now;
    this.countBeats = count && this.config.countIn ? 4 : 0;
    if (preserveClock) this.beat = Math.max(0, Math.ceil((now - this.origin) / beatSeconds));
    this.nextBeat = this.origin + this.beat * beatSeconds;
    this.nextNote = this.nextBeat + this.countBeats * beatSeconds;
    this.callbacks.onNote(null);
    this.tick();
    if (!this.scheduler) this.scheduler = setInterval(() => this.tick(), 40);
  }

  tick() {
    if (!this.active || this.ending) return;
    const horizon = this.context.currentTime + 0.25;
    const { plan, tempo, noteRate, loop, notesEnabled, accompaniment } = this.config;
    const beatSeconds = millisecondsPerBeat(tempo) / 1000;
    const noteSeconds = millisecondsPerNote(tempo, noteRate) / 1000;
    const now = this.context.currentTime;
    if (this.nextBeat < now - 0.03) {
      const missed = Math.ceil((now - this.nextBeat) / beatSeconds);
      this.beat += missed;
      this.nextBeat += missed * beatSeconds;
    }
    if (this.nextNote < now - 0.03) {
      const missed = Math.ceil((now - this.nextNote) / noteSeconds);
      this.index += missed;
      this.nextNote += missed * noteSeconds;
    }
    while (this.nextBeat < horizon) {
      const counting = this.beat < this.countBeats;
      if (counting || accompaniment === "metronome") this.buffer("drum:hat", this.nextBeat, 0.35);
      else if (accompaniment === "drums") {
        this.buffer("drum:hat", this.nextBeat, VOLUMES.hat);
        if ((this.beat - this.countBeats) % 4 === 0) this.buffer("drum:kick", this.nextBeat, VOLUMES.kick);
        if ((this.beat - this.countBeats) % 4 === 2) this.buffer("drum:snare", this.nextBeat, VOLUMES.snare);
      }
      const remaining = counting ? this.countBeats - this.beat : 0;
      this.visual(() => this.callbacks.onCount?.(remaining), this.nextBeat);
      this.beat += 1;
      this.nextBeat += beatSeconds;
    }
    if (!notesEnabled) return;
    while (this.nextNote < horizon) {
      const note = playbackNoteAt(plan, this.index, loop);
      if (!note) {
        this.ending = true;
        this.visual(() => { this.stop(); this.callbacks.onEnded(); }, this.nextNote);
        break;
      }
      this.buffer(`guitar:${note.sample}`, this.nextNote, 0.92, noteSeconds, note.playbackRate);
      const index = this.index;
      this.visual(() => { this.audibleIndex = index + 1; this.callbacks.onNote(note); }, this.nextNote);
      this.index += 1;
      this.nextNote += noteSeconds;
    }
  }

  cancel() {
    if (this.scheduler) clearInterval(this.scheduler);
    this.scheduler = null;
    this.sources.forEach((gain, source) => { try { source.stop(this.context.currentTime); source.disconnect(); gain.disconnect(); } catch (_) {} });
    this.sources.clear();
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.callbacks.onNote(null);
    this.callbacks.onCount?.(0);
  }

  pause() { this.active = false; this.cancel(); }
  stop() { this.pause(); this.audibleIndex = 0; this.origin = undefined; }
  async close() { this.stop(); await this.context.close(); }
}
