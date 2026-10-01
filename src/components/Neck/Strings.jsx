import React from "react";
import { Line } from "react-native-svg";

const Strings = ({ count }) => {
  return (
    <>
      {[...Array(count).keys()].map((string) => (
        <Line
          key={string}
          id={`string-${string + 1}`}
          x1="800"
          transform={`translate(42 ${14 + (180 / (count - 1)) * string})`}
          fill="none"
          stroke="#000"
          strokeWidth="4"
        />
      ))}
    </>
  );
};

export default Strings;
