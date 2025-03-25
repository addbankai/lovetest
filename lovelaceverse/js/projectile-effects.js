/**
 * Projectile Effects System for the Cyberpunk MMORPG game
 * Handles creation, movement, and impact of projectiles like arrows and fireballs
 */

const ProjectileEffects = {
    // Types of projectiles with their properties
    types: {
        ARROW: {
            sprite: null, // Will be created dynamically
            speed: 600,   // Pixels per second
            width: 32,
            height: 8,
            rotation: true,   // Whether projectile rotates toward target
            color: '#FFD700', // Gold color for arrow (when no sprite)
            damage: 1.0,      // Damage multiplier
            range: 1000       // Increased from 750 to 1000 to account for projectile travel
        },
        FIREBALL: {
            sprite: null, // Will be created dynamically
            speed: 400,
            width: 24,
            height: 24,
            rotation: false,
            animation: true,
            frames: 4,
            color: '#FF4500', // OrangeRed color for fireball (when no sprite)
            damage: 1.2,      // Damage multiplier
            range: 1000       // Increased from 750 to 1000 to account for projectile travel
        }
    },
    
    // Array to track active projectiles
    activeProjectiles: [],
    
    // Initialize projectile system
    init: function() {
        // Create projectile sprites dynamically
        this.createProjectileSprites();
        
        // Set up our own update loop since we may not have a Game.addUpdateCallback
        this.lastUpdateTime = Date.now();
        this.setupUpdateLoop();
        
        console.log("Projectile Effects system initialized");
    },
    
    // Set up independent update loop
    setupUpdateLoop: function() {
        const updateLoop = () => {
            const now = Date.now();
            const deltaTime = now - this.lastUpdateTime;
            this.lastUpdateTime = now;
            
            // Update all projectiles
            this.update(deltaTime);
            
            // Continue the loop
            requestAnimationFrame(updateLoop);
        };
        
        // Start the update loop
        requestAnimationFrame(updateLoop);
    },
    
    // Create canvas-based projectile sprites
    createProjectileSprites: function() {
        // Create arrow sprite
        const arrowCanvas = document.createElement('canvas');
        arrowCanvas.width = this.types.ARROW.width;
        arrowCanvas.height = this.types.ARROW.height;
        const arrowCtx = arrowCanvas.getContext('2d');
        
        // Draw arrow
        arrowCtx.fillStyle = this.types.ARROW.color;
        arrowCtx.beginPath();
        arrowCtx.moveTo(this.types.ARROW.width, this.types.ARROW.height / 2); // Tip
        arrowCtx.lineTo(this.types.ARROW.width - 10, 0); // Top edge
        arrowCtx.lineTo(0, this.types.ARROW.height / 2 - 1); // Shaft top
        arrowCtx.lineTo(0, this.types.ARROW.height / 2 + 1); // Shaft bottom
        arrowCtx.lineTo(this.types.ARROW.width - 10, this.types.ARROW.height); // Bottom edge
        arrowCtx.closePath();
        arrowCtx.fill();
        
        // Set arrow sprite
        this.types.ARROW.sprite = arrowCanvas.toDataURL();
        
        // Create fireball sprite (animated)
        const fireballCanvas = document.createElement('canvas');
        fireballCanvas.width = this.types.FIREBALL.width * this.types.FIREBALL.frames;
        fireballCanvas.height = this.types.FIREBALL.height;
        const fireballCtx = fireballCanvas.getContext('2d');
        
        // Draw fireball animation frames
        for (let i = 0; i < this.types.FIREBALL.frames; i++) {
            const centerX = i * this.types.FIREBALL.width + this.types.FIREBALL.width / 2;
            const centerY = this.types.FIREBALL.height / 2;
            const radius = (this.types.FIREBALL.height / 2) * (0.7 + 0.3 * Math.sin(i / this.types.FIREBALL.frames * Math.PI));
            
            // Create gradient
            const gradient = fireballCtx.createRadialGradient(
                centerX, centerY, radius * 0.3,
                centerX, centerY, radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, 'rgba(255, 200, 0, 1)');
            gradient.addColorStop(0.7, 'rgba(255, 50, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 30, 0, 0)');
            
            fireballCtx.fillStyle = gradient;
            fireballCtx.beginPath();
            fireballCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            fireballCtx.fill();
        }
        
        // Set fireball sprite
        this.types.FIREBALL.sprite = fireballCanvas.toDataURL();
    },
    
    /**
     * Create a new projectile
     * @param {string} type - Type of projectile (ARROW, FIREBALL)
     * @param {number} sourceX - Source X position
     * @param {number} sourceY - Source Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {Object} target - Target object (monster)
     * @param {Object} sourceCharacter - Character that fired the projectile
     */
    createProjectile: function(type, sourceX, sourceY, targetX, targetY, target, sourceCharacter) {
        const projectileType = this.types[type];
        if (!projectileType) {
            console.error(`Unknown projectile type: ${type}`);
            return null;
        }
        
        // Calculate direction and distance
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const direction = { x: dx / distance, y: dy / distance };
        
        // Calculate rotation angle
        const angle = Math.atan2(dy, dx);
        
        // Create projectile element
        const projectileElement = document.createElement('div');
        projectileElement.className = `projectile ${type.toLowerCase()}`;
        projectileElement.style.width = `${projectileType.width}px`;
        projectileElement.style.height = `${projectileType.height}px`;
        projectileElement.style.backgroundImage = `url(${projectileType.sprite})`;
        projectileElement.style.backgroundRepeat = 'no-repeat';
        projectileElement.style.backgroundSize = 'contain';
        projectileElement.style.zIndex = '100';
        
        // For animated projectiles
        if (projectileType.animation) {
            projectileElement.style.backgroundSize = `${projectileType.width * projectileType.frames}px ${projectileType.height}px`;
            projectileElement.style.animation = `projectile-animation ${0.5}s steps(${projectileType.frames}) infinite`;
        }
        
        // Apply rotation if needed
        if (projectileType.rotation) {
            projectileElement.style.transform = `rotate(${angle}rad)`;
        }
        
        // Add to DOM
        const gameWorld = document.getElementById('game-world');
        if (gameWorld) {
            gameWorld.appendChild(projectileElement);
        } else {
            document.body.appendChild(projectileElement);
        }
        
        // Create projectile object
        const projectile = {
            type: type,
            element: projectileElement,
            x: sourceX - projectileType.width / 2,
            y: sourceY - projectileType.height / 2,
            direction: direction,
            speed: projectileType.speed,
            target: target,
            sourceCharacter: sourceCharacter,
            damage: sourceCharacter.stats.damage * projectileType.damage, // Base damage modified by projectile type
            distanceTraveled: 0,
            maxDistance: distance + 100, // Add some extra distance to ensure it passes through
            frame: 0,
            frameTime: 0
        };
        
        // Position element
        projectileElement.style.left = `${projectile.x}px`;
        projectileElement.style.top = `${projectile.y}px`;
        
        // Add to active projectiles
        this.activeProjectiles.push(projectile);
        
        return projectile;
    },
    
    /**
     * Update all projectiles
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update: function(deltaTime) {
        for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.activeProjectiles[i];
            
            // Move projectile
            const moveDistance = projectile.speed * (deltaTime / 1000);
            projectile.x += projectile.direction.x * moveDistance;
            projectile.y += projectile.direction.y * moveDistance;
            projectile.distanceTraveled += moveDistance;
            
            // Update element position
            if (projectile.element) {
                projectile.element.style.left = `${projectile.x}px`;
                projectile.element.style.top = `${projectile.y}px`;
            }
            
            // Animate sprite if needed
            if (this.types[projectile.type].animation) {
                projectile.frameTime += deltaTime;
                if (projectile.frameTime >= 100) { // 100ms per frame
                    projectile.frame = (projectile.frame + 1) % this.types[projectile.type].frames;
                    projectile.frameTime = 0;
                    if (projectile.element) {
                        projectile.element.style.backgroundPosition = `-${projectile.frame * this.types[projectile.type].width}px 0`;
                    }
                }
            }
            
            // Check for collision with target
            if (projectile.target && !projectile.target.isDead) {
                const targetRect = {
                    x: projectile.target.x,
                    y: projectile.target.y,
                    width: projectile.target.width,
                    height: projectile.target.height
                };
                
                const projectileRect = {
                    x: projectile.x,
                    y: projectile.y,
                    width: this.types[projectile.type].width,
                    height: this.types[projectile.type].height
                };
                
                // Check for intersection
                if (this.checkRectIntersection(projectileRect, targetRect)) {
                    // Hit target!
                    this.onProjectileHit(projectile, projectile.target);
                    this.removeProjectile(i);
                    continue;
                }
            }
            
            // Remove if traveled too far
            if (projectile.distanceTraveled > projectile.maxDistance) {
                this.removeProjectile(i);
            }
        }
    },
    
    /**
     * Check if two rectangles intersect
     * @param {Object} rect1 - First rectangle {x, y, width, height}
     * @param {Object} rect2 - Second rectangle {x, y, width, height}
     * @returns {boolean} True if rectangles intersect
     */
    checkRectIntersection: function(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    },
    
    /**
     * Handle projectile hit
     * @param {Object} projectile - The projectile
     * @param {Object} target - Target hit by the projectile
     */
    onProjectileHit: function(projectile, target) {
        // Apply damage to target
        if (target && !target.isDead) {
            const damage = Math.round(projectile.damage);
            
            // Call damage function on monster system
            if (typeof MonsterSystem !== 'undefined' && MonsterSystem.damageMonster) {
                MonsterSystem.damageMonster(target.id, damage, projectile.sourceCharacter);
            }
        }
        
        // Create impact effect
        this.createImpactEffect(projectile);
    },
    
    /**
     * Create impact effect
     * @param {Object} projectile - The projectile
     */
    createImpactEffect: function(projectile) {
        const impactX = projectile.x + this.types[projectile.type].width / 2;
        const impactY = projectile.y + this.types[projectile.type].height / 2;
        
        // Create impact element
        const impactElement = document.createElement('div');
        impactElement.className = `impact-effect impact-${projectile.type.toLowerCase()}`;
        
        // Determine size and position based on projectile type
        let size, offset;
        if (projectile.type === 'ARROW') {
            size = 48; // Larger for better visibility
            offset = size / 2;
            // Add inner glow div for arrow impact
            const glowElement = document.createElement('div');
            glowElement.style.width = '100%';
            glowElement.style.height = '100%';
            glowElement.style.borderRadius = '50%';
            glowElement.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            glowElement.style.boxShadow = '0 0 10px 5px rgba(255, 255, 255, 0.7)';
            impactElement.appendChild(glowElement);
        } else if (projectile.type === 'FIREBALL') {
            size = 64; // Even larger for fireball explosion
            offset = size / 2;
            // Add inner glow div for fireball explosion
            const glowElement = document.createElement('div');
            glowElement.style.width = '100%';
            glowElement.style.height = '100%';
            glowElement.style.borderRadius = '50%';
            glowElement.style.backgroundColor = 'rgba(255, 100, 0, 0.5)';
            glowElement.style.boxShadow = '0 0 15px 8px rgba(255, 50, 0, 0.8)';
            impactElement.appendChild(glowElement);
        }
        
        // Style the impact element
        impactElement.style.width = `${size}px`;
        impactElement.style.height = `${size}px`;
        impactElement.style.left = `${impactX - offset}px`;
        impactElement.style.top = `${impactY - offset}px`;
        impactElement.style.animation = projectile.type === 'ARROW' 
            ? 'arrow-impact 0.3s forwards' 
            : 'fireball-explosion 0.6s forwards';
        impactElement.style.borderRadius = '50%';
        
        // Add CSS animation keyframes if not already present
        if (!document.getElementById('projectile-effects-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'projectile-effects-styles';
            styleElement.textContent = `
                @keyframes arrow-impact {
                    0% { transform: scale(0.3); opacity: 1; }
                    100% { transform: scale(1.0); opacity: 0; }
                }
                
                @keyframes fireball-explosion {
                    0% { transform: scale(0.5); opacity: 1; background-color: rgba(255, 255, 255, 0.9); }
                    50% { transform: scale(1.2); opacity: 0.8; background-color: rgba(255, 100, 0, 0.8); }
                    100% { transform: scale(1.5); opacity: 0; background-color: rgba(255, 30, 0, 0.1); }
                }
                
                @keyframes projectile-animation {
                    from { background-position: 0 0; }
                    to { background-position: -100% 0; }
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // Add to DOM
        const gameWorld = document.getElementById('game-world');
        if (gameWorld) {
            gameWorld.appendChild(impactElement);
        } else {
            document.body.appendChild(impactElement);
        }
        
        // Remove after animation completes
        setTimeout(() => {
            if (impactElement.parentNode) {
                impactElement.parentNode.removeChild(impactElement);
            }
        }, projectile.type === 'ARROW' ? 300 : 500);
    },
    
    /**
     * Remove a projectile
     * @param {number} index - Index in activeProjectiles array
     */
    removeProjectile: function(index) {
        const projectile = this.activeProjectiles[index];
        
        // Remove DOM element
        if (projectile.element && projectile.element.parentNode) {
            projectile.element.parentNode.removeChild(projectile.element);
        }
        
        // Remove from array
        this.activeProjectiles.splice(index, 1);
    }
};

// Initialize when this script loads
document.addEventListener('DOMContentLoaded', () => {
    ProjectileEffects.init();
});
