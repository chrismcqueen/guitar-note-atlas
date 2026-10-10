import { normalizePitchClass } from "./music.mjs";

export const MIN_TEMPO = 40;
export const MAX_TEMPO = 240;
export const DEFAULT_TEMPO = 100;
export const DEFAULT_NOTE_RATE = "quarter";
export const NOTE_RATES = [
  // Opus Text maps these characters to stemmed notes and augmentation dots.
  { beats: 0.25, id: "sixteenth", label: "1/16", notation: "x", name: "Sixteenth note" },
  { beats: 1 / 3, id: "eighth-triplet", label: "1/8T", notation: "e", name: "Eighth-note triplet", triplet: true },
  { beats: 0.5, id: "eighth", label: "1/8", notation: "e", name: "Eighth note" },
  { beats: 0.75, id: "dotted-eighth", label: "1/8.", notation: "e.", name: "Dotted eighth note" },
  { beats: 1, id: "quarter", label: "1/4", notation: "q", name: "Quarter note" },
  { beats: 1.5, id: "dotted-quarter", label: "1/4.", notation: "q.", name: "Dotted quarter note" },
  { beats: 2, id: "half", label: "1/2", notation: "h", name: "Half note" },
  { beats: 3, id: "dotted-half", label: "1/2.", notation: "h.", name: "Dotted half note" },
];

export const clampTempo = (tempo) => Math.max(
  MIN_TEMPO,
  Math.min(MAX_TEMPO, Math.round(Number(tempo) || DEFAULT_TEMPO)),
);

export const buildScaleSequence = (degrees = [], keyOffset = 0) => {
  const rootSample = 8 + normalizePitchClass(keyOffset);
  const ascending = [...new Set(degrees.map((degree) => Math.floor(degree)))]
    .sort((a, b) => a - b)
    .map((degree) => ({
      pitchClass: normalizePitchClass(keyOffset + degree),
      sample: rootSample + degree,
    }));

  if (ascending.length === 0) return [];

  const octave = { pitchClass: normalizePitchClass(keyOffset), sample: rootSample + 12 };
  return [...ascending, octave, ...ascending.slice().reverse()];
};

export const millisecondsPerBeat = (tempo) => 60000 / clampTempo(tempo);

export const tempoFromTapTimes = (tapTimes = []) => {
  if (tapTimes.length < 2) return null;
  const recentTimes = tapTimes.slice(-6);
  const intervals = recentTimes.slice(1).map((time, index) => time - recentTimes[index]);
  if (intervals.some((interval) => interval <= 0)) return null;
  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return clampTempo(60000 / averageInterval);
};

export const normalizeNoteRate = (rate) => (
  NOTE_RATES.some(({ id }) => id === rate) ? rate : DEFAULT_NOTE_RATE
);

export const millisecondsPerNote = (tempo, rate = DEFAULT_NOTE_RATE) => {
  const normalizedRate = normalizeNoteRate(rate);
  const { beats } = NOTE_RATES.find(({ id }) => id === normalizedRate);
  return millisecondsPerBeat(tempo) * beats;
};

export const normalizePlaybackIndex = (index, sequenceLength, looping) => {
  if (index < sequenceLength) return index;
  if (!looping || sequenceLength <= 1) return looping ? 0 : sequenceLength;

  // The sequence ends on the same low root it starts on. A looping pass has
  // already sounded that root, so resume on the second note at the turnaround.
  return 1 + ((index - sequenceLength) % (sequenceLength - 1));
};
