// Global variables
let snake, moyaki, cursors, score = 0, scoreText;
let snakeSegments = [];
let lastDirection = 'right';
let gameOver = false;
let gameOverText;
let isPaused = true;
let walletConnected = false;

// Grid settings
const GRID_SIZE = 20;
let moveTime = 0;
const MOVE_DELAY = 100;
let moveInterpolation = 1;
const MOVE_SPEED = 0.15;

// Add audio variables at the top
let backgroundMusic;
let eatSound;
let chogSound;

// Add these constants at the top with other global variables
const BASE_SCALE = 0.25;
const MIN_SCALE = 0.08;
const SCALE_THRESHOLD = 500; // Points at which scaling starts
const SCALE_FACTOR = 0.03; // How much to reduce scale per threshold
const BASE_MOVE_DELAY = 100;    // Starting speed (higher = slower)
const MIN_MOVE_DELAY = 40;      // Maximum speed (lower = faster)
const SPEED_THRESHOLD = 200;    // Points at which speed increases
const SPEED_INCREASE = 5;       // How many milliseconds faster per threshold

function preload() {
    this.load.image('molandak', 'snake-game/assets/molandak3.png');
    this.load.image('moyaki', 'snake-game/assets/moyaki3.png');
    this.load.image('chog', 'snake-game/assets/chog.png');

    // Load audio files
    this.load.audio('bgMusic', 'snake-game/assets/background-music.mp3');
    this.load.audio('eat', 'snake-game/assets/eat.mp3');
    this.load.audio('chog-eat', 'snake-game/assets/chog-eat.mp3');
}

function create() {
    // Create a custom grey grid background
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x666666, 0.3);
    
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
    
    // Initialize snake head with direction
    snake = this.add.sprite(400, 300, 'molandak');
    snake.setScale(0.25);
    snake.direction = { x: 1, y: 0 }; // Set initial direction
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

    // Add pause/start text
    pauseText = this.add.text(400, 300, 'Connect Wallet to Play', {
        fontSize: '48px',
        fill: '#fff',
        align: 'center'
    }).setOrigin(0.5);

    // Initialize audio with rate modification
    backgroundMusic = this.sound.add('bgMusic', {
        volume: 0.45,
        loop: true
    });

    eatSound = this.sound.add('eat', {
        volume: 1.5,
        rate: 1.95  // 2x speed
    });

    chogSound = this.sound.add('chog-eat', {
        volume: 3.5,
        rate: 1.25 // 2x speed
    });

    // Start background music when game starts
    this.input.keyboard.on('keydown-SPACE', function() {
        if (walletConnected) {
            togglePause(this.scene);
            if (!isPaused && !backgroundMusic.isPlaying) {
                backgroundMusic.play();
            }
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

function togglePause(scene) {
    // Only allow toggling if wallet is connected and game is not over
    if (!walletConnected || gameOver) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        // Show pause text
        pauseText.setText('PAUSED\nPress SPACE to Resume');
        pauseText.setVisible(true);
        // Pause the music
        if (backgroundMusic.isPlaying) {
            backgroundMusic.pause();
        }
    } else {
        // Hide pause text when game is running
        pauseText.setVisible(false);
        // Resume the music
        if (!backgroundMusic.isPlaying) {
            backgroundMusic.resume();
        }
    }
}

function update(time) {
    // Store scene context
    const scene = this;

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

    // Calculate current move delay based on score
    const currentMoveDelay = calculateMoveDelay(score);

    // Move snake on grid when interpolation is complete
    if (time >= moveTime && moveInterpolation >= 1) {
        moveTime = time + currentMoveDelay;  // Use the calculated delay
        moveInterpolation = 0;

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
            endGame(scene);
            return;
        }

        // Check self collision using target position
        for (let i = 1; i < snakeSegments.length; i++) {
            if (snake.targetX === snakeSegments[i].targetX && snake.targetY === snakeSegments[i].targetY) {
                endGame(scene);
                return;
            }
        }

        // Check food collision using target position
        if (Math.abs(snake.targetX - moyaki.x) < GRID_SIZE && Math.abs(snake.targetY - moyaki.y) < GRID_SIZE) {
            // Add new segment
            const lastSegment = snakeSegments[snakeSegments.length - 1];
            const newSegment = scene.add.sprite(lastSegment.x, lastSegment.y, 'molandak');
            
            // Calculate new scale based on current score
            const currentScale = calculateScale(score);
            newSegment.setScale(currentScale);
            
            // Update scale of all existing segments and food
            snakeSegments.forEach(segment => segment.setScale(currentScale));
            moyaki.setScale(currentScale);
            
            newSegment.startX = lastSegment.x;
            newSegment.startY = lastSegment.y;
            newSegment.targetX = lastSegment.x;
            newSegment.targetY = lastSegment.y;
            snakeSegments.push(newSegment);

            // Move food to new grid position
            moyaki.x = Phaser.Math.Between(2, 38) * GRID_SIZE;
            moyaki.y = Phaser.Math.Between(2, 28) * GRID_SIZE;

            // Update score and handle special food
            if (moyaki.texture.key === 'chog') {
                chogSound.play();
                score += 20;
                moyaki.setTexture('moyaki');
            } else {
                eatSound.play();
                score += 10;
                // Check if next food should be chog (at score multiples of 50)
                if (score % 100 === 0) {
                    moyaki.setTexture('chog');
                }
            }
            
            scoreText.setText('Score: ' + score);
        }
    }
}

// All your other functions (togglePause, endGame, restartGame, etc.)...

// AFTER all functions are defined, then create the config and initialize the game
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

// Instead, initialize after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    window.game = new Phaser.Game(config);
});

// Update the endGame function
function endGame(scene) {
    gameOver = true;
    isPaused = true;

    if (backgroundMusic.isPlaying) {
        backgroundMusic.stop();
    }

    if (gameOverText) {
        gameOverText.destroy();
    }
    gameOverText = scene.add.text(400, 300, 'Game Over!\nClick to submit score', {
        fontSize: '48px',
        fill: '#fff',
        align: 'center'
    }).setOrigin(0.5);

    if (pauseText) {
        pauseText.setVisible(false);
    }

    scene.input.once('pointerdown', async () => {
        if (!window.ethereum || !window.ethereum.selectedAddress) {
            gameOverText.setText('Wallet not connected!\nPlease connect wallet');
            return;
        }

        if (!window.contract) {
            gameOverText.setText('Contract not initialized!\nPlease refresh page');
            return;
        }

        if (score > 0) {
            try {
                gameOverText.setText('Submitting score...').setFontSize(32);
                
                const tx = await window.contract.submitScore(score);
                gameOverText.setText('Waiting confirmation...').setFontSize(32);
                
                // Wait for transaction confirmation
                await tx.wait();
                
                // Show success message briefly before restart
                gameOverText.setText('Score submitted!\nRestarting...').setFontSize(32);
                
                // Update leaderboard and restart after a short delay
                if (typeof updateLeaderboard === 'function') {
                    updateLeaderboard();
                }
                
                // Short delay to show the success message
                setTimeout(() => {
                    restartGame(scene);
                }, 800);
                
            } catch (error) {
                console.error('Error submitting score:', error);
                gameOverText.setText('Error submitting score!\nClick to try again').setFontSize(32);
                scene.input.once('pointerdown', () => endGame(scene));
            }
        } else {
            restartGame(scene);
        }
    });
}

// Update the restartGame function
function restartGame(scene) {
    // Reset game state
    gameOver = false;
    isPaused = true;
    score = 0;
    lastDirection = 'right';
    moveTime = 0;
    moveInterpolation = 1;

    // Update score display
    scoreText.setText('Score: 0');

    // Clear snake segments
    for (let i = 1; i < snakeSegments.length; i++) {
        snakeSegments[i].destroy();
    }
    snakeSegments = [snake];

    // Reset snake position
    snake.x = 400;
    snake.y = 300;
    snake.startX = 400;
    snake.startY = 300;
    snake.targetX = 400;
    snake.targetY = 300;
    snake.direction = { x: 1, y: 0 };

    // Reset food position
    moyaki.x = 200;
    moyaki.y = 200;
    moyaki.setTexture('moyaki');

    // Clear game over text
    if (gameOverText) {
        gameOverText.destroy();
        gameOverText = null;
    }

    // Show start message
    pauseText.setText('Press SPACE to Start');
    pauseText.setVisible(true);

    // Stop any playing music
    if (backgroundMusic.isPlaying) {
        backgroundMusic.stop();
    }

    // Make sure the game is ready for new input
    scene.input.keyboard.enabled = true;

    // Reset all scales to base scale
    snakeSegments.forEach(segment => segment.setScale(BASE_SCALE));
    moyaki.setScale(BASE_SCALE);
}

// Make sure restartGame is available globally
window.restartGame = restartGame;

// Update the setWalletConnected function
async function setWalletConnected() {
    walletConnected = true;
    if (pauseText) {
        pauseText.setText('Press SPACE to Start');
    }
    
    console.log('Wallet connected, checking contract setup...');
    console.log('CONTRACT_ADDRESS:', window.CONTRACT_ADDRESS);
    console.log('CONTRACT_ABI:', window.CONTRACT_ABI);
    
    try {
        if (!window.ethereum) {
            throw new Error('Ethereum object not found');
        }
        if (!window.CONTRACT_ADDRESS) {
            throw new Error('Contract address not defined');
        }
        if (!window.CONTRACT_ABI) {
            throw new Error('Contract ABI not defined');
        }
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        window.contract = new ethers.Contract(
            window.CONTRACT_ADDRESS,
            window.CONTRACT_ABI,
            signer
        );
        console.log('Contract initialized successfully:', window.contract);
    } catch (error) {
        console.error('Error initializing contract:', error);
    }
}

// Add this function to check wallet connection status
function checkWalletConnection() {
    if (window.ethereum && window.ethereum.selectedAddress) {
        setWalletConnected();
    }
}

// Add this somewhere in your main JavaScript file
window.CONTRACT_ADDRESS = '0x1489C0807144E10cE4cD3BEafA8Bed0077292A5E';
window.CONTRACT_ABI = [
    // Your contract ABI array here
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "score",
                "type": "uint256"
            }
        ],
        "name": "submitScore",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ... other contract functions
];

// Add this function to calculate current scale based on score
function calculateScale(currentScore) {
    if (currentScore < SCALE_THRESHOLD) return BASE_SCALE;
    
    const reduction = Math.floor(currentScore / SCALE_THRESHOLD) * SCALE_FACTOR;
    const newScale = BASE_SCALE - reduction;
    return Math.max(newScale, MIN_SCALE); // Don't go smaller than MIN_SCALE
}

// Add this function to calculate move delay based on score
function calculateMoveDelay(currentScore) {
    if (currentScore < SPEED_THRESHOLD) return BASE_MOVE_DELAY;
    
    const reduction = Math.floor(currentScore / SPEED_THRESHOLD) * SPEED_INCREASE;
    return Math.max(BASE_MOVE_DELAY - reduction, MIN_MOVE_DELAY);
}

