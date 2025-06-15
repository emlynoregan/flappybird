// Simplified PipeGroup - let's avoid the complex pooling system for now
class PipeGroup {
    constructor(scene) {
        this.scene = scene;
        this.pipes = [];
    }
    
    spawnPipe(x) {
        const pipePair = new PipePair(this.scene);
        pipePair.spawn(x);
        this.pipes.push(pipePair);
        return pipePair;
    }
    
    update() {
        // Update all active pipe pairs and remove dead ones
        this.pipes = this.pipes.filter(pipePair => {
            pipePair.update();
            if (!pipePair.active) {
                pipePair.destroy();
                return false;
            }
            return true;
        });
    }
    
    getPipes() {
        return this.pipes;
    }
    
    destroy() {
        this.pipes.forEach(pipePair => pipePair.destroy());
        this.pipes = [];
    }
}

class PipePair extends Phaser.GameObjects.Group {
    constructor(scene) {
        super(scene);
        
        this.scene = scene;
        
        // Create top and bottom pipe graphics
        this.topPipe = scene.add.graphics();
        this.bottomPipe = scene.add.graphics();
        
        // Add physics bodies to pipes
        scene.physics.add.existing(this.topPipe);
        scene.physics.add.existing(this.bottomPipe);
        
        // Set up physics bodies
        this.topPipe.body.setSize(CONFIG.PIPE_WIDTH, CONFIG.PIPE_HEIGHT);
        this.bottomPipe.body.setSize(CONFIG.PIPE_WIDTH, CONFIG.PIPE_HEIGHT);
        
        // Set immovable (pipes don't move when hit)
        this.topPipe.body.setImmovable(true);
        this.bottomPipe.body.setImmovable(true);
        
        // Add to this group
        this.add(this.topPipe);
        this.add(this.bottomPipe);
        
        // Scoring
        this.scored = false;
        this.x = 0;
    }
    
    spawn(x) {
        this.x = x;
        this.scored = false;
        
        // Calculate random gap position
        const minGapY = CONFIG.PIPE_GAP / 2 + 50;
        const maxGapY = CONFIG.GAME_HEIGHT - CONFIG.GROUND_HEIGHT - CONFIG.PIPE_GAP / 2 - 50;
        const gapCenterY = Phaser.Math.Between(minGapY, maxGapY);
        
        // Position top pipe
        const topPipeY = gapCenterY - CONFIG.PIPE_GAP / 2 - CONFIG.PIPE_HEIGHT / 2;
        this.topPipe.setPosition(x, topPipeY);
        this.topPipe.body.setPosition(x - CONFIG.PIPE_WIDTH / 2, topPipeY - CONFIG.PIPE_HEIGHT / 2);
        
        // Position bottom pipe
        const bottomPipeY = gapCenterY + CONFIG.PIPE_GAP / 2 + CONFIG.PIPE_HEIGHT / 2;
        this.bottomPipe.setPosition(x, bottomPipeY);
        this.bottomPipe.body.setPosition(x - CONFIG.PIPE_WIDTH / 2, bottomPipeY - CONFIG.PIPE_HEIGHT / 2);
        
        // Draw pipes
        this.drawPipe(this.topPipe);
        this.drawPipe(this.bottomPipe);
        
        // Set velocity
        this.topPipe.body.setVelocityX(CONFIG.PIPE_SPEED);
        this.bottomPipe.body.setVelocityX(CONFIG.PIPE_SPEED);
        
        // Activate
        this.setActive(true);
        this.setVisible(true);
        this.topPipe.setActive(true);
        this.bottomPipe.setActive(true);
        this.topPipe.setVisible(true);
        this.bottomPipe.setVisible(true);
    }
    
    drawPipe(pipe) {
        pipe.clear();
        pipe.fillStyle(CONFIG.COLORS.PIPE);
        pipe.fillRect(-CONFIG.PIPE_WIDTH / 2, -CONFIG.PIPE_HEIGHT / 2, CONFIG.PIPE_WIDTH, CONFIG.PIPE_HEIGHT);
        
        // Add a simple border
        pipe.lineStyle(2, 0x228B22);
        pipe.strokeRect(-CONFIG.PIPE_WIDTH / 2, -CONFIG.PIPE_HEIGHT / 2, CONFIG.PIPE_WIDTH, CONFIG.PIPE_HEIGHT);
    }
    
    update() {
        // Check if pipes have moved off screen
        if (this.topPipe.x < -CONFIG.PIPE_WIDTH) {
            this.kill();
        }
        
        // Update x position for scoring check
        this.x = this.topPipe.x;
    }
    
    kill() {
        // Deactivate
        this.setActive(false);
        this.setVisible(false);
        this.topPipe.setActive(false);
        this.bottomPipe.setActive(false);
        this.topPipe.setVisible(false);
        this.bottomPipe.setVisible(false);
        
        // Stop physics
        this.topPipe.body.setVelocity(0, 0);
        this.bottomPipe.body.setVelocity(0, 0);
        
        // Clear graphics
        this.topPipe.clear();
        this.bottomPipe.clear();
    }
    
    // Check if bird has passed this pipe for scoring
    hasPassedBird(birdX) {
        return !this.scored && birdX > this.x + CONFIG.PIPE_WIDTH / 2;
    }
    
    markScored() {
        this.scored = true;
    }
    
    // Get collision bodies for physics
    getCollisionBodies() {
        return [this.topPipe.body, this.bottomPipe.body];
    }
} 