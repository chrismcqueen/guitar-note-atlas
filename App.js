import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import * as Font from "expo-font";
import { useFonts } from "expo-font";
import AppLoading from "expo-app-loading";

import { Navigator } from "./src/navigation/Navigator";
import { StoreProvider } from "./Store";
import { Home } from "./src/screens/Home";
import Header from "./src/components/Header";
import Footer from "./src/components/Footer";

import { theme } from "./src/utils/theme";

export default function App() {
  let [fontsLoaded] = useFonts({
    blackout: require("./src/utils/fonts/BlackoutMidnight.ttf"),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
      <StoreProvider>
        {/* <SafeAreaView style={styles.container}> */}
        <Header style={styles.header} />
        <Home style={styles.main} />
        <Footer style={styles.footer} />
        {/* </SafeAreaView> */}
        {/* <Navigator /> */}
      </StoreProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: theme.colors.blue,
    // alignItems: "center",
    // justifyContent: "center",
  },
  header: {
    flex: 1,
  },
  // main: {
  //   flex: 2,
  // },
  // footer: {
  //   flex: 1,
  // },
});
