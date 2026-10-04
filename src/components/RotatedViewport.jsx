import React from "react";
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

  if (Platform.OS === "web") return children;

  const landscape = getLandscapeDimensions(window);
  const shouldRotate = isPortraitWindow(window);

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.landscape,
          {
            height: landscape.height,
            width: landscape.width,
          },
          shouldRotate && styles.rotated,
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
  screen: {
    alignItems: "center",
    backgroundColor: "#000",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
});
