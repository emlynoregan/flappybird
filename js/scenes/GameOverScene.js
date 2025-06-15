class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }
    
    init(data) {
        // Receive data from GameScene
        this.finalScore = data.score || 0;
        this.isNewHighScore = data.isNewHighScore || false;
        this.highScore = data.highScore || 0;
    }
    
    create() {
        // Create background
        this.createBackground();
        
        // Create game over title
        this.createGameOverTitle();
        
        // Create score display
        this.createScoreDisplay();
        
        // Create action buttons
        this.createButtons();
        
        // Create mute button
        this.createMuteButton();
        
        // Setup input
        this.setupInput();
        
        // Add entrance animation
        this.createEntranceAnimation();
    }
    
    createBackground() {
        // Semi-transparent overlay
        this.overlay = this.add.graphics();
        this.overlay.fillStyle(0x000000, 0.7);
        this.overlay.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        this.overlay.setAlpha(0);
        
        // Fade in overlay
        this.tweens.add({
            targets: this.overlay,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
    }
    
    createGameOverTitle() {
        this.gameOverText = this.add.text(CONFIG.GAME_WIDTH / 2, 150, 'GAME OVER', {
            fontSize: '42px',
            fill: '#FF4444',
            fontFamily: 'Courier New',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 2,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Initial position off-screen
        this.gameOverText.y = -50;
    }
    
    createScoreDisplay() {
        // Score panel background
        const panelWidth = 300;
        const panelHeight = 140;
        const panelX = CONFIG.GAME_WIDTH / 2 - panelWidth / 2;
        const panelY = 200;
        
        this.scorePanel = this.add.graphics();
        this.scorePanel.fillStyle(0x000000, 0.8);
        this.scorePanel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
        this.scorePanel.lineStyle(3, 0xFFFFFF, 0.8);
        this.scorePanel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
        
        // Current score
        this.add.text(CONFIG.GAME_WIDTH / 2, panelY + 25, 'FINAL SCORE', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        this.scoreValue = this.add.text(CONFIG.GAME_WIDTH / 2, panelY + 50, this.finalScore.toString(), {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // High score display
        this.add.text(CONFIG.GAME_WIDTH / 2, panelY + 85, 'HIGH SCORE', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        const highScoreColor = this.isNewHighScore ? '#00FF00' : '#FFD700';
        this.highScoreValue = this.add.text(CONFIG.GAME_WIDTH / 2, panelY + 110, this.highScore.toString(), {
            fontSize: '24px',
            fill: highScoreColor,
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // New high score message
        if (this.isNewHighScore) {
            this.newHighScoreText = this.add.text(CONFIG.GAME_WIDTH / 2, panelY + 135, 'NEW HIGH SCORE!', {
                fontSize: '14px',
                fill: '#00FF00',
                fontFamily: 'Courier New',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Pulsing animation for new high score
            this.tweens.add({
                targets: [this.highScoreValue, this.newHighScoreText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Initially hide score panel
        this.scorePanel.setAlpha(0);
        this.scoreValue.setAlpha(0);
        this.highScoreValue.setAlpha(0);
        if (this.newHighScoreText) this.newHighScoreText.setAlpha(0);
    }
    
    createButtons() {
        const buttonWidth = 140;
        const buttonHeight = 45;
        const buttonSpacing = 20;
        const totalWidth = (buttonWidth * 2) + buttonSpacing;
        const startX = CONFIG.GAME_WIDTH / 2 - totalWidth / 2;
        const buttonY = 380;
        
        // Restart button
        this.createButton(startX, buttonY, buttonWidth, buttonHeight, 'RESTART', 0x32CD32, () => {
            this.restartGame();
        });
        
        // Menu button
        this.createButton(startX + buttonWidth + buttonSpacing, buttonY, buttonWidth, buttonHeight, 'MENU', 0x4169E1, () => {
            this.goToMenu();
        });
        
        // Instructions
        this.instructionText = this.add.text(CONFIG.GAME_WIDTH / 2, 450, 'Click buttons or press SPACE to restart, ESC for menu', {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        this.instructionText.setAlpha(0);
    }
    
    createMuteButton() {
        // Mute button in top-right corner
        const buttonSize = 35;
        const buttonX = CONFIG.GAME_WIDTH - buttonSize - 15;
        const buttonY = 15;
        
        // Get sound manager from registry
        const soundManager = this.registry.get('soundManager') || new SoundManager();
        this.registry.set('soundManager', soundManager);
        
        // Button background
        this.muteButton = this.add.graphics();
        this.updateMuteButtonGraphics(soundManager.isEnabled());
        
        // Button text (speaker icon)
        this.muteButtonText = this.add.text(buttonX + buttonSize / 2, buttonY + buttonSize / 2, '🔊', {
            fontSize: '18px',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Make button interactive
        const buttonBounds = new Phaser.Geom.Rectangle(buttonX, buttonY, buttonSize, buttonSize);
        this.muteButton.setInteractive(buttonBounds, Phaser.Geom.Rectangle.Contains);
        this.muteButtonText.setInteractive(buttonBounds, Phaser.Geom.Rectangle.Contains);
        
        // Button click handler
        const toggleMute = () => {
            const isEnabled = soundManager.toggle();
            this.updateMuteButtonGraphics(isEnabled);
            this.muteButtonText.setText(isEnabled ? '🔊' : '🔇');
            
            // Save mute state to localStorage
            try {
                localStorage.setItem('flappyBird_muted', !isEnabled);
            } catch (e) {
                console.log('Could not save mute state:', e);
            }
        };
        
        this.muteButton.on('pointerdown', toggleMute);
        this.muteButtonText.on('pointerdown', toggleMute);
        
        // Button hover effects
        this.muteButton.on('pointerover', () => {
            this.muteButton.setAlpha(0.8);
        });
        
        this.muteButton.on('pointerout', () => {
            this.muteButton.setAlpha(1);
        });
        
        // Load saved mute state
        try {
            const savedMuted = localStorage.getItem('flappyBird_muted');
            if (savedMuted === 'true') {
                soundManager.enabled = false;
                this.updateMuteButtonGraphics(false);
                this.muteButtonText.setText('🔇');
            }
        } catch (e) {
            console.log('Could not load mute state:', e);
        }
        
        // Initially hide mute button
        this.muteButton.setAlpha(0);
        this.muteButtonText.setAlpha(0);
    }
    
    updateMuteButtonGraphics(isEnabled) {
        const buttonSize = 35;
        const buttonX = CONFIG.GAME_WIDTH - buttonSize - 15;
        const buttonY = 15;
        
        this.muteButton.clear();
        
        if (isEnabled) {
            // Sound enabled - green button
            this.muteButton.fillStyle(0x32CD32, 0.8);
            this.muteButton.lineStyle(2, 0x228B22);
        } else {
            // Sound disabled - red button
            this.muteButton.fillStyle(0xFF4444, 0.8);
            this.muteButton.lineStyle(2, 0xCC2222);
        }
        
        this.muteButton.fillRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 8);
        this.muteButton.strokeRoundedRect(buttonX, buttonY, buttonSize, buttonSize, 8);
    }
    
    createButton(x, y, width, height, text, color, callback) {
        // Button background
        const button = this.add.graphics();
        button.fillStyle(color, 1);
        button.fillRoundedRect(x, y, width, height, 8);
        button.lineStyle(2, 0xFFFFFF, 0.8);
        button.strokeRoundedRect(x, y, width, height, 8);
        
        // Button text
        const buttonText = this.add.text(x + width / 2, y + height / 2, text, {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Make interactive
        const buttonBounds = new Phaser.Geom.Rectangle(x, y, width, height);
        button.setInteractive(buttonBounds, Phaser.Geom.Rectangle.Contains);
        buttonText.setInteractive(buttonBounds, Phaser.Geom.Rectangle.Contains);
        
        // Hover effects
        button.on('pointerover', () => {
            button.clear();
            button.fillStyle(Phaser.Display.Color.GetColor32(
                Math.min(255, Phaser.Display.Color.GetRed(color) + 30),
                Math.min(255, Phaser.Display.Color.GetGreen(color) + 30),
                Math.min(255, Phaser.Display.Color.GetBlue(color) + 30),
                255
            ), 1);
            button.fillRoundedRect(x, y, width, height, 8);
            button.lineStyle(2, 0xFFFFFF, 0.8);
            button.strokeRoundedRect(x, y, width, height, 8);
        });
        
        button.on('pointerout', () => {
            button.clear();
            button.fillStyle(color, 1);
            button.fillRoundedRect(x, y, width, height, 8);
            button.lineStyle(2, 0xFFFFFF, 0.8);
            button.strokeRoundedRect(x, y, width, height, 8);
        });
        
        button.on('pointerdown', callback);
        buttonText.on('pointerdown', callback);
        
        // Initially hide buttons
        button.setAlpha(0);
        buttonText.setAlpha(0);
        
        return { button, text: buttonText };
    }
    
    createEntranceAnimation() {
        // Animate game over text falling down
        this.tweens.add({
            targets: this.gameOverText,
            y: 150,
            duration: 800,
            ease: 'Bounce.easeOut',
            delay: 200
        });
        
        // Fade in score panel
        this.tweens.add({
            targets: [this.scorePanel, this.scoreValue, this.highScoreValue],
            alpha: 1,
            duration: 600,
            delay: 600
        });
        
        if (this.newHighScoreText) {
            this.tweens.add({
                targets: this.newHighScoreText,
                alpha: 1,
                duration: 600,
                delay: 800
            });
        }
        
        // Fade in buttons
        this.tweens.add({
            targets: this.children.list.filter(child => 
                child.type === 'Graphics' && child !== this.overlay && child !== this.scorePanel
            ),
            alpha: 1,
            duration: 400,
            delay: 1000
        });
        
        // Fade in button texts and instructions
        this.tweens.add({
            targets: this.children.list.filter(child => 
                child.type === 'Text' && child !== this.gameOverText && 
                child !== this.scoreValue && child !== this.highScoreValue && 
                child !== this.newHighScoreText && child !== this.muteButtonText
            ),
            alpha: 1,
            duration: 400,
            delay: 1000
        });
        
        // Fade in mute button separately
        this.tweens.add({
            targets: [this.muteButton, this.muteButtonText],
            alpha: 1,
            duration: 400,
            delay: 500
        });
    }
    
    setupInput() {
        // Keyboard shortcuts
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        this.spaceKey.on('down', () => {
            this.restartGame();
        });
        
        this.enterKey.on('down', () => {
            this.restartGame();
        });
        
        this.escKey.on('down', () => {
            this.goToMenu();
        });
    }
    
    restartGame() {
        // Fade out transition
        this.cameras.main.fadeOut(300, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }
    
    goToMenu() {
        // Fade out transition
        this.cameras.main.fadeOut(300, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
        });
    }
} 