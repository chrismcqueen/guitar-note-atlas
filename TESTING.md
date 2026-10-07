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
- Master gain remains fixed at 0.8; guitar and percussion levels reserve headroom for the full mix, including overlapping cymbal tails. The manual Android emulators were at media volume 7/15 (phone) and 5/15 (tablet); both were raised to 11/15 without changing app behavior on physical devices.
- At that stage, all 63 automated tests and production exports for iOS, Android, and web passed. Native offline renders on iPhone 16 and Android match expected PCM at playback rates 0.5, 1, and 2 (RMS error below 0.000001, output peak below 1). This verifies decoding, pitch shifting, and envelopes; it does not verify real-time hardware output.
- Reloaded iPhone 16, iPad Pro, Pixel 9, and Pixel Tablet with the change. Metro and Android emulators run in independent user-session jobs for manual testing.
- Follow-up: tempo, subdivision and loop changes retain sounding/queued notes, applying changes to the next unscheduled event. The provider configures the running transport without pausing/restarting it. Stops, pauses and position changes use an independent 12 ms release gain. A native PCM test found `cancelAndHoldAtTime` on the existing envelope produced an abrupt amplitude drop (maximum error 0.5885); the independent release matches the expected fade within 0.0000001 on both platforms and ends in silence. Playback highlights again use React transitions.
- A six-second live iOS note/drum measurement recorded no clipped samples, peak amplitude 0.6486, and all audio events scheduled ahead of the clock. End-to-end listening confirmation remains required, especially rapid Play/Pause, tempo and subdivision changes.


### Shared clock and independent controls — October 6, 2026

- All 80 automated tests pass. Every supported subdivision uses the same 12-tick-per-beat timeline as click/drums. Ten-minute checks require identical timestamps where note subdivisions meet beats. Live tempo/subdivision changes, notes joining accompaniment, and tempo changes during count-in preserve their shared anchor.
- Production exports pass for iOS, Android, and web.
- Actual iPad Pro and Pixel Tablet provider/transport checks: Drums starts with notes disabled and the main button showing Play; Play adds notes without restarting the transport; switching to Click preserves notes; global Stop stops everything. Both recorded eight note/accompaniment events at identical timestamps and zero transport restarts during the control sequence. Android phone overview checks keep notes suppressed while accompaniment plays.
- Native guitar playback reuses the original samples. Pitch shifts and 12 ms attack / 35 ms release envelopes are prepared in PCM before scheduling; sources play at unity rate and finish naturally. A repeated Stop does not reset an already-running release to full volume. Development reload cleanup resets the audio transport so stale instances cannot survive Fast Refresh.
- Native offline renders on iPhone 16 and Android at octave rates 0.25, 0.5, 1 and 2 match prepared PCM within 0.00000004, start/end at zero, and peak at or below 0.686. These checks validate the sample data and native renderer; real-time listening remains pending for the reported artifacts.
- iPhone 16, iPad Pro, Pixel 9 and Pixel Tablet remain available for manual testing with a persistent Metro process. Test Play/Pause/Stop, independent Click/Drums, rapid tempo/subdivision changes, position changes, and a sustained mixed note/accompaniment run. Native timestamp equality does not establish that unsupported Expo Audio fallback output is sample-accurate.
