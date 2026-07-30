# intellidip vector logo system

The master wordmark uses outlined Baskerville letterforms with three amber dots. The dots do double duty as the three lowercase `i` dots and a visual “thinking…” ellipsis.

## Files

- `intellidip-wordmark-dark.svg` — primary full-color logo for dark backgrounds.
- `intellidip-wordmark-light.svg` — full-color logo for light backgrounds; its darker amber preserves contrast.
- `intellidip-wordmark-mono-light.svg` — one-color ivory logo.
- `intellidip-wordmark-mono-dark.svg` — one-color ink logo.
- `intellidip-mark.svg` — transparent compact mark for flexible placement.
- `intellidip-app-icon.svg` — compact mark on the brand’s near-black rounded square.
- `preview.html` — visual contact sheet for reviewing the complete system.
- `logo-system.json` — machine-readable colors and usage measurements.

## Color

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#0E1017` | Dark field or lettering on light backgrounds |
| Ivory | `#FFF8E7` | Primary lettering on dark backgrounds |
| Amber | `#F3A30F` | Signature dots on dark backgrounds |
| Amber on light | `#B87300` | Signature dots on light backgrounds |

## Usage rules

- Preserve the wordmark’s proportions. Never stretch, condense, rotate, outline, or typeset it again.
- Maintain clear space on every side equal to at least one amber dot diameter.
- Use the full wordmark at widths of `120px`/`32mm` or larger.
- Below that size, use the compact mark. The app-icon version is preferred when the background cannot be controlled.
- Do not recolor individual letters. The three dots are the only amber elements in the primary wordmark.
- Use a monochrome asset when color reproduction or contrast is uncertain.

## Rebuilding

Run `tools/generate-intellidip-logo.ps1` from the repository root. The script converts the installed Baskerville face to SVG paths, so the delivered SVGs have no runtime font dependency.
