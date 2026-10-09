// Similar full-level transient peaks for notes, click, kick and snare.
// Keep the hat underneath them and reserve headroom for summed voices.
export const MASTER_VOLUME = 0.6;
export const NOTE_LEVEL = 0.75;
export const DRUM_LEVELS = { hat: 0.16, kick: 0.8, snare: 0.75, click: 0.85 };

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
export const volumePercent = (gain) => Math.round(sliderFromVolume(gain) * 100);

export const sourceMixVolume = (key, config, base = 1) => base * clampVolume(
  key.startsWith('guitar:') ? config.notesVolume : config.accompanimentVolume,
);

export const fallbackSourceVolume = (key, config) => MASTER_VOLUME * sourceMixVolume(key, config,
  key.startsWith('guitar:') ? NOTE_LEVEL : DRUM_LEVELS[key.slice(5)] ?? 1,
);

// Mixer changes apply immediately without preparing notes or changing the grid.
export const hasPlaybackChanges = (previous, next) => Object.keys({ ...previous, ...next }).some(
  key => key !== 'notesVolume' && key !== 'accompanimentVolume' && previous[key] !== next[key],
);
