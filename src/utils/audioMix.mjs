export const DRUM_LEVELS = { hat: 0.08, kick: 0.48, snare: 0.45, click: 0.3 };

export const clampVolume = (value) => {
  if (value === null || value === undefined || value === '') return 1;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 1;
};

// A continuous audio taper: half travel is -20 dB (one tenth amplitude).
// Keep persisted mixer values as linear gains, so existing levels don't move.
const AUDIO_TAPER_EXPONENT = Math.log(0.1) / Math.log(0.5);
export const volumeFromSlider = (position) => clampVolume(position) ** AUDIO_TAPER_EXPONENT;
export const sliderFromVolume = (gain) => clampVolume(gain) ** (1 / AUDIO_TAPER_EXPONENT);
export const volumeDecibels = (gain) => {
  const level = clampVolume(gain);
  return level === 0 ? 'Mute' : `${Math.round(20 * Math.log10(level)) || 0} dB`;
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
