const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

canvas.width = 500;
canvas.height = 500;

let birdY = canvas.height / 2;
let birdSpeed = 0;
const gravity = 0.6;
const lift = -10;
let obstacles = [];
let frameCount = 0;
let score = 0;
const obstacleWidth = 30;
const gap = 200;

let audioContext, analyser, microphone, dataArray;

// Initialize game after user clicks the button
startButton.addEventListener("click", async () => {
  startButton.style.display = "none";  
  await startVoiceDetection();  
  gameLoop();  
});

// Voice detection setup
async function startVoiceDetection() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  microphone = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  microphone.connect(analyser);
}

// Detect loud sound 
function detectShout() {
  analyser.getByteFrequencyData(dataArray);
  const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
  if (volume > 80) birdSpeed = lift; // Shouting makes the bird jump
}

// Bird sprite
const bird = new Image();
// bird.src = "file:///C:/Users/Dell/Desktop/birds.gif";
bird.src = " https://img.clipart-library.com/2/clip-flying-bird-gif/clip-flying-bird-gif-9.gif";

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Detect shout
  if (analyser) detectShout();

  // Draw bird
  ctx.drawImage(bird, 50, birdY, 80, 80);

   
  birdSpeed += gravity;
  birdY += birdSpeed;

  // Prevent bird from leaving the canvas
  if (birdY > canvas.height - 40) birdY = canvas.height - 40;
  if (birdY < 0) birdY = 0;

  // Handle obstacles
  if (frameCount % 120 === 0) {
    const topHeight = Math.random() * (canvas.height - gap);
    obstacles.push({
      x: canvas.width,
      top: topHeight,
      bottom: topHeight + gap,
    });
  }

  obstacles.forEach((obstacle, index) => {
    obstacle.x -= 2;

    // Draw obstacles
    ctx.fillStyle = "blue";
    ctx.fillRect(obstacle.x, 0, obstacleWidth, obstacle.top);
    ctx.fillRect(obstacle.x, obstacle.bottom, obstacleWidth, canvas.height - obstacle.bottom);

    // Collision detection
    if (
      50 + 40 > obstacle.x &&
      50 < obstacle.x + obstacleWidth &&
      (birdY < obstacle.top || birdY + 40 > obstacle.bottom)
    ) {
      alert(`Game Over! Your score: ${score}`);
      document.location.reload();
    }

     if (obstacle.x + obstacleWidth < 0) {
      obstacles.splice(index, 1);
      score++;
    }
  });

  
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);

  frameCount++;
  requestAnimationFrame(gameLoop);
}
