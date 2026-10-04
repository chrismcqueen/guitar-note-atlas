export const PHONE_WELCOME_MESSAGE =
  "Tap the diagram to zoom out and view the entire fretboard. Would you like to see the tutorial for more info?";

export const TABLET_WELCOME_MESSAGE =
  "Would you like to see the tutorial to get started?";

export const getWelcomeMessage = ({ height, width }) =>
  width >= 1000 && height >= 550
    ? TABLET_WELCOME_MESSAGE
    : PHONE_WELCOME_MESSAGE;
