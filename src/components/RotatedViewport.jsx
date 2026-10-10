import React, { useMemo, useRef, useState } from "react";
import { Dimensions, Platform, StyleSheet, useWindowDimensions, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getAppViewport, isPortraitWindow, isTabletDisplay } from "../utils/orientation.mjs";
import { ViewportContext } from "./ViewportContext";

/**
 * Phones and iOS retain the portrait shell. Android tablet windows render
 * upright at their available size, with compact layouts when space is tight.
 * Layout, overlays and gestures all share this canvas and its transform.
 */
const RotatedViewport = ({ children }) => {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const portraitWindow = isPortraitWindow(window);
  const screen = Dimensions.get("screen");
  const portraitShell = Platform.OS === "ios" || (Platform.OS === "android" && !isTabletDisplay(screen));
  const lastPortraitWindow = useRef(null);
  const [contentWindow, setContentWindow] = useState(null);

  // Expo Go can briefly report its own landscape-shaped host window while it
  // hands off to this project's portrait lock. Never let that transient host
  // state flip the app canvas. A standalone build normally starts with the
  // portrait window immediately, while Expo Go gets a black frame until its
  // intended window is ready.
  if (portraitWindow) lastPortraitWindow.current = window;
  const activeWindow = portraitShell ? (lastPortraitWindow.current ?? window) : (contentWindow ?? window);
  const viewport = useMemo(() => getAppViewport({ window: activeWindow, screen, platform: Platform.OS, insets }),
    [activeWindow.height, activeWindow.width, screen.height, screen.width, insets.top, insets.bottom]);
  if (portraitShell && !lastPortraitWindow.current) return <View style={styles.screen} />;

  return (
    <ViewportContext.Provider value={viewport}>
      <View
        onLayout={portraitShell ? undefined : ({ nativeEvent: { layout } }) => {
          if (layout.width > 0 && layout.height > 0) {
            setContentWindow(previous => previous?.width === layout.width && previous?.height === layout.height
              ? previous : { width: layout.width, height: layout.height });
          }
        }}
        style={[styles.screen, { paddingTop: viewport.padding.top, paddingBottom: viewport.padding.bottom }]}>
        <View
          style={[
            styles.landscape,
            {
              height: viewport.dimensions.height,
              width: viewport.dimensions.width,
              transform: [{ rotate: viewport.rotated ? "90deg" : "0deg" }, { scale: viewport.scale }],
            },
          ]}
        >
          {children}
        </View>
      </View>
    </ViewportContext.Provider>
  );
};

export default RotatedViewport;

const styles = StyleSheet.create({
  landscape: {
    overflow: "hidden",
  },
  screen: {
    alignItems: "center",
    backgroundColor: "#000",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
});
