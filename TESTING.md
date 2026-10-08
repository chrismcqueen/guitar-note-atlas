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


### Restart from the beginning — October 6, 2026

- Main Stop now resets both native and fallback sequence progress, matching Stop / Reset. The next Play starts at the configured first note and includes the count-in when enabled. The main button label/icon now show Stop while playing.
- All 80 automated tests and iOS/Android/web exports pass. The cancellation regression now requires restarting at the first note after stopping.
- Actual iPad Pro and Pixel Tablet control checks progressed through several notes, pressed the main Stop button, verified index zero and stopped transport, then pressed Play and verified that the first scheduled guitar note matched the position's starting note. Both passed with no reported app error.


### Intermittent output investigation and idle driver — October 6, 2026

- Lane heard scratchy crackle through held scale notes. Removing extra simulators did not eliminate it. Only iPad Pro remains booted, with both Android emulator jobs stopped, at Lane's request.
- A native-decoded guitar sample exactly matches 1,052 points from its WAV on disk. Sampled real-time scale windows on iOS and Android match the scheduled prepared PCM within 0.00000004, including held notes. This verifies those captured windows, not the hardware output or every playback interval.
- A fixed scale WAV played through the iPad's standard file player with the audio-api context suspended. Lane initially heard two artifacts, then reported the same reference playing cleanly on its second and third replay. Intermittent host output trouble is a likely contributor; the specific cause remains unconfirmed. Mac output uses built-in speakers at 48 kHz, and the inspected host logs showed no explicit underrun/overload report.
- The app previously left its real-time output running after Stop. It now suspends the driver 50 ms after Stop so the short release can complete. Preparing playback cancels a pending suspension, waits for one already in progress, and resumes the context before scheduling. Live settings changes retain the running shared clock.
- All 84 tests and iOS/Android/web production exports pass. Actual iPad control checks verified running output during playback, suspended output and frozen clock after Stop, and running output after both normal and rapid restarts, with no app error.

### Select sounds, then Play — October 6, 2026

- Lane revised the controls: Click and Drums now select a mode without starting playback. Pressing the selected mode keeps it selected; Off disables accompaniment. Play starts the selected Notes/accompaniment combination, and Stop resets everything.
- All 84 tests and iOS/Android/web exports pass. Actual iPad checks verified that selecting Click/Drums stays stopped without loading, Notes-off Play starts accompaniment alone, live changes and repeated selection retain the running transport, Stop suspends output, and Notes-on Play starts notes and drums at an identical timestamp. All checks passed with no app error. Only iPad remains running for manual testing.


### Load audio behind the splash — October 6, 2026

- Mount the audio provider during startup and wait for fonts, saved global/practice settings, all 25 guitar samples and four percussion sounds, and the initial position PCM buffers before showing the app. Loading leaves the native output suspended; Play activates it and reuses the cached data. This runs even when the Audio Player option is disabled.
- All 86 automated tests pass, including suspended preload, cached first-Play reuse, and decoding failure/retry. Production exports pass for iOS, Android, and web.
- Actual cold iPad launch loaded all 29 sample buffers plus 21 prepared buffers before showing AppContent. Output remained suspended at clock zero with no playback or startup error.
- Injected delayed preloading kept the splash visible with AppContent absent; releasing the load opened the app while output stayed suspended. Injected failures in both native decoding and the fallback kept the splash visible with an error and Retry. After restoring loading and retrying, all 29 fallback player pools loaded and the app appeared with no error.
- Cold-restarted the iPad after the injected checks and confirmed its native transport again has all 29 samples loaded, output suspended at clock zero, and no startup error. Only iPad remains running for manual testing.


### Audio-clock note highlights — October 7, 2026

- Replace per-event wall-clock highlight timers with a single display-frame loop reading the native audio context clock. Use the exact scheduled source pitch/location, onset and prepared PCM duration. Delayed frames apply only the current state, rather than replaying old notes/counts. Sample endings clear the highlight; Stop cancels pending frames/events and invalidates callbacks from earlier runs.
- Remove React transitions from note/count updates so rendering is not intentionally deferred. The drawn location and MIDI pitch must both match the active note, preventing a stale guitar note from lighting a different bass pitch at the same coordinates.
- All 100 automated tests pass. New checks cover every subdivision at 240 BPM, a frozen audio clock while wall time advances, delayed frames skipping several notes, four-click count-in, early sample endings, old frame callbacks after Stop/restart, and position/tempo/mute changes at the audio boundary.
- Bundled Release builds pass for the physical Pixel 4a (Android 13, arm64) and iPad Pro simulator; web export passes. Installed and opened both updated builds past the splash. Pixel startup logs show no app crash/JS error, and its Audio Player preference persists. Both include the JavaScript and sounds locally.
- These tests verify the clock/state relationship. A screen can only update on available display frames; this installed audio API does not expose hardware output latency for route compensation. They do not establish sample-exact speaker/display synchronization or resolution of the reported crackling. Check through the Pixel's built-in speakers, then test fast subdivisions and live tempo/position/mute/Stop changes.

### Android position preview — October 7, 2026

- Reproduced stale dark fret/string clipping on the physical Pixel: dragging updated the white position window and notes while some dark lines remained at the previous position. Refresh the SVG clipping definition and its references whenever the window position or width changes, in both phone and tablet necks.
- Installed the updated bundled Release build on the Pixel 4a and verified held drags to high, middle, and low positions in both directions. Dark frets, strings, and anchor dots follow the selected window; the previous region dims correctly. Released the test gesture afterward.
- All 100 automated tests, Android/iOS bundled Release builds, and web export pass. Installed and opened the updated iPad simulator build; its overview shows the dark lines within the selected window. Android tablet visual testing remains pending.

### Settings-only audio popover — October 7, 2026

- Renamed the popover to “Audio Settings” and removed its Play/Stop and Stop / Reset buttons. The main-screen Play/Stop button remains the single playback control, with its existing reset behavior. Updated the instructions and removed unused popover playback styles/loading-label state.
- All 100 tests, web export, and bundled Android/iOS Release builds pass. Installed and opened both updated builds on the Pixel and iPad simulator. Visually checked the iPad popover: the title fits, settings remain visible, and neither playback button appears.
- Coverage follow-up: anchor the settings card to the same placement calculation as both main-screen buttons, with overhang around their bounds. Omit the underlying buttons while settings are open to prevent rounded-corner bleed and underlying taps. Browser checks at 844 × 390 and 1200 × 800 confirm both disappear while settings are open and return after closing; native iPad visual check confirms full coverage. All 100 tests, web export, and both bundled Release builds pass; updates installed on Pixel and iPad.

### Centered transport icons and count-in — October 7, 2026

- Replace font-glyph Play/Stop/loading symbols with centered vectors; use vector 1–4 numerals inside the same button during count-in. Both buttons inherit a shared 44-point height; Play is 44 × 44 with radius 22. Remove the settings countdown. Native count updates continue through the existing display-frame audio-clock loop, with upward beat numbering; the fallback applies the same numbering at its click dispatch.
- All 104 tests pass. Count-in regressions verify 1–4 at scheduled click onsets at 40/120/240 BPM, frozen audio clocks, delayed frames skipping stale numbers, clearing at the first note, and Stop/restart invalidating old count frames.
- Web export and bundled iOS/Android Release builds pass; installed both on iPad and Pixel. Phone browser measurements report both button heights as 44, Play width 44/radius 22, and zero horizontal/vertical offset between its vector canvas and button center. Browser and native iPad checks show the number in the button, followed by Stop; stopping restores Play. The settings countdown is absent. Display refresh and hardware output latency still bound absolute audible/visual synchronization.

### Compact Audio Settings labels — October 7, 2026

- Removed the bottom instructions and conditional overview/empty-selection/notes-off helper messages. Kept “Accompaniment” directly above Off/Click/Drums, with a compact gap. Actual playback errors still appear when present.
- All 104 tests, web export, and bundled Android/iOS Release builds pass. Native iPad visual check confirms the label order and shorter card without helper text.

### Audible tap tempo — October 7, 2026

- Tap Tempo's touch-down handler plays the existing cached metronome click on every press, including the first tap. Native playback uses an immediate one-shot on the existing audio context without starting/re-anchoring practice or changing count/highlight state. Idle output resumes for the click and suspends after it finishes; repeated taps extend that lifetime. Stop/close invalidate taps waiting for activation. The Expo Audio fallback uses the existing click player pool.
- All 108 tests, web export, and bundled iOS/Android Release builds pass. New regressions cover immediate cached-click scheduling, idle resume/suspend, repeated taps, unchanged active clock/count-in, and Stop during activation. Native iPad UI checks exercise first/repeated taps, retain tempo detection, and show no playback error; practice remains stopped afterward. Physical-device listening confirmation remains a manual check.

### Music-font subdivision notation — October 7, 2026

- Replace fraction labels with the already loaded Opus Text font's stemmed sixteenth, eighth, quarter, and half notes. Dotted values use its augmentation dot; the eighth-note triplet pairs the eighth note with its notation numeral 3. Keep readable note names in accessibility labels and all existing durations/order unchanged.
- Inspected the bundled font's actual glyphs with Core Text and verified half, dotted-half, eighth-triplet, and sixteenth rendering in the bundled native iPad settings card. Restored the previous half-note setting and left playback stopped.
- All 108 tests pass; web export and bundled Android/iOS Release builds pass. Installed and opened the updated builds on the physical Pixel 4a and iPad simulator. Android subdivision visual checks remain manual.

### Neck-style count-in digits — October 7, 2026

- Replace custom stroked numeral paths with the same DegreeLabel component and bundled Basic Manual font used inside neck note circles. Render at natural font proportions in the existing square icon canvas; per-digit positions center the actual ink bounds measured from the bundled font at size 24.
- Native iPad playback check shows the new count-in numeral centered in the circular button, matching neck digits. Stop resets the control to Play. Existing audio-clock count timing is unchanged.
- All 108 tests pass. Web export and Android/iOS bundled Release builds pass; updated builds installed and launched on the connected Pixel 4a and iPad simulator. Android count-in visual confirmation remains manual.

### Fixed Audio Settings header and body scrolling — October 7, 2026

- Keep the title/close row outside the ScrollView, non-shrinking and opaque. Allow only the settings body to shrink inside the screen-constrained card; preserve its natural content height when space is available. The body clips its scrolling contents below the header and accepts control taps while the tempo keyboard is open.
- At 667 × 320 in the browser, the body has 270 points of content in a 190-point viewport. Scrolling reaches Root start/Lowest note, while the close button stays exactly at x=16/y=54 before and after scrolling. At 1200 × 800 the body fits naturally at 270 points with no overflow.
- All 108 tests pass; web export and bundled Android/iOS Release builds pass. Installed/launched the iPad build and checked that its compact settings layout remains intact. The physical Pixel was disconnected during installation; its APK is built but device update/native short-phone verification remains pending.

### Fixed subdivision fractions and smaller glyphs — October 7, 2026

- Restore 1/16, 1/8T, 1/8, 1/8., 1/4, 1/4., 1/2, and 1/2. beside their notation symbols. Text occupies a fixed 42-point slot; the glyph canvas occupies a fixed 28-point slot. Reduce the note font from 30 to 18 points and keep its origin/baseline fixed at x=3/y=28. Place dots/triplet numerals separately so they never recenter the note.
- Browser checks cycle all eight values at 844 × 390. Every fraction slot stays at x=166/y=170 (42 × 22), and every glyph canvas stays at x=208/y=162 (28 × 38), with unchanged note origin/baseline. Bundled native iPad check confirms the smaller symbol and fraction pair; a clean relaunch was needed before the new display appeared.
- All 108 tests pass; web export and bundled Android/iOS Release builds pass. Installed and reopened the latest build on both the reconnected Pixel 4a and iPad simulator. Android subdivision visual confirmation remains manual.
