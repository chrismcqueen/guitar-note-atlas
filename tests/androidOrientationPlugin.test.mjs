import assert from "node:assert/strict";
import test from "node:test";
import withAndroidImmersiveMode from "../plugins/withAndroidImmersiveMode.js";

const freshActivity = `package dev.com.guitarnoteatlas
import android.os.Build
import android.os.Bundle
class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }

  /**
   * Returns the name of the main component
   */
  override fun getMainComponentName(): String = "main"
}
`;

async function generateActivity(contents) {
  const config = withAndroidImmersiveMode({});
  const result = await config.mods.android.mainActivity({
    modRequest: {}, modResults: { contents, language: "kt" },
  });
  return result.modResults.contents;
}

test("native tablet landscape request survives multi-window transitions and repeated prebuilds", async () => {
  const generated = await generateActivity(freshActivity);
  const previousPolicy = generated.replace(
    /    \/\/ Keep the tablet request fixed[\s\S]*?    if \(requestedOrientation/,
    `    val orientation = when {
      shortestDisplayDp < 600 -> ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
      isInMultiWindowMode -> ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
      else -> ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
    }
    if (requestedOrientation`,
  );
  assert.notEqual(previousPolicy, generated);
  // Exercise upgrades of the already generated activity as well as fresh builds.
  assert.equal(await generateActivity(previousPolicy), generated);
  assert.equal(await generateActivity(generated), generated);
  assert.doesNotMatch(generated, /SCREEN_ORIENTATION_UNSPECIFIED/);
  assert.match(generated, /shortestDisplayDp < 600[\s\S]*SCREEN_ORIENTATION_PORTRAIT[\s\S]*SCREEN_ORIENTATION_LANDSCAPE/);
  assert.match(generated, /maximumWindowMetrics.bounds/);
  assert.match(generated, /onMultiWindowModeChanged[\s\S]*super.onMultiWindowModeChanged[^\n]*\n    applyOrientationPolicy\(\)/);
});

test("folding reclassifies the active display without an activity restart", async () => {
  const generated = await generateActivity(freshActivity);
  const previous = generated.replace(/\n  override fun onConfigurationChanged\(newConfig: Configuration\) \{[\s\S]*?\n  \}\n/, "");
  assert.notEqual(previous, generated);
  assert.equal(await generateActivity(previous), generated);
  assert.equal(await generateActivity(generated), generated);
  assert.equal((generated.match(/override fun onConfigurationChanged/g) || []).length, 1);
  assert.match(generated, /super.onConfigurationChanged\(newConfig\)[\s\S]*?applyOrientationPolicy\(\)/);
});

test("fold transitions request a direct cut before native orientation changes", async () => {
  const generated = await generateActivity(freshActivity);
  const earlierActivity = generated.replace(/    \/\/ Configure the outgoing window[\s\S]*?(?=    \/\/ Use the display's maximum bounds)/, "");
  assert.notEqual(earlierActivity, generated);
  assert.equal(await generateActivity(earlierActivity), generated);
  assert.equal(await generateActivity(generated), generated);
  // Android honors the rotation preference only for opaque fullscreen windows.
  // Keep it on the outgoing window, before requesting the next orientation.
  assert.match(generated, /attributes.rotationAnimation = WindowManager.LayoutParams.ROTATION_ANIMATION_JUMPCUT[\s\S]*attributes.flags = attributes.flags or WindowManager.LayoutParams.FLAG_FULLSCREEN[\s\S]*window.attributes = attributes[\s\S]*requestedOrientation = orientation/);
  assert.match(generated, /applyOrientationPolicy\(\)[\s\S]*super.onCreate\(null\)/);
});

test("keeping tablet orientation fixed preserves Android window resizing", async () => {
  const config = withAndroidImmersiveMode({});
  const apply = async (modResults) => (await config.mods.android.manifest({ modRequest: {}, modResults })).modResults;
  const manifest = await apply({ manifest: { application: [{ activity: [{ $: { "android:name": ".MainActivity" } }] }] } });
  const application = manifest.manifest.application[0];
  const activity = application.activity[0];
  assert.equal(activity.$["android:resizeableActivity"], "true");
  assert.ok(activity["meta-data"].some(({ $: item }) => item["android:name"] === "android.supports_size_changes" && item["android:value"] === "true"));
  for (const [name, value] of [
    ["PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY", "true"],
    ["PROPERTY_COMPAT_ALLOW_ORIENTATION_OVERRIDE", "false"],
  ]) {
    assert.ok(application.property.some(({ $: item }) => item["android:name"] === `android.window.${name}` && item["android:value"] === value));
  }
  assert.deepEqual(await apply(structuredClone(manifest)), manifest);
});

test("native fold cover attaches once and hides stale frames before React receives configuration changes", async () => {
  const generated = await generateActivity(freshActivity);
  const previous = generated
    .replace("import expo.modules.atlasdisplay.FoldTransitionCover\n", "")
    .replace("    FoldTransitionCover.attach(this)\n", "")
    .replace("    FoldTransitionCover.configurationChanging(this)\n", "")
    .replace(/\n  override fun onDestroy\(\) \{[\s\S]*?\n  \}\n/, "");
  assert.equal(await generateActivity(previous), generated);
  assert.equal(await generateActivity(generated), generated);
  assert.match(generated, /super.onCreate\(null\)\n    FoldTransitionCover.attach\(this\)/);
  assert.match(generated, /FoldTransitionCover.configurationChanging\(this\)\n    super.onConfigurationChanged/);
  assert.match(generated, /FoldTransitionCover.detach\(\)\n    super.onDestroy\(\)/);
});
