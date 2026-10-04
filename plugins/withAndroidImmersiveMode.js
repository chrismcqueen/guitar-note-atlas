const { withMainActivity } = require("@expo/config-plugins");

const IMPORTS = `import android.os.Build
import android.view.WindowManager

import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat`;

const BEFORE_SUPER = `    WindowCompat.setDecorFitsSystemWindows(window, false)
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
