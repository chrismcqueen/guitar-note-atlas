import React, { useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import TitleSVG from "./TitleSVG";
import NeckSVG from "./NeckSVG";

import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Store } from "../../../Store";
import { storeGlobalState } from "../../utils/functions";
import { theme } from "../../utils/theme";
import { orientScreenBounds } from "../../utils/screenBounds.mjs";

const initialValue = {
  key: {
    key_offset: 0,
    title: "C",
  },
  scale: {
    title: "Major Scale",
    long_title: "Major Scale",
    menu_title: "Major Scale",
    degrees: [0, 2, 4, 5, 7, 9, 11],
  },
  strings: [4, 11, 7, 2, 9, 4],
  options: {
    showScaleDegree: true,
    bassMode: false,
    leftHand: false,
    upsideDown: false,
    hideAnchorFrets: false,
    keyNavigation: "chromatic",
    audioPlayer: false,
  },
  displayedTutorial: false,
};

const Splash = ({ setLoading, error, onRetry }) => {
  const { setGlobalState, setShowTutorialPrompt, dimensions } = useContext(Store);

  useEffect(() => {
    let cancelled = false;
    let timer;
    (async () => {
      let next = initialValue;
      try {
        const value = await AsyncStorage.getItem("globalState");
        const saved = value ? JSON.parse(value) : null;
        if (saved) {
          next = {
            ...initialValue,
            ...saved,
            key: { ...initialValue.key, ...saved.key },
            scale: { ...initialValue.scale, ...saved.scale },
            options: { ...initialValue.options, ...saved.options },
          };
        } else {
          void storeGlobalState(initialValue).catch(() => {});
        }
      } catch (_) {
        // An unreadable preference must not prevent the app from starting.
      }
      if (cancelled) return;
      setGlobalState(next);
      setShowTutorialPrompt(!next.displayedTutorial);
      timer = setTimeout(() => setLoading(false), 500);
    })();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [setGlobalState, setLoading, setShowTutorialPrompt]);

  const paddingLeft = dimensions.width / 100;
  const screenBounds = (Platform.OS === "web" ? dimensions : orientScreenBounds(Dimensions.get("screen"), dimensions));
  return (
    <>
      <View style={[styles.container, screenBounds]}>
        <View style={[styles.title, { paddingLeft: paddingLeft }]}>
          <TitleSVG />
        </View>
        <View style={styles.neck}>
          <View style={styles.neckContent}>
            <NeckSVG dimensions={dimensions} />
          </View>
        </View>
        {!!error && <View style={styles.loadError}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.errorText}>Retry</Text>
          </Pressable>
        </View>}
      </View>
    </>
  );
};

export default Splash;

const styles = StyleSheet.create({
  loadError: { alignItems: "center", bottom: 24, left: 16, position: "absolute", right: 16 },
  errorText: { color: theme.colors.splashCream, fontSize: 16 },
  retryButton: { borderColor: theme.colors.splashCream, borderRadius: 6, borderWidth: 1, marginTop: 10, paddingHorizontal: 20, paddingVertical: 10 },
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.blue,
  },

  neck: {
    flex: 0.4,
    justifyContent: "flex-end",
  },
  neckContent: {
    justifyContent: "flex-end",
  },
  title: {
    flex: 0.6,
    justifyContent: "center",
  },
});
