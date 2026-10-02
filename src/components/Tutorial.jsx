import React, { useContext, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Store } from "../../Store";
import { theme } from "../utils/theme";

const tabletRightPages = [
  require("../../assets/tutorial/right/01.png"), require("../../assets/tutorial/right/02.png"), require("../../assets/tutorial/right/03.png"),
  require("../../assets/tutorial/right/04.png"), require("../../assets/tutorial/right/05.png"), require("../../assets/tutorial/right/06.png"),
  require("../../assets/tutorial/right/07.png"), require("../../assets/tutorial/right/08.png"), require("../../assets/tutorial/right/09.png"),
  require("../../assets/tutorial/right/10.png"), require("../../assets/tutorial/right/11.png"), require("../../assets/tutorial/right/12.png"),
  require("../../assets/tutorial/right/13.png"), require("../../assets/tutorial/right/14.png"), require("../../assets/tutorial/right/15.png"),
  require("../../assets/tutorial/right/16.png"), require("../../assets/tutorial/right/17.png"), require("../../assets/tutorial/right/18.png"),
  require("../../assets/tutorial/right/19.png"), require("../../assets/tutorial/right/20.png"), require("../../assets/tutorial/right/21.png"),
  require("../../assets/tutorial/right/22.png"), require("../../assets/tutorial/right/23.png"),
];

const tabletLeftPages = [
  require("../../assets/tutorial/left/01.png"), require("../../assets/tutorial/left/02.png"), require("../../assets/tutorial/left/03.png"),
  require("../../assets/tutorial/left/04.png"), require("../../assets/tutorial/left/05.png"), require("../../assets/tutorial/left/06.png"),
  require("../../assets/tutorial/left/07.png"), require("../../assets/tutorial/left/08.png"), require("../../assets/tutorial/left/09.png"),
  require("../../assets/tutorial/left/10.png"), require("../../assets/tutorial/left/11.png"), require("../../assets/tutorial/left/12.png"),
  require("../../assets/tutorial/left/13.png"), require("../../assets/tutorial/left/14.png"), require("../../assets/tutorial/left/15.png"),
  require("../../assets/tutorial/left/16.png"), require("../../assets/tutorial/left/17.png"), require("../../assets/tutorial/left/18.png"),
  require("../../assets/tutorial/left/19.png"), require("../../assets/tutorial/left/20.png"), require("../../assets/tutorial/left/21.png"),
  require("../../assets/tutorial/left/22.png"), require("../../assets/tutorial/left/23.png"),
];

const phoneRightPages = [
  require("../../assets/tutorial/phone-right/01.png"), require("../../assets/tutorial/phone-right/02.png"), require("../../assets/tutorial/phone-right/03.png"),
  require("../../assets/tutorial/phone-right/04.png"), require("../../assets/tutorial/phone-right/05.png"), require("../../assets/tutorial/phone-right/06.png"),
  require("../../assets/tutorial/phone-right/07.png"), require("../../assets/tutorial/phone-right/08.png"), require("../../assets/tutorial/phone-right/09.png"),
  require("../../assets/tutorial/phone-right/10.png"), require("../../assets/tutorial/phone-right/11.png"), require("../../assets/tutorial/phone-right/12.png"),
  require("../../assets/tutorial/phone-right/13.png"), require("../../assets/tutorial/phone-right/14.png"), require("../../assets/tutorial/phone-right/15.png"),
  require("../../assets/tutorial/phone-right/16.png"), require("../../assets/tutorial/phone-right/17.png"), require("../../assets/tutorial/phone-right/18.png"),
  require("../../assets/tutorial/phone-right/19.png"), require("../../assets/tutorial/phone-right/20.png"), require("../../assets/tutorial/phone-right/21.png"),
  require("../../assets/tutorial/phone-right/22.png"), require("../../assets/tutorial/phone-right/23.png"),
];

const phoneLeftPages = [
  require("../../assets/tutorial/phone-left/01.png"), require("../../assets/tutorial/phone-left/02.png"), require("../../assets/tutorial/phone-left/03.png"),
  require("../../assets/tutorial/phone-left/04.png"), require("../../assets/tutorial/phone-left/05.png"), require("../../assets/tutorial/phone-left/06.png"),
  require("../../assets/tutorial/phone-left/07.png"), require("../../assets/tutorial/phone-left/08.png"), require("../../assets/tutorial/phone-left/09.png"),
  require("../../assets/tutorial/phone-left/10.png"), require("../../assets/tutorial/phone-left/11.png"), require("../../assets/tutorial/phone-left/12.png"),
  require("../../assets/tutorial/phone-left/13.png"), require("../../assets/tutorial/phone-left/14.png"), require("../../assets/tutorial/phone-left/15.png"),
  require("../../assets/tutorial/phone-left/16.png"), require("../../assets/tutorial/phone-left/17.png"), require("../../assets/tutorial/phone-left/18.png"),
  require("../../assets/tutorial/phone-left/19.png"), require("../../assets/tutorial/phone-left/20.png"), require("../../assets/tutorial/phone-left/21.png"),
  require("../../assets/tutorial/phone-left/22.png"), require("../../assets/tutorial/phone-left/23.png"),
];

const IOS_LANDSCAPE_CUTOUT_INSET = 72;

const Tutorial = () => {
  const { dimensions, globalState, insets, setShowTutorial } = useContext(Store);
  const [page, setPage] = useState(0);
  const [incomingPage, setIncomingPage] = useState(null);
  const transitionOpacity = useRef(new Animated.Value(0)).current;
  const transitioning = useRef(false);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const reportedSideInset = isTablet
    ? Math.max(insets.left, insets.right)
    : Math.max(insets.left, insets.right, insets.top, insets.bottom);
  const sideInset = !isTablet && Platform.OS === "ios"
    ? Math.max(reportedSideInset, IOS_LANDSCAPE_CUTOUT_INSET)
    : reportedSideInset;
  const pages = globalState.options.leftHand
    ? (isTablet ? tabletLeftPages : phoneLeftPages)
    : (isTablet ? tabletRightPages : phoneRightPages);

  const advance = () => {
    if (transitioning.current) return;
    if (page === pages.length - 1) {
      setShowTutorial(false);
      return;
    }

    transitioning.current = true;
    const nextPage = page + 1;
    transitionOpacity.setValue(0);
    setIncomingPage(nextPage);
    Animated.timing(transitionOpacity, { duration: 300, toValue: 1, useNativeDriver: true }).start(() => {
      setPage(nextPage);
      setIncomingPage(null);
      transitionOpacity.setValue(0);
      transitioning.current = false;
    });
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Next tutorial page"
        onPress={advance}
        style={[styles.pageButton, { marginHorizontal: sideInset }]}
      >
        <Animated.Image source={pages[page]} resizeMode="stretch" style={styles.image} />
        {incomingPage !== null && (
          <Animated.Image
            source={pages[incomingPage]}
            resizeMode="stretch"
            style={[styles.incomingImage, { opacity: transitionOpacity }]}
          />
        )}
      </Pressable>
      <Pressable
        style={[styles.exit, { right: sideInset + 18, top: insets.top + 12 }]}
        onPress={(event) => {
          event.stopPropagation();
          setShowTutorial(false);
        }}
      >
        <Text style={styles.exitText}>Exit</Text>
      </Pressable>
      <Text style={[styles.page, { bottom: insets.bottom + 8 }]}>{page + 1} / {pages.length}</Text>
    </View>
  );
};

export default Tutorial;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.tutorialPaper,
    zIndex: 4000,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  incomingImage: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
  },
  pageButton: {
    ...StyleSheet.absoluteFillObject,
  },
  exit: {
    position: "absolute",
    padding: 12,
  },
  exitText: {
    color: theme.colors.lightBlue,
    fontFamily: "blackout",
    fontSize: 18,
    textTransform: "uppercase",
  },
  page: {
    alignSelf: "center",
    color: theme.colors.grey,
    fontFamily: "proletarsk",
    position: "absolute",
  },
});
