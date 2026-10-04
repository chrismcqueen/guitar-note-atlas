import React, { useContext } from "react";
import { StyleSheet, Text, View, Animated, Platform, Pressable, ScrollView, useWindowDimensions } from "react-native";
import * as Linking from "expo-linking";

import { OverlayStore, Store } from "../../Store";
import { theme } from "../utils/theme";
import { storeGlobalState } from "../utils/functions";
import { pressedOpacity } from "../utils/pressable";
import { getOptionsDrawerWidth } from "../utils/screenBounds.mjs";
import { KEY_NAVIGATION_MODES } from "../utils/keyNavigation.mjs";

const Options = ({ mounted, transition, viewport }) => {
  const { dimensions, insets, setShowTutorial, globalState, setGlobalState } = useContext(Store);
  const { setShowOptions, showOptions } = useContext(OverlayStore);
  const usableWindow = useWindowDimensions();
  const viewportWidth = viewport?.width || dimensions.width;
  const viewportHeight = viewport?.height || dimensions.height;
  const scrollViewportHeight = Math.min(viewportHeight, usableWindow.height);
  const width = getOptionsDrawerWidth(viewportWidth);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const isShortViewport = scrollViewportHeight < 500;
  const bottomScrollPadding = Platform.OS === "android" && !isTablet
    ? Math.max(insets.bottom + 16, 44)
    : isShortViewport
      ? Math.max(insets.bottom + 16, 44)
      : Math.max(insets.bottom, 16);

  const options = ["View Tutorial", "Show Scale Degrees", "Enable Bass Mode", "Enable Left Hand", "Flip Upside Down", "Hide Anchor Frets", "Rate Us", "Give Us Feedback"];

  const updateOption = (name) => {
    const nextState = {
      ...globalState,
      options: { ...globalState.options, [name]: !globalState.options[name] },
    };
    setGlobalState(nextState);
    storeGlobalState(nextState);
  };

  const setKeyNavigation = (keyNavigation) => {
    const nextState = {
      ...globalState,
      options: { ...globalState.options, keyNavigation },
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
      <View style={styles.modalContainer}>
      {showOptions ? (
        <View
          pointerEvents="none"
          style={[
            styles.backdrop,
            {
              height: viewportHeight,
              width: viewportWidth,
            },
          ]}
        />
      ) : null}
        <Pressable
          android_disableSound
          accessibilityLabel="Close options"
          onPress={() => setShowOptions(false)}
          style={[styles.dismissArea, { height: viewportHeight, width: viewportWidth - width }]}
        />
        <View style={[styles.drawerSlot, { width }]}>
          <Animated.View
            style={[
              styles.options,
              {
                height: scrollViewportHeight,
                width: width,
                transform: [{ translateX: transition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [width, 0],
                }) }],
              },
            ]}
          >
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.optionsContent}
              nestedScrollEnabled={Platform.OS === "android"}
              overScrollMode="always"
              showsVerticalScrollIndicator={false}
              style={styles.optionsScroll}
            >
              {options.map((option, i) => {
                const selected = isSelected(option);
                return (
                <Pressable android_disableSound accessibilityRole="button" key={i} onPress={() => handlePress(option)} style={pressedOpacity}>
                  <View style={[styles.itemRow, isTablet && styles.tabletItemRow]}>
                    <Text style={styles.item}>{option}</Text>
                    {option === "Rate Us" ? (
                      <Text accessibilityLabel="five stars" style={styles.stars}>★★★★★</Text>
                    ) : (
                      <Text
                        accessibilityElementsHidden={!selected}
                        importantForAccessibility={selected ? "auto" : "no-hide-descendants"}
                        style={[styles.checkmark, !selected && styles.checkmarkHidden]}
                      >
                        ✓
                      </Text>
                    )}
                  </View>
                </Pressable>
                );
              })}
              <View style={[styles.navigationSection, isTablet && styles.tabletNavigationSection]}>
                <Text style={styles.navigationTitle}>KEY NAVIGATION</Text>
                <View accessibilityRole="radiogroup" style={styles.navigationSelector}>
                  {[
                    [KEY_NAVIGATION_MODES.CHROMATIC, "CHROMATIC"],
                    [KEY_NAVIGATION_MODES.CIRCLE, "CIRCLE"],
                  ].map(([mode, label]) => {
                    const selected = (globalState.options.keyNavigation || KEY_NAVIGATION_MODES.CHROMATIC) === mode;
                    return (
                      <Pressable
                        android_disableSound
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        key={mode}
                        onPress={() => setKeyNavigation(mode)}
                        style={({ pressed }) => [
                          styles.navigationChoice,
                          selected && styles.navigationChoiceSelected,
                          pressed && styles.navigationChoicePressed,
                        ]}
                      >
                        <Text style={[styles.navigationChoiceText, selected && styles.navigationChoiceTextSelected]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View pointerEvents="none" style={{ height: bottomScrollPadding }} />
            </ScrollView>
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
    backgroundColor: theme.colors.overlay,
    left: 0,
    position: "absolute",
    top: 0,
    zIndex: 0,
  },
  dismissArea: {
    left: 0,
    position: "absolute",
    top: 0,
    zIndex: 1,
  },
  drawerSlot: {
    backgroundColor: theme.colors.blue,
    bottom: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 2,
  },
  options: {
    backgroundColor: theme.colors.blue,
  },
  optionsScroll: {
    flex: 1,
  },
  optionsContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  item: {
    color: theme.colors.white,
    fontFamily: "proletarsk",
    flex: 1,
  },
  itemRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 44,
    paddingLeft: 14,
    paddingRight: 12,
    position: "relative",
  },
  tabletItemRow: {
    minHeight: 48,
  },
  checkmark: {
    color: theme.colors.white,
    fontFamily: "proletarsk",
    fontSize: 20,
    textAlign: "center",
    width: 24,
  },
  checkmarkHidden: {
    opacity: 0,
  },
  stars: {
    color: theme.colors.white,
    fontSize: 15,
    letterSpacing: 1,
    textAlign: "right",
  },
  navigationSection: {
    paddingBottom: 8,
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  tabletNavigationSection: {
    paddingTop: 10,
  },
  navigationTitle: {
    color: theme.colors.white,
    fontFamily: "proletarsk",
    marginBottom: 7,
  },
  navigationSelector: {
    borderColor: theme.colors.white,
    borderWidth: 1,
    flexDirection: "row",
  },
  navigationChoice: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 36,
  },
  navigationChoiceSelected: {
    backgroundColor: theme.colors.white,
  },
  navigationChoicePressed: {
    opacity: 0.55,
  },
  navigationChoiceText: {
    color: theme.colors.white,
    fontFamily: "proletarsk",
    fontSize: 12,
  },
  navigationChoiceTextSelected: {
    color: theme.colors.blue,
  },
});
