import React, { useEffect, useRef, useState } from "react";
import { useFonts } from "expo-font";
import { useKeepAwake } from "expo-keep-awake";
import { Animated, Dimensions, Easing, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Header from "./src/components/Header";
import Menu from "./src/components/Menu";
import Options from "./src/components/Options";
import Main from "./src/components/Main";
import Tutorial from "./src/components/Tutorial";
import { Splash } from "./src/components/Splash";
import RotatedViewport from "./src/components/RotatedViewport";
import { AudioPopover, AudioTrigger } from "./src/components/AudioControls";
import { AudioPlaybackProvider, AudioPlaybackStore } from "./src/components/AudioPlaybackProvider";
import { OverlayStore, Store, StoreProvider } from "./Store";
import { storeGlobalState } from "./src/utils/functions";
import { getOptionsDrawerWidth, orientScreenBounds } from "./src/utils/screenBounds.mjs";
import { theme } from "./src/utils/theme";
import {
  getWelcomeMessage,
  WELCOME_ACCEPT_LABEL,
  WELCOME_DECLINE_LABEL,
  WELCOME_TITLE,
} from "./src/utils/releaseParity.mjs";

export default function App() {
  useKeepAwake();

  let [fontsLoaded] = useFonts({
    blackout: require("./src/utils/fonts/Blackout-Midnight.ttf"),
    basicManual: require("./src/utils/fonts/SVBasicManual-Bold.ttf"),
    jrHand: require("./src/utils/fonts/jr-hand.ttf"),
    opus: require("./src/utils/fonts/OpusTextStd.otf"),
    opusChords: require("./src/utils/fonts/OpusChordsSansStd.otf"),
    proletarsk: require("./src/utils/fonts/Proletarsk.ttf"),
  });
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaProvider style={styles.safeAreaProvider}>
      <StatusBar hidden />
      <RotatedViewport>
        <StoreProvider>
          {!fontsLoaded || loading ? (
            <Splash setLoading={setLoading} />
          ) : (
            <AudioPlaybackProvider><AppContent /></AudioPlaybackProvider>
          )}
        </StoreProvider>
      </RotatedViewport>
    </SafeAreaProvider>
  );
}

const AppContent = () => {
  const { dimensions, globalState } = React.useContext(Store);
  const { showOptions } = React.useContext(OverlayStore);
  const { popoverOpen } = React.useContext(AudioPlaybackStore);
  const screenBounds = orientScreenBounds(Dimensions.get("screen"), dimensions);
  const optionsTransition = useRef(new Animated.Value(0)).current;
  const [optionsMounted, setOptionsMounted] = useState(false);
  const [viewport, setViewport] = useState(dimensions);
  const viewportWidth = viewport.width || dimensions.width;
  const viewportHeight = viewport.height || dimensions.height;
  const optionsWidth = getOptionsDrawerWidth(viewportWidth);

  useEffect(() => {
    optionsTransition.stopAnimation();

    if (showOptions) {
      if (!optionsMounted) {
        setOptionsMounted(true);
        return;
      }

      optionsTransition.setValue(0);
      Animated.timing(optionsTransition, {
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        toValue: 1,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (optionsMounted) {
      Animated.timing(optionsTransition, {
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        toValue: 0,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setOptionsMounted(false);
      });
    } else {
      optionsTransition.setValue(0);
    }
  }, [optionsMounted, showOptions]);

  const appScale = optionsTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, (viewportWidth - optionsWidth) / viewportWidth],
  });
  const appTranslateX = optionsTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -optionsWidth / 2],
  });
  const animatedViewportStyle = optionsMounted && {
    height: viewportHeight,
    width: viewportWidth,
    transform: [{ translateX: appTranslateX }, { scale: appScale }],
  };

  return (
    <View
      onLayout={({ nativeEvent }) => {
        const { height, width } = nativeEvent.layout;
        if (width !== viewport.width || height !== viewport.height) setViewport({ height, width });
      }}
      style={[
        styles.app,
        screenBounds,
        !optionsMounted && styles.appIdle,
      ]}
    >
      <Animated.View
        accessibilityElementsHidden={popoverOpen}
        importantForAccessibility={popoverOpen ? "no-hide-descendants" : "auto"}
        pointerEvents={popoverOpen ? "none" : "auto"}
        renderToHardwareTextureAndroid={optionsMounted}
        shouldRasterizeIOS={optionsMounted}
        style={[
          styles.navigationScreen,
          !optionsMounted && styles.navigationScreenIdle,
          screenBounds,
          animatedViewportStyle,
        ]}
      >
        <Main />
        <Menu />
        <Header />
      </Animated.View>
      <Animated.View
        accessibilityElementsHidden={popoverOpen}
        importantForAccessibility={popoverOpen ? "no-hide-descendants" : "auto"}
        pointerEvents={popoverOpen ? "none" : "box-none"}
        style={[
          styles.audioTriggerLayer,
          !optionsMounted && styles.navigationScreenIdle,
          screenBounds,
          animatedViewportStyle,
        ]}
      >
        {globalState.options?.audioPlayer && <AudioTrigger />}
      </Animated.View>
      <Options interactionDisabled={popoverOpen} mounted={optionsMounted} transition={optionsTransition} viewport={viewport} />
      {globalState.options?.audioPlayer && <AudioPopover />}
      <TutorialGate />
      <TutorialPrompt />
    </View>
  );
};

const TutorialPrompt = () => {
  const { dimensions, globalState, setGlobalState, setShowTutorial, setShowTutorialPrompt, showTutorialPrompt } = React.useContext(Store);

  const finish = (openTutorial) => {
    const nextState = { ...globalState, displayedTutorial: true };
    setGlobalState(nextState);
    storeGlobalState(nextState);
    setShowTutorialPrompt(false);
    if (openTutorial) setShowTutorial(true);
  };

  if (!showTutorialPrompt) return null;

  return (
    <View
      accessibilityViewIsModal
      style={[
        styles.promptOverlay,
        {
          height: dimensions.height,
          width: dimensions.width,
        },
      ]}
    >
      <View style={styles.promptCard}>
        <Text style={styles.promptTitle}>{WELCOME_TITLE}</Text>
        <Text style={styles.promptMessage}>{getWelcomeMessage(dimensions)}</Text>
        <View style={styles.promptActions}>
          <Pressable android_disableSound accessibilityRole="button" onPress={() => finish(false)} style={styles.promptButton}>
            <Text style={styles.promptButtonText}>{WELCOME_DECLINE_LABEL}</Text>
          </Pressable>
          <Pressable android_disableSound accessibilityRole="button" onPress={() => finish(true)} style={styles.promptButton}>
            <Text style={styles.promptButtonText}>{WELCOME_ACCEPT_LABEL}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const TutorialGate = () => {
  const { showTutorial } = React.useContext(Store);
  return showTutorial ? <Tutorial /> : null;
};

const styles = StyleSheet.create({
  safeAreaProvider: {
    ...StyleSheet.absoluteFillObject,
  },
  app: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  appIdle: {
    backgroundColor: "#F9F8EF",
  },
  audioTriggerLayer: {
    position: "absolute",
    zIndex: 350,
  },
  navigationScreen: {
    position: "absolute",
  },
  navigationScreenIdle: {
    ...StyleSheet.absoluteFillObject,
  },
  promptActions: {
    borderTopColor: "#3C3C434A",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
  },
  promptButton: {
    alignItems: "center",
    borderRightColor: "#3C3C434A",
    borderRightWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  promptButtonText: {
    color: "#007AFF",
    fontSize: 17,
  },
  promptCard: {
    backgroundColor: "#F2F2F7F2",
    borderRadius: 14,
    overflow: "hidden",
    width: 320,
  },
  promptMessage: {
    color: theme.colors.black,
    fontSize: 13,
    lineHeight: 18,
    paddingBottom: 18,
    paddingHorizontal: 18,
    textAlign: "center",
  },
  promptOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    zIndex: 5000,
  },
  promptTitle: {
    color: theme.colors.black,
    fontSize: 17,
    fontWeight: "600",
    paddingBottom: 4,
    paddingHorizontal: 18,
    paddingTop: 18,
    textAlign: "center",
  },
});
