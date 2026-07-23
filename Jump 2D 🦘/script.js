const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let W, H;
let scale = 1;

const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');

let score = 0;
let level = 1;
let gameOver = false;
let gameLoop;

let player = { x: 0, y: 0, width: 34, height: 34, vy: 0 };
const GRAVITY = 0.35;
const JUMP_VELOCITY = -11;
const BOOST_VELOCITY = -17;
let moveLeft = false;
let moveRight = false;
const MOVE_SPEED = 5;

let platforms = [];
const PLATFORM_WIDTH = 60;
const PLATFORM_HEIGHT = 12;
const LEVEL_THRESHOLD = 2000;
const SCORE_MULTIPLIER = 0.4;

// Level-up message state
let levelMsgStartTime = null;
const LEVEL_MSG_HOLD = 1000;
const LEVEL_MSG_FADE = 800;

function resizeCanvas() {
  const maxW = Math.min(window.innerWidth * 0.92, 420);
  const maxH = Math.min(window.innerHeight * 0.6, 650);
  canvas.width = maxW;
  canvas.height = maxH;
  W = canvas.width;
  H = canvas.height;
  scale = W / 380;
  player.width = 34 * scale;
  player.height = 34 * scale;
}

function createInitialPlatforms() {
  platforms = [];
  const gap = 70 * scale;
  let y = H - 30 * scale;

  platforms.push({ x: W / 2 - (PLATFORM_WIDTH * scale) / 2, y: y, width: PLATFORM_WIDTH * scale, height: PLATFORM_HEIGHT * scale, type: 'normal', dir: 1 });

  y -= gap;
  while (y > 0) {
    spawnPlatformAt(y);
    y -= gap;
  }

  player.x = W / 2 - player.width / 2;
  player.y = H - 30 * scale - player.height;
  player.vy = JUMP_VELOCITY;
}

function pickPlatformType() {
  const r = Math.random();
  const movingChance = level >= 3 ? 0.18 : 0;
  const breakableChance = level >= 2 ? 0.2 : 0.05;
  const boostChance = 0.1;

  if (r < boostChance) return 'boost';
  if (r < boostChance + breakableChance) return 'breakable';
  if (r < boostChance + breakableChance + movingChance) return 'moving';
  return 'normal';
}

function spawnPlatformAt(y) {
  const pw = PLATFORM_WIDTH * scale;
  const x = Math.random() * (W - pw);
  const type = pickPlatformType();
  platforms.push({
    x: x,
    y: y,
    width: pw,
    height: PLATFORM_HEIGHT * scale,
    type: type,
    dir: Math.random() < 0.5 ? 1 : -1
  });
}

function getGapForLevel() {
  return Math.min(70 + level * 4, 110) * scale;
}

function drawPlayer() {
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0d1117';
  const eyeOffsetX = player.width * 0.2;
  const eyeY = player.y + player.height * 0.4;
  ctx.beginPath();
  ctx.arc(player.x + player.width / 2 - eyeOffsetX, eyeY, player.width * 0.08, 0, Math.PI * 2);
  ctx.arc(player.x + player.width / 2 + eyeOffsetX, eyeY, player.width * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function platformColor(type) {
  if (type === 'moving') return '#c084fc';
  if (type === 'breakable') return '#f97316';
  if (type === 'boost') return '#38bdf8';
  return '#4ade80';
}

function drawPlatforms() {
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    const color = platformColor(p.type);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.shadowBlur = 0;

    if (p.type === 'breakable') {
      ctx.strokeStyle = '#0d1117';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x + p.width * 0.3, p.y);
      ctx.lineTo(p.x + p.width * 0.45, p.y + p.height);
      ctx.moveTo(p.x + p.width * 0.65, p.y);
      ctx.lineTo(p.x + p.width * 0.55, p.y + p.height);
      ctx.stroke();
    }
  }
}

function drawLevelMessage() {
  if (!levelMsgStartTime) return;
  const elapsed = Date.now() - levelMsgStartTime;
  const total = LEVEL_MSG_HOLD + LEVEL_MSG_FADE;
  if (elapsed > total) {
    levelMsgStartTime = null;
    return;
  }

  let alpha = 1;
  if (elapsed > LEVEL_MSG_HOLD) {
    alpha = 1 - (elapsed - LEVEL_MSG_HOLD) / LEVEL_MSG_FADE;
  }

  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold ' + (22 * scale) + 'px Courier New';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 10;
  ctx.fillText('Level ' + level, W / 2, H / 2);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function draw() {
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);
  drawPlatforms();
  drawPlayer();
  drawLevelMessage();
}

function checkLevelUp() {
  const newLevel = 1 + Math.floor(score / LEVEL_THRESHOLD);
  if (newLevel > level) {
    level = newLevel;
    levelMsgStartTime = Date.now();
  }
}

function update() {
  if (moveLeft) player.x -= MOVE_SPEED * scale;
  if (moveRight) player.x += MOVE_SPEED * scale;

  if (player.x + player.width < 0) player.x = W;
  if (player.x > W) player.x = -player.width;

  player.vy += GRAVITY * scale;
  player.y += player.vy;

  for (let i = platforms.length - 1; i >= 0; i--) {
    const p = platforms[i];
    if (p.type === 'moving') {
      p.x += p.dir * 1.5 * scale;
      if (p.x <= 0 || p.x + p.width >= W) p.dir *= -1;
    }
  }

  if (player.vy > 0) {
    for (let i = platforms.length - 1; i >= 0; i--) {
      const p = platforms[i];
      const playerBottom = player.y + player.height;
      const prevBottom = playerBottom - player.vy;
      if (
        player.x + player.width > p.x &&
        player.x < p.x + p.width &&
        playerBottom >= p.y &&
        prevBottom <= p.y + 4 * scale
      ) {
        player.vy = p.type === 'boost' ? BOOST_VELOCITY : JUMP_VELOCITY;
        if (p.type === 'breakable') {
          platforms.splice(i, 1);
        }
        break;
      }
    }
  }

  if (player.y < H / 2) {
    const dy = H / 2 - player.y;
    player.y = H / 2;
    score += Math.round((dy / scale) * SCORE_MULTIPLIER);
    scoreEl.textContent = 'Score: ' + score;
    checkLevelUp();

    for (let i = platforms.length - 1; i >= 0; i--) {
      platforms[i].y += dy;
      if (platforms[i].y > H) platforms.splice(i, 1);
    }

    let highestY = H;
    for (let i = 0; i < platforms.length; i++) {
      if (platforms[i].y < highestY) highestY = platforms[i].y;
    }
    const gap = getGapForLevel();
    while (highestY > 0) {
      highestY -= gap;
      spawnPlatformAt(highestY);
    }
  }

  if (player.y > H) {
    endGame();
  }
}

function tick() {
  if (gameOver) return;
  update();
  draw();
}

function endGame() {
  gameOver = true;
  clearInterval(gameLoop);
  gameOverEl.classList.remove('hidden');
}

function resetGame() {
  score = 0;
  level = 1;
  gameOver = false;
  levelMsgStartTime = null;
  scoreEl.textContent = 'Score: 0';
  gameOverEl.classList.add('hidden');
  resizeCanvas();
  createInitialPlatforms();
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, 20);
}

document.addEventListener('keydown', function(e) {
  if (gameOver && e.code === 'Space') { resetGame(); return; }
  if (e.key === 'ArrowLeft') moveLeft = true;
  if (e.key === 'ArrowRight') moveRight = true;
});

document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowLeft') moveLeft = false;
  if (e.key === 'ArrowRight') moveRight = false;
});

const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');

leftBtn.addEventListener('touchstart', function(e) { e.preventDefault(); moveLeft = true; });
leftBtn.addEventListener('touchend', function(e) { e.preventDefault(); moveLeft = false; });
leftBtn.addEventListener('mousedown', function() { moveLeft = true; });
leftBtn.addEventListener('mouseup', function() { moveLeft = false; });

rightBtn.addEventListener('touchstart', function(e) { e.preventDefault(); moveRight = true; });
rightBtn.addEventListener('touchend', function(e) { e.preventDefault(); moveRight = false; });
rightBtn.addEventListener('mousedown', function() { moveRight = true; });
rightBtn.addEventListener('mouseup', function() { moveRight = false; });

document.getElementById('restart').addEventListener('click', resetGame);

window.addEventListener('resize', function() {
  resizeCanvas();
  draw();
});

resizeCanvas();
createInitialPlatforms();
draw();
gameLoop = setInterval(tick, 20);