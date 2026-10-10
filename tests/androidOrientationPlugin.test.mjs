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
