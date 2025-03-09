const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'game',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let snake, moyaki, cursors, score = 0, scoreText;
let snakeSegments = [];
let lastDirection = 'right';
let gameOver = false;
let gameOverText;
let isPaused = true; // Game starts paused
let pauseText;
let walletConnected = false; // Track wallet connection status

// Grid settings
const GRID_SIZE = 20;
let moveTime = 0;
const MOVE_DELAY = 100; // Controls snake speed

function preload() {
    this.load.image('molandak', './assets/molandak.png');
    this.load.image('moyaki', './assets/moyaki.png');
}

function create() {
    // Initialize snake head
    snake = this.add.sprite(400, 300, 'molandak');
    snake.setScale(0.25);
    snakeSegments = [snake];

    // Initialize food
    moyaki = this.add.sprite(200, 200, 'moyaki');
    moyaki.setScale(0.25);

    // Add score text
    scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '32px', 
        fill: '#fff' 
    });

    // Setup keyboard controls
    cursors = this.input.keyboard.createCursorKeys();

    // Initialize direction
    snake.direction = { x: 1, y: 0 };

    // Add pause/start text
    pauseText = this.add.text(400, 300, 'Connect Wallet to Play', {
        fontSize: '48px',
        fill: '#fff',
        align: 'center'
    }).setOrigin(0.5);

    // Add space key for pause/resume
    this.input.keyboard.on('keydown-SPACE', function() {
        // Only allow toggling pause if wallet is connected
        if (walletConnected) {
            togglePause(this);
        } else {
            pauseText.setText('Connect Wallet to Play');
        }
    }, this);

    // Listen for wallet connection event
    window.addEventListener('walletConnected', function() {
        walletConnected = true;
        pauseText.setText('Press SPACE to Start');
    });
}

function update(time) {
    // Don't update if game is over, paused, or wallet not connected
    if (gameOver || isPaused || !walletConnected) return;

    // Handle keyboard input
    if (cursors.left.isDown && lastDirection !== 'right') {
        snake.direction = { x: -1, y: 0 };
        lastDirection = 'left';
    }
    else if (cursors.right.isDown && lastDirection !== 'left') {
        snake.direction = { x: 1, y: 0 };
        lastDirection = 'right';
    }
    else if (cursors.up.isDown && lastDirection !== 'down') {
        snake.direction = { x: 0, y: -1 };
        lastDirection = 'up';
    }
    else if (cursors.down.isDown && lastDirection !== 'up') {
        snake.direction = { x: 0, y: 1 };
        lastDirection = 'down';
    }

    // Move snake on grid
    if (time >= moveTime) {
        moveTime = time + MOVE_DELAY;

        // Store previous positions
        let prevX = snake.x;
        let prevY = snake.y;

        // Move head
        snake.x += snake.direction.x * GRID_SIZE;
        snake.y += snake.direction.y * GRID_SIZE;

        // Move body segments
        for (let i = 1; i < snakeSegments.length; i++) {
            const tempX = snakeSegments[i].x;
            const tempY = snakeSegments[i].y;
            snakeSegments[i].x = prevX;
            snakeSegments[i].y = prevY;
            prevX = tempX;
            prevY = tempY;
        }

        // Check wall collision
        if (snake.x < 0 || snake.x > 800 || snake.y < 0 || snake.y > 600) {
            endGame(this);
            return;
        }

        // Check self collision
        for (let i = 1; i < snakeSegments.length; i++) {
            if (snake.x === snakeSegments[i].x && snake.y === snakeSegments[i].y) {
                endGame(this);
                return;
            }
        }

        // Check food collision
        if (Math.abs(snake.x - moyaki.x) < GRID_SIZE && Math.abs(snake.y - moyaki.y) < GRID_SIZE) {
            // Add new segment
            const lastSegment = snakeSegments[snakeSegments.length - 1];
            const newSegment = this.add.sprite(lastSegment.x, lastSegment.y, 'molandak');
            newSegment.setScale(0.25);
            snakeSegments.push(newSegment);

            // Move food to new grid position
            moyaki.x = Phaser.Math.Between(2, 38) * GRID_SIZE;
            moyaki.y = Phaser.Math.Between(2, 28) * GRID_SIZE;

            // Update score
            score += 10;
            scoreText.setText('Score: ' + score);
        }
    }
}

function togglePause(scene) {
    // Only allow toggling if wallet is connected
    if (!walletConnected) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        // Show pause text
        pauseText.setText('PAUSED\nPress SPACE to Resume');
        pauseText.setVisible(true);
    } else {
        // Hide pause text
        pauseText.setVisible(false);
    }
}

function endGame(scene) {
    gameOver = true;
    isPaused = true;

    // Show game over message
    if (gameOverText) {
        gameOverText.destroy();
    }
    gameOverText = scene.add.text(400, 300, 'Game Over!\nClick to submit score', {
        fontSize: '64px',
        fill: '#fff',
        align: 'center'
    }).setOrigin(0.5);

    // Hide pause text if visible
    if (pauseText) {
        pauseText.setVisible(false);
    }

    // Add click handler to submit score and restart
    scene.input.once('pointerdown', () => {
        // Update blockchain score if available
        if (typeof updateHighScore === 'function') {
            updateHighScore(score).then(() => {
                if (typeof displayScoreHistory === 'function') {
                    displayScoreHistory();
                }
                restartGame(scene);
            }).catch(error => {
                console.error("Error updating score:", error);
                restartGame(scene);
            });
        } else {
            restartGame(scene);
        }
    });
}

function restartGame(scene) {
    gameOver = false;
    isPaused = true; // Start paused
    score = 0;
    lastDirection = 'right';
    scoreText.setText('Score: 0');

    // Clear snake segments
    for (let i = 1; i < snakeSegments.length; i++) {
        snakeSegments[i].destroy();
    }
    snakeSegments = [snake];

    // Reset positions
    snake.x = 400;
    snake.y = 300;
    snake.direction = { x: 1, y: 0 };
    moyaki.x = 200;
    moyaki.y = 200;
    moveTime = 0;

    if (gameOverText) {
        gameOverText.destroy();
        gameOverText = null;
    }

    // Show start message
    pauseText.setText('Press SPACE to Start');
    pauseText.setVisible(true);
}

// Function to be called from blockchain.js when wallet is connected
function setWalletConnected() {
    walletConnected = true;
    pauseText.setText('Press SPACE to Start');
}

// Expose the function globally
window.setWalletConnected = setWalletConnected;
