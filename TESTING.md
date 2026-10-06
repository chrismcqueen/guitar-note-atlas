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
| Android phone with display cutout | Landscape left and right | Launch, safe areas, fretboard, footer, menu, options, tutorial | Pixel 9 emulator launched — full manual review pending |
| Android tablet | Landscape left and right | Launch, responsive layout, position zoom, position bars, footer, menu, options, tutorial | Pixel Tablet emulator launched — full manual review pending |

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
- Production exports pass for iOS, Android, and web. Browser checks verify one yellow active note, compact play/pause plus visible settings, and the expandable controls. Phone overview and position layouts are checked at landscape sizes.
- Expo Doctor: 19/21 checks pass. Existing `android.edgeToEdgeEnabled` config-schema warning and newer Expo/asset/linking patch-version recommendations remain; no dependency versions were changed for this feature.
- Native simulator UI/listening checks remain pending because the Mac was locked during verification.

Before release, listen on bundled iOS and Android builds and the Expo Audio fallback. Check low bass/high guitar pitch shifting, clean turnarounds, long-running subdivision/drum synchronization, and stop/pause during loading. While playing, switch position/key/selected degrees, enter/leave mobile overview, mute notes, and change accompaniment. Verify the overview does not overwrite the saved Notes preference. Confirm settings scroll on short landscape phones and do not cover key/position navigation when collapsed. Check bass, left-hand, upside-down, and custom selections with no root; force-quit/relaunch to verify settings persistence.

### Audio regression follow-up — October 6, 2026

- User reported static during both notes and accompaniment after the position-player change. Restore the earlier renderer's natural percussion endings and source cleanup, retaining the new position sequence and octave shifting. Listening confirmation is still required; the specific cause of live-output static has not been established.
- Count-in and metronome now use a short tonal click rather than the noise-based hi-hat. The drum groove retains its cymbal sample.
- Solo guitar uses full master gain; metronome and full drum accompaniment retain separate mixing headroom. The manual Android emulators were at media volume 7/15 (phone) and 5/15 (tablet); both were raised to 11/15 without changing app behavior on physical devices.
- All 61 automated tests and production exports for iOS, Android, and web pass. Native offline renders on iPhone 16 and Android match expected PCM at playback rates 0.5, 1, and 2 (RMS error below 0.000001, output peak below 1). This verifies decoding, pitch shifting, and envelopes; it does not verify real-time hardware output.
- Reloaded iPhone 16, iPad Pro, Pixel 9, and Pixel Tablet with the change. Metro and Android emulators run in independent user-session jobs for manual testing.
