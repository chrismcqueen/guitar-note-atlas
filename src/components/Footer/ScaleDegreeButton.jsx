import React, { useContext, useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { Store } from "../../../Store";

import { Accidental, useFooter } from ".";
import { theme } from "../../utils/theme";

export const ScaleDegreeButton = (props) => {
  const { globalState, setGlobalState } = useContext(Store);
  const { selected, altSelected, d, e } = props;
  const [degree, setDegree] = useState();
  const [altDegree, setAltDegree] = useState();
  const [accidental, setAccidental] = useState();
  const [altAccidental, setAltAccidental] = useState();

  const { getScaleDegree } = useFooter();

  useEffect(() => {
    const deg = getScaleDegree(d);
    switch (deg.length) {
      case 1:
        setDegree(deg);
        break;
      case 2:
        const items = getScaleDegree(d).split("");
        setAccidental(items[0]);
        setDegree(items[1]);
        break;
    }

    if (!e) return;
    const altDeg = getScaleDegree(e);
    switch (altDeg.length) {
      case 1:
        setAltDegree(deg);
        break;
      case 2:
        const items = getScaleDegree(e).split("");
        setAltAccidental(items[0]);
        setAltDegree(items[1]);
        break;
      default:
        break;
    }
  }, []);

  const onPressScaleDegree = () => {
    if (globalState.scale.degrees.includes(d)) {
      setGlobalState({ ...globalState, scale: { degrees: globalState.scale.degrees.filter((i) => i !== d) } });
    } else {
      const degrees = globalState.scale.degrees;
      degrees.push(d);
      degrees.sort((a, b) => a - b);
      setGlobalState({ ...globalState, scale: { degrees } });
    }
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

const SCALE_DEGREE_HEIGHT = 56;

const styles = StyleSheet.create({
  label: {
    fontFamily: "blackout",
    fontSize: 25,
    color: theme.colors.lightBlue,
    transform: [{ translateY: 8 }],
  },

  scaleDegree: {
    fontSize: 37,
    display: "flex",
    color: theme.colors.lightBlue,
    fontFamily: "basicManual",
    width: 50,
    height: SCALE_DEGREE_HEIGHT,
    textAlign: "center",
    paddingTop: 10,
  },
  scaleDegreeSelected: {
    backgroundColor: theme.colors.blue,
    color: theme.colors.white,
  },
  scaleDegreeSelectedText: {
    color: theme.colors.white,
  },
  scaleDegreeSmall: {
    fontSize: 28,
    color: theme.colors.lightBlue,
    fontFamily: "basicManual",
    width: 50,
    textAlign: "center",
    height: SCALE_DEGREE_HEIGHT / 2,
  },
  accidental: {
    fontFamily: "opus",
  },
  accidentalOffset: {
    transform: [{ translateY: 6 }],
  },
  scaleDegreeSmallTop: {
    transform: [{ translateY: -4 }],
  },
  scaleDegreeSmallBottom: {
    transform: [{ translateY: -8 }],
  },
});
