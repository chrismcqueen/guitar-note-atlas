export const POSITION_ORDER = [0, 2, 4, 6, 1, 3, 5];

export const positionFingerLabelY = ({ stringOriginY, stringCount, stringGap, noteRadius, noteStrokeWidth, fontSize }) =>
  stringOriginY + (stringCount - 1) * stringGap + noteRadius + noteStrokeWidth / 2 + fontSize * 0.9;

// The released iOS app numbers keys from A (0), while this app's public data
// numbers them from C (0). Color-band placement still follows the iOS IDs.
export const legacyKeyOffset = (keyOffset) => (keyOffset + 3) % 12;

export const positionBandFrets = (pitch, keyOffset, maxFret = 15) =>
  [-12, 0, 12]
    .map((octave) => pitch + legacyKeyOffset(keyOffset) + octave)
    .filter((fret) => fret >= 0 && fret <= maxFret);

// The released renderer defines band height as the number of string spaces
// covered, plus a small overhang above and below the outer strings. `height`
// is the legacy heightForPosition value (5/4/3), not a string count.
export const positionBandVerticalGeometry = ({ bassMode = false, height, stringGap, upsideDown = false, verticalOffset, stringOriginY = verticalOffset }) => {
  let bandHeight = height;
  // Translate the released drawing coordinates with the strings. Overview
  // necks use a fixed string origin rather than the old UIKit bass inset.
  let y = stringOriginY - verticalOffset;

  if (upsideDown) {
    if (height === 3) y += stringGap * 2;
    else if (height === 4) y += stringGap;
  }

  if (bassMode) {
    bandHeight -= 2;
    y += stringGap * 0.43;
    return { height: bandHeight * stringGap + verticalOffset * 0.95, y };
  }

  return { height: bandHeight * stringGap + verticalOffset * 2, y };
};

export const POSITIONS = [
  { id: 0, baseFret: 4, offset: 0, title: "6TH STRING // PINKY", bassTitle: "4TH STRING // PINKY", color: "green", height: 5 },
  { id: 2, baseFret: 2, offset: 2, title: "6TH STRING // MIDDLE", bassTitle: "4TH STRING // MIDDLE", color: "green", height: 5 },
  { id: 4, baseFret: 0, offset: 4, title: "6TH STRING // INDEX", bassTitle: "4TH STRING // INDEX", color: "green", height: 5, short: true },
  { id: 6, baseFret: 0, offset: 6, title: "4TH STRING // INDEX", bassTitle: "2ND STRING // INDEX", color: "yellow", height: 3, short: true },
  { id: 1, baseFret: 4, offset: 7, title: "5TH STRING // PINKY", bassTitle: "3RD STRING // PINKY", color: "purple", height: 4 },
  { id: 3, baseFret: 2, offset: 9, title: "5TH STRING // MIDDLE", bassTitle: "3RD STRING // MIDDLE", color: "purple", height: 4 },
  { id: 5, baseFret: 0, offset: 11, title: "5TH STRING // INDEX", bassTitle: "3RD STRING // INDEX", color: "purple", height: 4, short: true },
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

export const positionSelectionTargets = (keyOffset = 0, maxFret = 16) =>
  positionTargets(keyOffset, maxFret).slice(0, POSITION_ORDER.length);

export const positionForFret = (fret, keyOffset = 0) => {
  return positionTargetForFret(fret, keyOffset).id;
};

export const positionTargetForFret = (fret, keyOffset = 0) => {
  const targets = positionSelectionTargets(keyOffset);
  return targets.reduce((best, target) => {
    const distance = Math.abs(fret - target.fret);
    return distance < best.distance ? { ...target, distance } : best;
  }, { fret: targets[0]?.fret ?? 0, id: targets[0]?.id ?? 0, distance: Infinity });
};

export const fretForNeckX = (x, width, leftHand = false) => {
  const viewBoxX = (x / width) * 864;
  const visualFret = Math.max(0, Math.min(16, Math.floor((viewBoxX - 40) / 49)));
  return leftHand ? 16 - visualFret : visualFret;
};

export const positionStartFret = (id, keyOffset = 0) => {
  const start = getPosition(id).offset + legacyKeyOffset(keyOffset);
  return start > 11 ? start - 12 : start;
};

export const resolvedPositionFret = (id, fret, keyOffset = 0) => {
  const exactTarget = positionSelectionTargets(keyOffset).find((target) => target.id === id && target.fret === fret);
  return exactTarget?.fret ?? positionStartFret(id, keyOffset);
};

export const positionDisplayFret = (id, fret, keyOffset = 0, maxFret = 16) => {
  const fretCount = getPosition(id).short ? 5 : 6;
  return Math.max(0, Math.min(maxFret - fretCount, resolvedPositionFret(id, fret, keyOffset)));
};

export const stepPositionTarget = (id, fret, amount, keyOffset = 0) => {
  const targets = positionSelectionTargets(keyOffset);
  const resolvedFret = resolvedPositionFret(id, fret, keyOffset);
  const currentIndex = Math.max(0, targets.findIndex((target) => target.id === id && target.fret === resolvedFret));
  const nextIndex = Math.max(0, Math.min(targets.length - 1, currentIndex + amount));
  return targets[nextIndex];
};
