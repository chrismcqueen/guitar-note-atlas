const { withAndroidManifest, withMainActivity } = require("@expo/config-plugins");

const RESTRICTED_RESIZABILITY_PROPERTY =
  "android.window.PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY";

const IMPORTS = `import android.content.pm.ActivityInfo
import android.view.WindowManager

import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat`;

const BEFORE_SUPER = `    requestedOrientation =
      if (resources.configuration.smallestScreenWidthDp >= 600) {
        ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
      } else {
        ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
      }
    WindowCompat.setDecorFitsSystemWindows(window, false)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      window.attributes.layoutInDisplayCutoutMode =
        WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
    }
`;

const AFTER_SUPER = `
    hideSystemBars()
`;

const METHODS = `
  private fun hideSystemBars() {
    WindowInsetsControllerCompat(window, window.decorView).apply {
      hide(WindowInsetsCompat.Type.systemBars())
      systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus) hideSystemBars()
  }
`;

module.exports = function withAndroidImmersiveMode(config) {
  config = withAndroidManifest(config, (manifestConfig) => {
    const application = manifestConfig.modResults.manifest.application?.[0];

    if (application) {
      const mainActivity = application.activity?.find(
        (activity) => activity.$?.["android:name"] === ".MainActivity",
      );

      if (mainActivity) mainActivity.$["android:screenOrientation"] = "unspecified";

      application.property = application.property || [];
      const existingProperty = application.property.find(
        (property) => property.$?.["android:name"] === RESTRICTED_RESIZABILITY_PROPERTY,
      );

      if (existingProperty) {
        existingProperty.$["android:value"] = "true";
      } else {
        application.property.push({
          $: {
            "android:name": RESTRICTED_RESIZABILITY_PROPERTY,
            "android:value": "true",
          },
        });
      }
    }

    return manifestConfig;
  });

  return withMainActivity(config, (mainActivityConfig) => {
    let source = mainActivityConfig.modResults.contents;

    if (!source.includes("androidx.core.view.WindowCompat")) {
      source = source.replace("import android.os.Bundle", `import android.os.Bundle\n${IMPORTS}`);
    }

    if (!source.includes("WindowCompat.setDecorFitsSystemWindows")) {
      source = source.replace(
        /(^\s*)super\.onCreate\(null\)/m,
        `${BEFORE_SUPER}$1super.onCreate(null)${AFTER_SUPER}`,
      );
    }

    if (!source.includes("private fun hideSystemBars")) {
      source = source.replace(
        "\n  /**\n   * Returns the name of the main component",
        `${METHODS}\n  /**\n   * Returns the name of the main component`,
      );
    }

    mainActivityConfig.modResults.contents = source;
    return mainActivityConfig;
  });
};
