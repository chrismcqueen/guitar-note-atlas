import { normalizePitchClass } from "./music.mjs";

export const MIN_TEMPO = 40;
export const MAX_TEMPO = 240;
export const DEFAULT_TEMPO = 100;

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

export const normalizePlaybackIndex = (index, sequenceLength, looping) => {
  if (index < sequenceLength) return index;
  if (!looping || sequenceLength <= 1) return looping ? 0 : sequenceLength;

  // The sequence ends on the same low root it starts on. A looping pass has
  // already sounded that root, so resume on the second note at the turnaround.
  return 1 + ((index - sequenceLength) % (sequenceLength - 1));
};
