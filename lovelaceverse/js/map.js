/**
 * Map system for the Cyberpunk MMORPG game
 * Handles map generation, movement, and dungeon mechanics
 */

const MapSystem = {
    // Map properties
    mapWidth: 10000, // Total map distance
    currentDistance: 0, // Current distance traveled
    currentDungeonLevel: 1, // Current dungeon level
    maxDungeonLevels: 10, // Maximum dungeon levels
    isCompleting: false, // Flag to prevent multiple dungeon completions

    // Map background elements
    backgrounds: [],
    backgroundWidth: 10000, // Width of each background segment
    
    // Map speed (pixels per second)
    baseSpeed: 50, // Increased for faster monster movement
    currentSpeed: 50,
    
    // Map state
    isMoving: false,
    
    // Monster spawning
    monsterSpawnRate: 1, // Increased even more to spawn more monsters
    monsterSpawnDistance: 250, // Reduced to allow more frequent spawning
    lastMonsterSpawnDistance: 0,
    allowedMonsterTypes: null, // Will be set by the dungeon system
    
    // Add new properties
    mapFilter: null, // Reference to filter overlay
    
    /**
     * Initialize the map system
     */
    init: function(savedData = null) {
        // Initialize with default values
        this.currentDistance = 0;
        this.currentDungeonLevel = 1;
        this.lastMonsterSpawnDistance = 0;
        
        // Set default monster types for Cyber Slums
        this.allowedMonsterTypes = ['slime', 'goblin'];
        this.monsterSpawnRate = 0.09; // Base rate for Cyber Slums
        
        // Load saved data if available
        if (savedData) {
            this.currentDistance = savedData.currentDistance || 0;
            this.currentDungeonLevel = savedData.currentDungeonLevel || 1;
        }
        
        // Ensure we're in Cyber Slums
        if (typeof DungeonSystem !== 'undefined') {
            const cyberSlums = DungeonSystem.getDungeonById('cyber_slums');
            if (cyberSlums) {
                this.allowedMonsterTypes = cyberSlums.monsterTypes;
                this.monsterSpawnRate = 0.08 + (cyberSlums.difficulty * 0.01);
            }
        }
        
        this.createBackgrounds();
        
        // Create filter overlay
        this.createFilterOverlay();
        
        // Update distance display
        this.updateDistanceDisplay();
    },
    
    /**
     * Create background elements for parallax scrolling
     */
    createBackgrounds: function() {
        const mapContainer = document.getElementById('map-background');
        if (!mapContainer) return;
        
        // Clear existing backgrounds
        mapContainer.innerHTML = '';
        this.backgrounds = [];
        
        // Get background image from Utils
        const backgroundImage = Utils.getMapBackground();
        
        // Create multiple background elements for seamless looping
        for (let i = 0; i < 3; i++) {
            const bg = document.createElement('div');
            bg.className = 'map-background-segment';
            bg.style.width = `${this.backgroundWidth}px`;
            bg.style.height = '100%';
            bg.style.backgroundImage = `url(${backgroundImage || 'img/mainmap1.png'})`;
            
            // Add error handling for background image loading
            const img = new Image();
            img.onerror = () => {
                console.error(`Failed to load background image: ${backgroundImage}`);
                bg.style.backgroundImage = `url(img/mainmap1.png)`;
                
                // If all else fails, generate a basic background color
                if (!bg.style.backgroundImage || bg.style.backgroundImage === 'url()') {
                    bg.style.background = 'linear-gradient(to bottom, #000033, #0066cc, #333333)';
                }
            };
            img.src = backgroundImage || 'img/mainmap1.png';
            
            // Set up mirroring effect
            if (i % 2 === 1) {
                bg.style.transform = 'scaleX(-1)'; // Mirror every other segment
            }
            
            bg.style.backgroundSize = '100% 100%';
            bg.style.backgroundRepeat = 'no-repeat';
            bg.style.position = 'absolute';
            bg.style.left = `${i * this.backgroundWidth}px`;
            bg.style.top = '0';
            
            mapContainer.appendChild(bg);
            this.backgrounds.push(bg);
        }
    },
    
    createFilterOverlay: function() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;
        
        // Remove existing filter if any
        const existingFilter = document.getElementById('dungeon-filter');
        if (existingFilter) {
            existingFilter.remove();
        }
        
        // Create new filter overlay
        this.mapFilter = document.createElement('div');
        this.mapFilter.id = 'dungeon-filter';
        this.mapFilter.style.position = 'absolute';
        this.mapFilter.style.top = '0';
        this.mapFilter.style.left = '0';
        this.mapFilter.style.width = '100%';
        this.mapFilter.style.height = '100%';
        this.mapFilter.style.backgroundColor = 'black';
        this.mapFilter.style.opacity = '0';
        this.mapFilter.style.pointerEvents = 'none';
        this.mapFilter.style.zIndex = '3';
        this.mapFilter.style.transition = 'opacity 0.5s ease';
        
        mapContainer.appendChild(this.mapFilter);
    },
    
    /**
     * Start map movement
     */
    startMovement: function() {
        if (this.isMoving) return;
        
        this.isMoving = true;
        this.lastFrameTime = Date.now();
        this.update();
    },
    
    /**
     * Stop map movement
     */
    stopMovement: function() {
        this.isMoving = false;
    },
    
    /**
     * Update map state (called every frame)
     */
    update: function() {
        if (!this.isMoving) return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        const distanceMoved = this.currentSpeed * deltaTime;
        const newDistance = this.currentDistance + distanceMoved;
        
        if (newDistance >= 100000) {
            // Prevent multiple triggers
            if (this.isCompleting) return;
            
            // Set completion state
            this.isCompleting = true;
            this.currentDistance = 100000;
            this.updateDistanceDisplay();
            this.stopMovement();
            
            // Show alert and handle completion
            setTimeout(() => {
                // Create and show completion modal
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.id = 'dungeon-complete-modal';
                
                const modalContent = document.createElement('div');
                modalContent.className = 'completion-modal';
                
                modalContent.innerHTML = `
                    <h2>DUNGEON COMPLETE</h2>
                    <div class="reward-text">
                        You've successfully cleared the dungeon!<br>
                        Reward: <span class="silver-amount">10 Silver</span>
                    </div>
                    <button class="continue-btn">Continue</button>
                `;
                
                modal.appendChild(modalContent);
                document.body.appendChild(modal);
                
                // Add silver reward
                if (typeof Currency !== 'undefined') {
                    Currency.addSilver(10);
                }
                
                // Handle continue button click
                const continueBtn = modalContent.querySelector('.continue-btn');
                continueBtn.addEventListener('click', () => {
                    modal.remove();
                    this.proceedToNextDungeon();
                });
                
                // Show modal with fade-in effect
                requestAnimationFrame(() => {
                    modal.style.display = 'flex';
                    modal.style.opacity = '0';
                    requestAnimationFrame(() => {
                        modal.style.transition = 'opacity 0.3s ease';
                        modal.style.opacity = '1';
                    });
                });
            }, 100);
            
            return;
        }
        
        this.currentDistance = newDistance;
        
        const newLevel = Math.floor(this.currentDistance / this.mapWidth) + 1;
        if (newLevel !== this.currentDungeonLevel) {
            this.currentDungeonLevel = newLevel;
            this.onDungeonLevelUp();
        }
        
        this.updateBackgrounds(distanceMoved);
        this.updateDistanceDisplay();
        this.checkMonsterSpawn();
        
        requestAnimationFrame(() => this.update());
    },

    // Add new method to handle proceeding to next dungeon
    proceedToNextDungeon: function() {
        // Hide any existing modals
        Utils.hideModal('dungeon-complete-modal');
        
        if (typeof DungeonSystem !== 'undefined') {
            // Get current dungeon ID to exclude it
            const currentDungeonId = DungeonSystem.currentDungeon ? DungeonSystem.currentDungeon.id : null;
            
            // Filter available dungeons excluding the current one
            const availableDungeons = DungeonSystem.dungeons.filter(d => d.id !== currentDungeonId);
            
            if (availableDungeons.length > 0) {
                // Select a random dungeon from available ones
                const randomIndex = Math.floor(Math.random() * availableDungeons.length);
                const nextDungeon = availableDungeons[randomIndex];
                
                // Reset map state
                this.currentDistance = 0;
                this.currentDungeonLevel = 1;
                this.lastMonsterSpawnDistance = 0;
                this.isCompleting = false;
                this.isMoving = false; // Reset movement state
                this.updateDistanceDisplay();
                
                // Clear monsters
                if (typeof MonsterSystem !== 'undefined') {
                    MonsterSystem.clearAllMonsters();
                }
                
                // Select and enter the new dungeon
                DungeonSystem.selectDungeon(nextDungeon.id);
                
                // Show notification
                Utils.showNotification(
                    `Entering ${nextDungeon.name}`,
                    `Difficulty: ${nextDungeon.difficulty} | Level: ${nextDungeon.recommendedLevel}`,
                    3000
                );
                
                // Force restart movement system after a short delay
                setTimeout(() => {
                    this.isMoving = false; // Ensure movement state is reset
                    this.lastFrameTime = Date.now(); // Reset frame time
                    this.startMovement(); // Restart movement
                    
                    // Force an initial update
                    requestAnimationFrame(() => this.update());
                }, 500);
            }
        }

        // Clean up modal if it exists
        const modalElement = document.getElementById('dungeon-complete-modal');
        if (modalElement) {
            modalElement.remove();
        }
    },
    
    /**
     * Handle dungeon level up events
     */
    onDungeonLevelUp: function() {
        console.log(`Dungeon level up! Now at level ${this.currentDungeonLevel}`);
        
        if (this.currentDungeonLevel < this.maxDungeonLevels) {
            // Update dungeon level and show notification
            this.updateDungeonLevel(this.currentDungeonLevel);
            
            // Clear existing monsters
            if (window.MonsterSystem) {
                MonsterSystem.clearAllMonsters();
            }
            
            // Reset character positions
            if (window.CharacterSystem) {
                CharacterSystem.characters.forEach(char => {
                    char.x = 100;
                    char.y = char.groundY;
                    if (char.element) {
                        char.element.style.left = `${char.x}px`;
                        char.element.style.top = `${char.y}px`;
                    }
                });
            }
        } else {
            this.onDungeonComplete();
        }
    },
    
    /**
     * Update background positions for parallax scrolling
     * @param {number} distanceMoved - Distance moved in this frame
     */
    updateBackgrounds: function(distanceMoved) {
        // Convert game distance to pixels for background movement
        const pixelsMoved = distanceMoved * 0.5;
        
        // Update backgrounds
        this.backgrounds.forEach((bg, index) => {
            let currentLeft = parseFloat(bg.style.left);
            currentLeft -= pixelsMoved;
            
            if (currentLeft <= -this.backgroundWidth) {
                currentLeft += this.backgrounds.length * this.backgroundWidth;
            }
            
            bg.style.left = `${currentLeft}px`;
        });
        
        // Move monsters relative to the centered character
        const monstersContainer = document.getElementById('monsters-container');
        if (monstersContainer) {
            const monsters = monstersContainer.children;
            Array.from(monsters).forEach(monsterElement => {
                let currentLeft = parseFloat(monsterElement.style.left);
                currentLeft -= pixelsMoved;
                monsterElement.style.left = `${currentLeft}px`;
                
                // Remove monsters that are too far off screen to the left
                if (currentLeft < -200) {
                    monsterElement.remove();
                }
            });
        }
    },
    
    /**
     * Update the distance display
     */
    updateDistanceDisplay: function() {
        const distanceElement = document.getElementById('current-distance');
        if (distanceElement) {
            distanceElement.textContent = Math.floor(this.currentDistance);
        }
    },
    
    /**
     * Check if a monster should be spawned
     */
    checkMonsterSpawn: function() {
        // Check if we've moved far enough since the last monster spawn
        if (this.currentDistance - this.lastMonsterSpawnDistance < this.monsterSpawnDistance) {
            return;
        }
        
        // Random chance to spawn a monster
        if (Math.random() < this.monsterSpawnRate) {
            this.spawnMonster();
            this.lastMonsterSpawnDistance = this.currentDistance;
        }
    },
    
    /**
     * Spawn a monster on the map
     */
    spawnMonster: function() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;
        
        const containerRect = mapContainer.getBoundingClientRect();
        
        // Determine monster type
        let monsterType;
        const progressPercent = this.currentDistance / this.mapWidth;
        
        if (this.allowedMonsterTypes && this.allowedMonsterTypes.length > 0) {
            if (progressPercent > 0.8 && Math.random() < 0.2) {
                monsterType = 'Bitzee';
            } else {
                const randomIndex = Math.floor(Math.random() * this.allowedMonsterTypes.length);
                monsterType = this.allowedMonsterTypes[randomIndex];
            }
        } else {
            monsterType = 'slime';
        }
        
        // Calculate spawn position
        const monsterData = MonsterSystem.monsterTypes[monsterType];
        if (!monsterData) return;
        
        const monsterX = containerRect.width - 100;
        const monsterY = containerRect.height * 0.7 - monsterData.height;
        
        // Create monster directly through MonsterSystem
        const monster = MonsterSystem.createMonster(monsterType, monsterX, monsterY);
        
        // Verify monster creation
        if (!monster) {
            console.error('Failed to create monster:', monsterType);
            return;
        }
    },
    
    // Remove or comment out the applyDungeonLevelScaling method since it's now handled in MonsterSystem
    /*
    applyDungeonLevelScaling: function(monster) {
        // This functionality is now in MonsterSystem.applyLevelScaling
    }
    */
    
    /**
     * Set the map speed
     * @param {number} speed - New speed in pixels per second
     */
    setSpeed: function(speed) {
        this.currentSpeed = speed;
    },
    
    /**
     * Reset the map speed to base value
     */
    resetSpeed: function() {
        this.currentSpeed = this.baseSpeed;
    },
    
    /**
     * Get the current map progress as a percentage
     * @returns {number} Progress percentage (0-100)
     */
    getProgressPercentage: function() {
        return (this.currentDistance / this.mapWidth) * 100;
    },
    
    /**
     * Check if a position is visible on screen
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Object width
     * @param {number} height - Object height
     * @returns {boolean} True if position is visible
     */
    isPositionVisible: function(x, y, width, height) {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return false;
        
        const containerRect = mapContainer.getBoundingClientRect();
        
        return (
            x + width > 0 &&
            x < containerRect.width &&
            y + height > 0 &&
            y < containerRect.height
        );
    },
    
    /**
     * Convert a distance value to an X position on screen
     * @param {number} distance - Distance value
     * @returns {number} X position
     */
    distanceToPosition: function(distance) {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return 0;
        
        const containerRect = mapContainer.getBoundingClientRect();
        
        // Calculate relative position based on current distance
        const relativeDistance = distance - this.currentDistance;
        
        // Convert to screen position
        return containerRect.width * 0.3 + relativeDistance;
    },
    
    /**
     * Save map data with enhanced position tracking
     * @returns {Object} Map data for saving
     */
    saveData: function() {
        const mapData = {
            currentDistance: this.currentDistance,
            lastMonsterSpawnDistance: this.lastMonsterSpawnDistance,
            currentDungeonLevel: this.currentDungeonLevel,
            isMoving: this.isMoving,
            currentSpeed: this.currentSpeed,
            // Add dungeon location data
            dungeonLocation: {
                id: DungeonSystem.getCurrentDungeon()?.id || 'cyber_slums',
                distance: this.currentDistance,
                level: this.currentDungeonLevel
            },
            lastSaved: new Date().toISOString()
        };

        // Save to local storage immediately
        Utils.saveToStorage('map_progress', mapData);
        
        // Return data for database saving
        return mapData;
    },

    /**
     * Load map data with enhanced position tracking
     * @param {Object} data - Saved map data
     */
    loadData: function(data) {
        // First try to load from local storage
        const localData = Utils.loadFromStorage('map_progress');
        
        // Use the most recent data (local or provided)
        const mapData = localData || data;
        
        if (!mapData) return;
        
        this.currentDistance = mapData.currentDistance || 0;
        this.lastMonsterSpawnDistance = mapData.lastMonsterSpawnDistance || 0;
        this.currentDungeonLevel = mapData.currentDungeonLevel || 1;
        this.isMoving = false; // Always start stopped for safety
        this.currentSpeed = this.baseSpeed; // Reset speed on load
        
        // Load and set dungeon location
        if (mapData.dungeonLocation && typeof DungeonSystem !== 'undefined') {
            DungeonSystem.selectDungeon(mapData.dungeonLocation.id);
            this.currentDistance = mapData.dungeonLocation.distance;
            this.currentDungeonLevel = mapData.dungeonLocation.level;
        }
        
        this.updateDistanceDisplay();
        console.log('Loaded map progress:', this.currentDistance);
    },

    /**
     * Update distance and trigger saves
     * @param {number} deltaTime - Time since last update
     */
    updateDistance: function(deltaTime) {
        if (!this.isMoving) return;

        const distanceMoved = this.currentSpeed * deltaTime;
        this.currentDistance += distanceMoved;
        
        // Update display
        this.updateDistanceDisplay();
        
        // Save locally every 2 seconds
        if (!this._lastLocalSave || Date.now() - this._lastLocalSave > 2000) {
            this.saveData();
            this._lastLocalSave = Date.now();
        }
    },
    
    /**
     * Handle dungeon level completion
     */
    handleDungeonLevelCompletion: function() {
        // Reset distance for next level
        this.currentDistance = 0;
        this.lastMonsterSpawnDistance = 0;
        
        if (this.currentDungeonLevel < this.maxDungeonLevels) {
            // Clear existing monsters
            if (window.MonsterSystem) {
                MonsterSystem.clearAllMonsters();
            }
            
            // Reset character positions
            if (window.CharacterSystem) {
                CharacterSystem.characters.forEach(char => {
                    char.x = 100;
                    char.y = char.groundY;
                    if (char.element) {
                        char.element.style.left = `${char.x}px`;
                        char.element.style.top = `${char.y}px`;
                    }
                });
            }
        } else {
            this.onDungeonComplete();
        }
    },
    
    updateDungeonLevel: function(newLevel) {
        // Update filter opacity
        if (this.mapFilter) {
            const opacity = (newLevel - 1) * 0.02; // 2% per level
            this.mapFilter.style.opacity = opacity.toString();
        }
        
        // Notify dungeon system
        if (window.DungeonSystem) {
            DungeonSystem.onDungeonLevelAdvance(newLevel);
        }
        
        // Show level up notification
        Utils.showNotification(
            `Dungeon Level ${newLevel}!`,
            'Monsters are stronger and larger!',
            3000
        );
    },
    
    /**
     * Handle dungeon completion
     */
    onDungeonComplete: function() {
        // Stop movement
        this.stopMovement();
        
        // Show completion message
        Utils.showNotification(
            'Dungeon Cleared!',
            'You have completed all levels of this dungeon!',
            5000
        );
        
        // Notify dungeon system
        if (window.DungeonSystem) {
            DungeonSystem.onDungeonComplete();
        }
    }
};

/**
 * Map generation utilities
 */
const MapGenerator = {
    /**
     * Generate a new map
     * @param {string} theme - Map theme ('cyberpunk', 'wasteland', 'neon', etc.)
     * @returns {Object} Map configuration
     */
    generateMap: function(theme = 'cyberpunk') {
        // Base map configuration
        const map = {
            theme: theme,
            width: 10000,
            backgroundImage: 'img/mainmap1.png',
            monsterDensity: 1.0,
            itemDensity: 0.5,
            obstacles: []
        };
        
        // Adjust properties based on theme
        switch (theme) {
            case 'wasteland':
                map.monsterDensity = 1.2;
                map.itemDensity = 0.3;
                break;
            case 'neon':
                map.monsterDensity = 0.8;
                map.itemDensity = 0.7;
                break;
            // Add more themes as needed
        }
        
        // Generate obstacles
        map.obstacles = this.generateObstacles(map.width, theme);
        
        return map;
    },
    
    /**
     * Generate obstacles for a map
     * @param {number} mapWidth - Width of the map
     * @param {string} theme - Map theme
     * @returns {Array} Array of obstacle objects
     */
    generateObstacles: function(mapWidth, theme) {
        const obstacles = [];
        const obstacleCount = Math.floor(mapWidth / 500); // One obstacle every 500 distance
        
        for (let i = 0; i < obstacleCount; i++) {
            // Position obstacles evenly throughout the map
            const position = (i + 0.5) * 500 + Utils.randomInt(-100, 100);
            
            // Skip positions too close to start or end
            if (position < 200 || position > mapWidth - 200) {
                continue;
            }
            
            // Generate obstacle based on theme
            let obstacle;
            switch (theme) {
                case 'cyberpunk':
                    obstacle = {
                        type: ['barrier', 'debris', 'terminal'][Utils.randomInt(0, 2)],
                        position: position,
                        width: Utils.randomInt(50, 150),
                        height: Utils.randomInt(50, 200)
                    };
                    break;
                case 'wasteland':
                    obstacle = {
                        type: ['rock', 'wreckage', 'crater'][Utils.randomInt(0, 2)],
                        position: position,
                        width: Utils.randomInt(50, 200),
                        height: Utils.randomInt(50, 150)
                    };
                    break;
                case 'neon':
                    obstacle = {
                        type: ['hologram', 'barrier', 'sign'][Utils.randomInt(0, 2)],
                        position: position,
                        width: Utils.randomInt(50, 100),
                        height: Utils.randomInt(100, 250)
                    };
                    break;
                // Add more themes as needed
            }
            
            obstacles.push(obstacle);
        }
        
        return obstacles;
    }
};
