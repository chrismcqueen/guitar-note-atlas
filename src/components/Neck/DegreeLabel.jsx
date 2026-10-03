import React from "react";
import { Text, TSpan } from "react-native-svg";

const DegreeLabel = ({ fill, fontSize, label, x, y }) => {
  const text = String(label);
  const hasAccidental = text.length > 1;
  const accidental = hasAccidental ? text[0] : null;
  const degree = hasAccidental ? text.slice(1) : text;

  return (
    <Text fill={fill} fontSize={fontSize} textAnchor="middle" x={x} y={y}>
      {accidental && <TSpan fontFamily="opus">{accidental}</TSpan>}
      <TSpan fontFamily="basicManual">{degree}</TSpan>
    </Text>
  );
};

export default DegreeLabel;
