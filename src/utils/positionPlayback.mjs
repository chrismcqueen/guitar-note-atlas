import { normalizePitchClass } from "./music.mjs";
import { resolvedPositionFret } from "./positions.mjs";

export const LEGACY_DEGREE_ID = { 0: 0, 1: 1, 2: 2, 3: 3, 3.1: 12, 4: 4, 5: 5, 6: 6, 6.1: 13, 7: 7, 8: 8, 8.1: 14, 9: 9, 10: 10, 11: 11 };
const GUITAR_TUNING = [64, 59, 55, 50, 45, 40];
const BASS_TUNING = [43, 38, 33, 28];

// Shared by drawing and playback. x/y identify a location before handedness
// and upside-down transforms; grey notes are still part of the position.
export const getPositionNotes = (coordinates, degrees = [], keyOffset = 0, positionId = 0, positionFret = null, bassMode = false) => {
  const startFret = resolvedPositionFret(positionId, positionFret, keyOffset);
  const notes = degrees.flatMap((degree) => (coordinates[LEGACY_DEGREE_ID[degree]]?.[positionId] ?? []).flatMap((coordinate, index) => {
    if ((!bassMode && coordinate.y === 6) || (bassMode && coordinate.y < 2)) return [];
    const stringIndex = bassMode ? (coordinate.y === 6 ? 0 : coordinate.y - 2) : coordinate.y;
    const fret = startFret + coordinate.x + 1;
    const midi = (bassMode ? BASS_TUNING : GUITAR_TUNING)[stringIndex] + fret;
    const pitchClass = normalizePitchClass(midi);
    // Existing samples span MIDI 48–72. Reuse the nearest octave of that
    // pitch with pitch correction off, preserving the position's register.
    let sample = midi - 40;
    while (sample < 8) sample += 12;
    while (sample > 32) sample -= 12;
    return [{ ...coordinate, degree, fret, key: `${degree}-${index}`, midi, pitchClass, sample,
      playbackRate: 2 ** ((midi - (sample + 40)) / 12),
      location: `${positionId}:${startFret}:${coordinate.x}:${coordinate.y}`, stringIndex }];
  }));
  return [...new Map(notes.map((note) => [note.location, note])).values()];
};

export const buildPositionSequence = (positionNotes = [], keyOffset = 0, startOnRoot = true) => {
  // For unisons, choose one deterministic fingering on the lower string.
  const unisons = new Map();
  positionNotes.slice().sort((a, b) => a.midi - b.midi || b.stringIndex - a.stringIndex || a.x - b.x).forEach((note) => {
    if (!unisons.has(note.midi)) unisons.set(note.midi, note);
  });
  const ascending = [...unisons.values()];
  if (!ascending.length) return { notes: [], loopStart: 0, oneShotLength: 0 };
  const rootIndex = startOnRoot ? ascending.findIndex((note) => note.pitchClass === normalizePitchClass(keyOffset)) : 0;
  const start = Math.max(0, rootIndex); // Custom selections may exclude the root.
  const descent = ascending.slice(0, -1).reverse();
  const intro = [...ascending.slice(start), ...descent];
  const cycle = ascending.length === 1 ? ascending : [...ascending.slice(1), ...descent];
  return { notes: [...intro, ...cycle], loopStart: intro.length, oneShotLength: intro.length };
};

export const playbackNoteAt = (plan, index, looping) => {
  if (!plan.notes.length || (!looping && index >= plan.oneShotLength)) return null;
  const normalized = index < plan.notes.length ? index : plan.loopStart + (index - plan.loopStart) % (plan.notes.length - plan.loopStart);
  return plan.notes[normalized];
};

export const practiceAudioMode = ({ notesEnabled, overview, accompaniment }) => ({
  notesEnabled: notesEnabled && !overview,
  // The overview gives the player a pulse without sounding an unseen position.
  accompaniment: overview && accompaniment === "off" ? "metronome" : accompaniment,
});
