const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let W, H;
let scale = 1;

const scoreEl = document.getElementById('score');
const waveEl = document.getElementById('wave');
const gameOverEl = document.getElementById('game-over');
const specialBtn = document.getElementById('special');

let score = 0;
let wave = 1;
let gameOver = false;
let gameLoop;

let player = { x: 0, y: 0, width: 40, height: 20, speed: 5 };
let bullets = [];
let enemyBullets = [];
let enemies = [];
let enemyDir = 1;
let enemySpeed = 1;
let enemyFireRate = 0.02;
let moveLeft = false;
let moveRight = false;

// Special weapon state
const SPECIAL_DURATION = 8000;
const SPECIAL_COOLDOWN = 15000;
let specialType = null;
let specialActive = false;
let specialEndsAt = 0;
let specialAvailableAt = 0;

// Shield pickup state
const SHIELD_DURATION = 8000;
let killsThisWave = 0;
let killTriggerForShield = 0;
let shieldSpawnedThisWave = false;
let shieldPickup = null;
let shieldActive = false;
let shieldEndsAt = 0;

// Shield "earned" message state
let shieldMsgStartTime = null;
const SHIELD_MSG_HOLD = 1000;
const SHIELD_MSG_FADE = 800;

function resizeCanvas() {
  const maxW = Math.min(window.innerWidth * 0.92, 500);
  const maxH = Math.min(window.innerHeight * 0.55, 600);
  canvas.width = maxW;
  canvas.height = maxH;
  W = canvas.width;
  H = canvas.height;
  scale = W / 500;
  player.width = 40 * scale;
  player.height = 20 * scale;
  player.speed = 5 * scale;
  player.x = W / 2 - player.width / 2;
  player.y = H - player.height - 15;
}

function getRowsForWave(w) {
  return Math.min(4 + Math.floor(w / 3), 6);
}

function createEnemies() {
  enemies = [];
  const rows = getRowsForWave(wave);
  const cols = 8;
  const enemyW = 30 * scale;
  const enemyH = 20 * scale;
  const gapX = 12 * scale;
  const gapY = Math.max(8, 15 - rows) * scale;
  const startX = (W - (cols * (enemyW + gapX))) / 2;
  const startY = 40 * scale;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      enemies.push({
        x: startX + c * (enemyW + gapX),
        y: startY + r * (enemyH + gapY),
        width: enemyW,
        height: enemyH,
        alive: true
      });
    }
  }

  enemySpeed = 1 + wave * 0.15;
  enemyFireRate = Math.min(0.02 + wave * 0.0015, 0.08);

  killsThisWave = 0;
  shieldSpawnedThisWave = false;
  shieldPickup = null;
  const totalEnemies = enemies.length;
  const minPct = 0.5;
  const maxPct = 0.85;
  const pct = minPct + Math.random() * (maxPct - minPct);
  killTriggerForShield = Math.max(1, Math.floor(totalEnemies * pct));
}

function drawPlayer() {
  if (shieldActive) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3 * scale;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.closePath();
  ctx.fill();
}

function drawEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (e.alive) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(e.x, e.y, e.width, e.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(e.x + e.width * 0.2, e.y + e.height * 0.3, e.width * 0.2, e.height * 0.2);
      ctx.fillRect(e.x + e.width * 0.6, e.y + e.height * 0.3, e.width * 0.2, e.height * 0.2);
    }
  }
}

function drawBullets() {
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i];
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  }

  ctx.fillStyle = '#facc15';
  for (let i = 0; i < enemyBullets.length; i++) {
    const b = enemyBullets[i];
    ctx.fillRect(b.x, b.y, 3 * scale, 12 * scale);
  }
}

function drawShieldPickup() {
  if (!shieldPickup) return;
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(shieldPickup.x, shieldPickup.y, shieldPickup.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.font = (shieldPickup.radius * 1.2) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', shieldPickup.x, shieldPickup.y + 1);
}

function drawShieldMessage() {
  if (!shieldMsgStartTime) return;
  const elapsed = Date.now() - shieldMsgStartTime;
  const total = SHIELD_MSG_HOLD + SHIELD_MSG_FADE;
  if (elapsed > total) {
    shieldMsgStartTime = null;
    return;
  }

  let alpha = 1;
  if (elapsed > SHIELD_MSG_HOLD) {
    alpha = 1 - (elapsed - SHIELD_MSG_HOLD) / SHIELD_MSG_FADE;
  }

  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold ' + (18 * scale) + 'px Courier New';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 10;
  ctx.fillText('🛡️ Earned a Shield!', W / 2, H / 2 - 40 * scale);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  drawPlayer();
  drawEnemies();
  drawBullets();
  drawShieldPickup();
  drawShieldMessage();
}

function updateSpecialButton() {
  const now = Date.now();
  if (specialActive) {
    specialBtn.disabled = true;
    specialBtn.classList.add('active-mode');
    const secsLeft = Math.ceil((specialEndsAt - now) / 1000);
    specialBtn.textContent = '⚡ ' + specialType.toUpperCase() + ' (' + secsLeft + 's)';
  } else if (now < specialAvailableAt) {
    specialBtn.disabled = true;
    specialBtn.classList.remove('active-mode');
    const secsLeft = Math.ceil((specialAvailableAt - now) / 1000);
    specialBtn.textContent = '⚡ COOLDOWN (' + secsLeft + 's)';
  } else {
    specialBtn.disabled = false;
    specialBtn.classList.remove('active-mode');
    specialBtn.textContent = '⚡ SPECIAL';
  }
}

function activateSpecial() {
  if (gameOver) return;
  const now = Date.now();
  if (now < specialAvailableAt) return;

  specialType = specialType === 'big' ? 'spread' : 'big';
  specialActive = true;
  specialEndsAt = now + SPECIAL_DURATION;
  specialAvailableAt = specialEndsAt + SPECIAL_COOLDOWN;
}

function shoot() {
  if (gameOver) return;
  const now = Date.now();

  if (specialActive && now < specialEndsAt) {
    if (specialType === 'big') {
      bullets.push({
        x: player.x + player.width / 2 - 6 * scale,
        y: player.y,
        vx: 0,
        width: 12 * scale,
        height: 22 * scale,
        color: '#c084fc'
      });
    } else if (specialType === 'spread') {
      bullets.push({ x: player.x + player.width / 2 - 1.5 * scale, y: player.y, vx: 0, width: 3 * scale, height: 12 * scale, color: '#c084fc' });
      bullets.push({ x: player.x + player.width / 2 - 1.5 * scale, y: player.y, vx: -2.5 * scale, width: 3 * scale, height: 12 * scale, color: '#c084fc' });
      bullets.push({ x: player.x + player.width / 2 - 1.5 * scale, y: player.y, vx: 2.5 * scale, width: 3 * scale, height: 12 * scale, color: '#c084fc' });
    }
  } else {
    bullets.push({ x: player.x + player.width / 2 - 1.5 * scale, y: player.y, vx: 0, width: 3 * scale, height: 12 * scale, color: '#4ade80' });
  }
}

function spawnShieldPickup() {
  const radius = 14 * scale;
  shieldPickup = {
    x: radius + Math.random() * (W - radius * 2),
    y: -radius,
    radius: radius,
    speed: 2 * scale
  };
}

function update() {
  const now = Date.now();
  if (specialActive && now >= specialEndsAt) {
    specialActive = false;
  }
  if (shieldActive && now >= shieldEndsAt) {
    shieldActive = false;
  }

  if (moveLeft) player.x -= player.speed;
  if (moveRight) player.x += player.speed;
  if (player.x < 0) player.x = 0;
  if (player.x > W - player.width) player.x = W - player.width;

  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= 7 * scale;
    bullets[i].x += bullets[i].vx;
    if (bullets[i].y < 0) bullets.splice(i, 1);
  }

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].y += 4 * scale;
    if (enemyBullets[i].y > H) enemyBullets.splice(i, 1);
  }

  let hitEdge = false;
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e.alive) continue;
    e.x += enemySpeed * enemyDir * scale;
    if (e.x <= 0 || e.x + e.width >= W) hitEdge = true;
  }
  if (hitEdge) {
    enemyDir *= -1;
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].y += 12 * scale;
    }
  }

  if (Math.random() < enemyFireRate) {
    const alive = enemies.filter(function(e) { return e.alive; });
    if (alive.length > 0) {
      const shooter = alive[Math.floor(Math.random() * alive.length)];
      enemyBullets.push({ x: shooter.x + shooter.width / 2, y: shooter.y + shooter.height });
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (!b) continue;
    for (let j = 0; j < enemies.length; j++) {
      const e = enemies[j];
      if (e.alive &&
          b.x < e.x + e.width && b.x + b.width > e.x &&
          b.y < e.y + e.height && b.y + b.height > e.y) {
        e.alive = false;
        bullets.splice(i, 1);
        score += 10;
        scoreEl.textContent = 'Score: ' + score;

        killsThisWave++;
        if (!shieldSpawnedThisWave && killsThisWave >= killTriggerForShield) {
          spawnShieldPickup();
          shieldSpawnedThisWave = true;
        }
        break;
      }
    }
  }

  if (shieldPickup) {
    shieldPickup.y += shieldPickup.speed;
    const dx = (player.x + player.width / 2) - shieldPickup.x;
    const dy = (player.y + player.height / 2) - shieldPickup.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < shieldPickup.radius + player.width / 2) {
      shieldActive = true;
      shieldEndsAt = Date.now() + SHIELD_DURATION;
      shieldPickup = null;
      shieldMsgStartTime = Date.now();
    } else if (shieldPickup && shieldPickup.y - shieldPickup.radius > H) {
      shieldPickup = null;
    }
  }

  for (let i = 0; i < enemyBullets.length; i++) {
    const b = enemyBullets[i];
    if (b.x < player.x + player.width && b.x + 3 * scale > player.x &&
        b.y < player.y + player.height && b.y + 12 * scale > player.y) {
      if (shieldActive) {
        enemyBullets.splice(i, 1);
        break;
      }
      return endGame();
    }
  }

  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].alive && enemies[i].y + enemies[i].height >= player.y) {
      return endGame();
    }
  }

  if (enemies.every(function(e) { return !e.alive; })) {
    wave++;
    waveEl.textContent = 'Wave ' + wave;
    enemyDir = 1;
    createEnemies();
  }
}

function tick() {
  if (gameOver) return;
  update();
  draw();
  updateSpecialButton();
}

function endGame() {
  gameOver = true;
  clearInterval(gameLoop);
  gameOverEl.classList.remove('hidden');
}

function resetGame() {
  score = 0;
  wave = 1;
  waveEl.textContent = 'Wave 1';
  enemyDir = 1;
  bullets = [];
  enemyBullets = [];
  gameOver = false;
  specialType = null;
  specialActive = false;
  specialAvailableAt = 0;
  shieldActive = false;
  shieldPickup = null;
  shieldMsgStartTime = null;
  scoreEl.textContent = 'Score: 0';
  gameOverEl.classList.add('hidden');
  resizeCanvas();
  createEnemies();
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, 30);
}

document.addEventListener('keydown', function(e) {
  if (gameOver && e.code === 'Space') { resetGame(); return; }
  if (e.key === 'ArrowLeft') moveLeft = true;
  if (e.key === 'ArrowRight') moveRight = true;
  if (e.code === 'Space') shoot();
  if (e.key === 'x' || e.key === 'X') activateSpecial();
});

document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowLeft') moveLeft = false;
  if (e.key === 'ArrowRight') moveRight = false;
});

const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const shootBtn = document.getElementById('shoot');

leftBtn.addEventListener('touchstart', function(e) { e.preventDefault(); moveLeft = true; });
leftBtn.addEventListener('touchend', function(e) { e.preventDefault(); moveLeft = false; });
leftBtn.addEventListener('mousedown', function() { moveLeft = true; });
leftBtn.addEventListener('mouseup', function() { moveLeft = false; });

rightBtn.addEventListener('touchstart', function(e) { e.preventDefault(); moveRight = true; });
rightBtn.addEventListener('touchend', function(e) { e.preventDefault(); moveRight = false; });
rightBtn.addEventListener('mousedown', function() { moveRight = true; });
rightBtn.addEventListener('mouseup', function() { moveRight = false; });

shootBtn.addEventListener('click', shoot);
specialBtn.addEventListener('click', activateSpecial);
document.getElementById('restart').addEventListener('click', resetGame);

window.addEventListener('resize', function() {
  resizeCanvas();
  draw();
});

resizeCanvas();
createEnemies();
draw();
gameLoop = setInterval(tick, 30);