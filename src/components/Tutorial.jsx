import React, { useContext, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Store } from "../../Store";
import { theme } from "../utils/theme";
import { withPressedOpacity } from "../utils/pressable";

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
  const { dimensions, globalState, overlayInsets: insets, setShowTutorial } = useContext(Store);
  const [page, setPage] = useState(0);
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const reportedSideInset = isTablet
    ? Math.max(insets.left, insets.right)
    : Math.max(insets.left, insets.right, insets.top, insets.bottom);
  const sideInset = !isTablet && Platform.OS === "ios"
    ? Math.max(reportedSideInset, IOS_LANDSCAPE_CUTOUT_INSET)
    : reportedSideInset;
  const exitRight = isTablet
    ? (sideInset * 2) + 18
    : Platform.OS === "ios"
      ? 24
      : insets.right + 18;
  const footerHeight = Math.max(insets.bottom, isTablet ? 12 : 18) + 18;
  const pages = globalState.options.leftHand
    ? (isTablet ? tabletLeftPages : phoneLeftPages)
    : (isTablet ? tabletRightPages : phoneRightPages);

  const advance = () => {
    if (page === pages.length - 1) {
      setShowTutorial(false);
      return;
    }

    setPage((currentPage) => currentPage + 1);
  };

  const goBack = () => {
    setPage((currentPage) => Math.max(0, currentPage - 1));
  };

  return (
    <View style={styles.container}>
      <Pressable
        android_disableSound
        accessibilityLabel="Next tutorial page"
        onPress={advance}
        style={[styles.pageButton, { marginHorizontal: sideInset }]}
      >
        <Image
          source={pages[page]}
          resizeMode="stretch"
          style={[styles.baseImage, !isTablet && styles.phoneImage]}
        />
      </Pressable>
      <Pressable
        android_disableSound
        style={withPressedOpacity([styles.exit, { right: exitRight, top: insets.top + 12 }])}
        onPress={(event) => {
          event.stopPropagation();
          setShowTutorial(false);
        }}
      >
        <Text style={styles.exitText}>Exit</Text>
      </Pressable>
      {page > 0 ? (
        <Pressable
          android_disableSound
          accessibilityLabel="Previous tutorial page"
          accessibilityRole="button"
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            goBack();
          }}
          style={[
            styles.back,
            {
              bottom: Math.max(insets.bottom, isTablet ? 12 : 18),
              left: sideInset + 12,
            },
          ]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}
      <View
        pointerEvents="none"
        style={[
          styles.pageFooter,
          { height: footerHeight, left: sideInset, right: sideInset },
        ]}
      >
        <Text style={styles.page}>{page + 1} / {pages.length}</Text>
      </View>
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
  baseImage: {
    height: "100%",
    width: "100%",
  },
  pageButton: {
    height: "100%",
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
  back: {
    padding: 12,
    position: "absolute",
    zIndex: 1,
  },
  backText: {
    color: theme.colors.lightBlue,
    fontFamily: "blackout",
    fontSize: 18,
    textTransform: "uppercase",
  },
  page: {
    color: theme.colors.grey,
    fontFamily: "proletarsk",
  },
  phoneImage: {
    height: "94%",
  },
  pageFooter: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "flex-start",
    position: "absolute",
  },
});
