import assert from "node:assert/strict";
import test from "node:test";
import withIOSSceneLifecycle from "../plugins/withIOSSceneLifecycle.js";

const legacy = `internal import Expo
@main
class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?
  var reactNativeFactory: RCTReactNativeFactory?
  public override func application(_ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let factory = ExpoReactNativeFactory(delegate: ReactNativeDelegate())
    reactNativeFactory = factory
#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
`;

const plugin = withIOSSceneLifecycle({});
const generate = async (contents, language = "swift") =>
  (await plugin.mods.ios.appDelegate({
    modRequest: {}, modResults: { contents, language },
  })).modResults.contents;

test("scene startup replaces the legacy window owner and survives repeated prebuilds", async () => {
  const generated = await generate(legacy);
  assert.match(generated, /class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider/);
  assert.match(generated, /reactNativeFactory = factory/);
  assert.match(generated, /return super.application\(application, didFinishLaunchingWithOptions: launchOptions\)/);
  assert.doesNotMatch(generated, /UIWindow\(frame:|factory.startReactNative/);
  assert.equal(await generate(generated), generated);
});

test("unknown startup templates fail instead of starting React Native twice", async () => {
  await assert.rejects(generate(legacy, "objc"), /Swift AppDelegate/);
  await assert.rejects(generate(legacy.replace("UIScreen.main.bounds", "customBounds")), /Unrecognized/);
  await assert.rejects(generate(legacy.replace("reactNativeFactory = factory", "")), /Unrecognized/);
});

test("scene registration preserves phone/tablet orientation and splash configuration", async () => {
  const original = {
    UISupportedInterfaceOrientations: ["UIInterfaceOrientationPortrait"],
    "UISupportedInterfaceOrientations~ipad": ["UIInterfaceOrientationLandscapeRight"],
    UIRequiresFullScreen: true,
    UILaunchStoryboardName: "SplashScreen",
    UIBackgroundModes: ["audio"],
  };
  const apply = async (modResults) =>
    (await plugin.mods.ios.infoPlist({ modRequest: {}, modResults })).modResults;
  const result = await apply(structuredClone(original));
  assert.deepEqual(result, {
    ...original,
    UIApplicationSceneManifest: {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [{
          UISceneConfigurationName: "Default Configuration",
          UISceneDelegateClassName: "EXExpoAppSceneDelegate",
        }],
      },
    },
  });
  assert.deepEqual(await apply(structuredClone(result)), result);
});
