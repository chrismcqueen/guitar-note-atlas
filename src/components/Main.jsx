import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";

import KeySelector from "./KeySelector";
import Neck from "./Neck";
import PositionZoom from "./PositionZoom";
import TabletNeck from "./TabletNeck";
import { Footer } from "./Footer";
import { PositionStore, PositionVisibilityStore, Store } from "../../Store";
import { theme } from "../utils/theme";
import { getPosition } from "../utils/positions.mjs";
import { getPhonePracticeHeaderLayout } from "./Header";
import { getPhonePracticeBodyHeight, getTabletPracticeLayout, TABLET_BODY_GAP, TABLET_HEADER_HEIGHT } from "../utils/practiceLayout.mjs";

export const Main = React.memo(() => {
  const { dimensions, insets, navigationInsets, globalState } = useContext(Store);
  const { positionId } = useContext(PositionStore);
  const { showPositionOverview } = useContext(PositionVisibilityStore);
  const fullScreen = { height: "100%", width: "100%" };
  const isTablet = dimensions.width >= 1000 && dimensions.height >= 550;
  const safeSideInset = Math.max(insets.left, insets.right);
  const phoneHeader = getPhonePracticeHeaderLayout(navigationInsets);
  const navigationSideInset = Math.max(navigationInsets.left, navigationInsets.right);
  const phoneBodyHeight = getPhonePracticeBodyHeight(dimensions.height, phoneHeader);
  const position = getPosition(positionId);
  const positionTitle = globalState.options?.bassMode ? position.bassTitle : position.title;
  const tabletLayout = getTabletPracticeLayout(dimensions, insets);
  const contentInsets = isTablet
    ? { paddingLeft: insets.left, paddingRight: insets.right }
    : { paddingLeft: safeSideInset, paddingRight: safeSideInset };

  return (
    <View style={styles.container}>
      <View style={fullScreen}>
        <View style={[styles.content, isTablet ? styles.tabletContent : { paddingTop: phoneHeader.top + phoneHeader.height + TABLET_BODY_GAP, paddingBottom: TABLET_BODY_GAP }, contentInsets]}>
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
        {!isTablet && (
          <View pointerEvents="box-none" style={{ position: "absolute", top: phoneHeader.top, height: phoneHeader.height, left: navigationSideInset, right: navigationSideInset }}>
            <KeySelector positionTitle={showPositionOverview ? undefined : positionTitle} />
          </View>
        )}
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
  tabletContent: {
    paddingTop: TABLET_HEADER_HEIGHT + TABLET_BODY_GAP,
    paddingBottom: TABLET_BODY_GAP,
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
