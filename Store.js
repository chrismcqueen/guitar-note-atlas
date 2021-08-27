import React, { useState, createContext, useEffect } from "react";
import { useWindowDimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const Store = createContext(null);

export const StoreProvider = ({ children }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [globalState, setGlobalState] = useState({});
  // const [globalState, setGlobalState] = useState({
  //   key: {
  //     key_offset: 0,
  //     title: "C",
  //   },
  //   scale: {
  //     title: "Major Scale",
  //     long_title: "Major Scale",
  //     menu_title: "Major Scale",
  //     degrees: [0, 2, 4, 5, 7, 9, 11],
  //   },
  // });

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
