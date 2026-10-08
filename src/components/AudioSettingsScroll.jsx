import React, { useEffect, useMemo, useRef } from "react";
import { PanResponder, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";

import { clampSettingsOffset, settingsOffsetForGesture, shouldScrollSettings } from "../utils/settingsScroll.mjs";

// Native scroll recognition does not reliably follow the portrait shell's
// rotation. Capture only app-vertical drags and drive the native Y offset;
// keep the native ScrollView for clipping, indicators and accessibility.
const AudioSettingsScroll = ({ children, contentContainerStyle, height, onContentSizeChange }) => {
  const window = useWindowDimensions();
  const rotated = Platform.OS !== "web" && window.height >= window.width;
  const scroll = useRef(null);
  const offset = useRef(0);
  const startOffset = useRef(0);
  const contentHeight = useRef(0);
  const viewportHeight = useRef(height);
  const dragging = useRef(false);
  viewportHeight.current = height;

  const maxOffset = () => Math.max(0, contentHeight.current - viewportHeight.current);
  const scrollTo = (nextOffset) => {
    offset.current = clampSettingsOffset(nextOffset, maxOffset());
    scroll.current?.scrollTo({ x: 0, y: offset.current, animated: false });
  };
  useEffect(() => scrollTo(offset.current), [height]);
  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) => shouldScrollSettings(gesture, rotated, maxOffset()),
    onPanResponderGrant: (_, gesture) => {
      dragging.current = true;
      startOffset.current = offset.current;
      scrollTo(settingsOffsetForGesture(startOffset.current, gesture, rotated, maxOffset()));
    },
    onPanResponderMove: (_, gesture) => scrollTo(settingsOffsetForGesture(startOffset.current, gesture, rotated, maxOffset())),
    onPanResponderRelease: () => { dragging.current = false; },
    onPanResponderTerminate: () => { dragging.current = false; },
    onPanResponderTerminationRequest: () => true,
    onShouldBlockNativeResponder: () => true,
  }), [rotated]);

  const body = (
    <ScrollView
      ref={scroll}
      horizontal={false}
      disableScrollViewPanResponder={Platform.OS !== "web"}
      canCancelContentTouches={false}
      directionalLockEnabled
      alwaysBounceHorizontal={false}
      bounces={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator
      scrollEnabled={Platform.OS === "web"}
      keyboardShouldPersistTaps="handled"
      onScroll={({ nativeEvent }) => {
        if (!dragging.current) offset.current = nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
      onContentSizeChange={(width, measuredHeight) => {
        contentHeight.current = measuredHeight;
        scrollTo(offset.current);
        onContentSizeChange(width, measuredHeight);
      }}
      style={[styles.scroll, { height }]}
      contentContainerStyle={[contentContainerStyle, styles.content]}
    >
      {children}
    </ScrollView>
  );

  return Platform.OS === "web" ? body : (
    <View {...responder.panHandlers} style={[styles.viewport, { height }]}>{body}</View>
  );
};

const styles = StyleSheet.create({
  viewport: { flexGrow: 0, flexShrink: 0, overflow: "hidden", width: "100%" },
  scroll: { flexGrow: 0, flexShrink: 0, overflow: "hidden", width: "100%" },
  content: { width: "100%" },
});

export default AudioSettingsScroll;
