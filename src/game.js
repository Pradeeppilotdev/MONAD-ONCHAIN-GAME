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

function preload() {
    // Create simple colored rectangles instead of loading images
    const graphics = this.add.graphics();
    graphics.fillStyle(0x800080);
    graphics.fillRect(0, 0, 20, 20);
    graphics.generateTexture('molandak', 20, 20);
    
    graphics.clear();
    graphics.fillStyle(0xFFFF00);
    graphics.fillRect(0, 0, 10, 10);
    graphics.generateTexture('moyaki', 10, 10);
}

function create() {
    this.add.text(16, 16, 'Snake Game', { fontSize: '32px', fill: '#fff' });
}

function update() {
    // Empty for now
}
