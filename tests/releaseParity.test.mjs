import assert from "node:assert/strict";
import test from "node:test";

import {
  PHONE_WELCOME_MESSAGE,
  TABLET_WELCOME_MESSAGE,
  getWelcomeMessage,
} from "../src/utils/releaseParity.mjs";

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
