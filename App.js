import React, { useState } from "react";
import { useFonts } from "expo-font";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Header from "./src/components/Header";
import Menu from "./src/components/Menu";
import Options from "./src/components/Options";
import Main from "./src/components/Main";
import Tutorial from "./src/components/Tutorial";
import { Splash } from "./src/components/Splash";
import { Store, StoreProvider } from "./Store";

export default function App() {
  let [fontsLoaded] = useFonts({
    blackout: require("./src/utils/fonts/Blackout-Midnight.ttf"),
    basicManual: require("./src/utils/fonts/SVBasicManual-Bold.ttf"),
    jrHand: require("./src/utils/fonts/jr!hand.ttf"),
    opus: require("./src/utils/fonts/OpusTextStd.otf"),
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
    </View>
  );
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
