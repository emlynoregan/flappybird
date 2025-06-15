class Bird extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Create a simple colored rectangle for the bird (we'll replace with sprite later)
        super(scene, x, y, null);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up physics body - make it much smaller for very forgiving collision
        this.body.setSize(CONFIG.BIRD_SIZE - 8, CONFIG.BIRD_SIZE - 8);
        this.body.setOffset(4, 4); // Center the much smaller collision box within the bird
        this.body.setCollideWorldBounds(false); // We'll handle world collision manually
        
        // Don't apply gravity until game starts
        this.body.setGravityY(0);
        
        // Create a proper bird sprite using graphics
        this.graphics = scene.add.graphics();
        this.drawBirdSprite();
        this.graphics.x = x - CONFIG.BIRD_SIZE / 2;
        this.graphics.y = y - CONFIG.BIRD_SIZE / 2;
        
        // Animation properties
        this.wingFrame = 0;
        this.wingAnimTimer = 0;
        
        // Bird state
        this.isDead = false;
        this.hasFlapped = false;
        
        // Animation properties
        this.flapTween = null;
        this.angle = 0;
        
        // Bind update method
        this.scene = scene;
    }
    
    drawBirdSprite() {
        this.graphics.clear();
        
        const size = CONFIG.BIRD_SIZE;
        const halfSize = size / 2;
        
        // Bird body (oval shape)
        this.graphics.fillStyle(0xFFD700); // Golden yellow
        this.graphics.fillEllipse(halfSize, halfSize, size * 0.8, size * 0.6);
        
        // Bird wing (changes based on animation frame)
        this.graphics.fillStyle(0xFFA500); // Orange wing
        const wingOffset = Math.sin(this.wingFrame * 0.5) * 3;
        this.graphics.fillEllipse(halfSize - 2, halfSize - 2 + wingOffset, size * 0.4, size * 0.3);
        
        // Bird beak
        this.graphics.fillStyle(0xFF8C00); // Dark orange beak
        this.graphics.fillTriangle(
            halfSize + size * 0.3, halfSize - 2,
            halfSize + size * 0.5, halfSize,
            halfSize + size * 0.3, halfSize + 2
        );
        
        // Bird eye
        this.graphics.fillStyle(0x000000); // Black eye
        this.graphics.fillCircle(halfSize + 2, halfSize - 4, 2);
        
        // Eye highlight
        this.graphics.fillStyle(0xFFFFFF);
        this.graphics.fillCircle(halfSize + 3, halfSize - 5, 1);
    }
    
    flap() {
        if (!this.isDead) {
            // Enable gravity on first flap if not already enabled
            if (this.body.gravity.y === 0) {
                this.body.setGravityY(CONFIG.GRAVITY);
            }
            
            // Apply upward velocity
            this.body.setVelocityY(CONFIG.FLAP_POWER);
            this.hasFlapped = true;
            
            // Animate wing flap
            this.wingFrame = 0;
            this.drawBirdSprite();
            
            // Visual feedback - slight rotation and scale
            this.setRotation(-0.3); // Tilt up slightly
            
            // Tween back to normal rotation
            if (this.flapTween) {
                this.flapTween.stop();
            }
            
            this.flapTween = this.scene.tweens.add({
                targets: this,
                rotation: 0.5, // Tilt down as falling
                duration: 500,
                ease: 'Quad.easeIn'
            });
        }
    }
    
    update() {
        // Update graphics position to follow physics body
        this.graphics.x = this.x - CONFIG.BIRD_SIZE / 2;
        this.graphics.y = this.y - CONFIG.BIRD_SIZE / 2;
        
        // Animate wings
        this.wingAnimTimer += 16; // Roughly 60fps
        if (this.wingAnimTimer >= 150) { // Change frame every 150ms
            this.wingFrame++;
            this.drawBirdSprite();
            this.wingAnimTimer = 0;
        }
        
        // Only check bounds and apply rotation if gravity is active (game started)
        if (this.body.gravity.y > 0) {
            // Check if bird is out of bounds
            if (this.y > CONFIG.GAME_HEIGHT - CONFIG.GROUND_HEIGHT || this.y < 0) {
                this.die();
            }
            
            // Limit rotation based on velocity
            if (!this.isDead) {
                const velocity = this.body.velocity.y;
                let targetRotation = Phaser.Math.Clamp(velocity * 0.001, -0.5, 1.5);
                this.setRotation(targetRotation);
            }
        }
    }
    
    die() {
        if (!this.isDead) {
            this.isDead = true;
            
            // Play death sound
            if (this.scene.soundManager) {
                this.scene.soundManager.playDeath();
            }
            
            // Stop any existing tweens
            if (this.flapTween) {
                this.flapTween.stop();
            }
            
            // Death animation - rotate and fall
            this.scene.tweens.add({
                targets: this,
                rotation: Math.PI,
                duration: 1000,
                ease: 'Bounce.easeOut'
            });
            
            // Change appearance to indicate death
            this.graphics.clear();
            const size = CONFIG.BIRD_SIZE;
            const halfSize = size / 2;
            
            // Dead bird (gray and flat)
            this.graphics.fillStyle(0x808080); // Gray
            this.graphics.fillEllipse(halfSize, halfSize, size * 0.8, size * 0.4);
            
            // X eyes
            this.graphics.lineStyle(2, 0x000000);
            this.graphics.lineBetween(halfSize - 2, halfSize - 6, halfSize + 2, halfSize - 2);
            this.graphics.lineBetween(halfSize + 2, halfSize - 6, halfSize - 2, halfSize - 2);
        }
    }
    
    reset() {
        // Reset position
        this.setPosition(CONFIG.BIRD_START_X, CONFIG.BIRD_START_Y);
        
        // Reset physics
        this.body.setVelocity(0, 0);
        this.body.setGravityY(0); // Turn off gravity until first flap
        this.setRotation(0);
        
        // Reset state
        this.isDead = false;
        this.hasFlapped = false;
        
        // Reset graphics
        this.wingFrame = 0;
        this.wingAnimTimer = 0;
        this.drawBirdSprite();
        
        // Stop any tweens
        if (this.flapTween) {
            this.flapTween.stop();
        }
    }
    
    destroy() {
        // Clean up graphics
        if (this.graphics) {
            this.graphics.destroy();
        }
        
        // Clean up tweens
        if (this.flapTween) {
            this.flapTween.stop();
        }
        
        // Call parent destroy
        super.destroy();
    }
} 