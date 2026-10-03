import React, { useContext, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated, Modal, Platform, Pressable } from "react-native";
import * as Linking from "expo-linking";

import { Store } from "../../Store";
import { theme } from "../utils/theme";
import { storeGlobalState } from "../utils/functions";

const Options = () => {
  const { dimensions, insets, showOptions, setShowOptions, setShowTutorial, globalState, setGlobalState } = useContext(Store);
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

  return (
    <Modal
      animationType="none"
      onRequestClose={() => setShowOptions(false)}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      supportedOrientations={["landscape", "landscape-left", "landscape-right"]}
      transparent
      visible={showOptions}
    >
      <Pressable accessibilityLabel="Close options" onPress={() => setShowOptions(false)} style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.options,
            {
              width: width,
              right: optionsAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -width],
              }),
            },
          ]}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[styles.optionsContent, { paddingRight: cutoutPadding }]}
          >
            {options.map((option, i) => (
              <Pressable key={i} onPress={() => handlePress(option)}>
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
      </Pressable>
    </Modal>
  );
};

export default Options;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: theme.colors.overlay,
    flex: 1,
  },
  options: {
    bottom: 0,
    position: "absolute",
    top: 0,
    backgroundColor: theme.colors.blue,
  },
  optionsContent: {
    flex: 1,
  },
  item: {
    color: theme.colors.pureWhite,
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
