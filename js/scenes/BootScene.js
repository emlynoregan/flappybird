class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    preload() {
        // For now, we don't have any assets to load
        // This is where we'd load sprites, sounds, etc. in Phase 3
        
        // No loading text needed here since we have the overlay
    }
    
    create() {
        // Generate pipe textures before starting the menu
        this.generatePipeTextures();
        
        // Start with the menu scene for Phase 2
        this.scene.start('MenuScene');
    }
    
    generatePipeTextures() {
        // Create a graphics object to draw the pipe
        const pipeGraphics = this.add.graphics();
        
        const width = CONFIG.PIPE_WIDTH;
        const height = CONFIG.PIPE_HEIGHT;
        
        // Draw detailed pipe graphics
        this.drawPipeToGraphics(pipeGraphics, width, height);
        
        // Generate texture from graphics (with caps included)
        const capHeight = 20;
        pipeGraphics.generateTexture('pipeTexture', width + 8, height + capHeight * 2);
        
        // Clean up the graphics object
        pipeGraphics.destroy();
        
        console.log('Generated pipe texture: ' + (width + 8) + 'x' + (height + capHeight * 2));
    }
    
    drawPipeToGraphics(graphics, width, height) {
        graphics.clear();
        
        const capHeight = 20;
        const capWidth = width + 8;
        const capOffset = (capWidth - width) / 2;
        
        // Start drawing from the cap offset to center everything
        const startX = capOffset;
        const startY = capHeight;
        
        // Main pipe body
        graphics.fillStyle(0x228B22); // Green
        graphics.fillRect(startX, startY, width, height);
        
        // Top cap (wider section)
        graphics.fillStyle(0x32CD32); // Lighter green
        graphics.fillRect(0, 0, capWidth, capHeight);
        
        // Bottom cap
        graphics.fillRect(0, startY + height, capWidth, capHeight);
        
        // Highlight on left side of pipe
        graphics.fillStyle(0x90EE90, 0.6); // Light green highlight
        graphics.fillRect(startX, startY, 4, height);
        
        // Shadow on right side
        graphics.fillStyle(0x006400, 0.4); // Dark green shadow
        graphics.fillRect(startX + width - 4, startY, 4, height);
        
        // Pipe borders
        graphics.lineStyle(2, 0x1E5F1E);
        graphics.strokeRect(startX, startY, width, height);
        graphics.strokeRect(0, 0, capWidth, capHeight);
        graphics.strokeRect(0, startY + height, capWidth, capHeight);
    }
} 