const screens = {
  scan: document.getElementById('scanScreen'),
  ar: document.getElementById('arScreen'),
  start: document.getElementById('startScreen'),
  game: document.getElementById('gameScreen'),
  end: document.getElementById('endScreen')
};
const statusBox = document.getElementById('cameraStatus');
const startCameraBtn = document.getElementById('startCameraBtn');
const simulateBtn = document.getElementById('simulateBtn');
const exitArBtn = document.getElementById('exitArBtn');
const arMessage = document.getElementById('arMessage');
const startBtn = document.getElementById('startBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const rescanBtn = document.getElementById('rescanBtn');
const winnerText = document.getElementById('winnerText');
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const playerScoreEl = document.getElementById('playerScore');
const cpuScoreEl = document.getElementById('cpuScore');
const gameWrap = document.getElementById('gameWrap');
const cpuBubble = document.getElementById('cpuBubble');
const sceneLabel = document.getElementById('sceneLabel');
const targetEntity = document.getElementById('targetEntity');
const arScene = document.getElementById('arScene');

let arReady = false;
let gameRunning = false;
let playerScore = 0;
let cpuScore = 0;
let rafId = null;
let lastBubbleTime = 0;

const scenes = [
  ['street-bg-1', 'Queensbridge Night Run'],
  ['street-bg-2', 'Brooklyn Block Party'],
  ['street-bg-3', 'Subway Neon Tunnel']
];
const cpuPhrases = ["You can't touch this!", 'Too slow, NYC!', 'Bridge defense activated!', 'RoboTechi returns it!', 'Try that again!'];
const userScorePhrases = ['Ahhh you won!', 'Nice hit!', 'You got me!', 'Point for you!', 'Respect!'];

const paddleW = 14, paddleH = 105;
const player = { x: 30, y: canvas.height / 2 - paddleH / 2, w: paddleW, h: paddleH };
const cpu = { x: canvas.width - 44, y: canvas.height / 2 - paddleH / 2, w: paddleW, h: paddleH };
const ball = { x: canvas.width / 2, y: canvas.height / 2, r: 9, vx: 6, vy: 4 };

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

async function checkTargetFile() {
  try {
    const res = await fetch('assets/targets/marker.mind', { method: 'HEAD', cache: 'no-store' });
    if (res.ok) {
      statusBox.textContent = 'AR target found. Camera scan is ready.';
      statusBox.className = 'status-box status-good';
      arReady = true;
    } else throw new Error('missing');
  } catch (err) {
    statusBox.innerHTML = 'Real AR target file not found yet. Convert your marker image into <strong>marker.mind</strong> and place it in <strong>assets/targets/</strong>. You can still test gameplay without AR.';
    statusBox.className = 'status-box status-bad';
    arReady = false;
  }
}

async function startAR() {
  if (!arReady) {
    alert('Missing assets/targets/marker.mind. Add the compiled MindAR target first, then run from localhost or HTTPS.');
    return;
  }
  showScreen('ar');
  try {
    const mindarSystem = arScene.systems['mindar-image-system'];
    await mindarSystem.start();
    arMessage.textContent = 'Point camera at the Queensbridge marker...';
  } catch (err) {
    arMessage.textContent = 'Camera did not start. Use HTTPS or localhost and allow camera permission.';
  }
}

function stopAR() {
  try {
    const mindarSystem = arScene.systems['mindar-image-system'];
    mindarSystem.stop();
  } catch (err) {}
  showScreen('scan');
}

if (targetEntity) {
  targetEntity.addEventListener('targetFound', () => {
    arMessage.textContent = 'Marker found. Tap to start.';
    setTimeout(() => showScreen('start'), 700);
  });
  targetEntity.addEventListener('targetLost', () => {
    arMessage.textContent = 'Marker lost. Point camera at the poster again.';
  });
}

document.body.addEventListener('click', () => {
  if (screens.ar.classList.contains('active')) showScreen('start');
});

function pickScene() {
  const [cls, label] = scenes[Math.floor(Math.random() * scenes.length)];
  gameWrap.classList.remove(...scenes.map(s => s[0]));
  gameWrap.classList.add(cls);
  sceneLabel.textContent = label;
}

function showBubble(text) {
  cpuBubble.textContent = text;
  cpuBubble.classList.remove('hidden');
  clearTimeout(showBubble.timer);
  showBubble.timer = setTimeout(() => cpuBubble.classList.add('hidden'), 1300);
}

function resetBall(direction = 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = 6 * direction;
  ball.vy = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 3);
}

function resetGame() {
  playerScore = 0; cpuScore = 0;
  playerScoreEl.textContent = playerScore;
  cpuScoreEl.textContent = cpuScore;
  player.y = canvas.height / 2 - paddleH / 2;
  cpu.y = canvas.height / 2 - paddleH / 2;
  resetBall(Math.random() > 0.5 ? 1 : -1);
  pickScene();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  for (let y = 0; y < canvas.height; y += 32) ctx.fillRect(canvas.width / 2 - 3, y, 6, 18);
  ctx.fillStyle = '#ffe0b0';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillRect(cpu.x, cpu.y, cpu.w, cpu.h);
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
}

function update() {
  ball.x += ball.vx; ball.y += ball.vy;
  if (ball.y - ball.r <= 0 || ball.y + ball.r >= canvas.height) ball.vy *= -1;
  const cpuTarget = ball.y - cpu.h / 2;
  cpu.y += (cpuTarget - cpu.y) * 0.075;
  cpu.y = Math.max(0, Math.min(canvas.height - cpu.h, cpu.y));

  const hitPlayer = ball.x - ball.r < player.x + player.w && ball.y > player.y && ball.y < player.y + player.h && ball.vx < 0;
  const hitCpu = ball.x + ball.r > cpu.x && ball.y > cpu.y && ball.y < cpu.y + cpu.h && ball.vx > 0;
  if (hitPlayer || hitCpu) {
    ball.vx *= -1.055;
    ball.vy += ((ball.y - (hitPlayer ? player.y : cpu.y)) - paddleH / 2) * 0.045;
    if (hitCpu && Date.now() - lastBubbleTime > 1200) {
      showBubble(cpuPhrases[Math.floor(Math.random() * cpuPhrases.length)]);
      lastBubbleTime = Date.now();
    }
  }

  if (ball.x < -20) {
    cpuScore++;
    cpuScoreEl.textContent = cpuScore;
    gameWrap.classList.remove('shake'); void gameWrap.offsetWidth; gameWrap.classList.add('shake');
    showBubble('Point for CPU!');
    resetBall(1);
  }
  if (ball.x > canvas.width + 20) {
    playerScore++;
    playerScoreEl.textContent = playerScore;
    showBubble(userScorePhrases[Math.floor(Math.random() * userScorePhrases.length)]);
    resetBall(-1);
  }
  if (playerScore >= 5 || cpuScore >= 5) endGame(playerScore > cpuScore);
}

function loop() {
  if (!gameRunning) return;
  update(); draw();
  rafId = requestAnimationFrame(loop);
}

function startGame() {
  resetGame(); showScreen('game'); gameRunning = true; cancelAnimationFrame(rafId); loop();
}
function endGame(playerWon) {
  gameRunning = false; cancelAnimationFrame(rafId);
  winnerText.textContent = playerWon ? 'You Win!' : 'Computer Wins!';
  showScreen('end');
}

function setPlayerFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const scale = canvas.height / rect.height;
  player.y = (clientY - rect.top) * scale - player.h / 2;
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));
}
canvas.addEventListener('mousemove', setPlayerFromEvent);
canvas.addEventListener('touchmove', e => { e.preventDefault(); setPlayerFromEvent(e); }, { passive: false });

startCameraBtn.addEventListener('click', startAR);
simulateBtn.addEventListener('click', () => showScreen('start'));
exitArBtn.addEventListener('click', stopAR);
startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);
rescanBtn.addEventListener('click', () => showScreen('scan'));

checkTargetFile();
draw();
