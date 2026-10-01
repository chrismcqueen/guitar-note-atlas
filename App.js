import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Header from "./src/components/Header";
import Menu from "./src/components/Menu";
import Options from "./src/components/Options";
import Main from "./src/components/Main";
import { Splash } from "./src/components/Splash";
import { StoreProvider } from "./Store";

export default function App() {
  let [fontsLoaded] = useFonts({
    blackout: require("./src/utils/fonts/BlackoutMidnight.ttf"),
    basicManual: require("./src/utils/fonts/SVBasicManual-Bold.ttf"),
    opus: require("./src/utils/fonts/OpusTextStd.otf"),
    proletarsk: require("./src/utils/fonts/Proletarsk.ttf"),
  });
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StoreProvider>
          {!fontsLoaded || loading ? (
            <Splash setLoading={setLoading} />
          ) : (
            <>
              <Main />
              <Menu />
              <Header />
              <Options />
            </>
          )}
        </StoreProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#4069AE",
    flex: 1,
  },
});
