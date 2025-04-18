// Updated timer logic with CSTimer-style behavior for mobile
const timerDisplay = document.getElementById("timer");
const scrambleDisplay = document.getElementById("scramble");
const countdownText = document.getElementById("countdown");
const ao5Display = document.getElementById("ao5");
const ao12Display = document.getElementById("ao12");
const timesList = document.getElementById("times-list");
const canvas = document.getElementById("timesChart");
const ctx = canvas.getContext("2d");

let startTime = null;
let running = false;
let animationFrameId = null;
let solveTimes = [];
let countdown = 3;
let countdownInterval = null;
let countdownRunning = false;
let longPressTimeout = null;

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  const centiseconds = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");
  return `${minutes}:${seconds}.${centiseconds}`;
}

function updateTimer() {
  const now = performance.now();
  const elapsed = now - startTime;
  timerDisplay.textContent = formatTime(elapsed);
  animationFrameId = requestAnimationFrame(updateTimer);
}

function startTimer() {
  if (!running) {
    startTime = performance.now();
    running = true;
    updateTimer();
  }
}

function stopTimer() {
  if (running) {
    running = false;
    cancelAnimationFrame(animationFrameId);
    saveSolve();
  }
}

function resetTimer() {
  stopTimer();
  timerDisplay.textContent = "00:00.00";
  scrambleDisplay.textContent = generateScramble();
}

function saveSolve() {
  const now = performance.now();
  const elapsed = now - startTime;
  const formatted = formatTime(elapsed);
  solveTimes.push(elapsed);

  const li = document.createElement("li");
  li.textContent = `${solveTimes.length}. ${formatted}`;
  timesList.appendChild(li);

  updateAverages();
  scrambleDisplay.textContent = generateScramble();
  plotGraph();
}

function updateAverages() {
  const ao5 = solveTimes.slice(-5);
  if (ao5.length === 5) {
    const avg = ao5.reduce((a, b) => a + b) / 5;
    ao5Display.textContent = `Ao5: ${formatTime(avg)}`;
  }

  const ao12 = solveTimes.slice(-12);
  if (ao12.length === 12) {
    const avg = ao12.reduce((a, b) => a + b) / 12;
    ao12Display.textContent = `Ao12: ${formatTime(avg)}`;
  }
}

function generateScramble(length = 20) {
  const moves = ["U", "D", "L", "R", "F", "B"];
  const modifiers = ["", "'", "2"];
  const axisGroups = {
    U: "UD",
    D: "UD",
    L: "LR",
    R: "LR",
    F: "FB",
    B: "FB",
  };

  let scramble = [];
  let prevAxis = "";

  while (scramble.length < length) {
    const move = moves[Math.floor(Math.random() * moves.length)];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    const fullMove = move + modifier;
    const axis = axisGroups[move];
    if (axis === prevAxis) continue;
    scramble.push(fullMove);
    prevAxis = axis;
  }
  return scramble.join(" ");
}

function plotGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.strokeStyle = "#00ffc8";
  const times = solveTimes.slice(-10);
  const step = canvas.width / (times.length - 1 || 1);
  const maxTime = Math.max(...times, 1);

  times.forEach((time, i) => {
    const x = i * step;
    const y = canvas.height - (time / maxTime) * canvas.height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function startCountdownAndTimer() {
  if (countdownRunning || running) return; // Prevent overlapping actions
  countdownRunning = true;
  countdown = 3;
  countdownText.textContent = countdown;
  countdownText.style.display = "block";

  countdownInterval = setInterval(() => {
    countdown--;
    countdownText.textContent = countdown;
    if (countdown === 0) {
      clearInterval(countdownInterval);
      countdownText.style.display = "none";
      countdownRunning = false;
      resetTimer();
      startTimer();
    }
  }, 1000);
}

// Touch-based controls
let isTouchActive = false;

document.addEventListener("touchstart", (e) => {
  e.preventDefault(); // Prevent default touch behavior

  if (!isTouchActive) {
    // Set a timeout for long press detection
    longPressTimeout = setTimeout(() => {
      isTouchActive = true;
      startCountdownAndTimer();
    }, 500); // 500ms delay for long press
  }
});

document.addEventListener("touchend", () => {
  clearTimeout(longPressTimeout); // Clear the timeout if the touch ends early

  if (isTouchActive) {
    // Quick tap to stop the timer
    stopTimer();
    isTouchActive = false;
  }
});

// Init scramble
scrambleDisplay.textContent = generateScramble();
