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
// Initially loads the canvas
window.onload = function () {
    canvas = document.getElementById("canvas")
    canvas.height = rows * spaceSize
    canvas.width = columns * spaceSize
    context = canvas.getContext("2d")
    foodSpawn()
    document.addEventListener("keydown", changeDir)
    setInterval(gameUpdate, 1000 / 15)
}
function gameUpdate() {
    // Stops the game when the snake runs into itself or the wall AND resets the game
    if (gameOver) {
        return
    }
    // Changes the background color AND lets the snake move freely
    context.fillStyle = "grey";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Spawns the apple
    context.fillStyle = "red";
    context.fillRect(foodX, foodY, spaceSize, spaceSize);
    // Check if the snake eats the apple
    if (playerX == foodX && playerY == foodY) {
        playerBody.push([foodX, foodY])
        foodSpawn()
    }
    // When the snake eats the apple, it adds a new segment to the snake
    for (let i = playerBody.length - 1; i >= 0; i--) {
        playerBody[i] = playerBody[i - 1]
    }
    // Allows the snake to grow when it eats the apple
    if (playerBody.length) {
        playerBody[0] = [playerX, playerY]
    }
    // Creates the snake AND allows it to move
    context.fillStyle = "blue";
    playerX += speedX * spaceSize
    playerY += speedY * spaceSize
    // Lets the snake appear on the canvas
    context.fillRect(playerX, playerY, spaceSize, spaceSize)
    for (let i = 0; i < playerBody.length; i++) {
        context.fillRect(playerBody[i][0], playerBody[i][1], spaceSize, spaceSize)
    }
    // Makes sure the canvas loads properly with all the properties-->
    // Makes sure the snake doesn't run into the walls        
    if (playerX < 0 || playerX >= rows * spaceSize || playerY < 0 || playerY >= columns * spaceSize) {
        gameOver = true
        alert("Game Over")
    }
    // Makes sure the snake doesn't run into itself
    for (let i = 0; i < playerBody.length; i++) {
        if (playerX == playerBody[i][0] && playerY == playerBody[i][1]) {
            gameOver = true
            alert("Game Over")
        }
    }
    check1 = 1
}
// Loads the canvas and allows the player to move the snake
function changeDir(e) {
    if ((e.code == 'ArrowUp' || e.code == 'KeyW') && speedY != 1 && check1 == 1) {
        speedX = 0
        speedY = -1
        check1 = 0
    }
    if ((e.code == 'ArrowDown' || e.code == 'KeyS') && speedY != -1 && check1 == 1) {
        speedX = 0
        speedY = 1
        check1 = 0
    }
    if ((e.code == 'ArrowLeft' || e.code == 'KeyA') && speedX != 1 && check1 == 1) {
        speedX = -1
        speedY = 0
        check1 = 0
    }
    if ((e.code == 'ArrowRight' || e.code == 'KeyD') && speedX != -1 && check1 == 1) {
        speedX = 1
        speedY = 0
        check1 = 0
    }
}
// Lets the apple spawn randomly AND loads the canvas
function foodSpawn() {
    foodX = Math.floor(Math.random() * rows) * spaceSize
    foodY = Math.floor(Math.random() * columns) * spaceSize
}

