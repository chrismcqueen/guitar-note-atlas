# Released iOS parity reference

The behavior and visuals used for parity work in this repository come from the released Guitar Note Atlas 2.1 (build 1) source.

- Public repository: `eboebo/guitar-scales`
- Branch: `scrolling-view3`
- Released commit: `4113b24`
- Home-screen display name: `Guitar Atlas` (`CFBundleDisplayName` in the released target’s Info.plist). Product/welcome name remains Guitar Note Atlas.
- iOS application category: Music; native status bar hidden on phone and iPad.
- Bundle identifier: `com.chrismcqueen.GuitarNoteAtlas`
- Local reference checkout: `~/Downloads/Guitar Note Atlas 3.0`

The committed files at `4113b24` match the installed App Store build used for visual comparison. Staged or uncommitted audio/playback changes in the local checkout are an unfinished 3.0 experiment and are deliberately excluded from parity work.

## Source mapping

| Released iOS source | React Native implementation |
| --- | --- |
| `notes.json` position metadata | `src/utils/positions.mjs` |
| `FullStringContainerView.m` tap-to-position behavior | `src/components/Neck/Neck.jsx` |
| `StringView.m` position view and color bands | `src/components/PositionZoom.jsx` |
| `FullStringView.m` full-neck colors and tablet overview | `src/components/Neck/PositionBands.jsx`, `src/components/TabletNeck.jsx` |
| `UIColor+Guitar.m` palette | `src/utils/theme.js` |

When the released binary and source disagree, record the difference before changing behavior. Playback is tracked separately because it does not belong to the released 2.1 baseline.
