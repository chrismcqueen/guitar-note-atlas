# Guitar Note Atlas requirements

Updated October 6, 2026 from Chris McQueen's October 5 voice memo (transcript supplied by Lane) and the September 30–October 6 email conversation, “Guitar note atlas.” This document records requested behavior and decisions; it is not a claim that these features are implemented or verified.

## Baseline and delivery

- Finish the React Native rebuild using the released iOS 2.1 app as the parity reference, as documented in [LEGACY_REFERENCE.md](LEGACY_REFERENCE.md). The unfinished native 3.0 playback experiment is context, not the released baseline.
- The agreed delivery has two milestones: finish the rebuild, then testing, store submission, and required store follow-ups. Chris accepted the proposed two $500 milestones on October 2.
- Android release depends on Chris completing Google Play setup. Lane sent setup instructions on October 6; completion is not established by the thread.

## Approved interaction improvements

Chris's October 5 email and voice memo approve the demonstrated changes, with particular enthusiasm for touching and dragging across the overview neck to select a position. Preserve:

- Phone orientation improvements that reduce interference from system navigation.
- Press-and-hold navigation arrows for faster movement through positions.
- Stronger active-position highlighting on the tablet overview.
- Press feedback and position scrubbing on the full neck on phone and tablet.
- While scrubbing, dark frets, strings, and anchor dots must follow the highlighted position window consistently on iOS and Android.
- Footer swiping to select or deselect multiple scale degrees.
- Optional Circle of Fourths/Fifths key navigation.
- Tutorial Back button and appropriate pressed-state feedback.
- Black key selector and aligned header menu/options buttons.

## Audio playback requirements

### Practice within the selected position

- Play the selected scale, arpeggio, interval set, or custom note selection within the currently displayed zoomed-in position. Do not play a global sequence across all octaves.
- Begin at the lowest root in that position, ascend to its highest playable selected note, descend through the root to its lowest playable selected note, then continue ascending and descending while looping.
- Include applicable greyed-out notes below the starting root. Grey presentation alone must not exclude a note from the practice sequence.
- Start from the root only at the beginning of the run; subsequent looping traverses the full position range rather than resetting at the root each cycle.
- Retain one-time playback and looping options. A one-time run stops after descending to the lowest selected note in the position.

### Show the exact note being practiced

- Highlight only the single fretboard location currently being played, rather than every occurrence of its pitch class or every octave.
- Keep the highlight synchronized with the exact sounding pitch/location. Derive the current highlight from the native audio clock on each available display frame, skip stale visual events after a delayed frame, and clear highlights when notes end or playback stops. Treat note/count updates as urgent.
- Make the highlight conspicuous enough to follow while practicing. Chris suggested turning the entire note yellow; that is a proposed visual treatment, not a fixed color requirement.
- Overview playback visuals are undecided. The voice memo explicitly allows no playback highlight on the zoomed-out neck; avoid a visualization that makes the intended practice target ambiguous.

### Controls and accompaniment

- Keep audio settings in an expandable popover so the normal fretboard controls retain their space.
- Label the popover “Audio Settings” and keep it limited to settings. The main-screen button is the only Play/Stop control; omit popover Play/Stop and Stop / Reset buttons.
- Omit bottom helper/instruction text from Audio Settings. Keep “Accompaniment” as a label directly above the Off/Click/Drums row.
- Keep the Audio Settings title and close button fixed. Constrain the settings body to the available card height and scroll its controls beneath the header when they do not fit; keep all settings reachable on short phone screens.
- Every Tap Tempo press sounds the existing metronome click, including the first tap and while stopped. Keep touch-timestamp tempo detection and the practice clock intact; tapping must not start practice playback or advance count-in/highlights. Return idle native output to suspension after the click ends.
- Always cover both main-screen audio buttons when the popover is open, including phone/tablet layouts and safe-area changes. Hide the underlying buttons until settings close.
- Keep both main-screen audio buttons exactly 44 points high. Play stays a 44-by-44 circle with centered vector Play/Stop symbols. Show the count-in as centered 1–2–3–4 inside this button using the same Basic Manual font and DegreeLabel renderer as neck circles, preserving the digits' natural proportions and centering their ink bounds. Advance from the same audio-clock/display-frame updates as note highlights; remove the popover countdown. Tapping the button during count-in still stops and resets playback.
- When collapsed, provide a compact play/pause control, as requested in the voice memo.
- Provide a notes-on/off toggle so users can practice with only a metronome or drum groove.
- Retain adjustable tempo, tap tempo, rhythmic subdivisions, and independent accompaniment controls from the demonstrated player.
- Display every subdivision with its fraction label (1/4, 1/8, etc.) beside a small glyph from the bundled Opus Text music font: sixteenth, eighth-triplet (with a 3), eighth, dotted eighth, quarter, dotted quarter, half, and dotted half. Use fixed text/glyph slots and note origins/baselines so changing values does not shift either display. Preserve spoken note names for accessibility and existing playback durations.
- Keep tight native audio scheduling on bundled iOS and Android builds.
- Load audio during startup behind the splash. Keep the splash visible until fonts, saved settings, all bundled guitar/drum samples, and the initial position buffers are ready; provide Retry if audio loading fails.
- Lane's revised control preference: choose Notes and accompaniment, then press Play to start. Click and Drums select a mode without starting playback. Stop affects everything and resets the sequence. With Notes off, Play runs only the selected accompaniment.
- Notes, click and drums must share one musical grid and audio clock, retaining exact beat/subdivision alignment through tempo, subdivision, position and accompaniment changes.
- The existing note sound is acceptable for now. Prefer readily available drum sounds rather than adding a large sample collection. Chris is willing to record guitar samples as a future refinement; recording is not a release dependency.

## Implementation decisions — October 6

Lane requested implementation after reviewing the combined requirements. The following interpretations are implemented for review; Chris has not separately reviewed their final UI or transition behavior.

| Topic | Implemented behavior |
| --- | --- |
| Mobile overview audio | Suppress position notes without changing the saved Notes toggle. Keep the selected click/drums; when accompaniment is Off, global Play uses a click in overview. Selecting a position starts its notes only if global Play requested notes. Accompaniment-only playback stays accompaniment-only. No playback highlight appears on the overview. |
| Accompaniment selection | Click and Drums select the accompaniment without starting playback. Selecting the current mode again keeps it selected; Off disables accompaniment. Play starts the selected Notes/accompaniment combination. While playing, mode changes apply on the shared beat grid. Stop affects everything and resets the sequence. |
| Playback highlight timing | Display frames read the native audio clock against the actual scheduled notes and prepared sample endings. A delayed frame shows the current sounding note directly, without replaying stale highlights. Notes/count updates use normal React priority. The displayed MIDI pitch and fretboard location must both match the playing note, including guitar/bass changes. Screen refresh and output-route latency limit absolute speaker-to-display precision. |
| Shared clock | One 12-tick-per-beat timeline represents every supported subdivision exactly. Both lanes derive timestamps from the same anchor. Live changes take effect at a shared beat boundary without starting separate clocks. |
| Count-in | Optional four-click count-in, enabled by default, when starting from stopped. Show 1–2–3–4 inside the circular Play/Stop button on each click's scheduled audio-clock onset, then restore Stop when playback begins. No countdown appears in settings. Changes to position/settings during playback do not repeat the count-in. |
| Settings access | Dedicated visible settings button beside the compact play/stop button. The “Audio Settings” popover contains settings only and scrolls on short screens. |
| Stop and restart | The main-screen Play/Stop button is the only playback control. Stop resets to the starting note. The next Play begins at the lowest root (or lowest selected note when Root start is off), with the optional count-in. One-time playback stops the whole player after reaching the position's lowest selected note. |
| Starting note | Root start by default, with a Lowest note option. After the initial pass, loops traverse the full range without repeating endpoint notes. |
| Missing root / duplicate pitches | When the root is excluded, start at the lowest selected note. Play each distinct pitch once per traversal, choosing a deterministic location on the lower string when there is a unison. |
| Key, position, or note selection changes | Restart the new position's sequence. Native accompaniment retains its beat grid; no new count-in. Notes-off remains respected. Handedness and upside-down options transform the drawing without changing the sounding pitch/location. |
| Startup | Mount the audio provider behind the splash and preload all 25 guitar samples plus four percussion sounds, including when the Audio Player option is off. Prepare the initial position from saved practice settings. Keep native output suspended until Play; retain the splash during loading and offer Retry on failure. |
| Sounds | Reuse the existing guitar and drum assets. Prepare pitch shifts and attack/release envelopes as PCM before native playback. Native notes play at unity rate and end naturally, with no scheduled note truncation. Stop suspends the native output after its fade; the next Play resumes it before scheduling. Additional recordings remain optional. |

Native device timing, pitch shifting, and layout still require device listening/visual checks before release. Browser verification and simulated native-clock tests do not replace those checks.

## Acceptance checks for the requested changes

- In a zoomed position containing selected notes below the root, a new run begins on its lowest root, reaches the highest selected note, then reaches the lowest selected note including applicable greyed-out notes. Looping continues across that range.
- Playback stays within that position's practice notes and highlights exactly one corresponding fretboard location at a time.
- Disabling note playback leaves the selected accompaniment usable independently.
- Collapsing settings leaves a usable playback control and restores the normal screen space on phone and tablet.
- Preserve the approved navigation and selection gestures while adding playback controls.
- On a cold launch, verify the splash stays visible until audio is ready, including with delayed loading. A failed audio load keeps the splash visible with a working Retry button. Opening audio controls and choosing Click/Drums must stay silent until Play.
- Verify overview transitions, count-in, and main-screen stop/restart against the implementation decisions above on native devices before release.

## Source references

- Voice memo: “Lane GNA update 10-5-2026.m4a,” supplied transcript in this task; attached to Chris's October 5, 7:49 PM email.
- [Demo description and proposed features — October 5, 5:20 PM](https://mail.google.com/mail/u/0/#all/1a10e2778f15bc79).
- [Chris's approval and voice memo — October 5, 7:49 PM](https://mail.google.com/mail/u/0/#all/1a10eafee0ca3d4f).
- [Notes-off toggle — October 5, 7:58 PM](https://mail.google.com/mail/u/0/#all/1a10eb8c52d4cadb).
- [Lane's playback interpretation and long-press proposal — October 5, 8:07 PM](https://mail.google.com/mail/u/0/#all/1a10ec05786c2d84).
- [Chris's overview, count-in, and discoverability suggestions — October 5, 8:20 PM](https://mail.google.com/mail/u/0/#all/1a10ecc22e6e2e60).
- [Android setup handoff — October 6, 12:02 PM](https://mail.google.com/mail/u/0/#all/1a1122ae752f15d6).
