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
        
        // Create top and bottom pipe sprites using the generated texture
        this.topPipe = scene.add.image(0, 0, 'pipeTexture');
        this.bottomPipe = scene.add.image(0, 0, 'pipeTexture');
        
        // Flip the bottom pipe vertically
        this.bottomPipe.setFlipY(true);
        
        // Add physics bodies to pipes - sprites automatically align perfectly!
        scene.physics.add.existing(this.topPipe);
        scene.physics.add.existing(this.bottomPipe);
        
        // Set physics body size to match the main pipe body (without caps)
        this.topPipe.body.setSize(CONFIG.PIPE_WIDTH, CONFIG.PIPE_HEIGHT);
        this.bottomPipe.body.setSize(CONFIG.PIPE_WIDTH, CONFIG.PIPE_HEIGHT);
        
        // Center the physics body within the sprite
        const capHeight = 20;
        this.topPipe.body.setOffset(4, capHeight); // Offset to skip the cap
        this.bottomPipe.body.setOffset(4, capHeight); // Offset to skip the cap
        
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
        
        // Position pipe sprites - physics bodies automatically align!
        const topPipeY = gapCenterY - CONFIG.PIPE_GAP / 2 - CONFIG.PIPE_HEIGHT / 2;
        const bottomPipeY = gapCenterY + CONFIG.PIPE_GAP / 2 + CONFIG.PIPE_HEIGHT / 2;
        
        // Set sprite positions - physics bodies automatically follow
        this.topPipe.setPosition(x, topPipeY);
        this.bottomPipe.setPosition(x, bottomPipeY);
        
        // Set velocity
        this.topPipe.body.setVelocityX(CONFIG.PIPE_SPEED);
        this.bottomPipe.body.setVelocityX(CONFIG.PIPE_SPEED);
        
        // Activate
        this.active = true;
        this.setActive(true);
        this.setVisible(true);
        this.topPipe.setActive(true);
        this.bottomPipe.setActive(true);
        this.topPipe.setVisible(true);
        this.bottomPipe.setVisible(true);
        
        console.log('Pipe spawned and activated at x:', x);
    }
    

    
    update() {
        // Check if pipes have moved off screen
        if (this.topPipe.x < -CONFIG.PIPE_WIDTH) {
            console.log('Pipe moved off screen, killing at x:', this.topPipe.x);
            this.kill();
        }
        
        // Update x position for scoring check
        this.x = this.topPipe.x;
    }
    
    kill() {
        // Mark as inactive for removal
        this.active = false;
        
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
        
        console.log('Pipe killed and marked inactive');
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