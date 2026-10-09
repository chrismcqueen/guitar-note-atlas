import { StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

export const audioSettingsStyles = StyleSheet.create({
  label: {
    color: theme.colors.black,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 24,
    includeFontPadding: false,
    textAlign: 'left',
  },
});
