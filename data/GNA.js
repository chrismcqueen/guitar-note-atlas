export const data = {
  strings: [
    {
      string_id: 0,
      tuning: 4,
    },
    {
      string_id: 1,
      tuning: 11,
    },
    {
      string_id: 2,
      tuning: 7,
    },
    {
      string_id: 3,
      tuning: 2,
    },
    {
      string_id: 4,
      tuning: 9,
    },
    {
      string_id: 5,
      tuning: 4,
    },
  ],
  keys: [
    {
      key_offset: 0,
      title: "C",
    },
    {
      key_offset: 1,
      title: "C#/Db",
    },
    {
      key_offset: 2,
      title: "D",
    },
    {
      key_offset: 3,
      title: "D#/Eb",
    },
    {
      key_offset: 4,
      title: "E",
    },
    {
      key_offset: 5,
      title: "F",
    },
    {
      key_offset: 6,
      title: "F#/Gb",
    },
    {
      key_offset: 7,
      title: "G",
    },
    {
      key_offset: 8,
      title: "G#/Ab",
    },
    {
      key_offset: 9,
      title: "A",
    },
    {
      key_offset: 10,
      title: "A#/Bb",
    },
    {
      key_offset: 11,
      title: "B",
    },
  ],
  scales: {
    scales: [
      {
        title: "Major Scale", //blackout top
        long_title: "Major Scale", //ipad or bigger phones for top blackout
        menu_title: "Major Scale", //menu
        degrees: [0, 2, 4, 5, 7, 9, 11],
      },
      {
        title: "Natural Minor",
        long_title: "Natural Minor",
        menu_title: "Natural Minor",
        degrees: [0, 2, 3, 5, 7, 8, 10],
      },
      {
        title: "Melodic Minor",
        long_title: "Melodic Minor",
        menu_title: "Melodic Minor",
        degrees: [0, 2, 3, 5, 7, 9, 11],
      },
      {
        title: "Harmonic Minor",
        long_title: "Harmonic Minor",
        menu_title: "Harmonic Minor",
        degrees: [0, 2, 3, 5, 7, 8, 11],
      },
      {
        title: "Harmonic Major",
        long_title: "Harmonic Major",
        menu_title: "Harmonic Major",
        degrees: [0, 2, 4, 5, 7, 8, 11],
      },
      {
        title: "Chromatic Scale",
        long_title: "Chromatic Scale",
        menu_title: "Chromatic Scale",
        degrees: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      },
      {
        title: "Major Pentatonic",
        long_title: "Major Pentatonic",
        menu_title: "Major Pentatonic",
        degrees: [0, 2, 4, 7, 9],
      },
      {
        title: "Minor Pentatonic",
        long_title: "Minor Pentatonic",
        menu_title: "Minor Pentatonic",
        degrees: [0, 3, 5, 7, 10],
      },
      {
        title: "Whole-Tone Scale",
        long_title: "Whole-Tone Scale",
        menu_title: "Whole-Tone Scale",
        degrees: [0, 2, 4, 6.1, 8.1, 10],
      },
      {
        title: "Whole-Half Dim",
        long_title: "Whole-Half Diminished",
        menu_title: "Whole-Half Diminished",
        degrees: [0, 2, 3, 5, 6, 8.1, 9, 11],
      },
      {
        title: "Half-Whole Dim",
        long_title: "Half-Whole Diminished",
        menu_title: "Half-Whole Diminished",
        degrees: [0, 1, 3.1, 4, 6.1, 7, 9, 10],
      },
      {
        title: "Augmented Scale",
        long_title: "Augmented Scale",
        menu_title: "Augmented Scale",
        degrees: [0, 3.1, 4, 7, 8, 11],
      },
      {
        title: "Double Harm Min",
        long_title: "Double Harm Minor",
        menu_title: "Double Harmonic Minor",
        degrees: [0, 2, 3, 6.1, 7, 8, 11],
      },
      {
        title: "Double Harm Maj",
        long_title: "Double Harm Major",
        menu_title: "Double Harmonic Major",
        degrees: [0, 1, 4, 5, 7, 8, 11],
      },
    ],
    arpeggios: [
      {
        title: "Major Arpeggio",
        long_title: "Major Arpeggio",
        menu_title: "Major Arpeggio",
        degrees: [0, 4, 7],
      },
      {
        title: "Minor Arpeggio",
        long_title: "Minor Arpeggio",
        menu_title: "Minor Arpeggio",
        degrees: [0, 3, 7],
      },
      {
        title: "Diminished Arp",
        long_title: "Diminished Arpeggio",
        menu_title: "Diminished Arpeggio",
        degrees: [0, 3, 6],
      },
      {
        title: "Augmented Arp",
        long_title: "Augmented Arpeggio",
        menu_title: "Augmented Arpeggio",
        degrees: [0, 4, 8.1],
      },
      {
        title: "Major 7 Arpeggio",
        long_title: "Major 7 Arpeggio",
        menu_title: "Major 7 Arpeggio",
        degrees: [0, 4, 7, 11],
      },
      {
        title: "Dominant 7 Arp",
        long_title: "Dominant 7 Arpeggio",
        menu_title: "Dominant 7 Arpeggio",
        degrees: [0, 4, 7, 10],
      },
      {
        title: "Minor 7 Arpeggio",
        long_title: "Minor 7 Arpeggio",
        menu_title: "Minor 7 Arpeggio",
        degrees: [0, 3, 7, 10],
      },
      {
        title: "Minor-Maj 7 Arp",
        long_title: "Minor Major 7 Arp",
        menu_title: "Minor-Major 7",
        degrees: [0, 3, 7, 11],
      },
      {
        title: "Half-Dim 7 Arp",
        long_title: "Half-Diminished 7 Arp",
        menu_title: "Half-Diminished 7",
        degrees: [0, 3, 6, 10],
      },
      {
        title: "Fully-Dim 7 Arp",
        long_title: "Fully Diminished 7 Arp",
        menu_title: "Fully-Diminished 7",
        degrees: [0, 3, 6, 9],
      },
    ],
    intervals: [
      {
        title: "Minor 2nd",
        long_title: "Minor 2nd",
        menu_title: "Minor 2nd",
        degrees: [0, 1],
      },
      {
        title: "Major 2nd",
        long_title: "Major 2nd",
        menu_title: "Major 2nd",
        degrees: [0, 2],
      },
      {
        title: "Minor 3rd",
        long_title: "Minor 3rd",
        menu_title: "Minor 3rd",
        degrees: [0, 3],
      },
      {
        title: "Major 3rd",
        long_title: "Major 3rd",
        menu_title: "Major 3rd",
        degrees: [0, 4],
      },
      {
        title: "Perfect 4th",
        long_title: "Perfect 4th",
        menu_title: "Perfect 4th",
        degrees: [0, 5],
      },
      {
        title: "Tritone",
        long_title: "Tritone",
        menu_title: "Tritone",
        degrees: [0, 6],
      },
      {
        title: "Perfect 5th",
        long_title: "Perfect 5th",
        menu_title: "Perfect 5th",
        degrees: [0, 7],
      },
      {
        title: "Minor 6th",
        long_title: "Minor 6th",
        menu_title: "Minor 6th",
        degrees: [0, 8],
      },
      {
        title: "Major 6th",
        long_title: "Major 6th",
        menu_title: "Major 6th",
        degrees: [0, 9],
      },
      {
        title: "Minor 7th",
        long_title: "Minor 7th",
        menu_title: "Minor 7th",
        degrees: [0, 10],
      },
      {
        title: "Major 7th",
        long_title: "Major 7th",
        menu_title: "Major 7th",
        degrees: [0, 11],
      },
    ],
    major: [
      {
        title: "Major Scale",
        long_title: "Major Scale",
        menu_title: "I. Ionian",
        degrees: [0, 2, 4, 5, 7, 9, 11],
      },
      {
        title: "Dorian",
        long_title: "Dorian",
        menu_title: "ii. Dorian",
        degrees: [0, 2, 3, 5, 7, 9, 10],
      },
      {
        title: "Phrygian",
        long_title: "Phrygian",
        menu_title: "iii. Phrygian",
        degrees: [0, 1, 3, 5, 7, 8, 10],
      },
      {
        title: "Lydian",
        long_title: "Lydian",
        menu_title: "IV. Lydian",
        degrees: [0, 2, 4, 6.1, 7, 9, 11],
      },
      {
        title: "Mixolydian",
        long_title: "Mixolydian",
        menu_title: "V. Mixolydian",
        degrees: [0, 2, 4, 5, 7, 9, 10],
      },
      {
        title: "Natural Minor",
        long_title: "Natural Minor",
        menu_title: "vi. Aeolian",
        degrees: [0, 2, 3, 5, 7, 8, 10],
      },
      {
        title: "Locrian",
        long_title: "Locrian",
        menu_title: "vii°. Locrian",
        degrees: [0, 1, 3, 5, 6, 8, 10],
      },
    ],
    "Melodic Minor": [
      {
        title: "Melodic Minor",
        long_title: "Melodic Minor",
        menu_title: "i. Melodic Minor",
        degrees: [0, 2, 3, 5, 7, 9, 11],
      },
      {
        title: "Dorian -2",
        long_title: "Dorian -2",
        menu_title: "ii. Dorian b2",
        degrees: [0, 1, 3, 5, 7, 9, 10],
      },
      {
        title: "Lydian Augmented",
        long_title: "Lydian Augmented",
        menu_title: "bIII+. Lydian Augmented",
        degrees: [0, 2, 4, 6.1, 8.1, 9, 11],
      },
      {
        title: "Lydian Dominant",
        long_title: "Lydian Dominant",
        menu_title: "IV. Lydian Dominant",
        degrees: [0, 2, 4, 6.1, 7, 9, 10],
      },
      {
        title: "Mixolydian -6",
        long_title: "Mixolydian -6",
        menu_title: "V. Mixolydian b6",
        degrees: [0, 2, 4, 5, 7, 8, 10],
      },
      {
        title: "Locrian +2",
        long_title: "Locrian +2",
        menu_title: "vi°. Locrian #2",
        degrees: [0, 2, 3, 5, 6, 8, 10],
      },
      {
        title: "Super Locrian",
        long_title: "Super Locrian",
        menu_title: "vii°. Super Locrian",
        degrees: [0, 1, 3.1, 4, 6, 8, 10],
      },
    ],
    "Harmonic Minor": [
      {
        title: "Harmonic Minor",
        long_title: "Harmonic Minor",
        menu_title: "i. Harmonic Minor",
        degrees: [0, 2, 3, 5, 7, 8, 11],
      },
      {
        title: "Locrian +6",
        long_title: "Locrian +6",
        menu_title: "ii. Locrian #6",
        degrees: [0, 1, 3, 5, 6, 9, 10],
      },
      {
        title: "Ionian +5",
        long_title: "Ionian +5",
        menu_title: "bIII+. Ionian #5",
        degrees: [0, 2, 4, 5, 8.1, 9, 11],
      },
      {
        title: "Dorian +4",
        long_title: "Dorian +4",
        menu_title: "iv. Dorian #4",
        degrees: [0, 2, 3, 6.1, 7, 9, 10],
      },
      {
        title: "Mixolydian -2 -6",
        long_title: "Mixolydian -2 -6",
        menu_title: "V. Mixolydian b2, b6",
        degrees: [0, 1, 4, 5, 7, 8, 10],
      },
      {
        title: "Lydian +2",
        long_title: "Lydian +2",
        menu_title: "bVI. Lydian #2",
        degrees: [0, 3.1, 4, 6.1, 7, 9, 11],
      },
      {
        title: "Super Locrian dim7",
        long_title: "Super Locrian dim7",
        menu_title: "vii°. Super Locrian °7",
        degrees: [0, 1, 3.1, 4, 6.1, 8.1, 9],
      },
    ],
    "Harmonic Major": [
      {
        title: "Harmonic Major",
        long_title: "Harmonic Major",
        menu_title: "I. Harmonic Major",
        degrees: [0, 2, 4, 5, 7, 8, 11],
      },
      {
        title: "Locrian +2 +6",
        long_title: "Locrian +2 +6",
        menu_title: "ii°. Locrian #2, #6",
        degrees: [0, 2, 3, 5, 6, 9, 10],
      },
      {
        title: "Phrygian -4",
        long_title: "Phrygian -4",
        menu_title: "iii. Phrygian b4",
        degrees: [0, 1, 3.1, 4, 7, 8, 10],
      },
      {
        title: "Melodic Minor +4",
        long_title: "Melodic Minor +4",
        menu_title: "iv. Melodic Minor #4",
        degrees: [0, 2, 3, 6.1, 7, 9, 11],
      },
      {
        title: "Mixolydian -2",
        long_title: "Mixolydian -2",
        menu_title: "V. Mixolydian b2",
        degrees: [0, 1, 4, 5, 7, 9, 10],
      },
      {
        title: "Lydian +2 +5",
        long_title: "Lydian +2 +5",
        menu_title: "bVI+. Lydian #2, #5",
        degrees: [0, 3.1, 4, 6.1, 8.1, 9, 11],
      },
      {
        title: "Locrian dim7",
        long_title: "Locrian dim7",
        menu_title: "vii°. Locrian °7",
        degrees: [0, 1, 3, 5, 6, 8, 9],
      },
    ],
  },
};
