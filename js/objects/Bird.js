class Bird extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Create a simple colored rectangle for the bird (we'll replace with sprite later)
        super(scene, x, y, null);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Make the sprite invisible since we're using graphics for the bird appearance
        this.setVisible(false);
        
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
        const wingBeat = Math.sin(this.wingFrame * 0.8) * 2;
        
        // Tail feathers (draw first, behind body)
        this.graphics.fillStyle(0xFF6B35); // Darker orange tail
        const tailSpread = Math.sin(this.wingFrame * 0.4) * 1;
        this.graphics.fillEllipse(halfSize - 8, halfSize + 1 + tailSpread, size * 0.35, size * 0.25);
        this.graphics.fillStyle(0xE55100); // Even darker tail stripes
        this.graphics.fillEllipse(halfSize - 7, halfSize + 2 + tailSpread, size * 0.25, size * 0.15);
        
        // Bird body (plump, rounded bird shape)
        this.graphics.fillStyle(0xFFD54F); // Bright yellow body
        this.graphics.fillEllipse(halfSize - 1, halfSize + 2, size * 0.85, size * 0.75);
        
        // Chest/belly (lighter area)
        this.graphics.fillStyle(0xFFF176, 0.8); // Light yellow chest
        this.graphics.fillEllipse(halfSize + 1, halfSize + 4, size * 0.5, size * 0.45);
        
        // Bird head (round, overlapping body)
        this.graphics.fillStyle(0xFFD54F); // Same bright yellow
        this.graphics.fillCircle(halfSize + 3, halfSize - 1, size * 0.4);
        
        // Wing (animated with realistic bird wing shape)
        this.graphics.fillStyle(0xFF9800); // Orange wing
        
        // Wing main body (elliptical shape)
        this.graphics.fillEllipse(halfSize - 2, halfSize + 1 + wingBeat, size * 0.4, size * 0.3);
        
        // Wing tip (smaller ellipse)
        this.graphics.fillEllipse(halfSize - 5, halfSize - 1 + wingBeat, size * 0.25, size * 0.2);
        
        // Wing feather details
        this.graphics.fillStyle(0xE65100, 0.7); // Darker wing markings
        this.graphics.fillEllipse(halfSize - 4, halfSize + 1 + wingBeat, size * 0.25, size * 0.15);
        
        // Beak (prominent bird beak)
        this.graphics.fillStyle(0xFF5722); // Bright orange-red beak
        this.graphics.fillTriangle(
            halfSize + size * 0.45, halfSize - 2,
            halfSize + size * 0.65, halfSize,
            halfSize + size * 0.45, halfSize + 2
        );
        
        // Beak highlight
        this.graphics.fillStyle(0xFF8A50);
        this.graphics.fillTriangle(
            halfSize + size * 0.45, halfSize - 1,
            halfSize + size * 0.55, halfSize,
            halfSize + size * 0.45, halfSize + 1
        );
        
        // Large expressive eye
        this.graphics.fillStyle(0xFFFFFF); // White eye background
        this.graphics.fillCircle(halfSize + 5, halfSize - 2, 4);
        
        this.graphics.fillStyle(0x1A1A1A); // Dark pupil
        this.graphics.fillCircle(halfSize + 6, halfSize - 2, 2.5);
        
        // Eye shine (makes it look alive)
        this.graphics.fillStyle(0xFFFFFF);
        this.graphics.fillCircle(halfSize + 7, halfSize - 3, 1.2);
        
        // Small secondary eye shine
        this.graphics.fillStyle(0xFFFFFF, 0.6);
        this.graphics.fillCircle(halfSize + 5.5, halfSize - 1, 0.8);
        
        // Eyebrow area (slight color variation)
        this.graphics.fillStyle(0xFFC107, 0.5);
        this.graphics.fillEllipse(halfSize + 4, halfSize - 4, size * 0.25, size * 0.15);
        
        // Small feet (when wings are down)
        if (wingBeat < 0) {
            this.graphics.fillStyle(0xFF5722); // Orange feet
            this.graphics.fillCircle(halfSize - 1, halfSize + 9, 1.5);
            this.graphics.fillCircle(halfSize + 2, halfSize + 9, 1.5);
            
            // Tiny claws
            this.graphics.lineStyle(1, 0xD84315);
            this.graphics.lineBetween(halfSize - 1, halfSize + 10, halfSize - 1, halfSize + 11);
            this.graphics.lineBetween(halfSize + 2, halfSize + 10, halfSize + 2, halfSize + 11);
        }
        
        // Body outline for definition
        this.graphics.lineStyle(1, 0xF57F17, 0.3);
        this.graphics.strokeCircle(halfSize + 3, halfSize - 1, size * 0.4); // Head outline
        this.graphics.strokeEllipse(halfSize - 1, halfSize + 2, size * 0.85, size * 0.75); // Body outline
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
        
        // Only animate and update bird appearance if not dead
        if (!this.isDead) {
            // Animate wings
            this.wingAnimTimer += 16; // Roughly 60fps
            if (this.wingAnimTimer >= 150) { // Change frame every 150ms
                this.wingFrame++;
                this.drawBirdSprite();
                this.wingAnimTimer = 0;
            }
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
            
            // Dead bird body (dulled colors, flattened)
            this.graphics.fillStyle(0x999999); // Gray body
            this.graphics.fillEllipse(halfSize - 1, halfSize + 2, size * 0.85, size * 0.5);
            
            // Dead bird head
            this.graphics.fillStyle(0x999999);
            this.graphics.fillCircle(halfSize + 3, halfSize - 1, size * 0.35);
            
            // Drooped wing
            this.graphics.fillStyle(0x666666);
            this.graphics.fillEllipse(halfSize - 2, halfSize + 3, size * 0.3, size * 0.2);
            
            // Beak (unchanged)
            this.graphics.fillStyle(0xFF5722);
            this.graphics.fillTriangle(
                halfSize + size * 0.45, halfSize - 2,
                halfSize + size * 0.65, halfSize,
                halfSize + size * 0.45, halfSize + 2
            );
            
            // X eyes (larger and more prominent)
            this.graphics.lineStyle(3, 0x000000);
            this.graphics.lineBetween(halfSize + 2, halfSize - 4, halfSize + 8, halfSize + 2);
            this.graphics.lineBetween(halfSize + 8, halfSize - 4, halfSize + 2, halfSize + 2);
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