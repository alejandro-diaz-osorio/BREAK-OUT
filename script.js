const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const scoreTag = document.getElementById("points");
const statusTag = document.getElementById("status");
const startButton = document.querySelector(".start");
const stopButton = document.querySelector(".stop");

const CANVAS_WIDTH = 550;
const CANVAS_HEIGHT = 620;
const BALL_RADIUS = 5;
const BALL_SPEED = 3;
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 80;
const PADDLE_SPEED = 8;
const BRICK_ROW_COUNT = 10;
const BRICK_COLUMN_COUNT = 17;
const BRICK_WIDTH = 25;
const BRICK_HEIGHT = 15;
const BRICK_PADDING = 2;
const BRICK_OFFSET_TOP = 80;
const BRICK_OFFSET_LEFT = 50;

const BRICK_STATUS = {
  ACTIVE: 0,
  DESTROYED: 1,
};

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let gameStatus = "ready";
let animationFrameId = null;
let score = 0;
let ballX;
let ballY;
let ballDirectionX;
let ballDirectionY;
let paddleX;
let paddleY;
let isRightPressed = false;
let isLeftPressed = false;
const bricks = [];

function makingRandomColors() {
  const colors = ["#6f9da2", "#a96588", "#c0a964", "#77749b"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function componentToHex(component) {
  const hex = component.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function createBricks() {
  bricks.length = 0;
  for (let column = 0; column < BRICK_COLUMN_COUNT; column += 1) {
    bricks[column] = [];
    for (let row = 0; row < BRICK_ROW_COUNT; row += 1) {
      bricks[column][row] = {
        x: column * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
        y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
        status: BRICK_STATUS.ACTIVE,
        color: makingRandomColors(),
      };
    }
  }
}

function resetGame() {
  score = 0;
  ballX = CANVAS_WIDTH / 2;
  ballY = CANVAS_HEIGHT - 30;
  ballDirectionX = BALL_SPEED;
  ballDirectionY = -BALL_SPEED;
  paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
  paddleY = CANVAS_HEIGHT - PADDLE_HEIGHT - 20;
  scoreTag.textContent = score;
  statusTag.textContent = "Pulsa START para jugar";
  createBricks();
  render();
}

function start() {
  if (gameStatus === "running") return;
  if (gameStatus === "won" || gameStatus === "lost") resetGame();
  gameStatus = "running";
  statusTag.textContent = "En juego";
  animationFrameId = window.requestAnimationFrame(draw);
}

function stop() {
  if (gameStatus !== "running") return;
  gameStatus = "paused";
  statusTag.textContent = "Pausa";
  window.cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
  render();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
  ctx.shadowColor = "#dfe8ed";
  ctx.shadowBlur = 6;
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.closePath();
}

function drawPaddle() {
  ctx.shadowColor = "#8ab9bd";
  ctx.shadowBlur = 7;
  ctx.fillStyle = "#8ab9bd";
  ctx.fillRect(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.shadowBlur = 0;
}

function drawBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.status === BRICK_STATUS.DESTROYED) return;
      ctx.shadowColor = brick.color;
      ctx.shadowBlur = 3;
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      ctx.shadowBlur = 0;
    });
  });
}

function collisionDetection() {
  for (const column of bricks) {
    for (const brick of column) {
      if (brick.status === BRICK_STATUS.DESTROYED) continue;

      const closestX = Math.max(brick.x, Math.min(ballX, brick.x + BRICK_WIDTH));
      const closestY = Math.max(brick.y, Math.min(ballY, brick.y + BRICK_HEIGHT));
      const distanceX = ballX - closestX;
      const distanceY = ballY - closestY;

      if (distanceX ** 2 + distanceY ** 2 <= BALL_RADIUS ** 2) {
        brick.status = BRICK_STATUS.DESTROYED;
        ballDirectionY = -ballDirectionY;
        score += 1;
        scoreTag.textContent = score;
        if (score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT) endGame("won");
        return;
      }
    }
  }
}

function ballMovement() {
  if (ballX + ballDirectionX > CANVAS_WIDTH - BALL_RADIUS || ballX + ballDirectionX < BALL_RADIUS) {
    ballDirectionX = -ballDirectionX;
  }
  if (ballY + ballDirectionY < BALL_RADIUS) ballDirectionY = -ballDirectionY;

  const hitsPaddle =
    ballX + BALL_RADIUS > paddleX &&
    ballX - BALL_RADIUS < paddleX + PADDLE_WIDTH &&
    ballY + BALL_RADIUS + ballDirectionY >= paddleY &&
    ballY < paddleY + PADDLE_HEIGHT;

  if (hitsPaddle && ballDirectionY > 0) {
    ballDirectionY = -ballDirectionY;
    const paddleCenter = paddleX + PADDLE_WIDTH / 2;
    ballDirectionX = ((ballX - paddleCenter) / (PADDLE_WIDTH / 2)) * BALL_SPEED;
  } else if (ballY + ballDirectionY > CANVAS_HEIGHT - BALL_RADIUS) {
    endGame("lost");
    return;
  }

  ballX += ballDirectionX;
  ballY += ballDirectionY;
}

function paddleMovement() {
  if (isRightPressed) paddleX = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddleX + PADDLE_SPEED);
  if (isLeftPressed) paddleX = Math.max(0, paddleX - PADDLE_SPEED);
}

function endGame(result) {
  gameStatus = result;
  statusTag.textContent = result === "won" ? "¡Has ganado!" : "GAME OVER";
  window.cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
  render();
}

function screenCleaner() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function render() {
  screenCleaner();
  drawBall();
  drawPaddle();
  drawBricks();
}

function draw() {
  if (gameStatus !== "running") return;
  collisionDetection();
  if (gameStatus !== "running") return;
  ballMovement();
  paddleMovement();
  render();
  animationFrameId = window.requestAnimationFrame(draw);
}

function setDirection(direction, isPressed) {
  if (direction === "left") isLeftPressed = isPressed;
  if (direction === "right") isRightPressed = isPressed;
}

function initEvents() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") event.preventDefault();
    if (event.key === "ArrowRight") setDirection("right", true);
    if (event.key === "ArrowLeft") setDirection("left", true);
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowRight") setDirection("right", false);
    if (event.key === "ArrowLeft") setDirection("left", false);
  });

  document.querySelector(".left").addEventListener("pointerdown", () => setDirection("left", true));
  document.querySelector(".right").addEventListener("pointerdown", () => setDirection("right", true));
  document.addEventListener("pointerup", () => {
    setDirection("left", false);
    setDirection("right", false);
  });
  startButton.addEventListener("click", start);
  stopButton.addEventListener("click", stop);
}

resetGame();
initEvents();
