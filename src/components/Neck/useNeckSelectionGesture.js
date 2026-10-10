import { useContext, useRef } from 'react';
import { Platform } from 'react-native';
import { ViewportContext } from '../ViewportContext';
import { neckPointForTouch, positionTargetForNeckPoint } from '../../utils/neckSelection.mjs';

export const useNeckSelectionGesture = ({ width, height, keyOffset, leftHand, onSelect, onFinish, onCancel }) => {
  const { rotated, scale } = useContext(ViewportContext);
  const anchor = useRef(null);
  const bounds = useRef({ width, height });
  const select = (point) => {
    const target = positionTargetForNeckPoint(point, bounds.current, keyOffset, leftHand);
    if (target) onSelect(target);
  };
  return {
    // Keep the initial local point relative to this wrapper, not SVG children.
    pointerEvents: 'box-only',
    onLayout: ({ nativeEvent: { layout } }) => { bounds.current = { width: layout.width, height: layout.height }; },
    onStartShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: ({ nativeEvent: touch }) => {
      const localScale = Platform.OS === 'web' ? scale : 1;
      anchor.current = {
        identifier: touch.identifier,
        pageX: touch.pageX, pageY: touch.pageY,
        x: touch.locationX / localScale, y: touch.locationY / localScale,
      };
      select(anchor.current);
    },
    onResponderMove: ({ nativeEvent }) => {
      if (!anchor.current) return;
      const touch = nativeEvent.touches?.find(item => item.identifier === anchor.current.identifier) ?? nativeEvent;
      if (touch.identifier !== anchor.current.identifier) return;
      select(neckPointForTouch(anchor.current, touch, { rotated, scale }));
    },
    onResponderRelease: () => { anchor.current = null; onFinish?.(); },
    onResponderTerminate: () => { anchor.current = null; onCancel?.(); },
  };
};
