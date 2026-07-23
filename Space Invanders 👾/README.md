# 👾 Space Invaders

A classic Space Invaders game built from scratch with plain HTML, CSS, and JavaScript — no frameworks, no libraries. Fully responsive canvas, on-screen controls, an alternating special weapon, a random shield pickup, and infinitely scaling waves.


## 🎮 Features

- Smooth ship movement with wall clamping
- Enemy formation that marches side to side and descends on hitting an edge
- Enemies fire back at random intervals
- Collision detection (player bullets vs enemies, enemy bullets vs player, enemies reaching the player line)
- Live score tracking
- **Infinite waves** — enemy rows, speed, and fire rate all scale up the further you go, with no cap
- **Special weapon** — tap ⚡ to alternate between a Big Bullet and a 3-way Spread Shot, each with its own duration and cooldown
- **Shield pickup** — a glowing orb spawns once per wave at a random point (50–85% of that wave's kills), catch it to absorb enemy bullets for a few seconds, with a fading "Earned a Shield!" message on pickup
- On-screen ◀ 🔥 ▶ controls for mobile/touch play, plus full keyboard support
- Restart button + Game Over state
- Fully responsive canvas — fits any screen without scrolling

## 🕹️ How to Play

- **Desktop:** Arrow keys to move, Spacebar to shoot, `X` to activate Special.
- **Mobile/Touch:** Tap ◀ ▶ to move, 🔥 to shoot, ⚡ SPECIAL to activate your weapon upgrade.
- Clear all enemies in a wave to advance — each wave gets harder.
- Catch the blue shield orb when it drops to survive a few extra hits.
- Hit **Restart** to play again after Game Over.

## 🛠️ Built With

- HTML5 Canvas
- CSS3
- Vanilla JavaScript (no frameworks or dependencies)

## 📂 Project Structure

```
space-invaders/
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
