import React, { useRef } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";

import { getLandscapeDimensions, isPortraitWindow } from "../utils/orientation.mjs";

/**
 * Keeps the native window in portrait so system gestures stay in their normal
 * orientation, while exposing the same landscape canvas the app has always
 * rendered into. Keeping the rotation at this single boundary means the neck,
 * menu, tutorial, and overlays continue to share one coordinate system.
 */
const RotatedViewport = ({ children }) => {
  const window = useWindowDimensions();
  const portraitWindow = isPortraitWindow(window);
  const nativeLandscapeTablet =
    Platform.OS === "android" &&
    !portraitWindow &&
    Math.min(window.height, window.width) >= 600;
  const lastPortraitWindow = useRef(null);

  if (Platform.OS === "web") return children;

  // Android tablets are naturally landscape. Rendering directly into that
  // landscape activity avoids rotating a portrait compatibility box, while
  // phones and iOS keep the app's established portrait-shell behavior.
  if (nativeLandscapeTablet) {
    return <View style={styles.nativeLandscape}>{children}</View>;
  }

  // Expo Go can briefly report its own landscape-shaped host window while it
  // hands off to this project's portrait lock. Never let that transient host
  // state flip the app canvas. A standalone build normally starts with the
  // portrait window immediately, while Expo Go gets a black frame until its
  // intended window is ready.
  if (portraitWindow) lastPortraitWindow.current = window;

  const stablePortraitWindow = lastPortraitWindow.current;

  if (!stablePortraitWindow) return <View style={styles.screen} />;

  const landscape = getLandscapeDimensions(stablePortraitWindow);

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.landscape,
          {
            height: landscape.height,
            width: landscape.width,
          },
          styles.rotated,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

export default RotatedViewport;

const styles = StyleSheet.create({
  landscape: {
    overflow: "hidden",
  },
  rotated: {
    transform: [{ rotate: "90deg" }],
  },
  nativeLandscape: {
    backgroundColor: "#F9F8EF",
    flex: 1,
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
