import React, { useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import TitleSVG from "./TitleSVG";
import NeckSVG from "./NeckSVG";

import { StyleSheet, View } from "react-native";
import { Store } from "../../../Store";
import { storeGlobalState, removeStorage } from "../../utils/functions";
import { theme } from "../../utils/theme";

const Splash = ({ setLoading }) => {
  const { setGlobalState, dimensions } = useContext(Store);

  const initialValue = {
    key: {
      key_offset: 0,
      title: "C",
    },
    scale: {
      title: "Major Scale",
      long_title: "Major Scale",
      menu_title: "Major Scale",
      degrees: [0, 2, 4, 5, 7, 9, 11],
    },
    strings: [4, 11, 7, 2, 9, 4],
    options: {
      showScaleDegree: true,
      bassMode: false,
      leftHand: false,
      upsideDown: false,
      hideAnchorFrets: false,
    },
  };

  //check local storage for previous global state
  const getLocalStorage = async () => {
    try {
      const value = await AsyncStorage.getItem("globalState");
      const parsedValue = value !== null ? JSON.parse(value) : null;
      if (parsedValue !== null) {
        const migratedValue = {
          ...initialValue,
          ...parsedValue,
          key: { ...initialValue.key, ...parsedValue.key },
          scale: { ...initialValue.scale, ...parsedValue.scale },
          options: { ...initialValue.options, ...parsedValue.options },
        };
        setGlobalState(migratedValue);
        storeGlobalState(migratedValue);
      } else {
        //if no ls, set to C major scale
        setGlobalState(initialValue);
        storeGlobalState(initialValue);
      }
      setTimeout(() => setLoading(false), 500);
    } catch (e) {
      throw e;
    }
  };

  //check for ls on mount
  useEffect(() => {
    getLocalStorage();
  }, []);

  const paddingLeft = dimensions.width / 100;

  return (
    <>
      <View style={[styles.container, { width: dimensions.width, height: dimensions.height }]}>
        <View style={[styles.title, { paddingLeft: paddingLeft }]}>
          <TitleSVG />
        </View>
        <View style={styles.neck}>
          <View style={styles.neckContent}>
            <NeckSVG dimensions={dimensions} />
          </View>
        </View>
      </View>
    </>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.blue,
    flex: 1,
  },

  neck: {
    flex: 0.4,
    justifyContent: "flex-end",
  },
  neckContent: {
    justifyContent: "flex-end",
  },
  title: {
    flex: 0.6,
    justifyContent: "center",
  },
});
