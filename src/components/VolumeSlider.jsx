import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { sliderFromVolume, volumePercent, volumeFromSlider } from '../utils/audioMix.mjs';
import { isSliderDrag, SLIDER_INSET, sliderPositionAtX, sliderPositionForGesture } from '../utils/volumeSlider.mjs';
import { theme } from '../utils/theme';
import { audioSettingsStyles } from './audioSettingsStyles';

const VolumeSlider = ({ label, name, value, onChange }) => {
  const window = useWindowDimensions();
  const rotated = Platform.OS !== 'web' && window.height >= window.width;
  const [width, setWidth] = useState(0);
  const position = sliderFromVolume(value);
  const percent = volumePercent(value);
  const latest = useRef({ width, position, onChange });
  latest.current = { width, position, onChange };
  const startX = useRef(0);
  const tapX = useRef(0);
  const dragging = useRef(false);
  const change = (next) => latest.current.onChange(volumeFromSlider(next));
  const step = (amount) => change(Math.max(0, Math.min(1, latest.current.position + amount)));
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const current = latest.current;
      const thumbX = SLIDER_INSET + current.position * Math.max(0, current.width - SLIDER_INSET * 2);
      tapX.current = event.nativeEvent.locationX;
      // Grabbing the thumb keeps its original position until it moves.
      startX.current = Math.abs(tapX.current - thumbX) <= 14 ? thumbX : tapX.current;
      dragging.current = false;
    },
    onPanResponderMove: (_, gesture) => {
      if (isSliderDrag(gesture, rotated)) dragging.current = true;
      if (dragging.current && latest.current.width > 0) {
        change(sliderPositionForGesture(startX.current, gesture, rotated, latest.current.width));
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (latest.current.width > 0) {
        if (dragging.current) change(sliderPositionForGesture(startX.current, gesture, rotated, latest.current.width));
        else if (Math.abs(gesture.dx) <= 6 && Math.abs(gesture.dy) <= 6) change(sliderPositionAtX(startX.current, latest.current.width));
      }
      dragging.current = false;
    },
    onPanResponderTerminate: () => { dragging.current = false; },
    // Let a vertical swipe scroll, but retain a horizontal slider drag.
    onPanResponderTerminationRequest: () => !dragging.current,
    onShouldBlockNativeResponder: () => true,
  }), [rotated]);
  const thumbX = SLIDER_INSET + position * Math.max(0, width - SLIDER_INSET * 2);
  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={audioSettingsStyles.label}>{label}</Text>
        <Text accessible={false} style={styles.value}>{percent}</Text>
      </View>
      <View
        {...responder.panHandlers}
        accessible
        accessibilityLabel={`${name} volume`}
        accessibilityRole="adjustable"
        accessibilityValue={{ min: 0, max: 100, now: percent, text: `${percent} percent` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={({ nativeEvent }) => {
          if (nativeEvent.actionName === 'increment') step(0.05);
          if (nativeEvent.actionName === 'decrement') step(-0.05);
        }}
        {...(Platform.OS === 'web' ? {
          tabIndex: 0,
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': percent,
          'aria-valuetext': `${percent} percent`,
          onKeyDown: (event) => {
            if (['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
              event.preventDefault();
              if (event.key === 'Home') change(0);
              else if (event.key === 'End') change(1);
              else step(['ArrowLeft', 'ArrowDown'].includes(event.key) ? -0.05 : 0.05);
            }
          },
        } : {})}
        onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}
        style={styles.slider}
      >
        <View pointerEvents="none" style={styles.track} />
        <View pointerEvents="none" style={[styles.fill, { width: Math.max(0, thumbX - SLIDER_INSET) }]} />
        <View pointerEvents="none" style={[styles.thumb, { left: thumbX - 10 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 12, width: '100%' },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  value: { color: theme.colors.grey, fontFamily: 'proletarsk', fontSize: 14, lineHeight: 24, includeFontPadding: false, textAlign: 'right', width: 70 },
  slider: { height: 44, width: '100%', ...Platform.select({ web: { cursor: 'pointer', touchAction: 'pan-y' }, default: {} }) },
  track: { backgroundColor: theme.colors.neckLightGray, borderRadius: 2, height: 4, left: SLIDER_INSET, position: 'absolute', right: SLIDER_INSET, top: 20 },
  fill: { backgroundColor: theme.colors.blue, borderRadius: 2, height: 4, left: SLIDER_INSET, position: 'absolute', top: 20 },
  thumb: { backgroundColor: theme.colors.white, borderColor: theme.colors.blue, borderRadius: 10, borderWidth: 2, height: 20, position: 'absolute', top: 12, width: 20 },
});

export default VolumeSlider;
