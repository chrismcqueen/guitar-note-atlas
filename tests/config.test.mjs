import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appConfig = JSON.parse(
  await readFile(new URL("../app.json", import.meta.url), "utf8"),
).expo;

test("keeps iPad in landscape-only full-screen mode", () => {
  assert.equal(appConfig.orientation, "landscape");
  assert.equal(appConfig.ios.supportsTablet, true);
  assert.equal(appConfig.ios.requireFullScreen, true);
  assert.deepEqual(appConfig.ios.infoPlist.UISupportedInterfaceOrientations, [
    "UIInterfaceOrientationLandscapeRight",
  ]);
  assert.deepEqual(appConfig.ios.infoPlist["UISupportedInterfaceOrientations~ipad"], [
    "UIInterfaceOrientationLandscapeRight",
  ]);
  assert.deepEqual(appConfig.plugins[0], [
    "expo-screen-orientation",
    { initialOrientation: "LANDSCAPE_RIGHT" },
  ]);
});
