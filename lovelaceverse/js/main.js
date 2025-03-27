/**
 * Main game logic for the Cyberpunk MMORPG game
 * Initializes and coordinates all game systems
 */

const Game = {
    // Game state
    isRunning: false,
    isPaused: false,
    hasInitialized: false,
    lastFrameTime: 0,
    
    // Game systems
    systems: [
        Utils,
        Currency, // Note: Used as CurrencySystem elsewhere, ensure consistency if needed
        Items,
        Inventory,
        MarketSystem, // Added MarketSystem here
        Abilities,
        BuffSystem,
        CharacterSystem,
        MonsterSystem,
        MapSystem,
        GachaSystem,
        ShardSystem,
        DungeonSystem,
        AudioSystem,
        AuthenticationSystem,
        ProfileDashboard,
        MissionSystem
    ],
    
    /**
     * Initialize the game
     */
    init: function() {
        if (this.hasInitialized) {
            console.log('Game already initialized');
            return;
        }
        
        console.log('Initializing game...');
        
        try {
            // Initialize all game systems
            this.initSystems();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start the game loop
            this.start();
            
            this.hasInitialized = true;
            console.log('Game initialization complete');
        } catch (error) {
            console.error('Error during game initialization:', error);
            throw error;
        }
    },
    
    /**
     * Initialize all game systems
     */
    initSystems: function() {
        // Load saved data
        const savedData = {
            currency: Currency.loadData(),
            inventory: Utils.loadFromStorage('inventory'),
            characters: CharacterSystem.loadData(),
            gacha: GachaSystem.loadData(),
            map: Utils.loadFromStorage('map'),
            shards: ShardSystem.loadData(),
            dungeon: DungeonSystem.loadData() || { currentDungeonId: 'cyber_slums' }, // Load saved dungeon or default
            audio: Utils.loadFromStorage('audio_settings'),
            gameData: Utils.loadFromStorage('gameData') || {}
        };

        // Initialize systems with saved data
        this.systems.forEach(system => {
            if (typeof system.init === 'function') {
                let systemData = null;
                if (system === DungeonSystem) {
                    systemData = savedData.dungeon;
                    // Select the saved dungeon
                    if (systemData && systemData.currentDungeonId) {
                        system.selectDungeon(systemData.currentDungeonId);
                    }
                } else if (system === MapSystem) {
                    systemData = savedData.map;
                }
                system.init(systemData);
            }
        });
    },
    
    /**
     * Set up game event listeners
     */
    setupEventListeners: function() {
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Pause/resume
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    },
    
    /**
     * Handle window resize
     */
    handleResize: function() {
        // Reposition characters
        CharacterSystem.getActiveCharacters().forEach(character => {
            CharacterSystem.positionCharacter(character);
        });
    },
    
    /**
     * First time setup for new players
     */
    firstTimeSetup: function() {
        console.log('First time setup...');
        
        // Give initial currency
        Currency.addCopper(50);
        
        // Add initial items
        Inventory.addItem('health_stim', 3);
        Inventory.addItem('cyber_blade', 1);
        
        // Force start in Cyber Slums
        if (typeof DungeonSystem !== 'undefined') {
            DungeonSystem.selectDungeon('cyber_slums');
        }
        
        // Save initial game data
        Utils.saveToStorage('gameData', {
            firstTimeSetup: true,
            startDate: new Date().toISOString(),
            lastDungeon: 'cyber_slums'
        });
    },
    
    /**
     * Create and add a starter item
     * @param {string} id - Item ID
     * @param {string} name - Item name
     * @param {string} description - Item description
     * @param {string} category - Item category
     * @param {Object} rarity - Item rarity
     * @param {Object} stats - Item stats
     * @param {Array} effects - Item effects
     * @param {Object} extraProps - Extra properties
     */
    createAndAddStarterItem: function(id, name, description, category, rarity, stats = {}, effects = [], extraProps = {}) {
        // Register the item first
        const itemData = {
            id: id,
            name: name,
            category: category,
            rarity: rarity,
            description: description,
            stats: stats,
            effects: effects,
            level: 1,
            ...extraProps
        };
        
        // Register with Items system
        Items.registerItem(itemData);
        
        // Add to inventory
        Inventory.addItem(id, 1);
    },
    
    /**
     * Start the game
     */
    start: function() {
        if (this.isRunning) return;
        
        console.log('Starting game...');
        this.isRunning = true;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        
        // Start game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    
    /**
     * Pause the game
     */
    pause: function() {
        if (!this.isRunning || this.isPaused) return;
        
        console.log('Pausing game...');
        this.isPaused = true;
        
        // Stop map movement
        MapSystem.stopMovement();
    },
    
    /**
     * Resume the game
     */
    resume: function() {
        if (!this.isRunning || !this.isPaused) return;
        
        console.log('Resuming game...');
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        
        // Resume map movement
        MapSystem.startMovement();
        
        // Resume game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    
    /**
     * Stop the game
     */
    stop: function() {
        if (!this.isRunning) return;
        
        console.log('Stopping game...');
        this.isRunning = false;
        this.isPaused = false;
        
        // Stop map movement
        MapSystem.stopMovement();
        
        // Save game data
        this.saveGameData();
    },
    
    /**
     * Main game loop
     * @param {number} timestamp - Current timestamp
     */
    gameLoop: function(timestamp) {
        if (!this.isRunning || this.isPaused) return;
        
        // Calculate delta time
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Update game state
        this.update(deltaTime);
        
        // Continue the loop
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    
    /**
     * Update game state - with performance optimizations
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update: function(deltaTime) {
        // Update map system only if needed
        if (!MapSystem.isMoving) {
            MapSystem.startMovement();
        }

        // Throttle UI updates to improve performance
        // Only update UI every 5 frames (approximately 80ms at 60fps)
        const currentFrame = Math.floor(this.lastFrameTime / 16.667); // frame count at 60fps
        const shouldUpdateUI = currentFrame % 5 === 0;

        // Update characters
        CharacterSystem.updateCharacters(deltaTime);
        
        // Update monsters
        MonsterSystem.updateMonsters(deltaTime);
        
        // Less frequent UI updates to reduce DOM operations
        if (shouldUpdateUI) {
            const activeCharacter = this.getActiveCharacter();
            if (activeCharacter && window.UIManager) {
                UIManager.updateCharacterStatsDisplay(activeCharacter);
            }
        }
    },
    
    /**
     * Save all game data
     */
    saveGameData: function() {
        // Each system should save its own data
        Currency.saveData();
        Utils.saveToStorage('inventory', Inventory.saveData());
        CharacterSystem.saveData();
        GachaSystem.saveData();
        ShardSystem.saveData();
        DungeonSystem.saveData();  // This saves the current dungeon
        Utils.saveToStorage('map', MapSystem.saveData());
        
        // Save general game data
        Utils.saveToStorage('gameData', {
            lastSaved: new Date().toISOString(),
            playTime: this.getPlayTime(),
            firstTimeSetup: true,
            lastDungeon: DungeonSystem.getCurrentDungeon()?.id || 'cyber_slums'  // Backup dungeon tracking
        });
    },
    
    /**
     * Get total play time in seconds
     * @returns {number} Play time in seconds
     */
    getPlayTime: function() {
        const gameData = Utils.loadFromStorage('gameData') || {};
        const startDate = gameData.startDate ? new Date(gameData.startDate) : new Date();
        const playTime = gameData.playTime || 0;
        
        // Add time since last save
        return playTime + (new Date() - startDate) / 1000;
    },
    
    /**
     * Handle map completion
     * Called by MapSystem when the player reaches the end of the map
     */
    onMapCompleted: function() {
        console.log('Map completed!');
        
        // Reset buffs
        BuffSystem.resetForNewDungeon();
        
        // Award bonus currency
        Currency.addCopper(1000);
        
        // Show completion message
        Utils.createDamageText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            'Dungeon Completed!',
            '#ffff00'
        );
    },
    
    /**
     * Create a monster
     * @param {string} type - Monster type
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object} Created monster
     */
    createMonster: function(type, x, y) {
        return MonsterSystem.createMonster(type, x, y);
    },
    
    /**
     * Get the active character
     * @returns {Object|null} Active character or null if none
     */
    getActiveCharacter: function() {
        return CharacterSystem.getActiveCharacter();
    },
    
    /**
     * Get all active characters
     * @returns {Array} Array of active characters
     */
    getActiveCharacters: function() {
        return CharacterSystem.getActiveCharacters();
    },
    
    /**
     * Update character stats
     * Recalculates stats for a specific character or all active characters
     * @param {string|null} characterId - Optional character ID, if null updates all active characters
     */
    updateCharacterStats: function(characterId = null) {
        if (characterId) {
            // Update specific character
            const character = CharacterSystem.getCharacterById(characterId);
            if (character) {
                CharacterSystem.calculateDerivedStats(character);
            }
        } else {
            // Update all active characters
            CharacterSystem.getActiveCharacters().forEach(character => {
                CharacterSystem.calculateDerivedStats(character);
            });
        }
    }
};

// Remove the timeout-based initialization from index.html
// The loading screen will handle initialization
