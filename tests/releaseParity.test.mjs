import assert from "node:assert/strict";
import test from "node:test";

import { getOptionsDrawerWidth, orientScreenBounds } from "../src/utils/screenBounds.mjs";

import {
  PHONE_WELCOME_MESSAGE,
  TABLET_WELCOME_MESSAGE,
  WELCOME_ACCEPT_LABEL,
  WELCOME_DECLINE_LABEL,
  WELCOME_TITLE,
  getWelcomeMessage,
} from "../src/utils/releaseParity.mjs";

test("physical screen bounds follow the active viewport orientation", () => {
  assert.deepEqual(
    orientScreenBounds({ width: 402, height: 874 }, { width: 852, height: 393 }),
    { width: 874, height: 402 },
  );
  assert.deepEqual(
    orientScreenBounds({ width: 874, height: 402 }, { width: 393, height: 852 }),
    { width: 402, height: 874 },
  );
});

test("options drawer and minimized app share a pixel-aligned boundary", () => {
  assert.equal(getOptionsDrawerWidth(1080), 360);
  assert.equal(getOptionsDrawerWidth(2560), 854);
  assert.equal(getOptionsDrawerWidth(1179.5), 394);
});

test("preserves the released first-launch alert labels", () => {
  assert.equal(WELCOME_TITLE, "Welcome to Guitar Note Atlas");
  assert.equal(WELCOME_DECLINE_LABEL, "No Thanks");
  assert.equal(WELCOME_ACCEPT_LABEL, "OK");
});

test("uses the released phone welcome copy for phone layouts", () => {
  assert.equal(
    getWelcomeMessage({ width: 852, height: 393 }),
    PHONE_WELCOME_MESSAGE,
  );
});

test("uses the released tablet welcome copy for tablet layouts", () => {
  assert.equal(
    getWelcomeMessage({ width: 1194, height: 834 }),
    TABLET_WELCOME_MESSAGE,
  );
});
