import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Header from "./src/components/Header";
import Menu from "./src/components/Menu";
import Options from "./src/components/Options";
import Main from "./src/components/Main";
import Tutorial from "./src/components/Tutorial";
import { Splash } from "./src/components/Splash";
import { Store, StoreProvider } from "./Store";
import { storeGlobalState } from "./src/utils/functions";

export default function App() {
  let [fontsLoaded] = useFonts({
    blackout: require("./src/utils/fonts/Blackout-Midnight.ttf"),
    basicManual: require("./src/utils/fonts/SVBasicManual-Bold.ttf"),
    opus: require("./src/utils/fonts/OpusTextStd.otf"),
    opusChords: require("./src/utils/fonts/OpusChordsSansStd.otf"),
    proletarsk: require("./src/utils/fonts/Proletarsk.ttf"),
  });
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaProvider>
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
  return (
    <View style={styles.app}>
      <Main />
      <Menu />
      <Header />
      <Options />
      <TutorialGate />
      <TutorialPrompt />
    </View>
  );
};

const TutorialPrompt = () => {
  const { globalState, setGlobalState, setShowTutorial, setShowTutorialPrompt, showTutorialPrompt } = React.useContext(Store);

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
      "Tap the fretboard to open a position view. Would you like to see the tutorial for more info?",
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
    flex: 1,
  },
});
