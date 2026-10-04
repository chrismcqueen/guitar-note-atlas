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

export const degreeIndicesBetween = (fromIndex, toIndex) => {
  const start = Math.min(fromIndex, toIndex);
  const end = Math.max(fromIndex, toIndex);
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
};
