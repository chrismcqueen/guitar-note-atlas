const { withAndroidManifest, withMainActivity } = require("@expo/config-plugins");

const RESTRICTED_RESIZABILITY_PROPERTY =
  "android.window.PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY";

const IMPORTS = `import android.content.pm.ActivityInfo
import android.content.res.Configuration
import android.util.DisplayMetrics
import android.view.WindowManager
import android.view.View
import android.view.WindowInsets

import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat`;

const BEFORE_SUPER = `    applyOrientationPolicy()
    WindowCompat.setDecorFitsSystemWindows(window, false)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      window.attributes.layoutInDisplayCutoutMode =
        WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
    }
`;

const AFTER_SUPER = `
    fitWindowCaption()
    hideSystemBars()
`;

const ORIENTATION_METHODS = `
  private fun applyOrientationPolicy() {
    // Use the display's maximum bounds, not the current freeform window size.
    val density = resources.displayMetrics.density
    val shortestDisplayDp = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      val bounds = windowManager.maximumWindowMetrics.bounds
      minOf(bounds.width(), bounds.height()) / density
    } else {
      val metrics = DisplayMetrics()
      @Suppress("DEPRECATION")
      windowManager.defaultDisplay.getRealMetrics(metrics)
      minOf(metrics.widthPixels, metrics.heightPixels) / density
    }
    val orientation = when {
      shortestDisplayDp < 600 -> ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
      isInMultiWindowMode -> ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
      else -> ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
    }
    if (requestedOrientation != orientation) requestedOrientation = orientation
  }

  override fun onMultiWindowModeChanged(isInMultiWindowMode: Boolean, newConfig: Configuration) {
    super.onMultiWindowModeChanged(isInMultiWindowMode, newConfig)
    applyOrientationPolicy()
  }
`;

const CAPTION_METHOD = `
  private fun fitWindowCaption() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      findViewById<View>(android.R.id.content).setOnApplyWindowInsetsListener { view, insets ->
        val caption = insets.getInsets(WindowInsets.Type.captionBar())
        view.setPadding(0, caption.top, 0, caption.bottom)
        insets
      }
      window.decorView.requestApplyInsets()
    }
  }
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
    if (hasFocus) {
      applyOrientationPolicy()
      hideSystemBars()
    }
  }
`;

module.exports = function withAndroidImmersiveMode(config) {
  config = withAndroidManifest(config, (manifestConfig) => {
    const application = manifestConfig.modResults.manifest.application?.[0];

    if (application) {
      const mainActivity = application.activity?.find(
        (activity) => activity.$?.["android:name"] === ".MainActivity",
      );

      if (mainActivity) {
        mainActivity.$["android:screenOrientation"] = "unspecified";
        mainActivity.$["android:resizeableActivity"] = "true";
        mainActivity["meta-data"] = mainActivity["meta-data"] || [];
        const sizeChanges = mainActivity["meta-data"].find((item) => item.$?.["android:name"] === "android.supports_size_changes");
        if (sizeChanges) sizeChanges.$["android:value"] = "true";
        else mainActivity["meta-data"].push({ $: { "android:name": "android.supports_size_changes", "android:value": "true" } });
      }

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

    if (!source.includes("import android.content.res.Configuration")) {
      source = source.replace("import android.os.Bundle", "import android.os.Bundle\nimport android.content.res.Configuration\nimport android.util.DisplayMetrics");
    }

    if (!source.includes("import android.view.WindowInsets\n")) {
      source = source.replace("import android.os.Bundle", "import android.os.Bundle\nimport android.view.View\nimport android.view.WindowInsets");
    }
    if (!source.includes("private fun fitWindowCaption")) {
      source = source.replace("\n  /**\n   * Returns the name of the main component", `${CAPTION_METHOD}\n  /**\n   * Returns the name of the main component`);
      // Upgrade an existing immersive activity as well as fresh prebuilds.
      if (source.includes("WindowCompat.setDecorFitsSystemWindows")) {
        source = source.replace("super.onCreate(null)", "super.onCreate(null)\n    fitWindowCaption()");
      }
    }

    // Upgrade the earlier generated launch-only orientation policy in place.
    source = source.replace(/    requestedOrientation =\n      if \(resources.configuration.smallestScreenWidthDp >= 600\) \{[\s\S]*?\n      \}/, "    applyOrientationPolicy()");
    if (!source.includes("private fun applyOrientationPolicy")) {
      source = source.replace("\n  /**\n   * Returns the name of the main component", `${ORIENTATION_METHODS}\n  /**\n   * Returns the name of the main component`);
    }
    source = source.replace("if (hasFocus) hideSystemBars()", "if (hasFocus) { applyOrientationPolicy(); hideSystemBars() }");

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
