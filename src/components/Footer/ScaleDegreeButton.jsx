import React, { useContext } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { Store } from "../../../Store";

import { Accidental } from "./Accidental";
import { useFooter } from "./useFooter";
import { theme } from "../../utils/theme";
import { pressedOpacity } from "../../utils/pressable";

export const ScaleDegreeButton = (props) => {
  const { dimensions, globalState, setGlobalState } = useContext(Store);
  const { selected, altSelected, d, e } = props;
  const { getScaleDegree, getMatchingScale } = useFooter();
  const [accidental, degree] = getScaleDegree(d).length === 2 ? getScaleDegree(d).split("") : [undefined, getScaleDegree(d)];
  const [altAccidental, altDegree] = e === undefined ? [] : getScaleDegree(e).split("");
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const degreeWidth = isTablet ? TABLET_DEGREE_WIDTH : PHONE_DEGREE_WIDTH;
  const degreeSize = { width: degreeWidth };
  const degreeContainerSize = { height: isTablet ? TABLET_DEGREE_HEIGHT : SCALE_DEGREE_HEIGHT, width: degreeWidth };
  const degreeTextStyle = isTablet && styles.tabletScaleDegree;
  const degreeSmallStyle = isTablet && styles.tabletScaleDegreeSmall;
  const degreeSmallTopStyle = isTablet ? styles.tabletScaleDegreeSmallTop : styles.scaleDegreeSmallTop;
  const degreeSmallBottomStyle = isTablet ? styles.tabletScaleDegreeSmallBottom : styles.scaleDegreeSmallBottom;

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

  if (altDegree) {
    if (altSelected) {
      return (
        <Pressable onPress={onPressScaleDegree} style={pressedOpacity}>
          <View style={[styles.scaleDegreeSelected, degreeContainerSize]}>
            <Text style={[styles.scaleDegree, degreeTextStyle, degreeContainerSize, styles.scaleDegreeSelectedText]}>
              {altAccidental && <Accidental>{altAccidental}</Accidental>}
              {altDegree}
            </Text>
          </View>
        </Pressable>
      );
    }

    if (selected) {
      return (
        <Pressable onPress={onPressScaleDegree} style={pressedOpacity}>
          <View style={[styles.scaleDegreeSelected, degreeContainerSize]}>
            <Text style={[styles.scaleDegree, degreeTextStyle, degreeContainerSize, styles.scaleDegreeSelectedText, !accidental && styles.accidentalOffset]}>
              {accidental && <Accidental>{accidental}</Accidental>}
              {degree}
            </Text>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable onPress={onPressScaleDegree} style={pressedOpacity}>
        <View style={degreeContainerSize}>
          <Text style={[styles.scaleDegreeSmall, degreeSmallStyle, degreeSize, degreeSmallTopStyle, selected && styles.scaleDegreeSelected]}>
            <Text style={styles.accidental}>
              <Accidental />
              {accidental}
            </Text>
            {degree}
          </Text>
          <Text style={[styles.scaleDegreeSmall, degreeSmallStyle, degreeSize, degreeSmallBottomStyle, selected && styles.scaleDegreeSelected]}>
            <Text style={styles.accidental}>
              <Accidental />
              {altAccidental}
            </Text>
            {altDegree}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPressScaleDegree} style={pressedOpacity}>
      <View style={[degreeContainerSize, selected && styles.scaleDegreeSelected]}>
        <Text style={[styles.scaleDegree, degreeTextStyle, degreeContainerSize, selected && styles.scaleDegreeSelectedText, !accidental && styles.accidentalOffset]}>
          {accidental && <Accidental>{accidental}</Accidental>}
          {degree}
        </Text>
      </View>
    </Pressable>
  );
};

const SCALE_DEGREE_HEIGHT = 45;
const TABLET_DEGREE_HEIGHT = 79;
const PHONE_DEGREE_WIDTH = 46;
const TABLET_DEGREE_WIDTH = 80;

const styles = StyleSheet.create({
  label: {
    fontFamily: "blackout",
    fontSize: 25,
    color: theme.colors.lightBlue,
    transform: [{ translateY: 8 }],
  },

  scaleDegree: {
    fontSize: 33,
    display: "flex",
    color: theme.colors.lightBlue,
    fontFamily: "basicManual",
    width: 52,
    height: SCALE_DEGREE_HEIGHT,
    textAlign: "center",
    paddingTop: 7,
  },
  scaleDegreeSelected: {
    backgroundColor: theme.colors.blue,
    color: theme.colors.white,
  },
  scaleDegreeSelectedText: {
    color: theme.colors.white,
  },
  scaleDegreeSmall: {
    position: "absolute",
    fontSize: 25,
    lineHeight: 28,
    color: theme.colors.lightBlue,
    fontFamily: "basicManual",
    width: 52,
    textAlign: "center",
    height: 28,
  },
  accidental: {
    fontFamily: "opus",
  },
  accidentalOffset: {
    transform: [{ translateY: 4 }],
  },
  scaleDegreeSmallTop: {
    top: 1,
  },
  scaleDegreeSmallBottom: {
    top: 17,
  },
  tabletScaleDegree: {
    fontSize: 49,
    paddingTop: 10,
  },
  tabletScaleDegreeSmall: {
    fontSize: 36,
    lineHeight: 42,
    height: 42,
  },
  tabletScaleDegreeSmallTop: {
    top: 2,
  },
  tabletScaleDegreeSmallBottom: {
    top: 35,
  },
});
