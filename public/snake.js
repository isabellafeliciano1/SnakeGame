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
let addOnX
let addOnY
let gameOver = false
let scored = false
let scaling = false
let points = 0
let xhttps = new XMLHttpRequest()
let gameInterval;  // So we can control when the game starts
let gameStarted = false;
let difficultyScreen = document.createElement("div");
difficultyScreen.id = "difficultyScreen";
difficultyScreen.innerHTML = `
    <h1>Select Difficulty</h1>
    <button onclick="startGame(5), scaling = true">Progression Mode</button>
    <button onclick="startGame(1)">Very Easy</button>
    <button onclick="startGame(10)">Easy</button>
    <button onclick="startGame(15)">Normal</button>
    <button onclick="startGame(25)">Extreme</button>
`;

document.body.appendChild(difficultyScreen);

let bombs = []; // Bomb positions
let bombCount = 4;
let bombImage = new Image();
bombImage.src = "img/add-ons/bomb.png"
let explosionImage = new Image();
explosionImage.src = "img/explosion.png"
let isExploding = false;
let explosionFrame = 0;
let explosionX = 0;
let explosionY = 0;
const EXPLOSION_FRAME_WIDTH = 755; // Width of each frame in the sprite sheet
const EXPLOSION_FRAME_HEIGHT = 1065; // Height of each frame in the sprite sheet
const EXPLOSION_FRAMES_PER_ROW = 5; // Number of frames in each row of the sprite sheet
let explosionInterval = null;
let explosionSound = new Audio('audio/explosion.mp3');

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
    "img/fruits/dragonFruit.png",
    "img/fruits/starFruit.png",
    "img/fruits/avacado.png",
    "img/fruits/pineapple.png",
    "img/fruits/coconut.png",
    "img/fruits/papaya.png",
    "img/fruits/lychee.png",
    "img/fruits/mango.png",
    "img/fruits/pomegranate.png",
    "img/fruits/strawberry.png",
    "img/fruits/blueberry.png",
]

const addOn = new Image()
const addOns = [
    'img/add-ons/bronzeCoin.png',
    'img/add-ons/silverCoin.png',
    'img/add-ons/goldCoin.png',
    'img/add-ons/dollarBill.png',
    'img/add-ons/moneyBag.png',
    'img/add-ons/pigBank.png',
    'img/add-ons/diamond.png',
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
    if (!scaling) {
        spawnBombs()
    }
    foodSpawn()
    document.addEventListener("keydown", keyboardInput)
}

function highScore() {
    xhttps.open('POST', '/highScore', true);
    xhttps.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttps.send(`score=${points}`);
    scored = true
}

function startGame(speed) {
    if (gameStarted) return;
    gameStarted = true;
    difficultyScreen.remove();
    gameInterval = setInterval(gameUpdate, 1000 / speed);
}

// Stops stuff from spawning in other things
function isValidPosition(x, y, checkFood = false) {
    // Check player position
    if (x === playerX && y === playerY) return false;

    // Check snake body
    for (let segment of playerBody) {
        if (x === segment[0] && y === segment[1]) return false;
    }

    // Check bombs only if not in scaling mode
    if (!scaling) {
        for (let bomb of bombs) {
            if (x === bomb[0] && y === bomb[1]) return false;
        }
    }

    // Check food if needed
    if (checkFood && x === foodX && y === foodY) return false;

    return true;
}

// Function to spawn bombs
function spawnBombs() {
    if (scaling) { return }
    bombs = [];
    for (let i = 0; i < bombCount; i++) {
        let bombX, bombY;
        let validPosition = false;

        while (!validPosition) {
            bombX = Math.floor(Math.random() * rows) * spaceSize;
            bombY = Math.floor(Math.random() * columns) * spaceSize;
            validPosition = isValidPosition(bombX, bombY);
        }

        bombs.push([bombX, bombY]);
    }
}

// Function to handle player death
function death() {
    if (!isExploding) {
        isExploding = true;
        explosionX = playerX;
        explosionY = playerY;
        explosionFrame = 0;

        explosionSound.currentTime = 0;
        explosionSound.play();

        // Stop the game loop
        clearInterval(gameInterval);

        // Start explosion animation
        explosionInterval = setInterval(() => {
            explosionFrame++;
            // Redraw the game state for each frame
            context.drawImage(map, 0, 0, canvas.width, canvas.height);
            context.drawImage(fruit, foodX, foodY, spaceSize, spaceSize);
            context.drawImage(addOn, addOnX, addOnY, spaceSize, spaceSize);
            context.drawImage(snakeHead, playerX, playerY, spaceSize, spaceSize);
            for (let i = 0; i < playerBody.length; i++) {
                if (i == playerBody.length - 1) {
                    context.drawImage(snakeTail, playerBody[i][0], playerBody[i][1], spaceSize, spaceSize)
                } else {
                    context.drawImage(snakeBody, playerBody[i][0], playerBody[i][1], spaceSize, spaceSize)
                }
            }
            // Draw the current explosion frame
            const sourceX = (explosionFrame % EXPLOSION_FRAMES_PER_ROW) * EXPLOSION_FRAME_WIDTH;
            const sourceY = Math.floor(explosionFrame / EXPLOSION_FRAMES_PER_ROW) * EXPLOSION_FRAME_HEIGHT;
            context.drawImage(
                explosionImage,
                sourceX, sourceY,
                EXPLOSION_FRAME_WIDTH, EXPLOSION_FRAME_HEIGHT,
                explosionX - spaceSize / 2, explosionY - spaceSize / 2,
                spaceSize * 2, spaceSize * 2
            );
            if (explosionFrame >= 17) {
                clearInterval(explosionInterval);
                gameOver = true;
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = "white";
                context.font = "50px Arial";
                context.fillText("Score: " + points, canvas.width / 2 - 200, canvas.height / 2);
            }
        }, 50); // Faster animation (20fps)
    }
}

function gameUpdate() {
    if (gameOver) {
        if (!scored) highScore();
        return;
    }

    // Changes the background color AND lets the snake move freely
    context.drawImage(map, 0, 0, canvas.width, canvas.height);

    // Draw bombs only if not in scaling mode
    if (!scaling) {
        for (let bomb of bombs) {
            context.drawImage(bombImage, bomb[0], bomb[1], spaceSize, spaceSize);
        }
    }

    // Spawns the fruit
    context.drawImage(fruit, foodX, foodY, spaceSize, spaceSize);

    // Spawns the add-on
    context.drawImage(addOn, addOnX, addOnY, spaceSize, spaceSize);

    // Check if the snake eats the fruit
    if (playerX == foodX && playerY == foodY) {
        playerBody.push([foodX, foodY]); // Add a new segment to the snake
        foodSpawn();
        points++;
        if (scaling) {
            clearInterval(gameInterval);
            const newSpeed = Math.max(5, 5 + Math.floor(points * 0.2));
            gameInterval = setInterval(gameUpdate, 1000 / newSpeed);
        }
    }

    if (playerX == addOnX && playerY == addOnY) {
        addOnX = -200
        addOnY = -200
        money += 5
    }

    let nextX = playerX + speedX * spaceSize;
    let nextY = playerY + speedY * spaceSize;
    //walls
    if (nextX < 0 || nextX >= rows * spaceSize || nextY < 0 || nextY >= columns * spaceSize) {
        death();
        return;
    }
    //self
    for (let i = 0; i < playerBody.length; i++) {
        if (nextX == playerBody[i][0] && nextY == playerBody[i][1]) {
            death();
            return;
        }
    }
    //bombs
    if (!scaling) {
        for (let bomb of bombs) {
            if (nextX === bomb[0] && nextY === bomb[1]) {
                death();
                return;
            }
        }
    }

    // Update the snake's body segments
    for (let i = playerBody.length - 1; i > 0; i--) {
        playerBody[i] = playerBody[i - 1]; // Shift each segment to the position of the previous one
    }

    // Update the head of the snake
    if (playerBody.length) {
        playerBody[0] = [playerX, playerY];
    }

    // Update player position
    playerX = nextX;
    playerY = nextY;

    // Lets the snake appear on the canvas
    context.drawImage(snakeHead, playerX, playerY, spaceSize, spaceSize);

    // Loop through the list of body parts and draw each one
    for (let i = 0; i < playerBody.length; i++) {
        //if this is the last body part, draw the tail
        if (i == playerBody.length - 1) {
            //if the previous body part is above this one, draw the downward tail image, let the tail face the last body part
            context.drawImage(snakeTail, playerBody[i][0], playerBody[i][1], spaceSize, spaceSize)
            //else if the previous part is to the right... etc.. etc...
        } else {
            //else draw a body part
            context.drawImage(snakeBody, playerBody[i][0], playerBody[i][1], spaceSize, spaceSize)
        }
    }

    check1 = 1
}

// Loads the canvas and allows the player to move the snake
function keyboardInput(e) {
    console.log(e)
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
    requestAnimationFrame(controllerInput);
})

// Lets the fruit spawn randomly AND loads the canvas
function foodSpawn() {
    let validPosition = false;
    while (!validPosition) {
        foodX = Math.floor(Math.random() * rows) * spaceSize;
        foodY = Math.floor(Math.random() * columns) * spaceSize;
        validPosition = isValidPosition(foodX, foodY);
    }

    //Spawns fruit randomly 
    rand = Math.floor(Math.random() * fruits.length);
    var fruity = fruits[rand]
    fruit.src = fruity

    addChance = Math.floor(Math.random() * 10) // 0-9
    // % chance to spawn an add-on
    if (addChance > 7) {
        validPosition = false;
        while (!validPosition) {
            addOnX = Math.floor(Math.random() * rows) * spaceSize;
            addOnY = Math.floor(Math.random() * columns) * spaceSize;
            validPosition = isValidPosition(addOnX, addOnY, true);
        }

        //Spawns add-on randomly 
        rand = Math.floor(Math.random() * addOns.length);
        var boost = addOns[rand]
        addOn.src = boost
    }
}
