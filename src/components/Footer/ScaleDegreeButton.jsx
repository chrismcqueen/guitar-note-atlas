import React, { useContext } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { Store } from "../../../Store";

import { Accidental } from "./Accidental";
import { useFooter } from "./useFooter";
import { theme } from "../../utils/theme";

export const ScaleDegreeButton = (props) => {
  const { globalState, setGlobalState } = useContext(Store);
  const { selected, altSelected, d, e } = props;
  const { getScaleDegree, getMatchingScale } = useFooter();
  const [accidental, degree] = getScaleDegree(d).length === 2 ? getScaleDegree(d).split("") : [undefined, getScaleDegree(d)];
  const [altAccidental, altDegree] = e === undefined ? [] : getScaleDegree(e).split("");

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
        <Pressable onPress={onPressScaleDegree}>
          <View style={[styles.scaleDegreeSelected]}>
            <Text style={[styles.scaleDegree, styles.scaleDegreeSelectedText]}>
              {altAccidental && <Accidental>{altAccidental}</Accidental>}
              {altDegree}
            </Text>
          </View>
        </Pressable>
      );
    }

    if (selected) {
      return (
        <Pressable onPress={onPressScaleDegree}>
          <View style={[styles.scaleDegreeSelected]}>
            <Text style={[styles.scaleDegree, styles.scaleDegreeSelectedText, !accidental && styles.accidentalOffset]}>
              {accidental && <Accidental>{accidental}</Accidental>}
              {degree}
            </Text>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable onPress={onPressScaleDegree}>
        <View>
          <Text style={[styles.scaleDegreeSmall, styles.scaleDegreeSmallTop, selected && styles.scaleDegreeSelected]}>
            <Text style={styles.accidental}>
              <Accidental />
              {accidental}
            </Text>
            {degree}
          </Text>
          <Text style={[styles.scaleDegreeSmall, styles.scaleDegreeSmallBottom, selected && styles.scaleDegreeSelected]}>
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
    <Pressable onPress={onPressScaleDegree}>
      <View style={[selected && styles.scaleDegreeSelected]}>
        <Text style={[styles.scaleDegree, selected && styles.scaleDegreeSelectedText, !accidental && styles.accidentalOffset]}>
          {accidental && <Accidental>{accidental}</Accidental>}
          {degree}
        </Text>
      </View>
    </Pressable>
  );
};

const SCALE_DEGREE_HEIGHT = 64;

const styles = StyleSheet.create({
  label: {
    fontFamily: "blackout",
    fontSize: 25,
    color: theme.colors.lightBlue,
    transform: [{ translateY: 8 }],
  },

  scaleDegree: {
    fontSize: 42,
    display: "flex",
    color: theme.colors.lightBlue,
    fontFamily: "jrHand",
    width: 52,
    height: SCALE_DEGREE_HEIGHT,
    textAlign: "center",
    paddingTop: 9,
  },
  scaleDegreeSelected: {
    backgroundColor: theme.colors.blue,
    color: theme.colors.white,
  },
  scaleDegreeSelectedText: {
    color: theme.colors.white,
  },
  scaleDegreeSmall: {
    fontSize: 31,
    color: theme.colors.lightBlue,
    fontFamily: "jrHand",
    width: 52,
    textAlign: "center",
    height: SCALE_DEGREE_HEIGHT / 2,
  },
  accidental: {
    fontFamily: "opus",
  },
  accidentalOffset: {
    transform: [{ translateY: 5 }],
  },
  scaleDegreeSmallTop: {
    transform: [{ translateY: -4 }],
  },
  scaleDegreeSmallBottom: {
    transform: [{ translateY: -8 }],
  },
});
