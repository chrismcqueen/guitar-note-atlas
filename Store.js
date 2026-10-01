import React, { useState, createContext, useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Store = createContext(null);

export const StoreProvider = ({ children }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
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
    globalState,
    setGlobalState,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
};
