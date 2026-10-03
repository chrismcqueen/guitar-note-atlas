import React, { useState, createContext, useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Store = createContext(null);

export const StoreProvider = ({ children }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);
  const [positionId, setPositionId] = useState(0);
  const [showPositionOverview, setShowPositionOverview] = useState(false);
  const [globalState, setGlobalState] = useState({});

  useEffect(() => {
    //
  }, [globalState]);

  const windowDimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const dimensions = windowDimensions;

  const value = {
    dimensions,
    insets,
    showMenu,
    setShowMenu,
    showOptions,
    setShowOptions,
    showTutorial,
    setShowTutorial,
    showTutorialPrompt,
    setShowTutorialPrompt,
    positionId,
    setPositionId,
    showPositionOverview,
    setShowPositionOverview,
    globalState,
    setGlobalState,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
};
