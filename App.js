import React, { useEffect, useRef, useState } from "react";
import { useFonts } from "expo-font";
import { useKeepAwake } from "expo-keep-awake";
import { NavigationBar } from "expo-navigation-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { Alert, Animated, Easing, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Header from "./src/components/Header";
import Menu from "./src/components/Menu";
import Options from "./src/components/Options";
import Main from "./src/components/Main";
import Tutorial from "./src/components/Tutorial";
import { Splash } from "./src/components/Splash";
import { Store, StoreProvider } from "./Store";
import { storeGlobalState } from "./src/utils/functions";
import { getWelcomeMessage } from "./src/utils/releaseParity.mjs";

export default function App() {
  useKeepAwake();

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
  }, []);

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
    <SafeAreaProvider>
      <StatusBar hidden />
      <NavigationBar hidden style="dark" />
      <StoreProvider>
        {!fontsLoaded || loading ? (
          <Splash setLoading={setLoading} />
        ) : (
          <AppContent />
        )}
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const AppContent = () => {
  const { dimensions, showOptions } = React.useContext(Store);
  const optionsTransition = useRef(new Animated.Value(0)).current;
  const [optionsMounted, setOptionsMounted] = useState(false);
  const optionsWidth = Math.min(300, dimensions.width);

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
    outputRange: [1, (dimensions.width - optionsWidth) / dimensions.width],
  });
  const appTranslateX = optionsTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -optionsWidth / 2],
  });

  return (
    <View style={[styles.app, !optionsMounted && styles.appIdle]}>
      <Animated.View
        renderToHardwareTextureAndroid={optionsMounted}
        shouldRasterizeIOS={optionsMounted}
        style={[
          styles.navigationScreen,
          !optionsMounted && styles.navigationScreenIdle,
          {
            height: optionsMounted ? dimensions.height : undefined,
            width: optionsMounted ? dimensions.width : undefined,
            transform: [{ translateX: appTranslateX }, { scale: appScale }],
          },
        ]}
      >
        <Main />
        <Menu />
        <Header />
      </Animated.View>
      <Options mounted={optionsMounted} transition={optionsTransition} />
      <TutorialGate />
      <TutorialPrompt />
    </View>
  );
};

const TutorialPrompt = () => {
  const { dimensions, globalState, setGlobalState, setShowTutorial, setShowTutorialPrompt, showTutorialPrompt } = React.useContext(Store);

  useEffect(() => {
    if (!showTutorialPrompt) return;

    const finish = (openTutorial) => {
      const nextState = { ...globalState, displayedTutorial: true };
      setGlobalState(nextState);
      storeGlobalState(nextState);
      setShowTutorialPrompt(false);
      if (openTutorial) setShowTutorial(true);
    };

    Alert.alert(
      "Welcome to Guitar Note Atlas",
      getWelcomeMessage(dimensions),
      [
        { text: "No Thanks", onPress: () => finish(false), style: "cancel" },
        { text: "OK", onPress: () => finish(true) },
      ],
      { cancelable: false },
    );
  }, [showTutorialPrompt]);

  return null;
};

const TutorialGate = () => {
  const { showTutorial } = React.useContext(Store);
  return showTutorial ? <Tutorial /> : null;
};

const styles = StyleSheet.create({
  app: {
    backgroundColor: "#000",
    flex: 1,
  },
  appIdle: {
    backgroundColor: "#F9F8EF",
  },
  navigationScreen: {
    position: "absolute",
  },
  navigationScreenIdle: {
    ...StyleSheet.absoluteFillObject,
  },
});
