export const POSITION_ORDER = [0, 2, 4, 6, 1, 3, 5];

// The released iOS app numbers keys from A (0), while this app's public data
// numbers them from C (0). Color-band placement still follows the iOS IDs.
export const legacyKeyOffset = (keyOffset) => (keyOffset + 3) % 12;

export const positionBandFrets = (pitch, keyOffset, maxFret = 15) =>
  [-12, 0, 12]
    .map((octave) => pitch + legacyKeyOffset(keyOffset) + octave)
    .filter((fret) => fret >= 0 && fret <= maxFret);

export const POSITIONS = [
  { id: 0, baseFret: 4, offset: 0, title: "6TH STRING // PINKY", bassTitle: "4TH STRING // PINKY", color: "green", height: 6 },
  { id: 2, baseFret: 2, offset: 2, title: "6TH STRING // MIDDLE", bassTitle: "4TH STRING // MIDDLE", color: "green", height: 6 },
  { id: 4, baseFret: 0, offset: 4, title: "6TH STRING // INDEX", bassTitle: "4TH STRING // INDEX", color: "green", height: 6, short: true },
  { id: 6, baseFret: 0, offset: 6, title: "4TH STRING // INDEX", bassTitle: "2ND STRING // INDEX", color: "yellow", height: 4, short: true },
  { id: 1, baseFret: 4, offset: 7, title: "5TH STRING // PINKY", bassTitle: "3RD STRING // PINKY", color: "purple", height: 5 },
  { id: 3, baseFret: 2, offset: 9, title: "5TH STRING // MIDDLE", bassTitle: "3RD STRING // MIDDLE", color: "purple", height: 5 },
  { id: 5, baseFret: 0, offset: 11, title: "5TH STRING // INDEX", bassTitle: "3RD STRING // INDEX", color: "purple", height: 5, short: true },
];

export const getPosition = (id) => POSITIONS.find((position) => position.id === id) ?? POSITIONS[0];

export const stepPosition = (id, amount) => {
  const index = Math.max(0, POSITION_ORDER.indexOf(id));
  return POSITION_ORDER[(index + amount + POSITION_ORDER.length) % POSITION_ORDER.length];
};

export const positionTargets = (keyOffset = 0, maxFret = 16) => {
  const offset = legacyKeyOffset(keyOffset);

  return POSITIONS.flatMap((position) =>
    [-12, 0, 12, 24]
      .map((octave) => ({ fret: position.offset + offset + octave, id: position.id }))
      .filter((target) => target.fret >= 0 && target.fret <= maxFret),
  ).sort((a, b) => a.fret - b.fret);
};

export const positionForFret = (fret, keyOffset = 0) => {
  const targets = positionTargets(keyOffset);
  return targets.reduce((best, target) => {
    const distance = Math.abs(fret - target.fret);
    return distance < best.distance ? { id: target.id, distance } : best;
  }, { id: targets[0]?.id ?? 0, distance: Infinity }).id;
};

export const positionStartFret = (id, keyOffset = 0) => {
  const start = getPosition(id).offset + legacyKeyOffset(keyOffset);
  return start > 11 ? start - 12 : start;
};
