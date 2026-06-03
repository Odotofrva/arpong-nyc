# AR Pong NYC - Version 1

This is the first playable prototype for a marker-based AR Pong art/gaming installation.

## What this version includes

- Marker scan simulation screen
- PRESS START screen
- Playable Pong game
- Player vs computer AI paddle
- Mobile touch controls
- Mouse controls for desktop testing
- First-to-5 scoring
- NYC cyber/installation-style UI

## How to run

Open `index.html` in a browser.

For best local testing, run a small local server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Next version

V2 should connect real marker/image tracking using MindAR or AR.js.

Suggested next steps:

1. Create the printed installation marker/poster.
2. Convert the marker image into a MindAR `.mind` target file.
3. Replace the simulated marker scan button with real camera tracking.
4. Attach the Pong canvas to the tracked AR marker.
5. Add sound effects and public installation instructions.


## V1.1 Update

Added:
- CPU chat bubble phrases when the computer hits the ball.
- CPU reaction phrases when the player scores, including “Ahhh you won!”.
- Screen shake effect when the player loses a round/point.

Edit phrase lists inside `app.js`:
- `cpuHitPhrases`
- `playerPointPhrases`
