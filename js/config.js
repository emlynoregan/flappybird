// Game Configuration
const CONFIG = {
    // Screen dimensions
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,
    
    // Physics settings
    GRAVITY: 600,
    FLAP_POWER: -350,
    
    // Pipe settings
    PIPE_SPEED: -200,
    PIPE_GAP: 120,
    PIPE_SPAWN_DISTANCE: 200,
    PIPE_WIDTH: 64,
    PIPE_HEIGHT: 400,
    
    // Bird settings
    BIRD_SIZE: 24,
    BIRD_START_X: 150,
    BIRD_START_Y: 300,
    
    // Game mechanics
    GROUND_HEIGHT: 80,
    DIFFICULTY_INCREASE_RATE: 0, // For future expansion
    
    // Colors (for geometric shapes before we add sprites)
    COLORS: {
        BACKGROUND: 0x87CEEB,
        BIRD: 0xFFD700,
        PIPE: 0x32CD32,
        GROUND: 0x8B4513,
        SCORE: 0xFFFFFF
    },
    
    // Score settings
    SCORE_X: 50,
    SCORE_Y: 50,
    HIGH_SCORE_X: 650,
    HIGH_SCORE_Y: 50,
    
    // Storage key for localStorage
    STORAGE_KEY: 'flappyBird'
};

// Phaser Game Configuration
const PHASER_CONFIG = {
    type: Phaser.AUTO,
    width: CONFIG.GAME_WIDTH,
    height: CONFIG.GAME_HEIGHT,
    parent: 'game-canvas',
    backgroundColor: CONFIG.COLORS.BACKGROUND,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // We'll handle gravity manually on the bird
            debug: false // Set to true for debugging collision boxes
        }
    },
    scene: [] // Will be populated in game.js
}; 