import { millisecondsPerBeat, millisecondsPerNote, normalizePlaybackIndex } from "./audioSequence.mjs";
import { getNextGridTime } from "./audioClock.mjs";

const START_LEAD_SECONDS = 0.1;
const LOOKAHEAD_SECONDS = 0.25;
const SCHEDULER_INTERVAL_MS = 40;
const ATTACK_SECONDS = 0.004;
const RELEASE_SECONDS = 0.035;
// Guitar and up to two drum transients can coincide. Web Audio sums those
// floating-point signals before output, so leave enough shared headroom to
// prevent the Android/iOS hardware output from hard-clipping the mix.
const MASTER_VOLUME = 0.58;
const DRUM_VOLUMES = { hat: 0.12, kick: 0.58, snare: 0.52 };

export class NativeAudioTransport {
  constructor(AudioContext, AudioManager, { onNote, onNotesEnded }) {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = MASTER_VOLUME;
    this.masterGain.connect(this.context.destination);
    // Do not race decoding/playback against Android audio-focus acquisition.
    // The previous fire-and-forget activation could leave a healthy-looking
    // clock (and therefore note highlights) connected to a silent output.
    this.sessionReady = AudioManager.setAudioSessionActivity(true);
    this.onNote = onNote;
    this.onNotesEnded = onNotesEnded;
    this.buffers = new Map();
    this.sources = new Set();
    this.visualTimers = new Set();
    this.scheduler = null;
    this.notesActive = false;
    this.drumsActive = false;
    this.sequence = [];
    this.noteIndex = 0;
    this.drumBeat = 0;
    this.nextNoteTime = Infinity;
    this.nextDrumTime = Infinity;
    this.origin = null;
    this.tempo = 100;
    this.noteRate = "quarter";
    this.loop = true;
  }

  async load(entries) {
    await this.sessionReady;
    await this.context.resume();
    await Promise.all(entries.map(async ([key, source]) => {
      if (!this.buffers.has(key)) this.buffers.set(key, await this.context.decodeAudioData(source));
    }));
  }

  configure({ loop, noteRate, sequence, tempo }) {
    this.loop = loop;
    this.noteRate = noteRate;
    this.sequence = sequence;
    this.tempo = tempo;
  }

  scheduleBuffer(key, when, volume, duration) {
    const buffer = this.buffers.get(key);
    if (!buffer) return;

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(volume, when + ATTACK_SECONDS);
    source.connect(gain);
    gain.connect(this.masterGain);
    if (duration) {
      const end = when + Math.min(duration, buffer.duration);
      gain.gain.setValueAtTime(volume, Math.max(when, end - RELEASE_SECONDS));
      gain.gain.linearRampToValueAtTime(0, end);
      // Explicitly stop after the gain reaches zero. Passing a duration to
      // start() caused occasional hard buffer truncation/clicks on Android.
      source.start(when);
      source.stop(end + 0.005);
    } else {
      source.start(when);
    }
    this.sources.add(source);

    const cleanupDelay = Math.max(0, ((when - this.context.currentTime) + (duration || buffer.duration) + 0.1) * 1000);
    const cleanup = setTimeout(() => this.sources.delete(source), cleanupDelay);
    this.visualTimers.add(cleanup);
  }

  scheduleVisual(pitchClass, when) {
    const delay = Math.max(0, (when - this.context.currentTime) * 1000);
    const timer = setTimeout(() => {
      this.visualTimers.delete(timer);
      this.onNote(pitchClass);
    }, delay);
    this.visualTimers.add(timer);
  }

  tick = () => {
    const horizon = this.context.currentTime + LOOKAHEAD_SECONDS;
    const beatSeconds = millisecondsPerBeat(this.tempo) / 1000;
    const noteSeconds = millisecondsPerNote(this.tempo, this.noteRate) / 1000;

    while (this.notesActive && this.nextNoteTime < horizon) {
      const normalized = normalizePlaybackIndex(this.noteIndex, this.sequence.length, this.loop);
      if (normalized >= this.sequence.length || this.sequence.length === 0) {
        const endTime = this.nextNoteTime;
        this.notesActive = false;
        this.nextNoteTime = Infinity;
        const endTimer = setTimeout(() => {
          this.visualTimers.delete(endTimer);
          this.onNotesEnded();
        }, Math.max(0, (endTime - this.context.currentTime) * 1000));
        this.visualTimers.add(endTimer);
        break;
      }

      this.noteIndex = normalized;
      const note = this.sequence[this.noteIndex];
      this.scheduleBuffer(`guitar:${note.sample}`, this.nextNoteTime, 0.92, noteSeconds);
      this.scheduleVisual(note.pitchClass, this.nextNoteTime);
      this.noteIndex += 1;
      this.nextNoteTime += noteSeconds;
    }

    while (this.drumsActive && this.nextDrumTime < horizon) {
      this.scheduleBuffer("drum:hat", this.nextDrumTime, DRUM_VOLUMES.hat);
      if (this.drumBeat % 4 === 0) this.scheduleBuffer("drum:kick", this.nextDrumTime, DRUM_VOLUMES.kick);
      if (this.drumBeat % 4 === 2) this.scheduleBuffer("drum:snare", this.nextDrumTime, DRUM_VOLUMES.snare);
      this.drumBeat += 1;
      this.nextDrumTime += beatSeconds;
    }
  };

  ensureScheduler() {
    this.tick();
    if (!this.scheduler) this.scheduler = setInterval(this.tick, SCHEDULER_INTERVAL_MS);
  }

  startNotes() {
    const now = this.context.currentTime + START_LEAD_SECONDS;
    if (this.origin === null || (!this.notesActive && !this.drumsActive)) this.origin = now;
    const beatSeconds = millisecondsPerBeat(this.tempo) / 1000;
    this.nextNoteTime = this.drumsActive
      ? getNextGridTime(this.origin, now, beatSeconds * 4)
      : now;
    this.noteIndex = 0;
    this.notesActive = true;
    this.ensureScheduler();
  }

  startDrums() {
    const now = this.context.currentTime + START_LEAD_SECONDS;
    if (this.origin === null || (!this.notesActive && !this.drumsActive)) this.origin = now;
    const beatSeconds = millisecondsPerBeat(this.tempo) / 1000;
    this.nextDrumTime = this.notesActive ? getNextGridTime(this.origin, now, beatSeconds) : now;
    this.drumBeat = Math.max(0, Math.round((this.nextDrumTime - this.origin) / beatSeconds));
    this.drumsActive = true;
    this.ensureScheduler();
  }

  cancelScheduledAudio() {
    const now = this.context.currentTime;
    this.sources.forEach((source) => {
      try { source.stop(now); } catch (_error) {}
    });
    this.sources.clear();
    this.visualTimers.forEach(clearTimeout);
    this.visualTimers.clear();
  }

  stopNotes() {
    this.notesActive = false;
    this.nextNoteTime = Infinity;
    this.cancelScheduledAudio();
    if (this.drumsActive) {
      this.nextDrumTime = this.context.currentTime + START_LEAD_SECONDS;
      this.ensureScheduler();
    }
  }

  stopDrums() {
    this.drumsActive = false;
    this.nextDrumTime = Infinity;
    this.cancelScheduledAudio();
    if (this.notesActive) {
      this.nextNoteTime = this.context.currentTime + START_LEAD_SECONDS;
      this.ensureScheduler();
    }
  }

  restartActive() {
    const notes = this.notesActive;
    const drums = this.drumsActive;
    this.cancelScheduledAudio();
    this.origin = this.context.currentTime + START_LEAD_SECONDS;
    if (notes) {
      this.noteIndex = 0;
      this.nextNoteTime = this.origin;
    }
    if (drums) {
      this.drumBeat = 0;
      this.nextDrumTime = this.origin;
    }
    this.ensureScheduler();
  }

  async close() {
    this.notesActive = false;
    this.drumsActive = false;
    if (this.scheduler) clearInterval(this.scheduler);
    this.scheduler = null;
    this.cancelScheduledAudio();
    await this.context.close();
  }
}

export const createNativeAudioTransport = (callbacks) => {
  try {
    // A literal dynamic require keeps the native package in development and
    // production bundles, while allowing Expo Go to fall back when the native
    // module is unavailable.
    const { AudioContext, AudioManager } = require("react-native-audio-api");
    AudioManager.setAudioSessionOptions({
      iosCategory: "playback",
      iosMode: "default",
      iosOptions: ["mixWithOthers"],
    });
    return new NativeAudioTransport(AudioContext, AudioManager, callbacks);
  } catch (_error) {
    return null;
  }
};
