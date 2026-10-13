# Native test lab

Configured October 10, 2026. Device identities and the refresh matrix are in [TESTING.md](../TESTING.md). Use bundled Release builds for manual checks, especially audio; Metro is not required. These devices expand screen-size coverage, not a claim that the complete regression checklist has passed on every target.

## Apple

The host now runs macOS 27.0.1. Xcode 27.1 RC (27A9275) is installed at `/Applications/Xcode-27.1-RC.app` alongside Xcode 26.5 (17F42), which remains the default developer directory. Use `DEVELOPER_DIR=/Applications/Xcode-27.1-RC.app/Contents/Developer` for Duo builds and simctl commands. Reused the existing iPad mini (A17 Pro) and iPad (A16) simulators with iPadOS 26.5 rather than creating duplicates. The existing iPhone SE, iPhone 12, iPhone 16 and iPad Pro 11-inch remain in the refresh matrix.

In Simulator, choose a device from Window. Set the iPads' physical orientation through Device > Orientation > Landscape Right. Phones use the existing portrait-native/rotated app shell; tablet UI is unrotated.

iPhone Duo is installed with iOS 27.1 (24A94232), identity `B3B3E73F-B9E6-4F83-8EED-690D968EA85A`. Open `/Applications/Xcode-27.1-RC.app/Contents/Applications/DeviceHub.app`, select Duo, and use Open / Partially Open / Closed to change posture. The bundled Release build is in `/tmp/gna-bundled-duo/Build/Products/Release-iphonesimulator/guitarnoteatlas.app` (temporary build output).

The iOS 27 SDK rejects the old application-only startup. The `withIOSSceneLifecycle` config plugin registers Expo's scene delegate and gives it ownership of the window and React Native startup; generated native files remain reproducible. Duo now follows its live app-window bounds through the local iOS display-geometry module, rather than the permanent phone idiom or main screen. iPhone compatibility sizing is disabled while the iPad-specific full-screen key and landscape mask remain. The inner display uses the two-neck tablet canvas in both wide and upright poses; closing returns to the rotated phone shell. UIKit handles the display transition without an added splash cover. Verified open → closed → open with the selected Middle position and open Audio Settings retained; full playback/physical-device regression remains manual. Use Device Hub’s Rotate Right control to adjust the phone viewing angle.

## Android

Android Studio 2026.1.3 and Emulator 37.1.11 are installed. Added Google's official command-line tools under `~/Library/Android/sdk/cmdline-tools/latest`. All listed AVDs share the installed Google Play ARM64 API 37.1 / 16 KB-page system image (`system-images;android-37.1;google_apis_playstore_ps16k;arm64-v8a`, revision 8). The API level is independent of the hardware profile and does not reproduce each physical device's original OS.

| AVD | Screen configuration | Coverage and limits |
| --- | --- | --- |
| `GNA_Pixel_11_Pro_XL` | 1344 × 2992, density 480 | Custom layout approximation using the installed Pixel 10 Pro XL profile, which has the same resolution as [Google's published Pixel 11 Pro XL display](https://store.google.com/product/pixel_11_pro_specs?hl=en-US). Not an official Pixel 11 hardware profile; camera/corner geometry and device-specific firmware remain approximate. |
| `GNA_Galaxy_S26` | 1080 × 2340, density 420 | Custom [Galaxy S26-sized](https://www.samsung.com/africa_en/smartphones/galaxy-s/galaxy-s26-black-256gb-sm-s942bzkoafb/) stock-Android profile, without the decorative Samsung skin. [Samsung explains](https://developer.samsung.com/galaxy-emulator-skin/guide.html) that even its skins do not provide One UI. Keep physical Samsung testing for manufacturer behavior. |
| `Pixel_Tablet` | 2560 × 1600, density 320 | Reused the existing official Pixel Tablet AVD; refresh its installed app rather than making a duplicate. |
| `GNA_Pixel_Fold` | Inner 2208 × 1840; outer 1080 × 2092; density 420 | Official original Pixel Fold hardware profile, retaining hinge, posture and folded-display-region configuration. Check both screens and live transitions. |

New Android AVDs use 2 CPU cores and 2 GB RAM each. The Mac has 24 GB RAM: leave installed AVDs available, run a small batch at a time and isolate audio listening to one running emulator. Do not wipe devices or saved app settings during refreshes.

The custom Galaxy hardware definition is saved in [test-devices/galaxy-s26-layout.xml](test-devices/galaxy-s26-layout.xml) and registered in `~/.android/devices.xml`. Keep that definition when recreating the AVD; the local SDK's official phone profiles currently stop at Pixel 10.

### Setup smoke checks

Installed the bundled feature-polish app on all six iOS simulators, all four Android AVDs and the connected physical Samsung tablet. Both added iPads and Pixel Tablet render the complete tablet layout. The flagship and Galaxy-size profiles launch the compact phone layout. New installs may still show the normal first-run tutorial choice; choose No Thanks to continue testing. Existing device preferences were retained.

Pixel Fold's inner screen now renders the two-neck tablet view. The shared viewport fits the 1000 × 550 tablet canvas into usable tablet windows at least 800 × 440 points, with a minimum scale of 80%; smaller windows remain compact and upright. The outer display retains the existing phone shell. Safe areas and gestures use the same scale as the canvas.

Reapply the native display-based orientation policy on configuration changes and discard measurements from the previous display class. Verified a live open → closed → open cycle with the same running app process: inner tablet view, outer phone view, then inner tablet view again, without the previous black screen. Captures: [inner](feature-polish/pixel-fold-inner-tablet.png), [outer](feature-polish/pixel-fold-outer-phone.png). Native requests return to landscape on the inner display and portrait on the outer. An upright inner display can still be letterboxed by Android's orientation compatibility behavior; put the emulator hardware in landscape with Rotate Left/Right. Playback and open-popover continuity through folding remain manual regression checks.

Named `gna-ready` emulator snapshots were saved for all four AVDs; the Fold is left open on its inner display for manual testing. Its older `gna-outer-ready` snapshot predates the responsive fold fix and requires reinstalling the latest build if restored. Snapshots are conveniences, not substitutes for reinstalling a fresh build or testing a cold launch.

Open Android Studio > Running Devices > + (or Device Manager), choose the named AVD and start it. Use the emulator's Fold/Unfold controls for the Fold. Native adb serials are assigned at launch; identify the AVD before installing:

```sh
~/Library/Android/sdk/platform-tools/adb devices -l
~/Library/Android/sdk/platform-tools/adb -s <serial> emu avd name
~/Library/Android/sdk/platform-tools/adb -s <serial> install -r android/app/build/outputs/apk/release/app-release.apk
~/Library/Android/sdk/platform-tools/adb -s <serial> shell am start -n dev.com.guitarnoteatlas/.MainActivity
```

Use Android Studio's bundled Java for SDK/AVD management:

```sh
JAVA_HOME='/Applications/Android Studio.app/Contents/jbr/Contents/Home' \
  ~/Library/Android/sdk/cmdline-tools/latest/bin/avdmanager list avd
```

For bundled app builds, use the installed Java 17 toolchain (`/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home`) as `JAVA_HOME`. The newer Android Studio runtime produced a native Worklets/CMake configuration failure during the October 12 refresh; the same Release build passed with Java 17.

## Physical devices and next coverage

Keep the Samsung Tab A11+, Pixel 4a and Pixel 8 in USB refreshes whenever connected. The physical Pixel 8 (shiba), running Android 17, was authorized over USB on October 12; its adb identity is `3A301FDJH0044R`. Physical devices remain the best checks for audio artifacts, touch behavior, camera clearance and manufacturer window/orientation policies.

The existing large iPad Pro 13-inch profiles are useful for an occasional maximum-size tablet check. Next prioritize enlarged Android/iOS text, narrow resizable tablet windows, fold/unfold transitions while playing or with a popover open, and an older supported Android OS. More similarly sized modern phones add less coverage than these cases.
