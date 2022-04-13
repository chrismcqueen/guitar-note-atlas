import React from 'react'
import Svg, { Line, Defs, ClipPath, G, Path, Circle, Rect } from "react-native-svg";

import { theme } from '../../utils/theme'

const NeckSVG = ({ dimensions }) => {
  const { colors } = theme;
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox={`0 0 2208.018 ${dimensions.height / 2}`}>
      <Defs>
        <ClipPath id="clip-path">
          <Rect id="Rectangle_1" dataName="Rectangle 1" width="88" height="55" transform="translate(796 1187)" fill={colors.pureWhite} />
        </ClipPath>
        <ClipPath id="clip-path-2">
          <Rect id="Rectangle_2" dataName="Rectangle 2" width="88" height="45" transform="translate(274 1197)" fill={colors.pureWhite} />
        </ClipPath>
        <ClipPath id="clip-path-3">
          <Rect id="Rectangle_3" dataName="Rectangle 3" width="88" height="45" transform="translate(451 1197)" fill={colors.pureWhite} />
        </ClipPath>
      </Defs>
      <Line id="Line_1" dataName="Line 1" x1="2208" y1="1" transform="translate(0.009 38)" fill="none" stroke={colors.black} strokeWidth="9.9" />
      <Line id="Line_2" dataName="Line 2" x1="2208" y1="4" transform="translate(0.009 130)" fill="none" stroke={colors.black} strokeWidth="9.9" />
      <Line id="Line_3" dataName="Line 3" x1="2208" y1="1" transform="translate(0.009 223)" fill="none" stroke={colors.black} strokeWidth="9.9" />
      <Line id="Line_4" dataName="Line 4" y1="285" transform="translate(409.009 34)" fill="none" stroke={colors.black} strokeWidth="9.9" />
      <Line id="Line_5" dataName="Line 5" y1="282.104" transform="translate(580.009 36.396)" fill="none" stroke={colors.black} strokeWidth="9.9" />
      <Line id="Line_6" dataName="Line 6" y1="282.104" transform="translate(754.009 36.396)" fill="none" stroke={colors.black} strokeWidth="9.9" />
      <Line id="Line_7" dataName="Line 7" y1="149" transform="translate(931.009 39)" fill="none" stroke={colors.black} strokeWidth="9.9" />
      <Line id="Line_8" dataName="Line 8" y1="101" transform="translate(1108.009 33)" fill="none" stroke={colors.black} strokeWidth="9.9" />
      <Line id="Line_9" dataName="Line 9" y1="284" transform="translate(54.009 34)" fill="none" stroke={colors.black} strokeWidth="9.9" />
      <Line id="Line_10" dataName="Line 10" y1="284" transform="translate(229.009 34)" fill="none" stroke={colors.black} strokeWidth="9.9" />
      <G id="Ellipse_1" dataName="Ellipse 1" transform="translate(456.009)" stroke={colors.black} strokeWidth="13">
        <Circle cx="39" cy="39" r="39" stroke="none" />
        <Circle cx="39" cy="39" r="32.5" fill={colors.black} />
      </G>
      <G id="Ellipse_2" dataName="Ellipse 2" transform="translate(456.009 88)" stroke={colors.black} strokeWidth="13">
        <Circle cx="39" cy="39" r="39" stroke="none" />
        <Circle cx="39" cy="39" r="32.5" fill={colors.black} />
      </G>
      <G id="Ellipse_3" dataName="Ellipse 3" transform="translate(456.009 185)" stroke={colors.black} strokeWidth="13">
        <Circle cx="39" cy="39" r="39" stroke="none" />
        <Circle cx="39" cy="39" r="32.5" fill={colors.black} />
      </G>
      <G id="Ellipse_5" dataName="Ellipse 5" transform="translate(801.009)" stroke={colors.black} strokeWidth="13">
        <Circle cx="39" cy="39" r="39" stroke="none" />
        <Circle cx="39" cy="39" r="32.5" fill={colors.black} />
      </G>
      <G id="Ellipse_6" dataName="Ellipse 6" transform="translate(801.009 91)" stroke={colors.black} strokeWidth="13">
        <Circle cx="39" cy="39" r="39" stroke="none" />
        <Circle cx="39" cy="39" r="32.5" fill={colors.black} />
      </G>
      <G id="Ellipse_8" dataName="Ellipse 8" transform="translate(276.009 185)" stroke={colors.black} strokeWidth="13">
        <Circle cx="39" cy="39" r="39" stroke="none" />
        <Circle cx="39" cy="39" r="32.5" fill={colors.black} />
      </G>
      <G id="Ellipse_10" dataName="Ellipse 10" transform="translate(102.009 88)" stroke={colors.black} strokeWidth="13">
        <Circle cx="39" cy="39" r="39" stroke="none" />
        <Circle cx="39" cy="39" r="32.5" fill={colors.black} />
      </G>
      <G id="Ellipse_11" dataName="Ellipse 11" transform="translate(102.009)" fill="#f6f5d7" stroke={colors.black} strokeWidth="13">
        <Circle cx="39" cy="39" r="39" stroke="none" />
        <Circle cx="39" cy="39" r="32.5" fill="none" />
      </G>
      <G id="Mask_Group_1" dataName="Mask Group 1" transform="translate(0.009 -924)" clipPath="url(#clip-path)">
        <G id="Path_3" dataName="Path 3" transform="translate(801 1200)">
          <Path
            d="M 39 71.5 C 21.07943344116211 71.5 6.5 56.92056655883789 6.5 39 C 6.5 21.07943344116211 21.07943344116211 6.5 39 6.5 C 56.92056655883789 6.5 71.5 21.07943344116211 71.5 39 C 71.5 56.92056655883789 56.92056655883789 71.5 39 71.5 Z"
            stroke="none"
            fill={colors.black}
          />
          <Path
            d="M 39 13 C 24.66354370117188 13 13 24.66354370117188 13 39 C 13 53.33645629882812 24.66354370117188 65 39 65 C 53.33645629882812 65 65 53.33645629882812 65 39 C 65 24.66354370117188 53.33645629882812 13 39 13 M 39 0 C 60.53909301757812 0 78 17.46091079711914 78 39 C 78 60.53909301757812 60.53909301757812 78 39 78 C 17.46091079711914 78 0 60.53909301757812 0 39 C 0 17.46091079711914 17.46091079711914 0 39 0 Z"
            stroke="none"
            fill={colors.black}
          />
        </G>
      </G>
      <G id="Mask_Group_2" dataName="Mask Group 2" transform="translate(0.009 -924)" clipPath="url(#clip-path-2)">
        <G id="Ellipse_9" dataName="Ellipse 9" transform="translate(276 1207)" stroke={colors.black} strokeWidth="13">
          <Circle cx="39" cy="39" r="39" stroke="none" />
          <Circle cx="39" cy="39" r="32.5" fill={colors.black} />
        </G>
      </G>
      <G id="Mask_Group_3" dataName="Mask Group 3" transform="translate(0.009 -924)" clipPath="url(#clip-path-3)">
        <G id="Ellipse_4" dataName="Ellipse 4" transform="translate(456 1207)" fill="#f6f5d7" stroke={colors.black} strokeWidth="13">
          <Circle cx="39" cy="39" r="39" stroke="none" />
          <Circle cx="39" cy="39" r="32.5" fill="none" />
        </G>
      </G>
    </Svg>
  );
};

export default NeckSVG;