# Device testing

Run these checks before releasing changes that affect layout, navigation, music data, or Expo dependencies.

## Active manual-test builds

Lane requested on October 8 that each app refresh include the iPhone, iPad and connected Pixel, then added the iPhone SE and physical Samsung tablet for testing. Install and reopen the current bundled Release build on the available targets below after app changes; preserve each device's saved preferences. All iOS simulators can use the universal app built in `/tmp/gna-bundled-ipad/Build/Products/Release-iphonesimulator/guitarnoteatlas.app`.

| Target | Device identity | App |
| --- | --- | --- |
| iPhone 16, iOS 18.4 | `6FC22721-D615-459C-A2E9-D28CCFDE4B0A` | `dev.com.guitar-note-atlas` |
| iPhone SE (3rd generation), iOS 18.4 | `581D67C8-78BA-4ADF-B81B-A25C055DFC9B` | `dev.com.guitar-note-atlas` |
| iPad Pro 11-inch (M4), iOS 18.4 | `497648CB-7BFE-4972-BDE7-29C43C849A7A` | `dev.com.guitar-note-atlas` |
| Physical Pixel 4a, Android 13 | `08281JEC229228` | `dev.com.guitarnoteatlas` |
| Physical Samsung Galaxy Tab A11+, SM-X230 | `R5GL7221G8R` | `dev.com.guitarnoteatlas` |

The iPhone simulator is booted with the current bundled Release build. Its first-run tutorial prompt has been dismissed; Audio Player is always available. The app was left stopped in full-neck overview with the simulator upright in landscape. Native UI inspection confirms the fretboard, key header and audio controls are visible. Keep the testing simulators running and refresh them alongside connected physical devices. Other project simulators are separate.

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

### Stacked subdivisions, note grouping, and Android scroll sizing — October 7, 2026

- Stack each fraction above a 16-point music note in a fixed 74 × 42 slot. The label occupies 74 × 18 and the glyph canvas 30 × 24; dots and triplet numerals keep a separate fixed origin. Move Root start/Lowest note immediately below Notes/Loop/Count in, above Accompaniment.
- Clamp the settings card to the usable rotated native window, rather than Android's physical screen dimensions. Give the ScrollView an explicit viewport height, with Android nested scrolling enabled and eight points of bottom padding. Keep the 38-point header outside the scrolling body.
- At 667 × 320, the browser body contains 280 points in a 190-point viewport. Scrolling reaches the complete Off/Click/Drums row at offset 90, with the close button still at x=16/y=54. All eight fractions keep x=164/y=162 (74 × 18), and their glyph canvases keep x=186/y=180 (30 × 24).
- All 108 tests, web export, and bundled Android/iOS Release builds pass. Updated builds installed/launched on the physical Pixel 4a and iPad simulator. Pixel screenshot confirms stacked notation and the new grouping. Native Pixel swipe confirmation remains pending: the Android Studio mirror could be observed, but desktop UI automation could not reliably target its touch surface.

### Settings button optical height — October 7, 2026

- Reduce only the collapsed settings button from 44 to 40 points high, retaining its 38-point width and centered mixer icon. The trigger row vertically centers it beside the unchanged 44-point Play circle.
- At 844 × 390 in the browser, Play measures 44 × 44 at y=50 and Settings measures 38 × 40 at y=52. Both centerlines are y=72; the settings icon center exactly matches its button center (77, 72).
- Web export and bundled Android/iOS Release builds pass. The generated Android Studio Java 25 daemon override was moved out of the project to restore the existing Java 17 build. Updated bundled builds installed/launched on Pixel and iPad.

### Phone overview playback hint — October 7, 2026

- Add a small, two-line phone-only hint directly beneath Audio Settings: “Select a position to play notes. Full neck view plays accompaniment only.” Use the same phone/tablet breakpoint as playback. Keep the hint at the top of the scrolling body so the fixed header stays compact.
- Browser check at 844 × 390 confirms both lines fit without wrapping further. At 667 × 320 the full Off/Click/Drums row remains reachable by scrolling while the close button stays at y=54. The hint is absent at the 1200 × 800 tablet breakpoint.
- Web export and Android/iOS bundled Release builds pass; current builds installed/launched on Pixel and iPad.

### Accelerating hold controls — October 7, 2026

- Add hold-to-repeat to both subdivision arrows and share gradual acceleration with key, position and tempo buttons. Repeat begins after a 420 ms hold, then uses 150 ms intervals, 100 ms after one second of repeating, and 80 ms after 2.2 seconds. Every new hold starts slowly.
- Extract the repeat gesture/timer state into a shared controller. Release/cancellation cancels its timer; cancelled holds cannot suppress the next tap or respond to late long-press events. Disabled controls, closing audio settings and hook unmount cancel pending repeats. Tempo and subdivision actions stop at their limits.
- All 113 automated tests pass. New regressions cover a single short tap, progressive acceleration and speed cap, no extra step on release, reset cadence for a new hold, cancellation followed by a working tap, late long-press cancellation, and holding toward both subdivision endpoints.
- Browser UI checks confirm one-step subdivision taps, disabled shortest/longest arrows, and selecting back away from an endpoint. Web export and bundled Android/iOS Release builds pass; updated builds installed/launched on Pixel and iPad for manual hold-feel testing.

### Rotation-aware vertical-only Audio Settings scrolling — October 8, 2026

- The native root remains portrait while the canvas turns 90 degrees clockwise. Native page coordinates therefore map physical X to negative app Y and physical Y to app X. Replace native gesture recognition with an app-vertical-only PanResponder that explicitly drives the ScrollView's Y offset with X fixed at zero. Unrotated Android tablet windows use their ordinary Y axis; web retains ordinary vertical scrolling.
- Disable competing native and ScrollView pan recognition in native builds. Capture only drags over six points whose app-vertical movement dominates, preserving taps/holds on controls. Clamp the offset to the content extent and clamp again when the viewport height changes. Fit both content and viewport to 100% panel width, hide horizontal indicators, and disable bouncing.
- All 117 tests pass. New regressions cover rotated iOS/Android up/down gestures, app-horizontal rejection, top/bottom clamping, tap slop, unrotated tablet coordinates and fitting content.
- At 667 × 320 in the browser, viewport and content widths both measure 260 points; 312 points of content scroll through a 190-point body to reach the full Off/Click/Drums row. Header stays fixed. A native iPhone SE diagnostic confirms real content overflow of 62.75 points; automated desktop drags deliver touch-start/tap events but no touch moves, so they cannot establish native swipe success. Temporary diagnostics were removed and the temporary simulator shut down. Pixel manual swipe confirmation remains requested.
- Clean web export and Android/iOS bundled Release builds pass. Updated final builds installed/launched on the reconnected Pixel and iPad for manual testing.

### Audio Settings gutter, compact header, and centered phone heading — October 8, 2026

- Replace the platform overlay scroll indicator with a three-point thumb in the card’s existing right padding. Derive its size and position from viewport/content height and the same clamped scroll offset; omit it when content fits. Preserve the rotation-aware gesture mapping and full-width controls.
- Reduce the fixed header to 32 points plus a six-point gap; the close target retains three-point hit slop. Remove the tablet Tempo row’s additional top margin. The phone hint stays at the top of the body. At 1200 × 800, Tempo begins six points below the header; existing 38-point step buttons remain unchanged.
- Remove the Audio-mode left margin from the phone key heading. Center it in a full-width 88-point row with absolute key arrows and symmetric reserved side lanes. Fit font size/letter spacing to available width. At 667 × 320 its center stays x=333.5 with Audio both enabled and disabled; at 568 × 320 its center is x=284. The settings button ends at x=96 and the previous-key target starts at x=96, with no overlap.
- At 667 × 320, the 260-point-wide body holds 312 points of content in a 200-point viewport. It reaches Off/Click/Drums at offset 112 while the close button remains at y=54. The body ends at x=276 and the thumb occupies x=283–286, entirely outside the content.
- All 117 tests, web export, and final bundled Android/iOS Release builds pass. Updated iPad build installed and launched. Pixel installation currently waits for the device’s Play Protect security-check prompt; manual native swipe confirmation remains pending.

### Matching phone heading centerlines — October 8, 2026

- Replace the top scale title’s unequal left/right control margins with a symmetric inset based on the wider Menu/Options region plus its 12-point hit slop. Apply this on both Android and iOS, including uneven safe-area edges. Retain the existing font fitting and title clipping.
- Anchor the phone key-center text absolutely at 50% of the full-width row, offset by half its own width. Keep key arrows independent and preserve the existing symmetric safe-area treatment and Audio-mode-independent layout.
- At 844 × 390, both MAJOR SCALE and KEY CENTER - C text boxes measure at x=422 with Audio enabled and disabled. Browser screenshot confirms visible matching centerlines and clear navigation controls.
- All 117 tests, web export, and Android/iOS bundled Release builds pass. Refreshed iPad bundled build installed/launched. Latest Android APK is built; the physical Pixel continues to show the Play Protect security-check dialog blocking installation, so updated native phone alignment remains a manual check once dismissed.

### Overview-only hint and shared vertical step controls — October 8, 2026

- Read the current phone overview/position state for the Audio Settings hint. Display it only in full-neck overview; remove it and the extra margin before Tempo in a selected position. Tablets continue to omit the hint.
- Extract the existing tablet-key triangle pair into shared VerticalStepButtons with its original 44 × 30 targets and 28 × 24 arrows. Reuse the pair in Tempo and Subdivision, grouped together to the left of fixed value slots, preserving tap and accelerating-hold handlers. Disable controls at tempo/rate endpoints. Up increases tempo or selects a shorter/faster rate; down decreases tempo or selects a longer/slower rate.
- Browser checks at 667 × 320 verify the hint appears in overview, is absent after selecting a position, and returns on tapping back to the overview. Up changes Tempo 100 → 101 and dotted-half → half; down restores both values. The longest-rate arrow is disabled at its endpoint. At 1200 × 800, tablet key arrows still step C → C#/Db → C and the settings hint remains absent.
- Phone content and viewport widths remain 260 points. With the overview hint, 352 points of content scroll through a 200-point body to offset 152, reaching the complete Off/Click/Drums row with the header fixed. The indicator remains in the right gutter. A zoomed phone screenshot confirms the new controls and absence of the overview disclaimer.
- All 117 tests, web export, and Android/iOS bundled Release builds pass. Updated iPad build installed/launched; The earlier Pixel installation completed after its prompt cleared; installing this latest bundled update triggered a new Play Protect prompt and awaits dismissal. Hand occlusion and native swipe feel remain manual checks.

### Independent mixer volumes and centered audio controls — October 8, 2026

- Add separate persisted Notes/Accompaniment levels, clamped to 0–100% with 100% defaults for existing saved settings. Paired arrows step by 5% with shared accelerating holds and disabled endpoints. Count-in and Tap Tempo clicks use accompaniment volume.
- Route native guitar/percussion release gains to independent mixer buses, retaining the existing PCM and master mix. Mixer-only updates bypass playback preparation/reconfiguration and apply live 20 ms gain ramps; rapid updates continue from the interpolated current level. Initialize the buses from loaded settings before the first tap. The fallback scales each source and updates loaded players independently.
- Center the complete 88-point button group under Menu’s text center on phone/tablet. In phone overview, render its absolute controls inside the key row for exact shared vertical centering. Report that logical row position separately to anchor the global settings card. Use 44-point-wide key targets and symmetric space around the centered heading to preserve clearance.
- Use the theme’s grey border and uppercase TEMPO/SUBDIVISION/ACCOMPANIMENT labels. Give tempo text fields/labels/BPM matching 24-point line boxes without native font padding, centered with Tap and the paired arrows. Preserve fixed fraction/glyph slots.
- At 667 × 320, both audio buttons and key arrows share y=60.640625. The complete group spans x=65–153 with center x=109, matching Menu text x=109; the previous-key target starts at x=161. The settings body remains 260 points wide with no horizontal overflow; 492 points of content scroll through a 211-point viewport to offset 281, reaching accompaniment volume with its value ending at y=266.
- At 844 × 390, Tempo label, Tap, arrow-pair center, number, and BPM all measure y=169. Subdivision label, pair center, and stacked value all measure y=239. Browser checks verify Notes 100 → 95% independently of Accompaniment 100 → 90%, retention after reload, and restoration to defaults. Tablet settings show both controls and the grey border.
- All 122 tests, web export, and final Android/iOS bundled Release builds pass. New regressions cover default/clamped saved levels, independent note/percussion/click scaling, mixer-only versus musical changes, native source routing, unchanged clock/voice/cache state, and interpolated rapid ramps. Final builds installed/launched on physical Pixel and iPad simulator. Native listening/hold/scroll feel remains a manual check.

### Bass position band alignment — October 8, 2026

- Compared committed `StringView.m` and `FullStringView.m` at released reference `4113b24`. Both apply the 2.1 bass multiplier to the vertical inset before computing band height. The zoom renderer passed the unscaled inset, cutting bands short; the overview applied the old band's Y coordinate to a different fixed string origin, moving it below the upper string.
- Pass the adjusted zoom string inset. Translate overview bands with the current string origin while preserving the released 1.3 gap / 2.1 inset proportions and upper/lower overhang. Keep all horizontal fret coordinates unchanged.
- All 124 tests pass, including coverage of green/purple/yellow across phone/tablet spans and both string orientations. Browser checks at 1200 × 800 and 844 × 390 confirm full-neck and zoom alignment; yellow covers two strings, purple three and green four. Left-handed and upside-down checks pass. Screenshots are saved in `docs/pr-51/bass-highlights-tablet.png` and `docs/pr-51/bass-highlights-phone.png`.
- Web export and Android/iOS bundled Release builds pass. Updated builds installed/launched on physical Pixel and iPad simulator.

### Flat audio buttons and lighter border — October 8, 2026

- Remove all shadow properties and Android elevation from the shared main-screen audio trigger style. Change the Audio Settings card border to the existing light grey `#C8CCCF`.
- At 844 × 390, browser visual verification confirms flat Play/Settings buttons; computed Play shadow is `none`, and the popover border is `rgb(200, 204, 207)`. Web export and Android/iOS bundled Release builds pass. Updated builds installed/launched on Pixel and iPad simulator.

### Audio Settings header clearance — October 8, 2026

- Move the card anchor down six points and clamp it below the shared header bottom plus six points. Preserve the replacement of both main-screen audio buttons and recalculate the bounded scrolling body for the reduced height.
- Browser checks at 667 × 320 and 1200 × 800 show card tops at y=44 and y=57, respectively, six points below each header. Neither audio trigger is rendered while settings are open. Web export and Android/iOS bundled Release builds pass; iPad build installed/launched. Pixel update awaits its Play Protect prompt dismissal.

### Wider audio-button gap — October 8, 2026

- Increase the gap between the 44-point Play and 38-point Settings buttons from six to ten points. Use a shared 92-point group width for Menu centering and the phone key-arrow reserve.
- At 667 × 320, the group spans x=63–155 with center x=109; Play ends at x=107, Settings begins at x=117, and the previous-key target begins at x=163. Both buttons retain the same vertical center and eight points of key-arrow clearance. Visual checks at 844 × 390 pass. Web export and Android/iOS bundled Release builds pass. iPad installed/launched; latest Pixel installation awaits the existing Play Protect prompt.

### Audio-taper volume sliders — October 8, 2026

- Replace both volume arrow pairs with full-width, flat sliders: four-point tracks, 20-point circular thumbs, 44-point gesture targets, dB readouts and an exact Mute endpoint. Labels and values sit above the tracks.
- Use the continuous gain curve `position ** (log(0.1) / log(0.5))`: half travel is −20 dB, quarter travel is −40 dB, zero is silent and full travel is unity. Invert the curve for existing persisted linear gains so their audible levels remain unchanged. Keep the independent native 20 ms ramps and mixer-only update path.
- Map physical drag deltas through the same portrait-shell rotation as settings scrolling. Thumb grabs retain their position, track taps move to the selected level on release, vertical swipes can transfer to settings scrolling, and horizontal drags retain control. Provide native increment/decrement accessibility actions and web keyboard arrows/Home/End with slider value semantics.
- All 128 tests pass, including taper endpoints/midpoint, monotonicity, saved-level round trips, precise low levels, inset/clamped taps, rotated/unrotated horizontal gestures and vertical scroll direction. Web checks verify midpoint taps at −20 dB, independent accompaniment mute, keyboard adjustment, retention after reload and restoration to full volume. At 667 × 320, focusing the accompaniment slider scrolls it fully into view at y=240–284 while the header stays fixed; its 260-point width fits the body. Tablet screenshot saved in `docs/pr-51/tapered-volume-sliders.png`.
- Web export and Android/iOS bundled Release builds pass. Final builds installed/launched on physical Pixel and iPad simulator. Native slider drag/scroll feel and listening remain manual checks.

### Matching Notes section labels — October 8, 2026

- Add NOTES immediately above the note controls, using the same centered label styling and six-point control gap as ACCOMPANIMENT. Shorten the note slider's visual label to VOLUME; keep its Notes volume accessibility name.
- Tablet browser verification confirms the requested labels and grouping. Web export and Android/iOS bundled Release builds pass; updated builds installed/launched on Pixel and iPad simulator.

### Bold left-aligned audio section labels — October 8, 2026

- Set the shared NOTES/ACCOMPANIMENT label style to weight 700 and left alignment. Tablet browser checks confirm both start at x=16 with computed weight 700 and left alignment. Web export and Android/iOS bundled Release builds pass; refreshed builds installed/launched on Pixel and iPad simulator.

### Unified Audio Settings label typography — October 8, 2026

- Give TEMPO, SUBDIVISION, NOTES, ACCOMPANIMENT and both VOLUME labels one shared style: 14-point system font, weight 700, black, left aligned and a 24-point line height. Keep row sizing and section margins separate from typography.
- Tablet browser checks confirm identical computed font family, size, weight, color and alignment for all six labels. Compact-phone SUBDIVISION fits its 124-point slot without overflow. Web export and Android/iOS bundled Release builds pass; updated iPad installed/launched. Pixel update awaits its security-check prompt.

### Balanced accompaniment and numeric volumes — October 8, 2026

- Calibrate notes to 0.75, click to 0.85, kick to 0.8, snare to 0.75 and hi-hat to 0.16, with a shared 0.6 master gain. Apply the same constants to native PCM playback and fallback players. Note level stays consistent across accompaniment modes. No sample assets or clock scheduling changed.
- Actual bundled PCM regression checks place click/kick/snare peaks within 4 dB of every guitar sample. A conservative absolute-sample sum, including hi-hat tails from the previous beat and the maximum guitar amplitude, stays below 0.92 at every supported integer tempo (40–240 BPM). This verifies normal scheduled mix headroom; physical-device loudness and artifact listening remain manual checks.
- All 130 tests, web export, and Android/iOS bundled Release builds pass. Browser checks verify plain 0, 50 and 100 readouts, independent slider values, and a computed zero-width panel border. The musical taper and saved linear gains remain intact; half travel still gives −20 dB. Screenshot: `docs/pr-51/balanced-audio-settings.png`.
- Updated bundled builds installed and launched successfully on physical Pixel 4a and iPad Pro simulator.

### Subdivision within Notes — October 8, 2026

- Move Subdivision below Root start/Lowest note and directly above Notes Volume. Tempo remains above Notes because it controls the shared clock. Preserve the existing arrow controls and hold behavior while alternative control designs are discussed.
- Web export and Android/iOS bundled Release builds pass. Browser checks at 1200 × 800 verify Notes → note toggles → start mode → Subdivision → Notes Volume ordering. At 667 × 320 the relocated shorter-subdivision button changes dotted half to half; focusing Notes Volume scrolls its entire 44-point target into view (y=173–217, width=264). Screenshot: `docs/pr-51/notes-subdivision.png`.
- Refreshed bundled build installed/launched successfully on the iPad simulator.

### Fixed phone overview/zoom header — October 8, 2026

- Anchor the phone practice heading and key arrows to one 56-point row immediately beneath the blue bar. Move the audio pair into the existing fixed overlay for both views; remove measured overview-center state and the inline audio copy. The 44-point Play circle starts six points below the blue header; title, arrows and both audio buttons share its centerline. Preserve neck layout space independently of the header.
- Use the same screen-centered, 38-point text row for Key Center and zoomed position names. Zoom names use the empty key-arrow lanes to stay readable on smaller phones without moving their center.
- At 844 × 390, both views put Play at x=63/y=44 and the title center at x=422/y=66. At 667 × 320 the title center remains x=333.5/y=66, Play remains x=63/y=44, and the previous-key target is x=163/y=38/44×56 with eight points of clearance from Settings. At 568 × 320 both heading centers are x=284/y=66; the longest position title fits its 242-point slot (text width 237.23). At 844 × 390 that title fits its 430-point slot (text width 421.55).
- Settings still opens six points below the blue bar, hides both audio buttons, and closing restores Play to y=44. Screenshots: `docs/pr-51/phone-header-overview.png` and `docs/pr-51/phone-header-zoom.png`. All 130 tests, web export and final Android/iOS bundled Release builds pass. Updated iPad build installed/launched.

### Phone header spacing midpoint — October 8, 2026

- Lower the shared phone practice row by three points, halfway back from the previous six-point rise. Title, key arrows and audio controls move together in overview and zoom; keep the popover anchored to the actual blue-header bottom independently of this row offset.
- At 844 × 390 both titles center at x=422/y=69, and Play remains x=63/y=47 in both views. At 667 × 320 both titles center at x=333.5/y=69. The Play circle now leaves nine points below the blue bar; neck placement stays intact. Refreshed overview/zoom screenshots in `docs/pr-51/phone-header-overview.png` and `docs/pr-51/phone-header-zoom.png`. Web export and Android/iOS bundled Release builds pass.

### Always available Audio Player — October 8, 2026

- Always mount AudioTrigger and AudioPopover. Remove the Enable Audio Player menu item, switch handling, disabled startup default and provider effect that stopped/closed audio when the old preference was off. Legacy saved flags no longer control visibility or transport. Preserve audio settings, manual Play/Stop, splash preloading and existing clock/mixer behavior.
- Browser upgrade check: on the previous build, turn Audio Player off through Options and confirm both audio controls disappear. Reload the new build at the same origin; both controls return without toggling a preference. Options no longer contains an Audio Player item, and Audio Settings opens/closes normally. Screenshots: `docs/pr-51/always-audio-home.png` and `docs/pr-51/always-audio-options.png`.
- All 130 tests, web export and Android/iOS bundled Release builds pass. Updated builds installed/launched on physical Pixel 4a, iPhone 16 simulator and iPad Pro simulator.

### Samsung tablet Menu label — October 9, 2026

- Reproduced `MEN` / `U` wrapping on the physical SM-X230 tablet with its existing system font scale of 1.15 and density of 240 dpi. The Menu label had a fixed width but no single-line constraint or fitting behavior.
- Menu now stays on one line and fits its existing label width. The button hit area, label center, and audio-button alignment stay unchanged; the tablet's font-size preference remains untouched.
- All 130 tests pass. Android and iOS bundled Release builds succeed; the iPhone 16, iPhone SE and iPad simulators were refreshed. Native iPad screenshot confirms Menu remains on one line. The Pixel is disconnected. Samsung installation and launch succeeded after its Play Protect prompt was dismissed. Native before/after screenshots confirm Menu stays on one line at the same 1.15 system font scale, with its center unchanged above the audio controls; see `docs/pr-51/samsung-menu-before.png` and `docs/pr-51/samsung-menu-fixed.png`.

## Adaptive tablet windows and bass fingering — October 9, 2026

- All 138 tests pass, including upright tablet-window resizing, portrait phone/iPad shell parity, safe areas beneath Android captions/system bars, scaled gesture coordinates, footer width, tablet body allocation and finger-label clearance for four/six strings at tablet/compact sizes.
- Bundled Android arm64 Release and universal iOS simulator Release builds pass; web export passes. Samsung SM-X230 is Android 16/API 36.1, 1200 × 1920 at 240 dpi, with system font scale 1.15.
- Verified bass zoom on the physical Samsung in full-screen landscape and upright portrait desktop windows, including floating-window resizing. Finger labels remain below the fourth string and inside the canvas; the footer fits narrow windows and selection survives resizing. Full-screen proof is in `docs/pr-51/samsung-bass-adaptive.png`.
- The Samsung desktop window manager reports multi-window mode even for maximized windows and ignores app orientation requests. A full-screen view is usable after turning the device sideways; do not claim the application can force a lock when the window manager overrides it.
- Upright Android tablet settings use native vertical scrolling; rotated phone/iPad canvases retain the existing mapped scroll responder. Verify touch feel on the physical device, especially very small scaled windows.
- Refreshed Samsung, iPad Pro M4, iPhone 16 and iPhone SE bundled builds. Pixel was disconnected. iOS startup/layout smoke checks pass; this does not certify iPadOS 26 Windowed Apps, which remains disabled by the existing native full-screen configuration.
- Android Studio generated a local Java 25 daemon setting while opening its device mirror. The bundled build uses Java 17; the ignored local daemon setting was corrected to 17.
- Phone practice necks now fit the body below the fixed practice row and above the footer; small-window key headings shorten before clipping. Tests cover 568 × 320, iPhone SE-sized and modern phone-sized canvases.
- Final native captures confirm iPhone SE bass overview, iPhone 16 guitar overview and iPad guitar zoom clear navigation. Compact bass zoom in the small Samsung floating window keeps finger labels visible; see `docs/pr-51/samsung-bass-window.png`. Samsung settings open and fit horizontally, but mirror drags did not establish touch scrolling; a hands-on scroll check remains.
