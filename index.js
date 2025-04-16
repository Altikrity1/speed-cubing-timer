const timerDisplay = document.getElementById("timer");
const scrambleDisplay = document.getElementById("scramble");
const countdownTimer = document.getElementById("countdown-timer");
const startStopBtn = document.getElementById("start-stop");
const ao5Display = document.getElementById("ao5");
const ao12Display = document.getElementById("ao12");
const solvesList = document.getElementById("solves");
const graphCanvas = document.getElementById("graph");
const ctx = graphCanvas.getContext("2d");

let startTime = null;
let running = false;
let animationFrameId = null;
let solveTimes = [];
let countdown = 3;
let countdownInterval;

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
    startStopBtn.textContent = "Stop";
    startStopBtn.style.backgroundColor = "#ff3e3e";
  }
}

function stopTimer() {
  if (running) {
    running = false;
    cancelAnimationFrame(animationFrameId);
    startStopBtn.textContent = "Start";
    startStopBtn.style.backgroundColor = "#39ff14";
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
  solvesList.appendChild(li);

  updateAverages();
  scrambleDisplay.textContent = generateScramble();
  plotGraph();
}

function generateScramble(length = 20) {
  const moves = ["U", "D", "L", "R", "F", "B"];
  const modifiers = ["", "'", "2"];
  let scramble = [];
  let prevAxis = "";

  const axisGroups = {
    U: "UD",
    D: "UD",
    L: "LR",
    R: "LR",
    F: "FB",
    B: "FB",
  };

  while (scramble.length < length) {
    const move = moves[Math.floor(Math.random() * moves.length)];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    const fullMove = move + modifier;

    const currentAxis = axisGroups[move];
    if (currentAxis === prevAxis) continue;

    scramble.push(fullMove);
    prevAxis = currentAxis;
  }

  return scramble.join(" ");
}

function updateAverages() {
  const ao5 = solveTimes.slice(-5);
  if (ao5.length === 5) {
    const ao5Avg = ao5.reduce((acc, time) => acc + time, 0) / ao5.length;
    ao5Display.textContent = `Ao5: ${formatTime(ao5Avg)}`;
  }

  const ao12 = solveTimes.slice(-12);
  if (ao12.length === 12) {
    const ao12Avg = ao12.reduce((acc, time) => acc + time, 0) / ao12.length;
    ao12Display.textContent = `Ao12: ${formatTime(ao12Avg)}`;
  }
}

function plotGraph() {
  ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
  ctx.fillStyle = "#39ff14";
  ctx.beginPath();

  const width = graphCanvas.width;
  const height = graphCanvas.height;
  const times = solveTimes.slice(-10);

  const step = width / times.length;
  times.forEach((time, index) => {
    const x = index * step;
    const y = height - (time / Math.max(...times)) * height;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}

startStopBtn.addEventListener("click", () => {
  if (running) {
    stopTimer();
  } else {
    startTimer();
  }
});

// Start countdown before starting the timer
startStopBtn.addEventListener("click", () => {
  if (countdown === 3) {
    countdownTimer.classList.remove("hidden");
    countdownTimer.textContent = countdown;
    countdownInterval = setInterval(() => {
      countdown--;
      countdownTimer.textContent = countdown;
      if (countdown === 0) {
        clearInterval(countdownInterval);
        countdownTimer.classList.add("hidden");
        resetTimer();
        startTimer();
      }
    }, 1000);
  }
});
