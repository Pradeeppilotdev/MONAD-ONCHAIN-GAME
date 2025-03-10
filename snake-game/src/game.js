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
let moveInterpolation = 1; // Tracks interpolation progress (0-1)
const MOVE_SPEED = 0.15; // Controls how fast the snake moves between grid positions

function preload() {
    this.load.image('molandak', 'snake-game/assets/molandak3.png');
    this.load.image('moyaki', 'snake-game/assets/moyaki3.png');
    this.load.image('chog', 'snake-game/assets/chog.png');  // Add new image
    this.load.image('gridbg', 'snake-game/assets/gridbg.png');
}

function create() {
    // Create a custom grey grid background
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x666666, 0.3); // Line width, grey color (0x666666), alpha 0.3
    
    // Draw vertical grid lines
    for (let x = 0; x <= config.width; x += GRID_SIZE) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, config.height);
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y <= config.height; y += GRID_SIZE) {
        graphics.moveTo(0, y);
        graphics.lineTo(config.width, y);
    }
    
    graphics.strokePath();
    
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

    // Smooth movement between grid positions
    if (moveInterpolation < 1) {
        moveInterpolation += MOVE_SPEED;
        
        // Apply smooth movement to all segments
        for (let i = 0; i < snakeSegments.length; i++) {
            const segment = snakeSegments[i];
            if (segment.targetX !== undefined && segment.targetY !== undefined) {
                segment.x = segment.startX + (segment.targetX - segment.startX) * moveInterpolation;
                segment.y = segment.startY + (segment.targetY - segment.startY) * moveInterpolation;
            }
        }
        
        // If we've reached the target position, complete the movement
        if (moveInterpolation >= 1) {
            moveInterpolation = 1;
            for (let i = 0; i < snakeSegments.length; i++) {
                const segment = snakeSegments[i];
                if (segment.targetX !== undefined) {
                    segment.x = segment.targetX;
                    segment.y = segment.targetY;
                }
            }
        }
    }

    // Move snake on grid when interpolation is complete
    if (time >= moveTime && moveInterpolation >= 1) {
        moveTime = time + MOVE_DELAY;
        moveInterpolation = 0; // Reset interpolation for next movement

        // Store previous positions
        let prevX = snake.x;
        let prevY = snake.y;
        
        // Set start positions for interpolation
        for (let i = 0; i < snakeSegments.length; i++) {
            snakeSegments[i].startX = snakeSegments[i].x;
            snakeSegments[i].startY = snakeSegments[i].y;
        }

        // Calculate target position for head
        snake.targetX = prevX + snake.direction.x * GRID_SIZE;
        snake.targetY = prevY + snake.direction.y * GRID_SIZE;

        // Calculate target positions for body segments
        for (let i = 1; i < snakeSegments.length; i++) {
            const tempX = snakeSegments[i].x;
            const tempY = snakeSegments[i].y;
            snakeSegments[i].targetX = prevX;
            snakeSegments[i].targetY = prevY;
            prevX = tempX;
            prevY = tempY;
        }

        // Check wall collision using target position
        if (snake.targetX < 0 || snake.targetX > 800 || snake.targetY < 0 || snake.targetY > 600) {
            endGame(this);
            return;
        }

        // Check self collision using target position
        for (let i = 1; i < snakeSegments.length; i++) {
            if (snake.targetX === snakeSegments[i].targetX && snake.targetY === snakeSegments[i].targetY) {
                endGame(this);
                return;
            }
        }

        // Check food collision using target position
        if (Math.abs(snake.targetX - moyaki.x) < GRID_SIZE && Math.abs(snake.targetY - moyaki.y) < GRID_SIZE) {
            // Add new segment
            const lastSegment = snakeSegments[snakeSegments.length - 1];
            const newSegment = this.add.sprite(lastSegment.x, lastSegment.y, 'molandak');
            newSegment.setScale(0.25);
            // Set initial properties for the new segment
            newSegment.startX = lastSegment.x;
            newSegment.startY = lastSegment.y;
            newSegment.targetX = lastSegment.x;
            newSegment.targetY = lastSegment.y;
            snakeSegments.push(newSegment);

            // Move food to new grid position
            moyaki.x = Phaser.Math.Between(2, 38) * GRID_SIZE;
            moyaki.y = Phaser.Math.Between(2, 28) * GRID_SIZE;

            // Update score and handle special food
            if (score % 100 === 90 && moyaki.texture.key !== 'chog') {
                // Change to chog at next multiple of 100 (current + 10)
                moyaki.setTexture('chog');
                score += 10;
            } else if (moyaki.texture.key === 'chog') {
                // Special reward for catching chog
                score += 20;
                moyaki.setTexture('moyaki');
            } else {
                // Normal score increase
                score += 10;
            }
            
            scoreText.setText('Score: ' + score);
        }
    }
}

function togglePause(scene) {
    // Only allow toggling if wallet is connected and game is not over
    if (!walletConnected || gameOver) return;
    
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

    // Reset positions and movement variables
    snake.x = 400;
    snake.y = 300;
    snake.startX = 400;
    snake.startY = 300;
    snake.targetX = 400;
    snake.targetY = 300;
    snake.direction = { x: 1, y: 0 };
    moyaki.x = 200;
    moyaki.y = 200;
    moveTime = 0;
    moveInterpolation = 1; // Start with completed interpolation

    if (gameOverText) {
        gameOverText.destroy();
        gameOverText = null;
    }

    // Show start message
    pauseText.setText('Press SPACE to Start');
    pauseText.setVisible(true);

    // Ensure moyaki resets to normal texture
    moyaki.setTexture('moyaki');
}

// Function to be called from blockchain.js when wallet is connected
function setWalletConnected() {
    walletConnected = true;
    pauseText.setText('Press SPACE to Start');
}

// Expose the function globally
window.setWalletConnected = setWalletConnected;
