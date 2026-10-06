import { NativeAudioTransport } from "./practiceTransport.mjs";
export { NativeAudioTransport } from "./practiceTransport.mjs";

export const createNativeAudioTransport = (callbacks) => {
  try {
    const { AudioContext, AudioManager } = require("react-native-audio-api");
    AudioManager.setAudioSessionOptions({ iosCategory: "playback", iosMode: "default", iosOptions: ["mixWithOthers"] });
    return new NativeAudioTransport(AudioContext, AudioManager, callbacks);
  } catch (_error) {
    return null;
  }
};
