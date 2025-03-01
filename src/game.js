const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    }
};

const game = new Phaser.Game(config);

let snake, moyaki, cursors, score = 0, scoreText;

function preload() {
    this.load.image('molandak', 'https://via.placeholder.com/20/800080'); // Replace with Molandak sprite
    this.load.image('moyaki', 'https://via.placeholder.com/10/FFFF00');   // Replace with Moyaki sprite
}

function create() {
    snake = this.physics.add.group({
        key: 'molandak',
        setXY: { x: 400, y: 300 }
    });
    snake.setVelocityX(200);

    moyaki = this.physics.add.sprite(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 600),
        'moyaki'
    );
    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', fill: '#fff' });

    this.physics.add.overlap(snake, moyaki, eatMoyaki, null, this);
}

function update() {
    const head = snake.getFirst(true);

    if (cursors.left.isDown) head.setVelocity(-200, 0);
    else if (cursors.right.isDown) head.setVelocity(200, 0);
    else if (cursors.up.isDown) head.setVelocity(0, -200);
    else if (cursors.down.isDown) head.setVelocity(0, 200);

    // Wrap around screen edges
    if (head.x > 800) head.x = 0;
    if (head.x < 0) head.x = 800;
    if (head.y > 600) head.y = 0;
    if (head.y < 0) head.y = 600;

    // Check self-collision
    snake.getChildren().forEach((segment, i) => {
        if (i > 0 && Phaser.Math.Distance.Between(head.x, head.y, segment.x, segment.y) < 15) {
            endGame(this);
        }
    });
}

function eatMoyaki(snake, moyaki) {
    moyaki.setPosition(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600));
    score += 10;
    scoreText.setText('Score: ' + score);

    // Grow snake
    const last = snake.getLast(true);
    snake.create(last.x, last.y, 'molandak');

    // Call blockchain function
    recordMoyakiEaten(10);
}

function endGame(scene) {
    scene.physics.pause();
    updateHighScore(score);
    alert('Game Over! Score: ' + score);
    score = 0;
    scoreText.setText('Score: 0');
    snake.clear(true, true);
    snake.create(400, 300, 'molandak');
    scene.physics.resume();
} 