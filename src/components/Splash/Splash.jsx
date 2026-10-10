import React, { useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import TitleSVG from "./TitleSVG";
import NeckSVG from "./NeckSVG";

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Store } from "../../../Store";
import { storeGlobalState } from "../../utils/functions";
import { theme } from "../../utils/theme";
import { getSplashLayout } from "../../utils/splashLayout.mjs";

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
  },
  displayedTutorial: false,
};

const Splash = ({ setLoading, error, onRetry }) => {
  const { setGlobalState, setShowTutorialPrompt, dimensions, safeAreaInsets, obstructions } = useContext(Store);

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

  const layout = getSplashLayout(dimensions, safeAreaInsets, obstructions);
  const screenBounds = dimensions;
  return (
    <>
      <View style={[styles.container, screenBounds]}>
        <View style={[styles.title, layout.title]}>
          <TitleSVG />
        </View>
        <View pointerEvents="none" style={[styles.neck, layout.neck]}>
          <NeckSVG width={dimensions.width - layout.neck.left - layout.neck.right} height={layout.neck.height} />
        </View>
        {!!error && <View style={[styles.loadError, layout.error]}>
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
  loadError: { alignItems: "center", backgroundColor: theme.colors.blue, padding: 8, position: "absolute" },
  errorText: { color: theme.colors.splashCream, fontSize: 16 },
  retryButton: { borderColor: theme.colors.splashCream, borderRadius: 6, borderWidth: 1, marginTop: 10, paddingHorizontal: 20, paddingVertical: 10 },
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.blue,
    overflow: "hidden",
  },

  neck: {
    overflow: "hidden",
    position: "absolute",
  },
  title: {
    justifyContent: "center",
    position: "absolute",
  },
});
