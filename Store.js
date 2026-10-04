import React, { useState, createContext, useMemo } from "react";
import { Dimensions, Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getLandscapeDimensions, getLandscapeInsets } from "./src/utils/orientation.mjs";

export const Store = createContext(null);
export const OverlayStore = createContext(null);
export const PositionStore = createContext(null);
export const PositionActionsStore = createContext(null);
export const PositionVisibilityStore = createContext(null);

export const StoreProvider = ({ children }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);
  const [positionId, setPositionId] = useState(0);
  const [positionFret, setPositionFret] = useState(null);
  const [showPositionOverview, setShowPositionOverview] = useState(true);
  const [globalState, setGlobalState] = useState({});

  const windowDimensions = useWindowDimensions();
  const physicalInsets = useSafeAreaInsets();
  const physicalDimensions = Platform.OS === "android" ? Dimensions.get("screen") : windowDimensions;
  const dimensions = useMemo(
    () => Platform.OS === "web" ? windowDimensions : getLandscapeDimensions(physicalDimensions),
    [windowDimensions.height, windowDimensions.width],
  );
  const insets = useMemo(
    () => Platform.OS === "web" ? physicalInsets : getLandscapeInsets(physicalInsets, physicalDimensions),
    [physicalDimensions.height, physicalDimensions.width, physicalInsets.bottom, physicalInsets.left, physicalInsets.right, physicalInsets.top],
  );

  const value = useMemo(() => ({
    dimensions,
    insets,
    showTutorial,
    setShowTutorial,
    showTutorialPrompt,
    setShowTutorialPrompt,
    globalState,
    setGlobalState,
  }), [dimensions, globalState, insets, showTutorial, showTutorialPrompt]);

  const overlayValue = useMemo(() => ({
    showMenu,
    setShowMenu,
    showOptions,
    setShowOptions,
  }), [showMenu, showOptions]);

  const positionValue = useMemo(() => ({
    positionFret,
    positionId,
  }), [positionFret, positionId]);
  const positionVisibilityValue = useMemo(() => ({ showPositionOverview }), [showPositionOverview]);
  const positionActions = useMemo(() => ({ setPositionFret, setPositionId, setShowPositionOverview }), []);

  return (
    <Store.Provider value={value}>
      <OverlayStore.Provider value={overlayValue}>
        <PositionActionsStore.Provider value={positionActions}>
          <PositionStore.Provider value={positionValue}>
            <PositionVisibilityStore.Provider value={positionVisibilityValue}>{children}</PositionVisibilityStore.Provider>
          </PositionStore.Provider>
        </PositionActionsStore.Provider>
      </OverlayStore.Provider>
    </Store.Provider>
  );
};
