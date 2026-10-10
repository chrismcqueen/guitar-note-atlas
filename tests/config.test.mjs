import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appConfig = JSON.parse(
  await readFile(new URL("../app.json", import.meta.url), "utf8"),
).expo;

test("keeps phones portrait-only and iPad natively landscape while rendering full-screen", () => {
  assert.equal(appConfig.orientation, "portrait");
  assert.equal(appConfig.ios.supportsTablet, true);
  assert.equal(appConfig.ios.requireFullScreen, true);
  assert.deepEqual(appConfig.ios.infoPlist.UISupportedInterfaceOrientations, [
    "UIInterfaceOrientationPortrait",
  ]);
  assert.deepEqual(appConfig.ios.infoPlist["UISupportedInterfaceOrientations~ipad"], [
    "UIInterfaceOrientationLandscapeRight",
  ]);
  // A global Expo initial mask overrides the per-device supported orientations.
  assert.equal(appConfig.plugins[0], "expo-screen-orientation");
});
