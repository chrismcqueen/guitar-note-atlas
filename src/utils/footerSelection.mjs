export const getFooterGeometry = ({ width, height }, insets) => {
  const tablet = width >= 1000 && height >= 550;
  const safeWidth = width - insets.left - insets.right;
  const scale = Math.min(1, safeWidth / (tablet ? 1240 : 752));
  return { scale, degreeWidth: (tablet ? 80 : 46) * scale, actionWidth: (tablet ? 140 : 100) * scale };
};

export const isDegreeChoiceSelected = (selectedDegrees, choice) => (
  selectedDegrees.includes(choice.d)
  || (choice.e !== undefined && selectedDegrees.includes(choice.e))
);

export const paintDegreeChoices = (selectedDegrees, choices, indices, shouldSelect) => {
  const nextDegrees = [...selectedDegrees];

  for (const index of indices) {
    const choice = choices[index];
    if (!choice) continue;

    const values = choice.e === undefined ? [choice.d] : [choice.d, choice.e];
    const selected = values.some((value) => nextDegrees.includes(value));

    if (shouldSelect && !selected) {
      nextDegrees.push(choice.e ?? choice.d);
    } else if (!shouldSelect && selected) {
      for (const value of values) {
        const valueIndex = nextDegrees.indexOf(value);
        if (valueIndex >= 0) nextDegrees.splice(valueIndex, 1);
      }
    }
  }

  return nextDegrees.sort((a, b) => a - b);
};

export const footerDegreeIndexAtX = (x, width, degreeCount) => {
  if (width <= 0 || degreeCount <= 0) return 0;
  return Math.max(0, Math.min(degreeCount - 1, Math.floor((x / width) * degreeCount)));
};

export const footerDegreeIndexFromGestureX = (localX, width, degreeCount, startIndex) => {
  const degreeWidth = width / degreeCount;
  return footerDegreeIndexAtX(startIndex * degreeWidth + localX, width, degreeCount);
};

export const footerGestureDistance = (startPoint, currentPoint, useVerticalAxis = false) => (
  useVerticalAxis
    ? currentPoint.y - startPoint.y
    : currentPoint.x - startPoint.x
);

export const degreeIndicesBetween = (fromIndex, toIndex) => {
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
};

export const paintDegreeRange = (initialDegrees, choices, startIndex, currentIndex, shouldSelect) =>
  paintDegreeChoices(
    initialDegrees,
    choices,
    degreeIndicesBetween(startIndex, currentIndex),
    shouldSelect,
  );

export const toggleDegreeRange = (initialDegrees, choices, startIndex, currentIndex) => {
  const nextDegrees = [...initialDegrees];

  for (const index of degreeIndicesBetween(startIndex, currentIndex)) {
    const choice = choices[index];
    if (!choice) continue;

    const values = choice.e === undefined ? [choice.d] : [choice.d, choice.e];
    const wasSelected = values.some((value) => initialDegrees.includes(value));

    for (const value of values) {
      const valueIndex = nextDegrees.indexOf(value);
      if (valueIndex >= 0) nextDegrees.splice(valueIndex, 1);
    }

    if (!wasSelected) nextDegrees.push(choice.e ?? choice.d);
  }

  return nextDegrees.sort((a, b) => a - b);
};
