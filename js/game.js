// Main Game Initialization
class FlappyBirdGame {
    constructor() {
        this.config = {
            ...PHASER_CONFIG,
            scene: [
                BootScene,
                MenuScene,
                GameScene,
                GameOverScene
            ]
        };
        
        // Initialize the game
        this.game = new Phaser.Game(this.config);
        
        // Add some debugging info to console
        console.log('Flappy Bird Game Initialized');
        console.log('Game Size:', CONFIG.GAME_WIDTH, 'x', CONFIG.GAME_HEIGHT);
        console.log('Starting with BootScene...');
    }
    
    // Method to get the current game instance
    getGame() {
        return this.game;
    }
    
    // Method to destroy the game (useful for restarting)
    destroy() {
        if (this.game) {
            this.game.destroy(true);
        }
    }
}

// Initialize the game when called (after all scripts are loaded)
function initializeFlappyBirdGame() {
    // Create the game instance
    window.flappyBirdGame = new FlappyBirdGame();
    console.log('🎮 Flappy Bird Game Instance Created!');
}

// Make initialization function available globally
window.initializeFlappyBirdGame = initializeFlappyBirdGame;

// Handle page visibility changes (pause when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (window.flappyBirdGame && window.flappyBirdGame.game) {
        const game = window.flappyBirdGame.game;
        
        if (document.hidden) {
            // Page is hidden, pause the game
            game.scene.pause('GameScene');
        } else {
            // Page is visible, resume the game
            game.scene.resume('GameScene');
        }
    }
});

// Add some global utility functions
window.FlappyBirdUtils = {
    // Reset high score (useful for testing)
    resetHighScore: () => {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            console.log('High score reset');
        } catch (e) {
            console.log('Error resetting high score:', e);
        }
    },
    
    // Get current high score
    getHighScore: () => {
        try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (data) {
                const gameData = JSON.parse(data);
                return gameData.highScore || 0;
            }
        } catch (e) {
            console.log('Error getting high score:', e);
        }
        return 0;
    },
    
    // Toggle debug mode
    toggleDebug: () => {
        if (window.flappyBirdGame && window.flappyBirdGame.game) {
            const gameScene = window.flappyBirdGame.game.scene.getScene('GameScene');
            if (gameScene && gameScene.physics) {
                gameScene.physics.world.drawDebug = !gameScene.physics.world.drawDebug;
                console.log('Debug mode:', gameScene.physics.world.drawDebug ? 'ON' : 'OFF');
            }
        }
    },
    
    // Toggle mute
    toggleMute: () => {
        if (window.flappyBirdGame && window.flappyBirdGame.game) {
            const registry = window.flappyBirdGame.game.registry;
            const soundManager = registry.get('soundManager');
            if (soundManager) {
                const isEnabled = soundManager.toggle();
                console.log('Sound:', isEnabled ? 'ON' : 'OFF');
                
                // Save mute state
                try {
                    localStorage.setItem('flappyBird_muted', !isEnabled);
                } catch (e) {
                    console.log('Could not save mute state:', e);
                }
                
                return isEnabled;
            }
        }
        return false;
    }
};

console.log('Available utilities:', Object.keys(window.FlappyBirdUtils)); 