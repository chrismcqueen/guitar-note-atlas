export const getTransportIndicator = ({ count = 0, pending = false, loading = false, playing = false }) => {
  if (count > 0) return 'count';
  if (pending) return 'blank';
  if (loading) return 'loading';
  return playing ? 'stop' : 'play';
};
