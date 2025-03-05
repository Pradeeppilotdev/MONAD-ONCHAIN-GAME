const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let snake, moyaki, cursors, score = 0, scoreText;
let snakeSegments = [];

function preload() {
    // Create simple colored rectangles instead of loading images
    const graphics = this.add.graphics();
    
    // Create purple square for snake
    graphics.fillStyle(0x800080);
    graphics.fillRect(0, 0, 20, 20);
    graphics.generateTexture('molandak', 20, 20);
    graphics.clear();
    
    // Create yellow square for moyaki
    graphics.fillStyle(0xFFFF00);
    graphics.fillRect(0, 0, 10, 10);
    graphics.generateTexture('moyaki', 10, 10);
    graphics.destroy();
}

function create() {
    // Initialize snake head
    snake = this.physics.add.sprite(400, 300, 'molandak');
    snake.setCollideWorldBounds(true);
    snakeSegments = [snake];

    // Initialize moyaki
    moyaki = this.physics.add.sprite(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(100, 500),
        'moyaki'
    );

    // Add score text
    scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '32px', 
        fill: '#fff' 
    });

    // Setup keyboard controls
    cursors = this.input.keyboard.createCursorKeys();

    // Add collision detection
    this.physics.add.overlap(snake, moyaki, eatMoyaki, null, this);
}

function update() {
    // Handle keyboard input
    if (cursors.left.isDown) {
        snake.setVelocity(-200, 0);
    }
    else if (cursors.right.isDown) {
        snake.setVelocity(200, 0);
    }
    else if (cursors.up.isDown) {
        snake.setVelocity(0, -200);
    }
    else if (cursors.down.isDown) {
        snake.setVelocity(0, 200);
    }

    // Wrap around screen edges
    if (snake.x > 800) snake.x = 0;
    if (snake.x < 0) snake.x = 800;
    if (snake.y > 600) snake.y = 0;
    if (snake.y < 0) snake.y = 600;

    // Update snake segments
    for (let i = snakeSegments.length - 1; i > 0; i--) {
        snakeSegments[i].x = snakeSegments[i - 1].x;
        snakeSegments[i].y = snakeSegments[i - 1].y;
    }
}

function eatMoyaki(snake, moyaki) {
    // Move moyaki to new random position
    moyaki.setPosition(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(100, 500)
    );

    // Update score
    score += 10;
    scoreText.setText('Score: ' + score);

    // Add new segment to snake
    const lastSegment = snakeSegments[snakeSegments.length - 1];
    const newSegment = this.physics.add.sprite(lastSegment.x, lastSegment.y, 'molandak');
    snakeSegments.push(newSegment);

    // Call blockchain function if it exists
    if (typeof recordMoyakiEaten === 'function') {
        recordMoyakiEaten(10);
    }
}