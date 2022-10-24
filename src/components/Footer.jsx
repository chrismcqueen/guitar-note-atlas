import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";

import { theme } from "../utils/theme";

const ScaleDegree = ({ selected, accidental, degree, small, altAccidental, altDegree }) => {

  const onPressScaleDegree = () => {
    console.log(`press ${accidental && accidental} ${degree}`)
  }

  if (small) {
    return (
      <Pressable onPress={onPressScaleDegree}>
        <View>
          <Text style={[styles.scaleDegreeSmall, styles.scaleDegreeSmallTop]}><Text style={styles.accidental}><Accidental type={accidental}/></Text>{degree}</Text>
          <Text style={[styles.scaleDegreeSmall, styles.scaleDegreeSmallBottom]}><Text style={styles.accidental}><Accidental type={altAccidental}/></Text>{altDegree}</Text>
        </View>
      </Pressable>
    )
  }

  return (
    <Pressable onPress={onPressScaleDegree}>
      <Text style={[styles.scaleDegree, selected && styles.scaleDegreeSelected, !accidental && styles.accidentalOffset]}>{accidental && <Accidental type={accidental}/>}{degree}</Text>
    </Pressable>
  )
}

const Accidental = ({type}) => {
  const [accidental, setAccidental] = useState('')
  
  useEffect(()=> {
    switch (type) {
      case 'flat':
        setAccidental('b');
        break;
      case 'sharp':
        setAccidental('#');
        break;
    }
  },[])

  return (
    <Text style={styles.accidental}>{accidental}</Text>
  )
}

const Label = ({children}) => {
  const handlePress = () => {
    console.log(`press ${children}`)
  }
  return (
    <Pressable onPress={handlePress}>
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  )
}

const Footer = () => {
  return (
    <View style={styles.container}>
      <Label>Clear</Label>
      <View style={styles.scaleDegreeContainer}>
        <ScaleDegree degree="1" selected />
        <ScaleDegree accidental="flat" degree="2" />
        <ScaleDegree degree="2" selected />
        <ScaleDegree small accidental="sharp" degree="2" altAccidental="flat" altDegree="3" />
        <ScaleDegree degree="3" selected />
        <ScaleDegree degree="4" selected />
        <ScaleDegree small accidental="flat" degree="4" altAccidental="sharp" altDegree="5" /> 
        <ScaleDegree degree="5" selected />
        <ScaleDegree small accidental="sharp" degree="5" altAccidental="flat" altDegree="6" />
        <ScaleDegree degree="6" selected />
        <ScaleDegree accidental="flat" degree="7" />
        <ScaleDegree degree="7" selected />
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
  },
  label: {
    fontFamily: "blackout",
    fontSize: 25,
    color: theme.colors.lightBlue,
    transform: [{ translateY: 8 }]
  },
  scaleDegreeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24
  },
  scaleDegree: {
    fontSize: 37,
    display: 'flex',
    color: theme.colors.lightBlue,
    fontFamily: "basicManual",
    width: 50,
    height: 60,
    textAlign: 'center',
    paddingTop: 10
  },
  scaleDegreeSelected: {
    backgroundColor: theme.colors.blue,
    color: theme.colors.white,
  },
  scaleDegreeSmall: {
    fontSize: 30,
    color: theme.colors.lightBlue,
    fontFamily: "basicManual",
    width: 55,
    textAlign: 'center',
    height: 30,
  },
  accidental: {
    fontFamily: 'opus'
  },
  accidentalOffset: {
    transform: [{ translateY: 6 }]
  },
  scaleDegreeSmallTop: {
    transform: [{ translateY: -4 }]
  },
  scaleDegreeSmallBottom: {
    transform: [{ translateY: -8 }]
  },
});
