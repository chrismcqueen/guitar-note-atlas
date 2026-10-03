import React from "react";
import { Text, TSpan } from "react-native-svg";

const DegreeLabel = ({ fill, fontSize, label, x, y }) => {
  const text = String(label);
  const hasAccidental = text.length > 1;
  const accidental = hasAccidental ? text[0] : null;
  const degree = hasAccidental ? text.slice(1) : text;

  if (!accidental) {
    return <Text fill={fill} fontFamily="basicManual" fontSize={fontSize} textAnchor="middle" x={x} y={y}>{degree}</Text>;
  }

  const size = Number(fontSize) * 0.84;

  return (
    <Text fill={fill} fontSize={size} textAnchor="middle" x={x} y={y}>
      <TSpan fontFamily="opus">{accidental}</TSpan>
      <TSpan fontFamily="basicManual">{degree}</TSpan>
    </Text>
  );
};

export default DegreeLabel;
