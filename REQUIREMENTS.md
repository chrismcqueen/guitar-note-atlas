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
- Make the highlight conspicuous enough to follow while practicing. Chris suggested turning the entire note yellow; that is a proposed visual treatment, not a fixed color requirement.
- Overview playback visuals are undecided. The voice memo explicitly allows no playback highlight on the zoomed-out neck; avoid a visualization that makes the intended practice target ambiguous.

### Controls and accompaniment

- Keep audio settings in an expandable popover so the normal fretboard controls retain their space.
- When collapsed, provide a compact play/pause control, as requested in the voice memo.
- Provide a notes-on/off toggle so users can practice with only a metronome or drum groove.
- Retain adjustable tempo, tap tempo, rhythmic subdivisions, and independent accompaniment controls from the demonstrated player.
- Keep tight native audio scheduling on bundled iOS and Android builds.
- Lane's testing clarification: clicking Click or Drums must start accompaniment independently while notes remain stopped. Play adds the selected position notes; Pause and Stop affect everything. Selecting a position during accompaniment-only playback must not start notes automatically.
- Notes, click and drums must share one musical grid and audio clock, retaining exact beat/subdivision alignment through tempo, subdivision, position and accompaniment changes.
- The existing note sound is acceptable for now. Prefer readily available drum sounds rather than adding a large sample collection. Chris is willing to record guitar samples as a future refinement; recording is not a release dependency.

## Implementation decisions — October 6

Lane requested implementation after reviewing the combined requirements. The following interpretations are implemented for review; Chris has not separately reviewed their final UI or transition behavior.

| Topic | Implemented behavior |
| --- | --- |
| Mobile overview audio | Suppress position notes without changing the saved Notes toggle. Keep the selected click/drums; when accompaniment is Off, global Play uses a click in overview. Selecting a position starts its notes only if global Play requested notes. Accompaniment-only playback stays accompaniment-only. No playback highlight appears on the overview. |
| Independent accompaniment | Clicking Click or Drums starts that accompaniment immediately, with no notes/count-in when global Play has not requested notes. Play adds notes at a shared beat boundary. Clicking the selected running accompaniment toggles it off. Pause/Stop affect notes and accompaniment together. |
| Shared clock | One 12-tick-per-beat timeline represents every supported subdivision exactly. Both lanes derive timestamps from the same anchor. Live changes take effect at a shared beat boundary without starting separate clocks. |
| Count-in | Optional four-click count-in, enabled by default, on Play and resume. Changes to position/settings during playback do not repeat the count-in. |
| Settings access | Dedicated visible settings button beside the compact play/pause button. Popover content scrolls on short screens. |
| Pause versus stop | Pause preserves sequence progress; Play resumes at the next note. Stop / Reset resets to the starting note. One-time playback stops the whole player after reaching the position's lowest selected note. |
| Starting note | Root start by default, with a Lowest note option. After the initial pass, loops traverse the full range without repeating endpoint notes. |
| Missing root / duplicate pitches | When the root is excluded, start at the lowest selected note. Play each distinct pitch once per traversal, choosing a deterministic location on the lower string when there is a unison. |
| Key, position, or note selection changes | Restart the new position's sequence. Native accompaniment retains its beat grid; no new count-in. Notes-off remains respected. Handedness and upside-down options transform the drawing without changing the sounding pitch/location. |
| Sounds | Reuse the existing guitar and drum assets. Prepare pitch shifts and attack/release envelopes as PCM before native playback. Native notes play at unity rate and end naturally, with no scheduled note truncation. Additional recordings remain optional. |

Native device timing, pitch shifting, and layout still require device listening/visual checks before release. Browser verification and simulated native-clock tests do not replace those checks.

## Acceptance checks for the requested changes

- In a zoomed position containing selected notes below the root, a new run begins on its lowest root, reaches the highest selected note, then reaches the lowest selected note including applicable greyed-out notes. Looping continues across that range.
- Playback stays within that position's practice notes and highlights exactly one corresponding fretboard location at a time.
- Disabling note playback leaves the selected accompaniment usable independently.
- Collapsing settings leaves a usable playback control and restores the normal screen space on phone and tablet.
- Preserve the approved navigation and selection gestures while adding playback controls.
- Verify overview transitions, count-in, pause/resume, and Stop / Reset against the implementation decisions above on native devices before release.

## Source references

- Voice memo: “Lane GNA update 10-5-2026.m4a,” supplied transcript in this task; attached to Chris's October 5, 7:49 PM email.
- [Demo description and proposed features — October 5, 5:20 PM](https://mail.google.com/mail/u/0/#all/1a10e2778f15bc79).
- [Chris's approval and voice memo — October 5, 7:49 PM](https://mail.google.com/mail/u/0/#all/1a10eafee0ca3d4f).
- [Notes-off toggle — October 5, 7:58 PM](https://mail.google.com/mail/u/0/#all/1a10eb8c52d4cadb).
- [Lane's playback interpretation and long-press proposal — October 5, 8:07 PM](https://mail.google.com/mail/u/0/#all/1a10ec05786c2d84).
- [Chris's overview, count-in, and discoverability suggestions — October 5, 8:20 PM](https://mail.google.com/mail/u/0/#all/1a10ecc22e6e2e60).
- [Android setup handoff — October 6, 12:02 PM](https://mail.google.com/mail/u/0/#all/1a1122ae752f15d6).
