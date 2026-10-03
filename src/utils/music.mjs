export const normalizePitchClass = (value) => ((Math.floor(value) % 12) + 12) % 12;

export const getScaleDegreeLabel = (degree) => {
  const labels = {
    0: "1",
    1: "b2",
    2: "2",
    3: "b3",
    3.1: "#2",
    4: "3",
    5: "4",
    6: "b5",
    6.1: "#4",
    7: "5",
    8: "b6",
    8.1: "#5",
    9: "6",
    10: "b7",
    11: "7",
  };

  return labels[degree];
};

export const getNoteName = (pitch, preferFlats = false) => {
  const sharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const flats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  return (preferFlats ? flats : sharps)[normalizePitchClass(pitch)];
};

export const findMatchingScale = (selectedDegrees, scaleGroups) => {
  const matchesDegrees = (scale) =>
    scale.degrees.length === selectedDegrees.length && scale.degrees.every((degree, index) => degree === selectedDegrees[index]);

  return Object.values(scaleGroups).flat().find(matchesDegrees);
};
