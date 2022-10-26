import React, { useContext, useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { Store } from "../../Store";

import { theme } from "../utils/theme";

const getScaleDegree = (d) => {
  switch (d) {
    case 0:
      return "1";
      break;
    case 1:
      return "b2";
      break;
    case 2:
      return "2";
      break;
    case 3:
      return "b3";
      break;
    case 3.1:
      return "#2";
      break;
    case 4:
      return "3";
      break;
    case 5:
      return "4";
      break;
    case 6:
      return "b5";
      break;
    case 6.1:
      return "#4";
      break;
    case 7:
      return "5";
      break;
    case 8:
      return "b6";
      break;
    case 8.1:
      return "#5";
      break;
    case 9:
      return "6";
      break;
    case 10:
      return "b7";
      break;
    case 11:
      return "7";
      break;
  }
};

const ScaleDegree = (props) => {
  const { selected, altSelected, d, e } = props;
  const [degree, setDegree] = useState();
  const [altDegree, setAltDegree] = useState();
  const [accidental, setAccidental] = useState();
  const [altAccidental, setAltAccidental] = useState();

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
    console.log(`press ${accidental && accidental} ${degree}`);
  };

  if (altDegree) {
    if (altSelected) {
      return (
        <Pressable onPress={onPressScaleDegree}>
          <View style={[styles.scaleDegreeSelected]}>
            <Text style={[styles.scaleDegree, styles.scaleDegreeSelectedText, accidental && styles.accidentalOffsetUp]}>
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

const Accidental = ({ children }) => {
  return <Text style={styles.accidental}>{children}</Text>;
};

const Label = ({ children }) => {
  const handlePress = () => {
    console.log(`press ${children}`);
  };
  return (
    <Pressable onPress={handlePress}>
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  );
};

const degrees = [{ d: 0 }, { d: 1 }, { d: 2 }, { d: 3.1, e: 3 }, { d: 4 }, { d: 5 }, { d: 6.1, e: 6 }, { d: 7 }, { d: 8.1, e: 8 }, { d: 9 }, { d: 10 }, { d: 11 }];

const Footer = () => {
  const { globalState, setGlobalState } = useContext(Store);

  return (
    <View style={styles.container}>
      <Label>Clear</Label>
      <View style={styles.scaleDegreeContainer}>
        {degrees.map((d, i) => {
          const selected = globalState.scale.degrees.includes(d.d);
          const altSelected = globalState.scale.degrees.includes(d.e);
          return <ScaleDegree key={i} d={d.d} e={d.e} selected={selected} altSelected={altSelected} />;
        })}
      </View>
      <Label>All</Label>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderBottomColor: theme.colors.blue,
    borderBottomWidth: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: 4 }],
  },
  label: {
    fontFamily: "blackout",
    fontSize: 25,
    color: theme.colors.lightBlue,
    transform: [{ translateY: 8 }],
  },
  scaleDegreeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  scaleDegree: {
    fontSize: 37,
    display: "flex",
    color: theme.colors.lightBlue,
    fontFamily: "basicManual",
    width: 50,
    height: 60,
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
    fontSize: 30,
    color: theme.colors.lightBlue,
    fontFamily: "basicManual",
    width: 50,
    textAlign: "center",
    height: 30,
  },
  accidental: {
    fontFamily: "opus",
  },
  accidentalOffset: {
    transform: [{ translateY: 6 }],
  },

  accidentalOffsetUp: {
    // transform: [{ translateY: -6 }],
  },
  scaleDegreeSmallTop: {
    // transform: [{ translateY: -4 }],
  },
  scaleDegreeSmallBottom: {
    transform: [{ translateY: -6 }],
  },
});
