export const POSITION_ORDER = [0, 2, 4, 6, 1, 3, 5];

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

export const positionForFret = (fret, keyOffset = 0) => {
  const pitch = ((fret - keyOffset) % 12 + 12) % 12;
  const anchors = [
    { id: 0, pitch: 0 },
    { id: 2, pitch: 2 },
    { id: 4, pitch: 4 },
    { id: 6, pitch: 6 },
    { id: 1, pitch: 7 },
    { id: 3, pitch: 9 },
    { id: 5, pitch: 11 },
  ];
  return anchors.reduce((best, candidate) => {
    const distance = Math.min((pitch - candidate.pitch + 12) % 12, (candidate.pitch - pitch + 12) % 12);
    return distance < best.distance ? { id: candidate.id, distance } : best;
  }, { id: 0, distance: Infinity }).id;
};

export const positionStartFret = (id, keyOffset = 0) => {
  const start = getPosition(id).offset + keyOffset;
  return start > 11 ? start - 12 : start;
};
