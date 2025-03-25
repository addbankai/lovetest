let dashboardSketch = new p5((p) => {
    let grid = [];
    const gridSize = 30;
    
    p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent('profile-modal');
        canvas.style('position', 'absolute');
        canvas.style('z-index', '0');
        canvas.style('opacity', '0.3');
        
        // Initialize grid
        for (let x = 0; x < p.width; x += gridSize) {
            for (let y = 0; y < p.height; y += gridSize) {
                grid.push({
                    x: x,
                    y: y,
                    color: p.color(0, 255, 255),
                    alpha: p.random(50, 150)
                });
            }
        }
    };
    
    p.draw = () => {
        p.clear();
        p.noFill();
        
        // Draw grid lines
        grid.forEach(point => {
            p.stroke(0, 255, 255, point.alpha);
            p.rect(point.x, point.y, gridSize, gridSize);
            
            // Animate alpha
            point.alpha += p.sin(p.frameCount * 0.05) * 2;
            point.alpha = p.constrain(point.alpha, 50, 150);
        });
        
        // Draw scanning line
        let scanY = (p.frameCount % p.height);
        p.stroke(255, 0, 255, 100);
        p.line(0, scanY, p.width, scanY);
    };
    
    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        grid = [];
        // Reinitialize grid
        for (let x = 0; x < p.width; x += gridSize) {
            for (let y = 0; y < p.height; y += gridSize) {
                grid.push({
                    x: x,
                    y: y,
                    color: p.color(0, 255, 255),
                    alpha: p.random(50, 150)
                });
            }
        }
    };
});