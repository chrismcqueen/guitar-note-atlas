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
- Retain one-time playback and looping options. The stopping point for a one-time root-start run remains to be specified.

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
- The existing note sound is acceptable for now. Prefer readily available drum sounds rather than adding a large sample collection. Chris is willing to record guitar samples as a future refinement; recording is not a release dependency.

## Proposals and unresolved decisions

These ideas were raised tentatively and should not be treated as settled requirements:

| Topic | Source and direction | Decision still needed |
| --- | --- | --- |
| Mobile overview audio | Chris's 8:20 PM email suggests turning notes off while the metronome continues, then starting notes when a position is selected. | Confirm transition behavior, including drums, timing, and interaction with the user's notes-off setting. |
| Count-in | The same email suggests four clicks before notes start after stopping and restarting. | Confirm whether to include it, whether it is optional, and when it repeats. |
| Opening settings | Lane proposed long-press on play; Chris questioned discoverability and suggested a dedicated expand/collapse button. | Prefer an explicit expand/collapse affordance when designing the controls; exact layout and mobile placement need review. |
| Pause versus stop | Voice memo requests play/pause; Lane's email proposed play/stop. | Define whether restarting resumes the sequence or begins again at the lowest root, and how count-in applies. |
| Starting note option | Chris and Lane both mentioned a possible root/lowest-note toggle while cautioning against complexity. | Root-start is the requested default; the alternative toggle is optional. |
| Missing root / duplicate pitches | The feedback does not define positions with no selected root or which location to play when multiple strings contain the same pitch. | Specify fallback and location ordering before implementation. |
| Changes during playback | No explicit behavior was given for changing key, position, or selected notes during a run. | Define a musically predictable transition consistent with the overview proposal. |
| Sound refinement | Chris may explore alternative drum sounds or record guitar. | Revisit after core practice behavior is working. |

## Acceptance checks for the requested changes

- In a zoomed position containing selected notes below the root, a new run begins on its lowest root, reaches the highest selected note, then reaches the lowest selected note including applicable greyed-out notes. Looping continues across that range.
- Playback stays within that position's practice notes and highlights exactly one corresponding fretboard location at a time.
- Disabling note playback leaves the selected accompaniment usable independently.
- Collapsing settings leaves a usable playback control and restores the normal screen space on phone and tablet.
- Preserve the approved navigation and selection gestures while adding playback controls.
- Verify the unresolved overview, count-in, and restart behaviors once decisions are made; do not infer approval from their inclusion here.

## Source references

- Voice memo: “Lane GNA update 10-5-2026.m4a,” supplied transcript in this task; attached to Chris's October 5, 7:49 PM email.
- [Demo description and proposed features — October 5, 5:20 PM](https://mail.google.com/mail/u/0/#all/1a10e2778f15bc79).
- [Chris's approval and voice memo — October 5, 7:49 PM](https://mail.google.com/mail/u/0/#all/1a10eafee0ca3d4f).
- [Notes-off toggle — October 5, 7:58 PM](https://mail.google.com/mail/u/0/#all/1a10eb8c52d4cadb).
- [Lane's playback interpretation and long-press proposal — October 5, 8:07 PM](https://mail.google.com/mail/u/0/#all/1a10ec05786c2d84).
- [Chris's overview, count-in, and discoverability suggestions — October 5, 8:20 PM](https://mail.google.com/mail/u/0/#all/1a10ecc22e6e2e60).
- [Android setup handoff — October 6, 12:02 PM](https://mail.google.com/mail/u/0/#all/1a1122ae752f15d6).
