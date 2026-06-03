const screens = {
  scan: document.getElementById('scanScreen'),
  start: document.getElementById('startScreen'),
  game: document.getElementById('gameScreen'),
  end: document.getElementById('endScreen'),
};

const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const playerScoreEl = document.getElementById('playerScore');
const cpuScoreEl = document.getElementById('cpuScore');
const winnerText = document.getElementById('winnerText');
const cpuBubble = document.getElementById('cpuBubble');
const gameWrap = document.querySelector('.game-wrap');

const cpuHitPhrases = [
  "You can't touch this!",
  "Too slow!",
  "NYC reflexes only!",
  "Back at you!",
  "Try me again!",
  "I run this court!"
];

const playerPointPhrases = [
  "Ahhh you won!",
  "Nice shot!",
  "You got me!",
  "Okay, I see you!",
  "That one was clean!"
];

let bubbleTimer;

const game = {
  running: false,
  playerScore: 0,
  cpuScore: 0,
  winningScore: 5,
  player: { x: 28, y: 210, w: 18, h: 100, speed: 8 },
  cpu: { x: 854, y: 210, w: 18, h: 100, speed: 5.2 },
  ball: { x: 450, y: 260, r: 10, vx: 5.2, vy: 3.2 },
};


function showCpuBubble(message) {
  if (!cpuBubble) return;
  clearTimeout(bubbleTimer);
  cpuBubble.textContent = message;
  cpuBubble.classList.add('show');
  bubbleTimer = setTimeout(() => {
    cpuBubble.classList.remove('show');
  }, 1250);
}

function randomPhrase(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shakeScreen() {
  if (!gameWrap) return;
  gameWrap.classList.remove('screen-shake');
  // Force the animation to restart each time the player loses a round.
  void gameWrap.offsetWidth;
  gameWrap.classList.add('screen-shake');
}

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[name].classList.add('active');
}

function resetBall(direction = 1) {
  game.ball.x = canvas.width / 2;
  game.ball.y = canvas.height / 2;
  game.ball.vx = 5.2 * direction;
  game.ball.vy = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 2.5);
}

function resetGame() {
  game.playerScore = 0;
  game.cpuScore = 0;
  game.player.y = canvas.height / 2 - game.player.h / 2;
  game.cpu.y = canvas.height / 2 - game.cpu.h / 2;
  resetBall(Math.random() > 0.5 ? 1 : -1);
  updateScore();
}

function updateScore() {
  playerScoreEl.textContent = game.playerScore;
  cpuScoreEl.textContent = game.cpuScore;
}

function drawCourt() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#03111d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(87,231,255,.25)';
  ctx.lineWidth = 2;
  for (let x = 0; x < canvas.width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.setLineDash([12, 18]);
  ctx.strokeStyle = 'rgba(255,255,255,.42)';
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(paddle) {
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#57e7ff';
  ctx.shadowBlur = 18;
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.shadowBlur = 0;
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = '#57e7ff';
  ctx.shadowColor = '#57e7ff';
  ctx.shadowBlur = 20;
  ctx.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function moveCPU() {
  const cpuCenter = game.cpu.y + game.cpu.h / 2;
  if (cpuCenter < game.ball.y - 12) game.cpu.y += game.cpu.speed;
  if (cpuCenter > game.ball.y + 12) game.cpu.y -= game.cpu.speed;
  game.cpu.y = Math.max(0, Math.min(canvas.height - game.cpu.h, game.cpu.y));
}

function collide(ball, paddle) {
  return ball.x - ball.r < paddle.x + paddle.w &&
    ball.x + ball.r > paddle.x &&
    ball.y - ball.r < paddle.y + paddle.h &&
    ball.y + ball.r > paddle.y;
}

function updateGame() {
  if (!game.running) return;

  game.ball.x += game.ball.vx;
  game.ball.y += game.ball.vy;

  if (game.ball.y - game.ball.r <= 0 || game.ball.y + game.ball.r >= canvas.height) {
    game.ball.vy *= -1;
  }

  moveCPU();

  if (collide(game.ball, game.player)) {
    game.ball.vx = Math.abs(game.ball.vx) + 0.18;
    const hitPos = (game.ball.y - (game.player.y + game.player.h / 2)) / (game.player.h / 2);
    game.ball.vy = hitPos * 6;
  }

  if (collide(game.ball, game.cpu)) {
    game.ball.vx = -Math.abs(game.ball.vx) - 0.18;
    const hitPos = (game.ball.y - (game.cpu.y + game.cpu.h / 2)) / (game.cpu.h / 2);
    game.ball.vy = hitPos * 6;
    showCpuBubble(randomPhrase(cpuHitPhrases));
  }

  if (game.ball.x < -30) {
    game.cpuScore++;
    updateScore();
    shakeScreen();
    showCpuBubble(randomPhrase(cpuHitPhrases));
    resetBall(-1);
  }

  if (game.ball.x > canvas.width + 30) {
    game.playerScore++;
    updateScore();
    showCpuBubble(randomPhrase(playerPointPhrases));
    resetBall(1);
  }

  if (game.playerScore >= game.winningScore || game.cpuScore >= game.winningScore) {
    game.running = false;
    winnerText.textContent = game.playerScore > game.cpuScore ? 'You Win!' : 'Computer Wins!';
    showScreen('end');
  }
}

function drawGame() {
  drawCourt();
  drawPaddle(game.player);
  drawPaddle(game.cpu);
  drawBall();
}

function gameLoop() {
  updateGame();
  drawGame();
  requestAnimationFrame(gameLoop);
}

function movePlayer(clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  const y = (clientY - rect.top) * scaleY;
  game.player.y = Math.max(0, Math.min(canvas.height - game.player.h, y - game.player.h / 2));
}

canvas.addEventListener('mousemove', event => movePlayer(event.clientY));
canvas.addEventListener('touchmove', event => {
  event.preventDefault();
  movePlayer(event.touches[0].clientY);
}, { passive: false });

canvas.addEventListener('touchstart', event => movePlayer(event.touches[0].clientY), { passive: true });

document.getElementById('scanBtn').addEventListener('click', () => showScreen('start'));
document.getElementById('startBtn').addEventListener('click', () => {
  resetGame();
  showScreen('game');
  game.running = true;
});
document.getElementById('playAgainBtn').addEventListener('click', () => {
  resetGame();
  showScreen('game');
  game.running = true;
});
document.getElementById('rescanBtn').addEventListener('click', () => showScreen('scan'));

resetGame();
gameLoop();
