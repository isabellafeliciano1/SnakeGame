// All the variables needed for the game
let spaceSize = 32
let rows = 20
let columns = 20
let canvas
let context
let playerX = spaceSize * 5
let playerY = spaceSize * 5
let speedX = 0;  //speed of snake in x coordinate.
let speedY = 0;  //speed of snake in Y coordinate.
let playerBody = []
let foodX
let foodY
let gameOver = false
let score = 0

// Load the snake head
const snakeHead = new Image();
snakeHead.src = "img/originalsnake/ForwardSnakeHead.png"

// Load the snake body
const snakeBody = new Image();
snakeBody.src = "img/originalsnake/BodySnake.png";

// Load the snake tail 
const snakeTail = new Image();
const snakeTails = {
    "up": "img/originalsnake/ForwardSnakeTail.png",
    "down": "img/originalsnake/BackSnakeTail.png",
    "left": "img/originalsnake/LeftSnakeTail.png",
    "right": "img/originalsnake/RightSnakeTail.png"
}

const fruit = new Image()
const fruits = [
    "img/fruits/banana.png",
    "img/fruits/cherry.png",
    "img/fruits/grape.png",
    "img/fruits/lemon.png",
    "img/fruits/orange.png",
    "img/fruits/peach.png",
    "img/fruits/apple.png",
    "img/fruits/watermelon.png",
]

// Load the background
const map = new Image()
map.src = "img/GameMap.png"

// Initially loads the canvas
window.onload = function () {
    canvas = document.getElementById("canvas")
    canvas.height = rows * spaceSize
    canvas.width = columns * spaceSize
    context = canvas.getContext("2d")
    foodSpawn()
    document.addEventListener("keydown", keyboardInput)
    setInterval(gameUpdate, 1000 / 15)
}

// Stops the game when the snake runs into itself or the wall AND resets the game
function gameUpdate() {
    if (gameOver) {
        return
    }

    // Changes the background color AND lets the snake move freely
    context.drawImage(map, 0, 0, canvas.width, canvas.height)

    // Spawns the fruit
    context.drawImage(fruit, foodX, foodY, spaceSize, spaceSize);

    // Check if the snake eats the fruit
    if (playerX == foodX && playerY == foodY) {
        playerBody.push([foodX, foodY])
        foodSpawn()
        score = playerBody.length
    }

    // When the snake eats the fruit, it adds a new segment to the snake
    for (let i = playerBody.length - 1; i >= 0; i--) {
        playerBody[i] = playerBody[i - 1];
    }

    // Allows the snake to grow when it eats the fruit
    if (playerBody.length) {
        playerBody[0] = [playerX, playerY];
    }

    // Creates the snake AND allows it to move
    playerX += speedX * spaceSize;
    playerY += speedY * spaceSize;

    // Lets the snake appear on the canvas
    context.drawImage(snakeHead, playerX, playerY, spaceSize, spaceSize)

    // Loop through the list of body parts and draw each one
    for (let i = 0; i < playerBody.length; i++) {
        //if this is the last body part, draw the tail
        if (i == playerBody.length - 1) {
            //if the previous body part is above this one, draw the downward tail image
            context.drawImage(snakeTail, playerBody[i][0], playerBody[i][1], spaceSize, spaceSize)
            //else if the previous part is to the right... etc.. etc...
        } else {
            //else draw a body part
            context.drawImage(snakeBody, playerBody[i][0], playerBody[i][1], spaceSize, spaceSize)

        }
    }

    // Makes sure the canvas loads properly with all the properties -->
    // Makes sure the snake doesn't run into the walls        
    if (playerX < 0 || playerX >= rows * spaceSize || playerY < 0 || playerY >= columns * spaceSize) {
        gameOver = true
        context.fillRect( 0, 0, canvas.width, canvas.height)
        context.fillStyle = "white"
        context.font = "50px Arial"
        context.fillText("Score: " + score, canvas.width / 2 - 150, canvas.height /
            2)
    }

    // Makes sure the snake doesn't run into itself -->
    for (let i = 0; i < playerBody.length; i++) {
        if (playerX == playerBody[i][0] && playerY == playerBody[i][1]) {
            gameOver = true
            context.fillRect( 0, 0, canvas.width, canvas.height)
            context.fillStyle = "white"
            context.font = "50px Arial"
            context.fillText("Score: " + score, canvas.width / 2 - 150, canvas.height /
                2)
    
        }
    }
    check1 = 1
}



// Loads the canvas and allows the player to move the snake
function keyboardInput(e) {
    if ((e.code == 'ArrowUp' || e.code == 'KeyW') && speedY !== 1 && check1 === 1) {
        moveSnake(0, -1, "img/originalsnake/BackSnakeHead.png", "img/originalsnake/BackSnakeTail.png");
    }
    if ((e.code == 'ArrowDown' || e.code == 'KeyS') && speedY !== -1 && check1 === 1) {
        moveSnake(0, 1, "img/originalsnake/ForwardSnakeHead.png", "img/originalsnake/ForwardSnakeTail.png");
    }
    if ((e.code == 'ArrowLeft' || e.code == 'KeyA') && speedX !== 1 && check1 === 1) {
        moveSnake(-1, 0, "img/originalsnake/LeftSnakeHead.png", "img/originalsnake/LeftSnakeTail.png");
    }
    if ((e.code == 'ArrowRight' || e.code == 'KeyD') && speedX !== -1 && check1 === 1) {
        moveSnake(1, 0, "img/originalsnake/RightSnakeHead.png", "img/originalsnake/RightSnakeTail.png");
    }
}

function moveSnake(x, y, headImg, tailImg) {
    speedX = x;
    speedY = y;
    check1 = 0;
    snakeHead.src = headImg;
    snakeTail.src = tailImg;
}

function controllerInput() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    const gp = gamepads[0]; // Get the first connected gamepad
    if (!gp) return;

    // D-pad buttons
    let up = gp.buttons[12].pressed;
    let down = gp.buttons[13].pressed;
    let left = gp.buttons[14].pressed;
    let right = gp.buttons[15].pressed;
    const startButton = gp.buttons[9];

    if (startButton.pressed) {
        location.reload()
    }

    // Joysticks
    let axisX = gp.axes[0]; // Left Right
    let axisY = gp.axes[1]; // Up Down
    const threshold = 0.5; // Deadzone

    if ((up || axisY < -threshold) && speedY !== 1 && check1 === 1) {
        moveSnake(0, -1, "img/originalsnake/BackSnakeHead.png", "img/originalsnake/BackSnakeTail.png");
    }
    if ((down || axisY > threshold) && speedY !== -1 && check1 === 1) {
        moveSnake(0, 1, "img/originalsnake/ForwardSnakeHead.png", "img/originalsnake/ForwardSnakeTail.png");
    }
    if ((left || axisX < -threshold) && speedX !== 1 && check1 === 1) {
        moveSnake(-1, 0, "img/originalsnake/LeftSnakeHead.png", "img/originalsnake/LeftSnakeTail.png");
    }
    if ((right || axisX > threshold) && speedX !== -1 && check1 === 1) {
        moveSnake(1, 0, "img/originalsnake/RightSnakeHead.png", "img/originalsnake/RightSnakeTail.png");
    }

    requestAnimationFrame(controllerInput);
}

window.addEventListener("gamepadconnected", () => {
    console.log("My wrist no longer hurts, kinda awkward to use though. Probably just because I'm not used to it.");
    requestAnimationFrame(controllerInput);
})

// Lets the fruit spawn randomly AND loads the canvas
function foodSpawn() {
    foodX = Math.floor(Math.random() * rows) * spaceSize
    foodY = Math.floor(Math.random() * columns) * spaceSize
    //Spawns fruit randomly || Incomplete
    rand = Math.floor(Math.random() * 8);
    var fruity = fruits[rand]
    fruit.src = fruity
}