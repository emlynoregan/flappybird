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
    PIPE_GAP: 240, // Increased to 240 for much easier gameplay
    PIPE_SPAWN_DISTANCE: 200,
    PIPE_WIDTH: 64,
    PIPE_HEIGHT: 400,
    
    // Bird settings
    BIRD_SIZE: 32,
    BIRD_START_X: 150,
    BIRD_START_Y: 300,
    
    // Game mechanics
    GROUND_HEIGHT: 80,
    
    // Difficulty scaling
    DIFFICULTY_SCALING: {
        ENABLED: true,
        SCORE_INTERVAL: 5, // Increase difficulty every 5 points
        MAX_DIFFICULTY: 10, // Cap at 10x difficulty multiplier
        
        // What increases with difficulty
        PIPE_SPEED_INCREASE: 20, // Add 20 units per difficulty level
        PIPE_GAP_DECREASE: 8, // Reduce gap by 8 pixels per difficulty level
        SPAWN_RATE_INCREASE: 0.1, // Increase spawn frequency by 10% per level
        
        // Minimums to prevent impossible gameplay
        MIN_PIPE_GAP: 120, // Never go below 120 pixels
        MAX_PIPE_SPEED: -400, // Never exceed 400 speed
        MIN_SPAWN_INTERVAL: 1200 // Never spawn faster than 1.2 seconds
    },
    
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
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: CONFIG.GAME_WIDTH,
        height: CONFIG.GAME_HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // We'll handle gravity manually on the bird
            debug: false // Set to true for debugging collision boxes
        }
    },
    scene: [] // Will be populated in game.js
}; 