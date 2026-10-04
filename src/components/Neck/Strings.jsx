import React from "react";
import { Line } from "react-native-svg";
import { theme } from "../../utils/theme";

const Strings = ({ color = theme.colors.black, count, endX = 842, span = 180, startX = 42, strokeWidth = 4 }) => {
  return (
    <>
      {[...Array(count).keys()].map((string) => (
        <Line
          key={string}
          id={`string-${string + 1}`}
          x1={endX - startX}
          transform={`translate(${startX} ${14 + (span / (count - 1)) * string})`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      ))}
    </>
  );
};

export default Strings;
