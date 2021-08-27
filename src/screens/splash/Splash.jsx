import React, { useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import TitleSVG from './TitleSVG'
import SplashGuitarNeckSVG from './SplashGuitarNeckSVG'

import { StyleSheet, View } from "react-native";
import { Store } from "../../../Store";
import { storeGlobalState, removeStorage } from "../../utils/functions"
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
    }
  };

  //check local storage for previous global state
  const getLocalStorage = async () => {
    try {
      const value = await AsyncStorage.getItem("globalState");
      const parsedValue = value !== null ? JSON.parse(value) : null;
      if (parsedValue !== null) {
        // console.log("parsed value: ", parsedValue);
        setGlobalState(parsedValue);
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
    //save to clear ls when updating initial state
    // removeStorage();
  }, []);

  let paddingTop = dimensions.height / 9;
  // paddingTop = 0;
  const paddingLeft = dimensions.width / 100;

  return (
    <>
      <View style={[styles.container, { paddingTop: paddingTop, width: dimensions.width, height: dimensions.height }]}>
        <View style={{ paddingLeft: paddingLeft, height: dimensions.height / 2 }}>
          <TitleSVG />
        </View>
        <View style={[styles.neck, { height: dimensions.height / 2 }]}>
          <View style={{ justifyContent: "flex-end" }}>
            <SplashGuitarNeckSVG dimensions={dimensions} />
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
    justifyContent: "flex-end",
  },
});
