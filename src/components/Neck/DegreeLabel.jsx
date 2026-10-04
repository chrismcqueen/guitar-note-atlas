import React from "react";
import { G, Text } from "react-native-svg";

const DegreeLabel = ({ fill, fontSize, label, x, y }) => {
  const text = String(label);
  const hasAccidental = text.length > 1;
  const accidental = hasAccidental ? text[0] : null;
  const degree = hasAccidental ? text.slice(1) : text;

  if (!accidental) {
    return <Text fill={fill} fontFamily="basicManual" fontSize={fontSize} textAnchor="middle" x={x} y={y}>{degree}</Text>;
  }

  const size = Number(fontSize);
  // react-native-svg does not preserve the UIKit attributed-string advances
  // when adjacent TSpans switch between Opus and Basic Manual. Position the
  // two runs from their optical bounds so b2 and #5 share the same center.
  const accidentalX = Number(x) - size * 0.3;
  const degreeX = Number(x) + size * 0.16;

  return (
    <G fill={fill} fontSize={size}>
      <Text fontFamily="opus" textAnchor="middle" x={accidentalX} y={y}>{accidental}</Text>
      <Text fontFamily="basicManual" textAnchor="middle" x={degreeX} y={y}>{degree}</Text>
    </G>
  );
};

export default DegreeLabel;
