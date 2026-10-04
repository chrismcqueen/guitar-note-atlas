import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appConfig = JSON.parse(
  await readFile(new URL("../app.json", import.meta.url), "utf8"),
).expo;

test("keeps the native shell portrait-only while the app renders full-screen", () => {
  assert.equal(appConfig.orientation, "portrait");
  assert.equal(appConfig.ios.supportsTablet, true);
  assert.equal(appConfig.ios.requireFullScreen, true);
  assert.deepEqual(appConfig.ios.infoPlist.UISupportedInterfaceOrientations, [
    "UIInterfaceOrientationPortrait",
  ]);
  assert.deepEqual(appConfig.ios.infoPlist["UISupportedInterfaceOrientations~ipad"], [
    "UIInterfaceOrientationPortrait",
  ]);
  assert.deepEqual(appConfig.plugins[0], [
    "expo-screen-orientation",
    { initialOrientation: "PORTRAIT_UP" },
  ]);
});
