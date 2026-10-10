import React, { useEffect, useContext, useMemo, useRef, useState } from "react";
import { PanResponder, Platform, ScrollView, StyleSheet, View } from "react-native";

import { ViewportContext } from "./ViewportContext";
import { clampSettingsOffset, settingsOffsetForGesture, shouldScrollSettings } from "../utils/settingsScroll.mjs";

// Native scroll recognition does not reliably follow the portrait shell's
// rotation. Capture only app-vertical drags and drive the native Y offset;
// keep the native ScrollView for clipping and accessibility.
const AudioSettingsScroll = ({ children, contentContainerStyle, height, onContentSizeChange }) => {
  const { rotated, scale } = useContext(ViewportContext);
  const customScroll = Platform.OS !== "web" && rotated;
  const scroll = useRef(null);
  const offset = useRef(0);
  const startOffset = useRef(0);
  const contentHeight = useRef(0);
  const viewportHeight = useRef(height);
  const dragging = useRef(false);
  const [indicatorOffset, setIndicatorOffset] = useState(0);
  const [measuredContentHeight, setMeasuredContentHeight] = useState(0);
  viewportHeight.current = height;

  const maxOffset = () => Math.max(0, contentHeight.current - viewportHeight.current);
  const scrollTo = (nextOffset) => {
    offset.current = clampSettingsOffset(nextOffset, maxOffset());
    setIndicatorOffset(offset.current);
    scroll.current?.scrollTo({ x: 0, y: offset.current, animated: false });
  };
  useEffect(() => scrollTo(offset.current), [height]);
  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) => shouldScrollSettings(gesture, rotated, maxOffset(), scale),
    onPanResponderGrant: (_, gesture) => {
      dragging.current = true;
      startOffset.current = offset.current;
      scrollTo(settingsOffsetForGesture(startOffset.current, gesture, rotated, maxOffset(), scale));
    },
    onPanResponderMove: (_, gesture) => scrollTo(settingsOffsetForGesture(startOffset.current, gesture, rotated, maxOffset(), scale)),
    onPanResponderRelease: () => { dragging.current = false; },
    onPanResponderTerminate: () => { dragging.current = false; },
    onPanResponderTerminationRequest: () => true,
    onShouldBlockNativeResponder: () => true,
  }), [rotated, scale]);

  const body = (
    <ScrollView
      ref={scroll}
      horizontal={false}
      disableScrollViewPanResponder={customScroll}
      canCancelContentTouches={false}
      directionalLockEnabled
      alwaysBounceHorizontal={false}
      bounces={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!customScroll}
      keyboardShouldPersistTaps="handled"
      onScroll={({ nativeEvent }) => {
        if (!dragging.current) {
          offset.current = nativeEvent.contentOffset.y;
          setIndicatorOffset(offset.current);
        }
      }}
      scrollEventThrottle={16}
      onContentSizeChange={(width, measuredHeight) => {
        contentHeight.current = measuredHeight;
        setMeasuredContentHeight(measuredHeight);
        scrollTo(offset.current);
        onContentSizeChange(width, measuredHeight);
      }}
      style={[styles.scroll, { height }]}
      contentContainerStyle={[contentContainerStyle, styles.content]}
    >
      {children}
    </ScrollView>
  );

  const overflow = Math.max(0, measuredContentHeight - height);
  const thumbHeight = Math.min(height, Math.max(20, height * height / (measuredContentHeight || 1)));
  const thumbTop = overflow > 0 ? clampSettingsOffset(indicatorOffset, overflow) / overflow * (height - thumbHeight) : 0;

  return (
    <View {...(customScroll ? responder.panHandlers : {})} style={[styles.viewport, { height }]}>
      {body}
      {overflow > 0 && (
        <View accessible={false} pointerEvents="none" style={[styles.indicator, { height: thumbHeight, top: thumbTop }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  viewport: { flexGrow: 0, flexShrink: 0, width: "100%" },
  scroll: { flexGrow: 0, flexShrink: 0, overflow: "hidden", width: "100%" },
  content: { width: "100%" },
  // The card reserves 14 points on the right; keep the thumb entirely there.
  indicator: { backgroundColor: "#A0A0A0", borderRadius: 2, position: "absolute", right: -10, width: 3 },
});

export default AudioSettingsScroll;
