class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        // Create background
        this.createBackground();
        
        // Create title
        this.createTitle();
        
        // Create high score display
        this.createHighScoreDisplay();
        
        // Create play button
        this.createPlayButton();
        
        // Create mute button
        this.createMuteButton();
        
        // Create instructions
        this.createInstructions();
        
        // Setup input
        this.setupInput();
        
        // Add some visual flair
        this.createFloatingElements();
        
        // Signal that the menu is ready - hide loading overlay
        console.log('🎯 MenuScene created, hiding loading overlay...');
        if (window.hideLoadingOverlay) {
            setTimeout(() => {
                window.hideLoadingOverlay();
                console.log('✅ Loading overlay hidden!');
            }, 300);
        } else {
            console.warn('⚠️ hideLoadingOverlay function not available');
        }
    }
    
    createBackground() {
        // Create a gradient background effect
        this.backgroundGraphics = this.add.graphics();
        
        // Sky gradient
        this.backgroundGraphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98D8E8, 0x98D8E8, 1);
        this.backgroundGraphics.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT - CONFIG.GROUND_HEIGHT);
        
        // Ground
        this.backgroundGraphics.fillStyle(CONFIG.COLORS.GROUND);
        this.backgroundGraphics.fillRect(0, CONFIG.GAME_HEIGHT - CONFIG.GROUND_HEIGHT, CONFIG.GAME_WIDTH, CONFIG.GROUND_HEIGHT);
        
        // Add some decorative clouds
        this.createClouds();
    }
    
    createClouds() {
        // Simple cloud shapes for decoration
        const cloudColor = 0xFFFFFF;
        const cloudAlpha = 0.8;
        
        for (let i = 0; i < 3; i++) {
            const cloud = this.add.graphics();
            cloud.fillStyle(cloudColor, cloudAlpha);
            
            const x = Phaser.Math.Between(100, CONFIG.GAME_WIDTH - 100);
            const y = Phaser.Math.Between(50, 200);
            
            // Draw simple cloud shape
            cloud.fillCircle(x, y, 30);
            cloud.fillCircle(x + 25, y, 35);
            cloud.fillCircle(x + 50, y, 30);
            cloud.fillCircle(x + 25, y - 20, 25);
            
            // Add gentle floating animation
            this.tweens.add({
                targets: cloud,
                x: x + 20,
                duration: 4000 + i * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    createTitle() {
        // Main title
        this.titleText = this.add.text(CONFIG.GAME_WIDTH / 2, 120, 'FLAPPY BIRD', {
            fontSize: '48px',
            fill: '#FFD700',
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
        
        // Add subtle bounce animation
        this.tweens.add({
            targets: this.titleText,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Subtitle
        this.subtitleText = this.add.text(CONFIG.GAME_WIDTH / 2, 170, 'Web Edition', {
            fontSize: '18px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }
    
    createHighScoreDisplay() {
        const highScore = this.getHighScore();
        
        // High score background
        const bgWidth = 200;
        const bgHeight = 60;
        const bgX = CONFIG.GAME_WIDTH / 2 - bgWidth / 2;
        const bgY = 220;
        
        this.highScoreBg = this.add.graphics();
        this.highScoreBg.fillStyle(0x000000, 0.3);
        this.highScoreBg.fillRoundedRect(bgX, bgY, bgWidth, bgHeight, 10);
        this.highScoreBg.lineStyle(2, 0xFFFFFF, 0.5);
        this.highScoreBg.strokeRoundedRect(bgX, bgY, bgWidth, bgHeight, 10);
        
        // High score text
        this.highScoreLabel = this.add.text(CONFIG.GAME_WIDTH / 2, bgY + 15, 'HIGH SCORE', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        this.highScoreValue = this.add.text(CONFIG.GAME_WIDTH / 2, bgY + 35, highScore.toString(), {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
    
    createPlayButton() {
        // Play button background
        const buttonWidth = 160;
        const buttonHeight = 50;
        const buttonX = CONFIG.GAME_WIDTH / 2 - buttonWidth / 2;
        const buttonY = 320;
        
        this.playButton = this.add.graphics();
        this.playButton.fillStyle(0x32CD32, 1);
        this.playButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
        this.playButton.lineStyle(3, 0x228B22);
        this.playButton.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
        
        // Play button text
        this.playButtonText = this.add.text(CONFIG.GAME_WIDTH / 2, buttonY + buttonHeight / 2, 'PLAY', {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Make button interactive
        const buttonBounds = new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight);
        this.playButton.setInteractive(buttonBounds, Phaser.Geom.Rectangle.Contains);
        this.playButtonText.setInteractive(buttonBounds, Phaser.Geom.Rectangle.Contains);
        
        // Button hover effects
        this.playButton.on('pointerover', () => {
            this.playButton.clear();
            this.playButton.fillStyle(0x3EE83E, 1);
            this.playButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
            this.playButton.lineStyle(3, 0x228B22);
            this.playButton.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
        });
        
        this.playButton.on('pointerout', () => {
            this.playButton.clear();
            this.playButton.fillStyle(0x32CD32, 1);
            this.playButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
            this.playButton.lineStyle(3, 0x228B22);
            this.playButton.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
        });
        
        this.playButton.on('pointerdown', () => {
            this.startGame();
        });
        
        this.playButtonText.on('pointerdown', () => {
            this.startGame();
        });
    }
    
    createMuteButton() {
        // Mute button in top-right corner
        const buttonSize = 40;
        const buttonX = CONFIG.GAME_WIDTH - buttonSize - 20;
        const buttonY = 20;
        
        // Get sound manager instance
        const soundManager = this.registry.get('soundManager') || new SoundManager();
        this.registry.set('soundManager', soundManager);
        
        // Button background
        this.muteButton = this.add.graphics();
        this.updateMuteButtonGraphics(soundManager.isEnabled());
        
        // Button text (speaker icon)
        this.muteButtonText = this.add.text(buttonX + buttonSize / 2, buttonY + buttonSize / 2, '🔊', {
            fontSize: '20px',
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
    }
    
    updateMuteButtonGraphics(isEnabled) {
        const buttonSize = 40;
        const buttonX = CONFIG.GAME_WIDTH - buttonSize - 20;
        const buttonY = 20;
        
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
    
    createInstructions() {
        const instructions = [
            'Click, Tap, or Press SPACE to flap',
            'Navigate through the pipes to score',
            'Avoid hitting pipes, ground, or ceiling'
        ];
        
        let yOffset = 420;
        instructions.forEach(instruction => {
            this.add.text(CONFIG.GAME_WIDTH / 2, yOffset, instruction, {
                fontSize: '14px',
                fill: '#FFFFFF',
                fontFamily: 'Courier New',
                align: 'center'
            }).setOrigin(0.5);
            yOffset += 25;
        });
    }
    
    createFloatingElements() {
        // Create a decorative bird that looks like the game bird
        this.decorativeBird = this.add.graphics();
        this.drawDecorativeBird();
        this.decorativeBird.x = 100;
        this.decorativeBird.y = 250;
        
        // Floating animation
        this.tweens.add({
            targets: this.decorativeBird,
            y: 280,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.tweens.add({
            targets: this.decorativeBird,
            rotation: 0.2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Wing flapping animation
        this.time.addEvent({
            delay: 300,
            callback: () => {
                this.decorativeBird.clear();
                this.drawDecorativeBird(true); // Flap wings
            },
            loop: true
        });
        
        this.time.addEvent({
            delay: 150,
            callback: () => {
                this.decorativeBird.clear();
                this.drawDecorativeBird(false); // Normal wings
            },
            loop: true
        });
    }
    
    drawDecorativeBird(flapping = false) {
        const size = 16; // Half the size of the game bird for decoration
        
        // Bird body (oval shape)
        this.decorativeBird.fillStyle(CONFIG.COLORS.BIRD); // Golden yellow
        this.decorativeBird.fillEllipse(0, 0, size * 1.5, size);
        
        // Bird beak
        this.decorativeBird.fillStyle(0xFF8C00); // Orange beak
        this.decorativeBird.beginPath();
        this.decorativeBird.moveTo(size * 0.75, -2);
        this.decorativeBird.lineTo(size * 1.2, 0);
        this.decorativeBird.lineTo(size * 0.75, 2);
        this.decorativeBird.closePath();
        this.decorativeBird.fillPath();
        
        // Bird eye
        this.decorativeBird.fillStyle(0x000000); // Black eye
        this.decorativeBird.fillCircle(size * 0.3, -size * 0.2, size * 0.15);
        
        // Eye highlight
        this.decorativeBird.fillStyle(0xFFFFFF); // White highlight
        this.decorativeBird.fillCircle(size * 0.35, -size * 0.25, size * 0.08);
        
        // Wing
        this.decorativeBird.fillStyle(0xDAA520); // Darker gold for wing
        if (flapping) {
            // Wing up position
            this.decorativeBird.fillEllipse(-size * 0.3, -size * 0.6, size * 0.8, size * 0.4);
        } else {
            // Wing down position
            this.decorativeBird.fillEllipse(-size * 0.3, size * 0.1, size * 0.8, size * 0.4);
        }
        
        // Wing outline
        this.decorativeBird.lineStyle(1, 0xB8860B);
        if (flapping) {
            this.decorativeBird.strokeEllipse(-size * 0.3, -size * 0.6, size * 0.8, size * 0.4);
        } else {
            this.decorativeBird.strokeEllipse(-size * 0.3, size * 0.1, size * 0.8, size * 0.4);
        }
        
        // Body outline
        this.decorativeBird.lineStyle(2, 0xB8860B);
        this.decorativeBird.strokeEllipse(0, 0, size * 1.5, size);
    }
    
    setupInput() {
        // Keyboard input
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        this.spaceKey.on('down', () => {
            this.startGame();
        });
        
        this.enterKey.on('down', () => {
            this.startGame();
        });
        
        // Click anywhere to start (except button area which has its own handler)
        this.input.on('pointerdown', (pointer) => {
            // Check if click is not on the play button
            const buttonArea = new Phaser.Geom.Rectangle(
                CONFIG.GAME_WIDTH / 2 - 80, 
                320, 
                160, 
                50
            );
            if (!buttonArea.contains(pointer.x, pointer.y)) {
                this.startGame();
            }
        });
    }
    
    startGame() {
        // Add transition effect
        this.cameras.main.fadeOut(300, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }
    
    getHighScore() {
        try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (data) {
                const gameData = JSON.parse(data);
                return gameData.highScore || 0;
            }
        } catch (e) {
            console.log('Error loading high score:', e);
        }
        return 0;
    }
} 