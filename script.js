const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let scoretag = document.getElementById("points");

/* SETTING CANVAS */
canvas.width = 550;
canvas.height = 620;

/*STARTER VARIABLES*/
let gameStatus = false;
let counter = 0;

/* START AND STOP THE GAME FUNCTIONS */
function start() {
  gameStatus = true;
  draw();
}
function stop() {
  gameStatus = false;
}

/* BALL VARIABLES*/
const BALL_RADIUS = 5;

let ballX = canvas.width / 2; //Position in X
let ballY = canvas.height - 30; //Position in Y

const BALL_SPEED = 3;
let ballDirectionX = BALL_SPEED; //Speed in X
let ballDirectionY = -BALL_SPEED; //Speed in Y

/* PADDLE VARIABLES*/
const paddleHeight = 10;
const paddleWidth = 80;

const PADDLE_SPEED = 8;

let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - paddleHeight - 20;

/* FLAGS FOR KEY PRESSING VERIFICATION */
let isRightPressed = false;
let isLeftPressed = false;

/* BRICKS VARIABLES*/
const brickRowCount = 10;
const brickColumnCount = 17;
const brickWidth = 25;
const brickHeight = 15;
const brickPadding = 2;
const brickOffsetTop = 80;
const brickOffsetLeft = 50;
const bricks = [];

const BRICK_STATUS = {
  DRESTROY: 1,
  ACTIVE: 0,
};
//RANDOM COLORS
function makingRandomColors() {
  let range = 256 / 16;

  let r = Math.floor(Math.random() * 16) * range;
  let g = Math.floor(Math.random() * 16) * range;
  let b = Math.floor(Math.random() * 16) * range;

  let colorHex =
    "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

  return colorHex;
}

function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

//Creating Bricks
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;

    //Saving bricks information
    bricks[c][r] = {
      x: brickX,
      y: brickY,
      status: BRICK_STATUS.ACTIVE,
      color: makingRandomColors(),
    };
  }
}

/* DRAWING FUNCTIONS */

/* Drawing ball */
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "#F00";
  ctx.fill();
  ctx.closePath();
}

/* Drawing paddle */
function drawPaddle() {
  ctx.fillStyle = "#000";
  ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}

/* Drawing bricks */
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DRESTROY) continue;

      ctx.beginPath();
      ctx.fillStyle = currentBrick.color;
      ctx.rect(currentBrick.x, currentBrick.y, brickWidth, brickHeight);
      ctx.fill();
      ctx.closePath();
    }
  }
}

/* Detection & Movement Functions */

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status == BRICK_STATUS.DRESTROY) continue;

      const isBallSameXAsBrick =
        ballX > currentBrick.x && ballX < currentBrick.x + brickWidth;

      const isBallTouchingBrick =
        ballY > currentBrick.y && ballY < currentBrick.y + brickHeight;

      if (isBallSameXAsBrick && isBallTouchingBrick) {
        ballDirectionY = -ballDirectionY;
        currentBrick.status = BRICK_STATUS.DRESTROY;
        counter += 1;
        scoretag.innerHTML = counter;
      }
    }
  }
}

function ballMovement() {
  if (
    ballX + ballDirectionX > canvas.width - BALL_RADIUS ||
    ballX + ballDirectionX < BALL_RADIUS
  ) {
    ballDirectionX = -ballDirectionX;
  }

  if (ballY + ballDirectionY < BALL_RADIUS) {
    ballDirectionY = -ballDirectionY;
  }

  //GAME OVER Condition | Cuando la pelota toca el suelo

  const isBallSameXAsPaddle = ballX > paddleX && ballX < paddleX + paddleWidth;
  const isBallTouchingPaddle = ballY + ballDirectionY > paddleY;

  if (isBallSameXAsPaddle && isBallTouchingPaddle) {
    ballDirectionY = -ballDirectionY;
  } else if (ballY + ballDirectionY > canvas.height - BALL_RADIUS) {
    scoretag.innerHTML = "GAME OVER";
    document.location.reload();
  }
  //Ball Movement
  ballX += ballDirectionX;
  ballY += ballDirectionY;
  /* console.log("Posición en X:", ballX, "\nPosición en Y: ",ballY) */
}

function paddleMovement() {
  if (isRightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += PADDLE_SPEED;
  } else if (isLeftPressed && paddleX > 0) {
    paddleX -= PADDLE_SPEED;
  }
}

/* Funcion para inicializar eventos */
function initEvents() {
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  function keyDownHandler(event) {
    const { key } = event;
    if (key == "ArrowRight") {
      isRightPressed = true;
    } else if (key == "ArrowLeft") {
      isLeftPressed = true;
    }
  }

  function keyUpHandler(event) {
    const { key } = event;
    if (key == "ArrowRight") {
      isRightPressed = false;
    } else if (key == "ArrowLeft") {
      isLeftPressed = false;
    }
  }
}

/* FUNCIÓN PARA LIMPIAR */
function screenCleaner() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  screenCleaner();
  /* Funciones de dibujo */
  drawBall();
  drawPaddle();
  drawBricks();

  /* Comprobadores de colisiones y Movimiento */
  collisionDetection();
  ballMovement();
  paddleMovement();

  if (gameStatus == true) {
    window.requestAnimationFrame(draw);
  }
}
draw();
initEvents();
