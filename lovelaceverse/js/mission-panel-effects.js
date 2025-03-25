const MissionPanelEffects = {
    sketch: null,
    
    init: function() {
        this.sketch = new p5((p) => {
            p.setup = () => {
                const panel = document.getElementById('mission-panel');
                const canvas = p.createCanvas(panel.offsetWidth, panel.offsetHeight);
                canvas.parent('mission-panel-canvas');
                canvas.style('position', 'absolute');
                canvas.style('top', '0');
                canvas.style('left', '0');
                canvas.style('pointer-events', 'none');
                canvas.style('z-index', '1');
            };
            
            p.draw = () => {
                p.clear();
                
                // Draw scanlines only
                for (let y = 0; y < p.height; y += 4) {
                    p.stroke(255, 2);
                    p.line(0, y, p.width, y);
                }
            };
            
            p.windowResized = () => {
                const panel = document.getElementById('mission-panel');
                p.resizeCanvas(panel.offsetWidth, panel.offsetHeight);
            };
        });
    }
};
