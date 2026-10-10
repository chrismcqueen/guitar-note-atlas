import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Platform, StyleSheet, useWindowDimensions, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getAppViewport, isPortraitWindow, isTabletDisplay } from "../utils/orientation.mjs";
import { ViewportContext } from "./ViewportContext";
import { completeDisplayTransition, useAndroidDisplayGeometry } from "../utils/useAndroidDisplayGeometry";

/**
 * Only phones use the rotated portrait shell. Tablets render upright at their
 * available size, with compact layouts when space is tight.
 * Layout, overlays and gestures all share this canvas and its transform.
 */
const RotatedViewport = ({ children }) => {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const portraitWindow = isPortraitWindow(window);
  const screen = Dimensions.get("screen");
  const tablet = Platform.OS === "ios" ? Platform.isPad : isTabletDisplay(screen);
  const portraitShell = (Platform.OS === "ios" || Platform.OS === "android") && !tablet;
  const lastPortraitWindow = useRef(null);
  const lastTablet = useRef(tablet);
  const [contentWindow, setContentWindow] = useState(null);
  const geometry = useAndroidDisplayGeometry();

  // Folding changes the physical display class without remounting the app.
  // Never carry the old display's measured canvas into the new shell.
  if (lastTablet.current !== tablet) {
    lastPortraitWindow.current = null;
    lastTablet.current = tablet;
  }

  // Expo Go can briefly report its own landscape-shaped host window while it
  // hands off to this project's portrait lock. Never let that transient host
  // state flip the app canvas. A standalone build normally starts with the
  // portrait window immediately, while Expo Go gets a black frame until its
  // intended window is ready.
  if (portraitWindow) lastPortraitWindow.current = window;
  const activeWindow = portraitShell ? (lastPortraitWindow.current ?? window)
    : (contentWindow?.tablet === tablet ? contentWindow : window);
  const viewport = useMemo(() => getAppViewport({ window: activeWindow, screen, platform: Platform.OS, insets, tablet }),
    [activeWindow.height, activeWindow.width, screen.height, screen.width, insets.top, insets.bottom, tablet]);
  const waitingForPortrait = portraitShell && !lastPortraitWindow.current;
  // Android can deliver display metrics, native orientation and root layout in
  // separate commits. Keep the native cover until those changes settle. Never
  // unmount the providers: doing so restarts preferences, audio and practice.
  useEffect(() => {
    if (!geometry?.transitioning || waitingForPortrait) return;
    const timer = setTimeout(() => completeDisplayTransition(geometry.transitionId, window.width, window.height), 200);
    return () => clearTimeout(timer);
  }, [geometry?.transitionId, geometry?.transitioning, window.width, window.height,
    viewport.dimensions.width, viewport.dimensions.height, viewport.rotated, viewport.scale, waitingForPortrait]);

  return (
    <ViewportContext.Provider value={viewport}>
      <View
        onLayout={portraitShell ? undefined : ({ nativeEvent: { layout } }) => {
          if (layout.width > 0 && layout.height > 0) {
            setContentWindow(previous => previous?.tablet === tablet && previous?.width === layout.width && previous?.height === layout.height
              ? previous : { width: layout.width, height: layout.height, tablet });
          }
        }}
        style={[styles.screen, { paddingTop: viewport.padding.top, paddingBottom: viewport.padding.bottom }]}>
        <View
          style={[
            styles.landscape,
            {
              height: viewport.dimensions.height,
              width: viewport.dimensions.width,
              opacity: waitingForPortrait ? 0 : 1,
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
