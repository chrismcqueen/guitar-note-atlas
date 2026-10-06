# Device testing

Run these checks before releasing changes that affect layout, navigation, music data, or Expo dependencies.

## Automated checks

```sh
npm test
npm run doctor
npm run export:web
```

## Manual matrix

| Target | Orientation | Checks | Current result |
| --- | --- | --- | --- |
| iPhone 16 Plus, iOS 18.4, Expo Go 57.0.9 | Landscape left and right | Launch, safe areas, fretboard, footer, menu, options, tutorial | Pass — 2026-09-30 |
| iPad Pro 11-inch (M4), iOS 18.4, Expo Go 57.0.9 | Landscape left and right | Launch, responsive layout, position zoom, position bars, footer, menu, options, tutorial | Pass — 2026-09-30 |
| Web export | Responsive landscape viewport | Bundle, launch, primary controls | Pass — 2026-09-30 |
| Android phone with display cutout | Landscape left and right | Launch, safe areas, fretboard, footer, menu, options, tutorial | Pending — Android SDK/emulator is not installed on this machine |
| Android tablet | Landscape left and right | Launch, responsive layout, position zoom, position bars, footer, menu, options, tutorial | Pending — Android SDK/emulator is not installed on this machine |

## Regression checklist

- Rotate before launch and while the app is open.
- Confirm the Dynamic Island, notch, camera cutout, and system gesture area do not cover controls or notes.
- Exercise every key, scale, and fret through fret 16.
- Cycle all enharmonic footer buttons through flat, sharp, and deselected states.
- Verify Clear/Undo and All/Undo.
- Toggle scale degrees, bass mode, left-hand mode, upside-down mode, and anchor frets.
- Navigate the complete right- and left-handed tutorials and exit from several pages.
- On tablets, move the position window from the first through the last available fret and verify its full-neck highlight.
- Force-quit and relaunch to confirm saved state migration and persistence.


## Position practice player — October 6, 2026

- Automated: 61 tests pass, including every key/position in guitar and bass, grey notes below the root, enharmonic selections, missing-root fallback, loop turnarounds, one-time completion, four-click count-in timing, accompaniment-only playback, pause cancellation/resume, and overdue scheduler behavior.
- Web export passes. Browser checks verify one yellow active note, compact play/pause plus visible settings, and the expandable controls. Phone overview and position layouts are checked at landscape sizes.
- Expo Doctor: 19/21 checks pass. Existing `android.edgeToEdgeEnabled` config-schema warning and newer Expo/asset/linking patch-version recommendations remain; no dependency versions were changed for this feature.
- Native simulator UI/listening checks remain pending because the Mac was locked during verification.

Before release, listen on bundled iOS and Android builds and the Expo Audio fallback. Check low bass/high guitar pitch shifting, clean turnarounds, long-running subdivision/drum synchronization, and stop/pause during loading. While playing, switch position/key/selected degrees, enter/leave mobile overview, mute notes, and change accompaniment. Verify the overview does not overwrite the saved Notes preference. Confirm settings scroll on short landscape phones and do not cover key/position navigation when collapsed. Check bass, left-hand, upside-down, and custom selections with no root; force-quit/relaunch to verify settings persistence.
