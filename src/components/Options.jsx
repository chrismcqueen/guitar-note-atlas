import React, { useContext } from "react";
import { StyleSheet, Text, View, Animated, Platform, Pressable } from "react-native";
import * as Linking from "expo-linking";

import { Store } from "../../Store";
import { theme } from "../utils/theme";
import { storeGlobalState } from "../utils/functions";
import { pressedOpacity } from "../utils/pressable";

const Options = ({ mounted, transition }) => {
  const { dimensions, insets, setShowOptions, setShowTutorial, globalState, setGlobalState } = useContext(Store);
  const width = Math.min(300, dimensions.width);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const reportedSideInset = Math.max(insets.left, insets.right);
  const cutoutPadding = !isTablet && Platform.OS === "ios"
    ? Math.max(reportedSideInset, 72)
    : reportedSideInset;

  const options = ["View Tutorial", "Show Scale Degrees", "Enable Bass Mode", "Enable Left Hand", "Flip Upside Down", "Hide Anchor Frets", "Rate Us", "Give Us Feedback"];

  const updateOption = (name) => {
    const nextState = {
      ...globalState,
      options: { ...globalState.options, [name]: !globalState.options[name] },
    };
    setGlobalState(nextState);
    storeGlobalState(nextState);
  };

  const isSelected = (option) => {
    switch (option) {
      case "Show Scale Degrees":
        return globalState.options.showScaleDegree;
      case "Enable Bass Mode":
        return globalState.options.bassMode;
      case "Enable Left Hand":
        return globalState.options.leftHand;
      case "Flip Upside Down":
        return globalState.options.upsideDown;
      case "Hide Anchor Frets":
        return globalState.options.hideAnchorFrets;
      default:
        return false;
    }
  };

  const handlePress = (option) => {
    switch (option) {
      case "View Tutorial":
        setShowOptions(false);
        setShowTutorial(true);
        break;
      case "Show Scale Degrees":
        updateOption("showScaleDegree");
        break;
      case "Enable Bass Mode":
        updateOption("bassMode");
        break;
      case "Enable Left Hand":
        updateOption("leftHand");
        break;
      case "Flip Upside Down":
        updateOption("upsideDown");
        break;
      case "Hide Anchor Frets":
        updateOption("hideAnchorFrets");
        break;
      case "Rate Us":
        Linking.openURL("https://apps.apple.com/us/app/guitar-note-atlas/id971847390");
        // TODO: android/google play url
        break;
      case "Give Us Feedback":
        Linking.openURL("mailto:guitarnoteatlas@gmail.com?subject=Feedback!");
    }
  };

  if (!mounted) return null;

  return (
      <View style={[styles.modalContainer, { height: dimensions.height, width: dimensions.width }]}>
        <Animated.View pointerEvents="none" style={[styles.backdrop, { opacity: transition }]} />
        <Pressable
          accessibilityLabel="Close options"
          onPress={() => setShowOptions(false)}
          style={[styles.dismissArea, { height: dimensions.height, width: dimensions.width - width }]}
        />
        <View style={[styles.drawerSlot, { width }]}>
          <Animated.View
            style={[
              styles.options,
              {
                height: dimensions.height,
                width: width,
                transform: [{ translateX: transition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [width, 0],
                }) }],
              },
            ]}
          >
            <Pressable
              onPress={(event) => event.stopPropagation()}
              style={[styles.optionsContent, { paddingRight: cutoutPadding }]}
            >
              {options.map((option, i) => (
                <Pressable key={i} onPress={() => handlePress(option)} style={pressedOpacity}>
                  <View style={styles.itemRow}>
                    <Text style={styles.item}>{option}</Text>
                    <Text
                      accessibilityElementsHidden={!isSelected(option)}
                      importantForAccessibility={isSelected(option) ? "auto" : "no-hide-descendants"}
                      style={[styles.checkmark, !isSelected(option) && styles.checkmarkHidden]}
                    >
                      ✓
                    </Text>
                  </View>
                </Pressable>
              ))}
            </Pressable>
          </Animated.View>
        </View>
      </View>
  );
};

export default Options;

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
    zIndex: 0,
  },
  dismissArea: {
    left: 0,
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
  drawerSlot: {
    bottom: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 2,
  },
  options: {
    backgroundColor: theme.colors.blue,
  },
  optionsContent: {
    flex: 1,
  },
  item: {
    color: theme.colors.white,
    fontFamily: "proletarsk",
    flex: 1,
  },
  itemRow: {
    alignItems: "center",
    flexDirection: "row",
    margin: 5,
    padding: 8,
  },
  checkmark: {
    color: theme.colors.white,
    fontSize: 18,
    textAlign: "center",
    width: 18,
  },
  checkmarkHidden: {
    opacity: 0,
  },
});
