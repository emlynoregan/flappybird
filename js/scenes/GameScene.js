class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    create() {
        // Game state
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        
        // Add fade in transition
        this.cameras.main.fadeIn(300, 0, 0, 0);
        
        // Create ground
        this.createGround();
        
        // Create bird
        this.bird = new Bird(this, CONFIG.BIRD_START_X, CONFIG.BIRD_START_Y);
        
        // Create pipe group
        this.pipeGroup = new PipeGroup(this);
        this.pipeTimer = 0;
        this.nextPipeDistance = CONFIG.PIPE_SPAWN_DISTANCE;
        
        // Create UI
        this.createUI();
        
        // Input handling
        this.setupInput();
        
        // Start instructions
        this.showStartInstructions();
    }
    
    createGround() {
        // Create ground graphics
        this.ground = this.add.graphics();
        this.ground.fillStyle(CONFIG.COLORS.GROUND);
        this.ground.fillRect(0, CONFIG.GAME_HEIGHT - CONFIG.GROUND_HEIGHT, CONFIG.GAME_WIDTH, CONFIG.GROUND_HEIGHT);
        
        // Create an invisible rectangle for ground collision
        this.groundCollider = this.add.rectangle(
            CONFIG.GAME_WIDTH / 2, 
            CONFIG.GAME_HEIGHT - CONFIG.GROUND_HEIGHT / 2, 
            CONFIG.GAME_WIDTH, 
            CONFIG.GROUND_HEIGHT
        );
        this.groundCollider.setVisible(false);
        
        // Add physics body for ground collision
        this.physics.add.existing(this.groundCollider);
        this.groundCollider.body.setImmovable(true);
    }
    
    createUI() {
        // Score text
        this.scoreText = this.add.text(CONFIG.SCORE_X, CONFIG.SCORE_Y, 'Score: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        });
        
        // High score text
        const highScore = this.getHighScore();
        this.highScoreText = this.add.text(CONFIG.HIGH_SCORE_X, CONFIG.HIGH_SCORE_Y, `High: ${highScore}`, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        });
    }
    
    showStartInstructions() {
        this.instructionText = this.add.text(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2 - 50, 
            'FLAPPY BIRD\n\nClick, Tap, or Press SPACE to flap\nClick to start!', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Courier New',
            align: 'center'
        });
        this.instructionText.setOrigin(0.5);
    }
    
    setupInput() {
        // Keyboard input
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        // Mouse/touch input
        this.input.on('pointerdown', () => {
            this.handleInput();
        });
        
        // Keyboard input
        this.spaceKey.on('down', () => {
            this.handleInput();
        });
        
        this.enterKey.on('down', () => {
            this.handleInput();
        });
    }
    
    handleInput() {
        if (!this.gameStarted) {
            this.startGame();
        } else if (!this.gameOver) {
            this.bird.flap();
        }
        // Game over input is now handled by GameOverScene
    }
    
    startGame() {
        this.gameStarted = true;
        if (this.instructionText) {
            this.instructionText.destroy();
        }
        this.bird.flap(); // First flap to start
    }
    
    update() {
        // Always update bird for visual position synchronization
        this.bird.update();
        
        if (!this.gameStarted || this.gameOver) {
            return;
        }
        
        // Update pipes
        this.updatePipes();
        
        // Check collisions (only when game is active)
        this.checkCollisions();
        
        // Check scoring
        this.checkScoring();
        
        // Spawn new pipes
        this.spawnPipes();
        
        // Check if bird is dead
        if (this.bird.isDead) {
            this.endGame();
        }
    }
    
    updatePipes() {
        // Update pipe group
        this.pipeGroup.update();
    }
    
    spawnPipes() {
        this.pipeTimer += this.time.delta;
        
        if (this.pipeTimer >= this.nextPipeDistance * 10) { // Convert to milliseconds
            this.createPipePair(CONFIG.GAME_WIDTH + CONFIG.PIPE_WIDTH);
            this.pipeTimer = 0;
        }
    }
    
    createPipePair(x) {
        const pipePair = this.pipeGroup.spawnPipe(x);
        
        // Add collision detection
        this.physics.add.overlap(this.bird, pipePair.topPipe, () => {
            this.bird.die();
        });
        
        this.physics.add.overlap(this.bird, pipePair.bottomPipe, () => {
            this.bird.die();
        });
    }
    
    checkCollisions() {
        // Check ground collision
        if (this.physics.overlap(this.bird, this.groundCollider)) {
            this.bird.die();
        }
    }
    
    checkScoring() {
        this.pipeGroup.getPipes().forEach(pipePair => {
            if (pipePair.hasPassedBird(this.bird.x)) {
                pipePair.markScored();
                this.score++;
                this.scoreText.setText(`Score: ${this.score}`);
            }
        });
    }
    
    endGame() {
        this.gameOver = true;
        
        // Save high score and check if it's a new record
        const previousHighScore = this.getHighScore();
        const isNewHighScore = this.score > previousHighScore;
        const currentHighScore = Math.max(this.score, previousHighScore);
        
        if (isNewHighScore) {
            this.saveHighScore(this.score);
            this.highScoreText.setText(`High: ${this.score}`);
        }
        
        // Transition to GameOverScene with score data
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', {
                score: this.score,
                highScore: currentHighScore,
                isNewHighScore: isNewHighScore
            });
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
    
    saveHighScore(score) {
        try {
            const data = {
                highScore: score,
                lastPlayed: new Date().toISOString()
            };
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.log('Error saving high score:', e);
        }
    }
} 