import React, { useContext, useState, createContext, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getViewportInsets } from "./src/utils/orientation.mjs";
import { ViewportContext } from "./src/components/ViewportContext";

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
  const [positionSelection, setPositionSelection] = useState({ fret: null, id: 0 });
  const [showPositionOverview, setShowPositionOverview] = useState(true);
  const [globalState, setGlobalState] = useState({});

  const windowDimensions = useWindowDimensions();
  const viewport = useContext(ViewportContext);
  const physicalInsets = useSafeAreaInsets();
  const dimensions = viewport.dimensions;
  const insets = useMemo(
    () => getViewportInsets(physicalInsets, windowDimensions, viewport),
    [viewport, windowDimensions.height, windowDimensions.width, physicalInsets.bottom, physicalInsets.left, physicalInsets.right, physicalInsets.top],
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
    positionFret: positionSelection.fret,
    positionId: positionSelection.id,
  }), [positionSelection]);
  const positionVisibilityValue = useMemo(() => ({ showPositionOverview }), [showPositionOverview]);
  const positionActions = useMemo(() => ({ setPositionSelection, setShowPositionOverview }), []);

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
