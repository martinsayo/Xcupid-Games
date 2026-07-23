# 🐸 Doodle Jump

A classic Doodle Jump style endless platform jumper built from scratch with plain HTML, CSS, and JavaScript — no frameworks, no libraries. Gravity-based physics, procedurally generated platforms, camera scroll, and scaling difficulty with levels.

![Made by Xcupid](https://img.shields.io/badge/made%20by-Xcupid-4ade80?style=flat-square)

## 🎮 Features

- Gravity and auto-bounce physics — jump automatically on landing
- Screen wrap — walk off one edge, appear on the other
- Procedurally generated platforms that scroll endlessly as you climb
- **4 platform types:**
  - 🟩 Normal — standard platform
  - 🟧 Breakable — crumbles after one bounce
  - 🟦 Boost — launches you significantly higher
  - 🟪 Moving — drifts side to side (unlocks from Level 3)
- **Leveling system** — every 2000 points triggers a new level, shown with a fading "Level X" message on-canvas
- Difficulty scales with level: platform gaps widen, moving/breakable platforms appear more often
- Live score tracking based on height climbed
- On-screen ◀ ▶ controls for mobile/touch play, plus full keyboard support
- Restart button + Game Over state
- Fully responsive canvas — fits any screen without scrolling

## 🕹️ How to Play

- **Desktop:** Arrow keys (Left/Right) to move.
- **Mobile/Touch:** Tap ◀ ▶ to move.
- Land on platforms to auto-bounce upward — climb as high as you can.
- Watch for orange (breakable) platforms — they only hold once.
- Blue platforms give an extra boost. Purple platforms move — time your landing.
- Falling off the bottom of the screen ends the game.
- Hit **Restart** to play again after Game Over.

## 🛠️ Built With

- HTML5 Canvas
- CSS3
- Vanilla JavaScript (no frameworks or dependencies)

## 📂 Project Structure

```
doodle-jump/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 Running Locally

1. Clone or download this repo
2. Open `index.html` in any browser

No build step, no dependencies — it just runs.

## 👤 Author

**Xcupid** (Martins Ayomide)
Frontend Web Developer | Video Editor & Content Creator

---

© All rights reserved.
