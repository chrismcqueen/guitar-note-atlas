import React, { useState, createContext } from "react";

export const Store = createContext(null);

export const StoreProvider = ({ children }) => {
  const [scale, setScale] = useState("Major Scale");

  const value = {
    scale,
    setScale,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
};
