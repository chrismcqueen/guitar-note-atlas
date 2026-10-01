import React from "react";
import { Line } from "react-native-svg";
import { theme } from "../../utils/theme";

const Strings = ({ count, span = 180 }) => {
  return (
    <>
      {[...Array(count).keys()].map((string) => (
        <Line
          key={string}
          id={`string-${string + 1}`}
          x1="800"
          transform={`translate(42 ${14 + (span / (count - 1)) * string})`}
          fill="none"
          stroke={theme.colors.black}
          strokeWidth="4"
        />
      ))}
    </>
  );
};

export default Strings;
