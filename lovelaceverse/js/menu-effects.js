// Create a new p5 instance to avoid conflicts with other p5 sketches
const menuSketch = (p) => {
    p.setup = () => {
        console.log('Menu effects setup starting...');
        const menuContainer = document.getElementById('game-ui');
        if (!menuContainer) {
            console.error('game-ui container not found');
            return;
        }

        const canvas = p.createCanvas(menuContainer.offsetWidth, menuContainer.offsetHeight);
        canvas.parent(menuContainer);
        canvas.style('position', 'absolute');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('z-index', '0');
        canvas.style('pointer-events', 'none');

        console.log('Menu effects setup complete');
    };

    p.draw = () => {
        p.clear();
        
        // Draw background gradient
        const c1 = p.color(10, 14, 23, 200);
        const c2 = p.color(19, 26, 41, 200);
        for (let y = 0; y < p.height; y++) {
            const inter = y / p.height;
            const c = p.lerpColor(c1, c2, inter);
            p.stroke(c);
            p.line(0, y, p.width, y);
        }

        // Draw scanlines
        for (let y = 0; y < p.height; y += 4) {
            p.stroke(255, 2);
            p.line(0, y, p.width, y);
        }
    };

    p.windowResized = () => {
        const menuContainer = document.getElementById('game-ui');
        if (menuContainer) {
            p.resizeCanvas(menuContainer.offsetWidth, menuContainer.offsetHeight);
        }
    };
};

// Initialize the sketch when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing menu effects...');
    new p5(menuSketch);
});



