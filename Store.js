import React, { useState, createContext, useEffect } from "react";
import { useWindowDimensions } from "react-native";

export const Store = createContext(null);

export const StoreProvider = ({ children }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [globalState, setGlobalState] = useState({});

  useEffect(() => {
    //
  }, [globalState]);

  const dimensions = useWindowDimensions();

  const value = {
    dimensions,
    showMenu,
    setShowMenu,
    showOptions,
    setShowOptions,
    globalState,
    setGlobalState,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
};
