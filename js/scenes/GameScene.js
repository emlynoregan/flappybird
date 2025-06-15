class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    create() {
        // Game state
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = false;
        
        // Create sound manager
        this.soundManager = new SoundManager();
        
        // Add fade in transition
        this.cameras.main.fadeIn(300, 0, 0, 0);
        
        // Create background
        this.createBackground();
        
        // Create ground
        this.createGround();
        
        // Create bird
        this.bird = new Bird(this, CONFIG.BIRD_START_X, CONFIG.BIRD_START_Y);
        
        // Create pipe group
        this.pipeGroup = new PipeGroup(this);
        this.lastSpawnTime = null; // Will be set when game starts
        this.nextPipeDistance = CONFIG.PIPE_SPAWN_DISTANCE;
        console.log('Scene created, spawn timing will be initialized when game starts');
        
        // Create UI
        this.createUI();
        
        // Input handling
        this.setupInput();
        
        // Start instructions
        this.showStartInstructions();
        
        // Initialize difficulty tracking
        this.currentDifficulty = 1;
        this.lastDifficultyScore = 0;
    }
    
    calculateDifficultyLevel() {
        if (!CONFIG.DIFFICULTY_SCALING.ENABLED) {
            return 1;
        }
        
        const level = Math.floor(this.score / CONFIG.DIFFICULTY_SCALING.SCORE_INTERVAL) + 1;
        return Math.min(level, CONFIG.DIFFICULTY_SCALING.MAX_DIFFICULTY);
    }
    
    getCurrentPipeSpeed() {
        const difficulty = this.calculateDifficultyLevel();
        const speedIncrease = difficulty * CONFIG.DIFFICULTY_SCALING.PIPE_SPEED_INCREASE;
        const newSpeed = CONFIG.PIPE_SPEED - speedIncrease; // More negative = faster
        return Math.max(newSpeed, CONFIG.DIFFICULTY_SCALING.MAX_PIPE_SPEED);
    }
    
    getCurrentPipeGap() {
        const difficulty = this.calculateDifficultyLevel();
        const gapDecrease = difficulty * CONFIG.DIFFICULTY_SCALING.PIPE_GAP_DECREASE;
        const newGap = CONFIG.PIPE_GAP - gapDecrease;
        return Math.max(newGap, CONFIG.DIFFICULTY_SCALING.MIN_PIPE_GAP);
    }
    
    getCurrentSpawnInterval() {
        const difficulty = this.calculateDifficultyLevel();
        const spawnIncrease = difficulty * CONFIG.DIFFICULTY_SCALING.SPAWN_RATE_INCREASE;
        const baseInterval = 2000; // 2 seconds
        const newInterval = baseInterval / (1 + spawnIncrease);
        return Math.max(newInterval, CONFIG.DIFFICULTY_SCALING.MIN_SPAWN_INTERVAL);
    }
    
    updateDifficulty() {
        const newDifficulty = this.calculateDifficultyLevel();
        
        if (newDifficulty > this.currentDifficulty) {
            this.currentDifficulty = newDifficulty;
            
            // Update difficulty UI
            this.difficultyText.setText(`Level: ${newDifficulty}`);
            
            // Show difficulty increase notification
            console.log('🔥 DIFFICULTY INCREASED! Level:', newDifficulty);
            console.log('  Pipe Speed:', this.getCurrentPipeSpeed());
            console.log('  Pipe Gap:', this.getCurrentPipeGap());
            console.log('  Spawn Interval:', this.getCurrentSpawnInterval());
            
            // Visual notification (optional)
            if (newDifficulty > 0) {
                this.showDifficultyNotification(newDifficulty);
            }
        }
    }
    
    showDifficultyNotification(level) {
        // Create a temporary notification text
        const notification = this.add.text(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2 - 100, 
            `DIFFICULTY INCREASED!\nLevel ${level}`, {
            fontSize: '24px',
            fill: '#ff4444',
            fontFamily: 'Courier New',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        });
        notification.setOrigin(0.5);
        
        // Animate and remove
        this.tweens.add({
            targets: notification,
            alpha: 0,
            y: notification.y - 50,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => notification.destroy()
        });
    }
    
    createBackground() {
        // Create sky background
        const graphics = this.add.graphics();
        graphics.fillStyle(0x87CEEB); // Sky blue
        graphics.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        // Add some clouds
        this.createClouds();
    }
    
    createClouds() {
        // Create some decorative clouds
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.graphics();
            const x = Math.random() * CONFIG.GAME_WIDTH * 1.5; // Start some off-screen to the right
            const y = Math.random() * CONFIG.GAME_HEIGHT * 0.4;
            
            // Cloud made of circles
            cloud.fillStyle(0xFFFFFF, 0.8);
            cloud.fillCircle(0, 0, 15);
            cloud.fillCircle(12, -5, 12);
            cloud.fillCircle(-8, -8, 10);
            cloud.fillCircle(20, 0, 8);
            cloud.fillCircle(-15, 0, 10);
            
            cloud.x = x;
            cloud.y = y;
            
            // Animate clouds slowly from right to left (parallax effect)
            this.tweens.add({
                targets: cloud,
                x: -100, // Move to left edge off-screen
                duration: 30000 + Math.random() * 20000,
                repeat: -1,
                ease: 'Linear',
                onComplete: () => {
                    // Reset to right side when animation completes
                    cloud.x = CONFIG.GAME_WIDTH + 100;
                }
            });
        }
    }
    
    createGround() {
        // Create ground graphics with texture
        this.ground = this.add.graphics();
        
        // Ground base
        this.ground.fillStyle(0x8B4513); // Brown
        this.ground.fillRect(0, CONFIG.GAME_HEIGHT - CONFIG.GROUND_HEIGHT, CONFIG.GAME_WIDTH, CONFIG.GROUND_HEIGHT);
        
        // Grass on top
        this.ground.fillStyle(0x228B22); // Green grass
        this.ground.fillRect(0, CONFIG.GAME_HEIGHT - CONFIG.GROUND_HEIGHT, CONFIG.GAME_WIDTH, 8);
        
        // Add some texture details
        for (let i = 0; i < CONFIG.GAME_WIDTH; i += 20) {
            const grassHeight = Math.random() * 3 + 2;
            this.ground.fillStyle(0x32CD32, 0.7);
            this.ground.fillRect(i, CONFIG.GAME_HEIGHT - CONFIG.GROUND_HEIGHT - grassHeight, 3, grassHeight);
        }
        
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
        
        // Difficulty level text
        this.difficultyText = this.add.text(CONFIG.GAME_WIDTH / 2, CONFIG.SCORE_Y, 'Level: 1', {
            fontSize: '18px',
            fill: '#ffff00',
            fontFamily: 'Courier New'
        });
        this.difficultyText.setOrigin(0.5, 0);
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
            this.soundManager.playFlap(); // Play flap sound
        }
        // Game over input is now handled by GameOverScene
    }
    
    startGame() {
        this.gameStarted = true;
        if (this.instructionText) {
            this.instructionText.destroy();
        }
        this.bird.flap(); // First flap to start
        
        // Reset spawn timing for regular spawning
        this.lastSpawnTime = this.time.now;
        console.log('Game started, spawn timer reset. Current time:', this.lastSpawnTime);
        
        // Spawn first pipe immediately
        this.time.delayedCall(1000, () => {
            this.createPipePair(CONFIG.GAME_WIDTH + CONFIG.PIPE_WIDTH);
            console.log('First pipe spawned!');
        });
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
        // Use absolute time instead of delta time for more reliability
        if (!this.lastSpawnTime) {
            this.lastSpawnTime = this.time.now;
        }
        
        const currentTime = this.time.now;
        const timeSinceLastSpawn = currentTime - this.lastSpawnTime;
        
        // Spawn interval based on current difficulty
        const spawnInterval = this.getCurrentSpawnInterval();
        
        // Debug: Log timer progress every second
        const secondsSinceSpawn = Math.floor(timeSinceLastSpawn / 1000);
        const prevSecondsSinceSpawn = Math.floor((timeSinceLastSpawn - 16) / 1000); // Assuming ~60fps
        
        if (secondsSinceSpawn !== prevSecondsSinceSpawn) {
            console.log('Time since last spawn:', secondsSinceSpawn, 'seconds. Next spawn in:', Math.max(0, Math.ceil((spawnInterval - timeSinceLastSpawn) / 1000)), 'seconds');
        }
        
        if (timeSinceLastSpawn >= spawnInterval) {
            const spawnX = CONFIG.GAME_WIDTH + CONFIG.PIPE_WIDTH;
            console.log('SPAWNING NEW PIPE! Time since last:', timeSinceLastSpawn, 'Spawn X:', spawnX);
            this.createPipePair(spawnX);
            this.lastSpawnTime = currentTime; // Reset the spawn timer
            console.log('Current active pipes after spawn:', this.pipeGroup.getPipes().length);
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
                this.soundManager.playScore(); // Play score sound
                
                // Check for difficulty increase
                this.updateDifficulty();
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