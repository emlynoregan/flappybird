class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    preload() {
        // For now, we don't have any assets to load
        // This is where we'd load sprites, sounds, etc. in Phase 3
        
        // Add a simple loading text
        this.add.text(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2, 'Loading...', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
    }
    
    create() {
        // Start with the menu scene for Phase 2
        this.scene.start('MenuScene');
    }
} 