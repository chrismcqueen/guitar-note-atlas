const { withAppDelegate, withInfoPlist } = require("expo/config-plugins");

// Expo's scene delegate owns the window and forwards lifecycle/link events to
// ExpoAppDelegate. iOS 27 requires this startup path for apps built with its SDK.
module.exports = function withIOSSceneLifecycle(config) {
  config = withAppDelegate(config, (config) => {
    const delegate = config.modResults;
    if (delegate.language !== "swift") {
      throw new Error("withIOSSceneLifecycle requires the Expo Swift AppDelegate");
    }
    let contents = delegate.contents.replace(
      /class AppDelegate: ExpoAppDelegate\s*\{/,
      "class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {",
    );
    contents = contents.replace(
      /#if os\(iOS\) \|\| os\(tvOS\)\s+window = UIWindow\(frame: UIScreen\.main\.bounds\)\s+factory\.startReactNative\([\s\S]*?launchOptions: launchOptions\)\s*#endif\n/,
      "// ExpoAppSceneDelegate creates the window and starts React Native.\n",
    );
    if (!contents.includes("ExpoReactNativeFactoryProvider") ||
        !contents.includes("reactNativeFactory = factory") ||
        /factory\.startReactNative\(/.test(contents)) {
      throw new Error("Unrecognized Expo AppDelegate startup; update withIOSSceneLifecycle before prebuilding");
    }
    delegate.contents = contents;
    return config;
  });
  return withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [{
          UISceneConfigurationName: "Default Configuration",
          UISceneDelegateClassName: "EXExpoAppSceneDelegate",
        }],
      },
    };
    return config;
  });
};
