import { millisecondsPerBeat, NOTE_RATES, normalizeNoteRate } from './audioSequence.mjs';
import { playbackNoteAt } from './positionPlayback.mjs';

const TICKS_PER_BEAT = 12;
const subdivisionTicks = config => Math.round(
  NOTE_RATES.find(rate => rate.id === normalizeNoteRate(config.noteRate)).beats * TICKS_PER_BEAT,
);

// Notes and accompaniment derive timestamps from the same integer musical grid.
// Twelve ticks per beat represent every supported subdivision exactly.
export class PracticeTimeline {
  start(time, config, count = true, index = 0) {
    this.config = config;
    this.anchorTime = time;
    this.anchorTick = 0;
    this.secondsPerTick = millisecondsPerBeat(config.tempo) / (1000 * TICKS_PER_BEAT);
    this.countBeats = count && config.countIn ? 4 : 0;
    this.beatTick = 0;
    this.noteTick = this.countBeats * TICKS_PER_BEAT;
    this.index = index;
    this.lastTick = -1;
    this.pending = null;
    this.active = true;
  }

  timeAt(tick) {
    return this.anchorTime + (tick - this.anchorTick) * this.secondsPerTick;
  }

  get nextBeat() { return this.timeAt(this.beatTick); }
  get nextNote() { return this.timeAt(this.noteTick); }

  configure(config, now, reset = false) {
    const earliest = Math.max(
      this.lastTick + 1,
      this.anchorTick + (now + 0.025 - this.anchorTime) / this.secondsPerTick,
    );
    // Both lanes adopt the latest settings at one unscheduled whole beat.
    this.pending = {
      config,
      tick: Math.ceil(earliest / TICKS_PER_BEAT) * TICKS_PER_BEAT,
      reset: reset || this.pending?.reset,
    };
  }

  events(now, horizon) {
    const events = [];
    while (this.active) {
      const config = this.config;
      const tick = Math.min(
        this.beatTick,
        config.notesEnabled ? this.noteTick : Infinity,
        this.pending?.tick ?? Infinity,
      );
      const time = this.timeAt(tick);
      if (time >= horizon) break;

      if (this.pending && tick === this.pending.tick) {
        const { config: next, reset } = this.pending;
        this.pending = null;
        this.anchorTime = time;
        this.anchorTick = tick;
        this.secondsPerTick = millisecondsPerBeat(next.tempo) / (1000 * TICKS_PER_BEAT);
        this.config = next;
        this.beatTick = Math.max(this.beatTick, tick);
        if (reset) {
          this.index = 0;
          this.countBeats = 0;
        }
        const changedNotes = reset || config.noteRate !== next.noteRate || config.tempo !== next.tempo
          || config.notesEnabled !== next.notesEnabled || config.accompaniment !== next.accompaniment;
        if (changedNotes) this.noteTick = Math.max(tick, this.countBeats * TICKS_PER_BEAT);
        events.push({ kind: 'change', time, config: next, fadeNotes: changedNotes });
        continue;
      }

      this.lastTick = tick;
      const late = time < now - 0.03;
      if (tick === this.beatTick) {
        const beat = tick / TICKS_PER_BEAT;
        if (!late) events.push({ kind: 'beat', time, beat, count: beat < this.countBeats ? this.countBeats - beat : 0, config });
        this.beatTick += TICKS_PER_BEAT;
      }
      if (config.notesEnabled && tick === this.noteTick) {
        const note = playbackNoteAt(config.plan, this.index, config.loop);
        if (!note) {
          events.push({ kind: 'end', time });
          this.active = false;
          break;
        }
        if (!late) events.push({ kind: 'note', time, note, index: this.index, duration: subdivisionTicks(config) * this.secondsPerTick, config });
        this.index++;
        this.noteTick += subdivisionTicks(config);
      }
    }
    return events;
  }
}
