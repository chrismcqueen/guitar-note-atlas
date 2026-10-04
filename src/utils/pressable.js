export const pressedOpacity = ({ pressed }) => ({ opacity: pressed ? 0.45 : 1 });

export const withPressedOpacity = (style) => ({ pressed }) => [
  style,
  pressed && { opacity: 0.45 },
];
