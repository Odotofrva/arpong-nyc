# AR Pong NYC v1.3 - Real Marker Upgrade

This version is ready for a real marker-tracking workflow using MindAR.

## Where to place the marker files

Your uploaded marker image is already placed here:

```text
assets/targets/arpongmarker.png
```

For real AR scanning, convert that PNG into a MindAR target file and save it here:

```text
assets/targets/marker.mind
```

The code already looks for that exact file path.

## How to create marker.mind

1. Open the MindAR Image Target Compiler.
2. Upload `assets/targets/arpongmarker.png`.
3. Compile/download the target file.
4. Rename the downloaded file to `marker.mind`.
5. Place it in `assets/targets/`.

Final folder should look like:

```text
assets/
  targets/
    arpongmarker.png
    marker.mind
```

## Why the camera may not show

Browser camera access usually will not work from `file://`.
Run the project from localhost or HTTPS.

Local test:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

For a phone test, host it on HTTPS using GitHub Pages, Netlify, Vercel, or another HTTPS host.

## Common camera fixes

- Use Chrome on Android or Safari on iPhone.
- Allow camera permission when prompted.
- Do not open the HTML file directly from your file manager.
- Use HTTPS for mobile testing.
- Make sure no other app/browser tab is using the camera.
- On iPhone, check Settings > Safari > Camera and allow access.

## What was added

- Real AR scan screen structure
- MindAR integration
- Correct marker folder
- Marker preview
- Missing `marker.mind` warning
- Fallback gameplay test button
- Existing Pong gameplay, NYC backgrounds, CPU chat bubbles, and screen shake
