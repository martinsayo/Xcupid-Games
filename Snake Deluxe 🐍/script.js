const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const gridSize = 20;
let box;

let snake = [{ x: 10, y: 10 }];
let dx = 1;
let dy = 0;
let food = { x: 5, y: 5 };

let score = 0;
let gameOver = false;
let speed = 150;
let gameLoop;

const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');

function resizeCanvas() {
  const maxSize = Math.min(window.innerWidth * 0.92, window.innerHeight * 0.55, 500);
  const size = Math.floor(maxSize / gridSize) * gridSize;
  canvas.width = size;
  canvas.height = size;
  box = size / gridSize;
}

function draw() {
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    ctx.fillStyle = i === 0 ? '#22c55e' : '#4ade80';
    ctx.fillRect(segment.x * box, segment.y * box, box - 1, box - 1);
  }

  drawEyes();

  const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(food.x * box + box / 2, food.y * box + box / 2, box / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawEyes() {
  const head = snake[0];
  const cx = head.x * box;
  const cy = head.y * box;
  const eyeSize = box / 7;

  let eye1 = { x: 0, y: 0 };
  let eye2 = { x: 0, y: 0 };

  if (dx === 1) {
    eye1 = { x: box * 0.65, y: box * 0.25 };
    eye2 = { x: box * 0.65, y: box * 0.65 };
  } else if (dx === -1) {
    eye1 = { x: box * 0.25, y: box * 0.25 };
    eye2 = { x: box * 0.25, y: box * 0.65 };
  } else if (dy === -1) {
    eye1 = { x: box * 0.25, y: box * 0.25 };
    eye2 = { x: box * 0.65, y: box * 0.25 };
  } else if (dy === 1) {
    eye1 = { x: box * 0.25, y: box * 0.65 };
    eye2 = { x: box * 0.65, y: box * 0.65 };
  }

  ctx.fillStyle = '#0d1117';
  ctx.beginPath();
  ctx.arc(cx + eye1.x, cy + eye1.y, eyeSize, 0, Math.PI * 2);
  ctx.arc(cx + eye2.x, cy + eye2.y, eyeSize, 0, Math.PI * 2);
  ctx.fill();
}

function update() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    endGame();
    return;
  }

  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      endGame();
      return;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score = score + 1;
    scoreEl.textContent = 'Score: ' + score;
    placeFood();
  } else {
    snake.pop();
  }
}

function placeFood() {
  let newFood;
  let onSnake = true;
  while (onSnake) {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
    onSnake = false;
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === newFood.x && snake[i].y === newFood.y) {
        onSnake = true;
      }
    }
  }
  food = newFood;
}

function endGame() {
  gameOver = true;
  clearInterval(gameLoop);
  gameOverEl.classList.remove('hidden');
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  dx = 1;
  dy = 0;
  score = 0;
  scoreEl.textContent = 'Score: 0';
  gameOver = false;
  gameOverEl.classList.add('hidden');
  placeFood();
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, speed);
}

function tick() {
  if (gameOver) {
    return;
  }
  update();
  draw();
}

function changeDirection(direction) {
  if (gameOver) {
    return;
  }
  if (direction === 'up' && dy === 0) {
    dx = 0;
    dy = -1;
  }
  if (direction === 'down' && dy === 0) {
    dx = 0;
    dy = 1;
  }
  if (direction === 'left' && dx === 0) {
    dx = -1;
    dy = 0;
  }
  if (direction === 'right' && dx === 0) {
    dx = 1;
    dy = 0;
  }
}

document.addEventListener('keydown', function(e) {
  if (gameOver && e.code === 'Space') {
    resetGame();
    return;
  }
  if (e.key === 'ArrowUp') changeDirection('up');
  if (e.key === 'ArrowDown') changeDirection('down');
  if (e.key === 'ArrowLeft') changeDirection('left');
  if (e.key === 'ArrowRight') changeDirection('right');
});

document.getElementById('up').addEventListener('click', function() { changeDirection('up'); });
document.getElementById('down').addEventListener('click', function() { changeDirection('down'); });
document.getElementById('left').addEventListener('click', function() { changeDirection('left'); });
document.getElementById('right').addEventListener('click', function() { changeDirection('right'); });
document.getElementById('restart').addEventListener('click', resetGame);

window.addEventListener('resize', function() {
  resizeCanvas();
  draw();
});

resizeCanvas();
placeFood();
draw();
gameLoop = setInterval(tick, speed);