export const DRUM_LEVELS = { hat: 0.08, kick: 0.48, snare: 0.45, click: 0.3 };

export const clampVolume = (value) => {
  if (value === null || value === undefined || value === '') return 1;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 1;
};

export const sourceMixVolume = (key, config, base = 1) => base * clampVolume(
  key.startsWith('guitar:') ? config.notesVolume : config.accompanimentVolume,
);

export const fallbackSourceVolume = (key, config) => sourceMixVolume(key, config,
  key.startsWith('guitar:') ? config.accompaniment === 'drums' ? 0.64 : 0.92 : DRUM_LEVELS[key.slice(5)] ?? 1,
);

// Mixer changes apply immediately without preparing notes or changing the grid.
export const hasPlaybackChanges = (previous, next) => Object.keys({ ...previous, ...next }).some(
  key => key !== 'notesVolume' && key !== 'accompanimentVolume' && previous[key] !== next[key],
);
