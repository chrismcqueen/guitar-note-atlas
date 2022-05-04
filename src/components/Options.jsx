import React, { useContext, useEffect, useRef } from "react";
import { StyleSheet, Text, Animated, Pressable } from "react-native";
import * as Linking from 'expo-linking';

import { Store } from "../../Store";
import { theme } from "../utils/theme";

const Options = () => {
  const { dimensions, showOptions, globalState, setGlobalState } = useContext(Store);
  const optionsAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    showOptions
      ? Animated.timing(optionsAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start()
      : Animated.timing(optionsAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start();
  }, [showOptions]);

  const width = dimensions.width / 3;

  const options = ["View Tutorial", "Show Scale Degree", "Enable Bass Mode", "Enable Left Hand", "Flip Upside Down", "Hide Anchor Frets", "Rate Us", "Give Us Feedback"];

  const handlePress = (option) => {
    switch (option) {
      case "Show Scale Degree":
        setGlobalState({ ...globalState, options: { ...globalState.options, showScaleDegree: !globalState.options.showScaleDegree } })
        break;
      case "Enable Bass Mode":
        setGlobalState({ ...globalState, options: { ...globalState.options, bassMode: !globalState.options.bassMode } })
        break;
      case "Enable Left Hand":
        setGlobalState({ ...globalState, options: { ...globalState.options, leftHand: !globalState.options.leftHand } })
        break;
      case "Flip Upside Down":
        setGlobalState({ ...globalState, options: { ...globalState.options, upsideDown: !globalState.options.upsideDown } })
        break;
      case "Hide Anchor Frets":
        setGlobalState({ ...globalState, options: { ...globalState.options, hideAnchorFrets: !globalState.options.hideAnchorFrets } })
        break;
      case "Rate Us":
        Linking.openURL('https://apps.apple.com/us/app/guitar-note-atlas/id971847390');
        // TODO: android/google play url
        break;
      case "Give Us Feedback":
        Linking.openURL("mailto:guitarnoteatlas@gmail.com?subject=Feedback!")
    }
  };

  return (
    <Animated.View
      style={[
        styles.options,
        {
          width: width,
          height: dimensions.height,
          right: optionsAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -width],
          }),
        },
      ]}
    >
      {options.map((option, i) => (
        <Pressable key={i} onPress={() => handlePress(option)}>
          <Text style={styles.item}>{option}</Text>
        </Pressable>
      ))}
    </Animated.View>
  );
};

export default Options;

const styles = StyleSheet.create({
  options: {
    position: "absolute",
    top: 0,
    zIndex: 2001,
    backgroundColor: theme.colors.blue,
  },
  item: {
    color: "white",
    fontFamily: "proletarsk",
    margin: 5,
    padding: 8,
  },
});
