// Prepare pitch, attack and release in PCM before scheduling native playback.
export const renderNotePcm = (context, input, rate, duration, volume) => {
  const seconds = Math.min(duration ?? input.duration / rate, input.duration / rate);
  const length = Math.max(2, Math.ceil(seconds * input.sampleRate));
  const output = context.createBuffer(input.numberOfChannels, length, input.sampleRate);
  const attack = Math.max(1, Math.round(input.sampleRate * (duration === undefined ? 0.004 : 0.012)));
  const release = duration === undefined ? 0 : Math.min(Math.round(input.sampleRate * 0.035), Math.floor(length / 2));

  for (let channel = 0; channel < input.numberOfChannels; channel++) {
    const source = input.getChannelData(channel);
    const data = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const position = i * rate;
      const index = Math.floor(position);
      const fraction = position - index;
      const sample = (source[index] ?? 0) * (1 - fraction) + (source[index + 1] ?? 0) * fraction;
      const envelope = Math.min(1, i / attack, release ? (length - 1 - i) / release : 1);
      data[i] = sample * volume * envelope;
    }
    output.copyToChannel(data, channel);
  }
  return output;
};
