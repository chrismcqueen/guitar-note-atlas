import React, { useContext } from "react";
import { Pressable } from "react-native";
import Svg from "react-native-svg";
import { Store } from "../../../Store";

import DegreeLabel from "../Neck/DegreeLabel";
import { useFooter } from "./useFooter";
import { theme } from "../../utils/theme";
import { getFooterGeometry } from "../../utils/footerSelection.mjs";
import { TABLET_FOOTER_BUTTON_HEIGHT } from "../../utils/practiceLayout.mjs";

export const ScaleDegreeButton = (props) => {
  const { dimensions, footerInsets: insets, globalState, setGlobalState } = useContext(Store);
  const { selected, altSelected, d, e, onTouchStart } = props;
  const { getScaleDegree, getMatchingScale } = useFooter();
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const { degreeWidth, scale } = getFooterGeometry(dimensions, insets);
  const height = isTablet ? TABLET_FOOTER_BUTTON_HEIGHT : 45;
  const selectedLabel = altSelected ? getScaleDegree(e) : selected ? getScaleDegree(d) : null;
  const stacked = e !== undefined && !selectedLabel;
  const fontSize = (isTablet ? (stacked ? 36 : 49) : (stacked ? 25 : 33)) * scale;
  const fill = selectedLabel ? theme.colors.white : theme.colors.lightBlue;
  // Preserve the tablet labels' top spacing while removing eight points of
  // extra space below them. Stacked choices split that reduction by lane.
  const laneHeight = stacked ? height / 2 : height;
  const labelLaneHeight = laneHeight + (isTablet ? (stacked ? 4 : 8) : 0);
  const baseline = (labelLaneHeight + fontSize * 0.65) / 2;

  const onPressScaleDegree = () => {
    const currentDegrees = globalState.scale.degrees;
    let nextDegrees;

    if (e !== undefined && currentDegrees.includes(e)) {
      nextDegrees = [...currentDegrees.filter((degree) => degree !== e), d];
    } else if (currentDegrees.includes(d)) {
      nextDegrees = currentDegrees.filter((degree) => degree !== d);
    } else {
      nextDegrees = [...currentDegrees, e ?? d];
    }

    nextDegrees.sort((a, b) => a - b);
    const matchingScale = getMatchingScale(nextDegrees);
    const scale = matchingScale
      ? { ...matchingScale, degrees: nextDegrees }
      : { title: "", long_title: "", menu_title: "", degrees: nextDegrees };
    setGlobalState({ ...globalState, scale });
  };

  return (
    <Pressable
      android_disableSound
      accessibilityRole="button"
      accessibilityLabel={e === undefined ? getScaleDegree(d) : `${getScaleDegree(d)} or ${getScaleDegree(e)}`}
      accessibilityState={{ selected: Boolean(selectedLabel) }}
      onPress={onPressScaleDegree}
      onTouchStart={onTouchStart}
      style={{ flexShrink: 0, height, width: degreeWidth, backgroundColor: selectedLabel ? theme.colors.blue : theme.colors.white }}
    >
      <Svg accessible={false} pointerEvents="none" width={degreeWidth} height={height} viewBox={`0 0 ${degreeWidth} ${height}`}>
        <DegreeLabel label={selectedLabel || getScaleDegree(d)} fill={fill} fontSize={fontSize} x={degreeWidth / 2} y={baseline} />
        {stacked && <DegreeLabel label={getScaleDegree(e)} fill={fill} fontSize={fontSize} x={degreeWidth / 2} y={baseline + laneHeight} />}
      </Svg>
    </Pressable>
  );
};
