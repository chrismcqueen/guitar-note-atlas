import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";

const displayGeometry = Platform.OS === "android" || Platform.OS === "ios" ? requireOptionalNativeModule("AtlasDisplayGeometry") : null;

export const completeDisplayTransition = (id, width, height) => {
  if (displayGeometry?.completeTransition) void displayGeometry.completeTransition(id, width, height).catch(() => {});
};

export const useDisplayGeometry = () => {
  const [geometry, setGeometry] = useState(null);
  useEffect(() => {
    if (!displayGeometry) return;
    let mounted = true;
    const update = (value) => { if (mounted && value) setGeometry(value); };
    const refresh = () => displayGeometry.getGeometry().then(update).catch(() => {});
    const changes = displayGeometry.addListener("onGeometryChanged", update);
    const foreground = AppState.addEventListener("change", (state) => { if (state === "active") refresh(); });
    refresh();
    return () => { mounted = false; changes.remove(); foreground.remove(); };
  }, []);
  return geometry;
};
