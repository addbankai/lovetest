const CharacterPanelEffects = {
    p5Instance: null,
    particles: [],
    
    init: function() {
        // Create p5 instance for character panel effects
        this.p5Instance = new p5((p) => {
            p.setup = () => this.setup(p);
            p.draw = () => this.draw(p);
        }, 'character-panel');
    },
    
    setup: function(p) {
        const panel = document.getElementById('character-panel');
        const canvas = p.createCanvas(panel.offsetWidth, panel.offsetHeight);
        canvas.style('position', 'absolute');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('pointer-events', 'none');
        canvas.style('z-index', '1');
        
        // Initialize particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: p.random(p.width),
                y: p.random(p.height),
                size: p.random(1, 3),
                speedX: p.random(-0.5, 0.5),
                speedY: p.random(-0.5, 0.5),
                alpha: p.random(50, 150)
            });
        }
    },
    
    draw: function(p) {
        p.clear();
        
        // Update and draw particles
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = p.width;
            if (particle.x > p.width) particle.x = 0;
            if (particle.y < 0) particle.y = p.height;
            if (particle.y > p.height) particle.y = 0;
            
            // Draw particle
            p.noStroke();
            p.fill(0, 255, 255, particle.alpha);
            p.circle(particle.x, particle.y, particle.size);
        });
        
        // Draw scan lines
        for (let y = 0; y < p.height; y += 4) {
            p.stroke(0, 255, 255, 10);
            p.line(0, y, p.width, y);
        }
    },
    
    // Call this when character thumbnails are created/updated
    enhanceThumbnail: function(thumbnailElement) {
        const ctx = this.p5Instance;
        if (!ctx) return;
        
        // Add hover effect
        thumbnailElement.addEventListener('mouseenter', () => {
            this.particles.forEach(particle => {
                particle.speedX *= 2;
                particle.speedY *= 2;
                particle.alpha = 200;
            });
        });
        
        thumbnailElement.addEventListener('mouseleave', () => {
            this.particles.forEach(particle => {
                particle.speedX /= 2;
                particle.speedY /= 2;
                particle.alpha = p.random(50, 150);
            });
        });
    }
};