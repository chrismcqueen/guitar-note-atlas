import React, { useContext } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import KeySelector from "./KeySelector";
import Neck from "./Neck";
import PositionZoom from "./PositionZoom";
import TabletNeck from "./TabletNeck";
import { Footer } from "./Footer";
import { PositionStore, PositionVisibilityStore, Store } from "../../Store";
import { AUDIO_CONTROL_GROUP_WIDTH } from "./AudioControls";
import { getMenuVisualCenterX } from "./Header";
import { theme } from "../utils/theme";
import { getPosition } from "../utils/positions.mjs";
import { getPhonePracticeBodyHeight, getPracticeHeaderLayout, getTabletPracticeLayout, PRACTICE_NECK_GAP, TABLET_BODY_GAP } from "../utils/practiceLayout.mjs";

export const Main = React.memo(() => {
  const { dimensions, insets, navigationInsets, globalState } = useContext(Store);
  const { positionId } = useContext(PositionStore);
  const { showPositionOverview } = useContext(PositionVisibilityStore);
  const fullScreen = { height: "100%", width: "100%" };
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const safeSideInset = Math.max(insets.left, insets.right);
  const practiceHeader = getPracticeHeaderLayout(dimensions, navigationInsets, Platform.OS);
  const navigationSideInset = Math.max(navigationInsets.left, navigationInsets.right);
  const phoneBodyHeight = getPhonePracticeBodyHeight(dimensions.height, practiceHeader);
  const position = getPosition(positionId);
  const positionTitle = globalState.options?.bassMode ? position.bassTitle : position.title;
  const tabletLayout = getTabletPracticeLayout(dimensions, insets, practiceHeader);
  const tabletTitleWidth = dimensions.width - 2 * (getMenuVisualCenterX(navigationInsets, true) + AUDIO_CONTROL_GROUP_WIDTH / 2 + 12);
  const contentInsets = isTablet
    ? { paddingLeft: insets.left, paddingRight: insets.right }
    : { paddingLeft: safeSideInset, paddingRight: safeSideInset };

  return (
    <View style={styles.container}>
      <View style={fullScreen}>
        <View style={[styles.content, { paddingTop: practiceHeader.bottom + PRACTICE_NECK_GAP, paddingBottom: TABLET_BODY_GAP }, contentInsets]}>
          {isTablet ? (
            <>
              <PositionZoom height={tabletLayout.zoomHeight} />
              <View style={styles.tabletNeckRow}>
                <View style={styles.tabletKeySelector}>
                  <KeySelector compact />
                </View>
                <TabletNeck maxHeight={tabletLayout.overviewHeight} />
              </View>
            </>
          ) : (
            <View style={[styles.phoneContent, { height: phoneBodyHeight }]}>
              {showPositionOverview ? (
                <Neck maxHeight={phoneBodyHeight} />
              ) : (
                <PositionZoom compact height={phoneBodyHeight} />
              )}
            </View>
          )}
        </View>
        <View pointerEvents="box-none" style={{ position: "absolute", top: practiceHeader.top, height: practiceHeader.height, left: navigationSideInset, right: navigationSideInset }}>
          {isTablet ? (
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.tabletPositionTitle, { width: tabletTitleWidth, height: practiceHeader.height, lineHeight: practiceHeader.height }]}>{positionTitle}</Text>
          ) : (
            <KeySelector positionTitle={showPositionOverview ? undefined : positionTitle} />
          )}
        </View>
        <Footer />
      </View>
    </View>
  );
});

export default Main;

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  tabletNeckRow: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
  },
  tabletPositionTitle: {
    alignSelf: "center",
    color: theme.colors.black,
    fontFamily: "proletarsk",
    fontSize: 40,
    includeFontPadding: false,
    letterSpacing: 6,
    textAlign: "center",
    width: "100%",
  },
  tabletKeySelector: {
    left: "3%",
    position: "absolute",
    top: -80,
  },
  phoneContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
