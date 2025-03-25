/**
 * Dungeon system for the Cyberpunk MMORPG game
 * Handles dungeon selection and management
 */

const DungeonSystem = {
    // Available dungeons
    dungeons: [
        {
            id: 'cyber_slums',
            name: 'Cyber Slums',
            description: 'A dangerous area filled with street gangs and basic security bots.',
            difficulty: 1,
            backgroundImage: 'img/cyber_slums.png', // Customizable background for beginner dungeon
            monsterTypes: ['slime', 'snekk', 'mindflayer'],
            recommendedLevel: 1,
            rewards: {
                copperMultiplier: 1,
                experienceMultiplier: 1
            }
        },
        {
            id: 'neon_district',
            name: 'Neon District',
            description: 'A vibrant nightlife area with enhanced security forces and corporate guards.',
            difficulty: 2,
            backgroundImage: 'img/neon_district.png', // Unique background for intermediate dungeon
            monsterTypes: ['chimeradog', 'booger', 'draco'],
            recommendedLevel: 5,
            rewards: {
                copperMultiplier: 2,
                experienceMultiplier: 1.3
            }
        },
        {
            id: 'corporate_plaza',
            name: 'Corporate Plaza',
            description: 'A high-security zone with corporate elite guards and mechanized units.',
            difficulty: 3,
            backgroundImage: 'img/corporate_plaza.png', // Unique background for advanced dungeon
            monsterTypes: ['chimeradog', 'chip'],
            recommendedLevel: 10,
            rewards: {
                copperMultiplier: 3,
                experienceMultiplier: 1.6
            }
        },
        {
            id: 'data_nexus',
            name: 'Data Nexus',
            description: 'The digital core with advanced AI security protocols and virtual entities.',
            difficulty: 4,
            backgroundImage: 'img/data_nexus.png', // Reusing intermediate dungeon background with different monsters
            monsterTypes: ['mindflayer', 'glitch', 'draco'],
            recommendedLevel: 15,
            rewards: {
                copperMultiplier: 4,
                experienceMultiplier: 2.0
            }
        },
        {
            id: 'quantum_void',
            name: 'Quantum Void',
            description: 'A reality-bending realm with unpredictable physics and powerful entities.',
            difficulty: 5,
            backgroundImage: 'img/quantum_void.png', // Reusing advanced dungeon background with different monsters
            monsterTypes: ['glitch', 'draco', 'Bitzee'],
            recommendedLevel: 20,
            rewards: {
                copperMultiplier: 5,
                experienceMultiplier: 2.5
            }
        }
    ],
    
    // Currently selected dungeon
    currentDungeon: null,
    
    /**
     * Initialize the dungeon system
     * @param {Object} savedData - Saved dungeon data (optional)
     */
    init: function(savedData = null) {
        // Force start in Cyber Slums regardless of saved data
        this.currentDungeon = this.getDungeonById('cyber_slums');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Force select the Cyber Slums dungeon
        this.selectDungeon('cyber_slums');
        
        // Update UI to reflect the selection
        const dungeonSelect = document.getElementById('dungeon-select');
        if (dungeonSelect) {
            dungeonSelect.value = 'cyber_slums';
        }
    },
    
    /**
     * Set up dungeon UI event listeners
     */
    setupEventListeners: function() {
        // Dungeon button
        const dungeonButton = document.getElementById('dungeon-button');
        if (dungeonButton) {
            dungeonButton.addEventListener('click', () => {
                this.openDungeonSelectionUI();
            });
        }
    },
    
    /**
     * Get a dungeon by ID
     * @param {string} id - Dungeon ID
     * @returns {Object|null} Dungeon object or null if not found
     */
    getDungeonById: function(id) {
        return this.dungeons.find(dungeon => dungeon.id === id);
    },
    
    /**
     * Select a dungeon
     * @param {string} dungeonId - Dungeon ID
     * @param {Object} [savedState] - Optional saved dungeon state
     * @returns {boolean} True if dungeon was selected
     */
    selectDungeon: function(dungeonId, savedState = null) {
        const dungeon = this.getDungeonById(dungeonId);
        if (!dungeon) {
            console.error(`Invalid dungeon ID: ${dungeonId}`);
            return false;
        }
        
        // Update current dungeon
        this.currentDungeon = dungeon;
        
        // Play dungeon music
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.playDungeonMusic(dungeonId);
        }
        
        // Update map background with the dungeon's custom background image
        this.updateMapBackground(dungeon.backgroundImage);
        
        // Reset the map progress or use saved state
        if (typeof MapSystem !== 'undefined') {
            if (savedState) {
                MapSystem.currentDistance = savedState.distance || 0;
                MapSystem.currentDungeonLevel = savedState.level || 1;
            } else {
                // Only reset if no saved state is provided
                MapSystem.currentDistance = 0;
                MapSystem.currentDungeonLevel = 1;
            }
            MapSystem.lastMonsterSpawnDistance = 0;
            MapSystem.allowedMonsterTypes = dungeon.monsterTypes;
            MapSystem.monsterSpawnRate = 0.08 + (dungeon.difficulty * 0.01);
        }

        return true;
    },
    
    /**
     * Update reward multipliers based on the current dungeon
     */
    updateRewardMultipliers: function() {
        if (!this.currentDungeon) return;
        
        // Update copper rewards
        const copperMultiplier = this.currentDungeon.rewards.copperMultiplier || 1;
        // Set a global multiplier that other systems can use
        window.dungeonCopperMultiplier = copperMultiplier;
        
        // Update experience rewards
        const experienceMultiplier = this.currentDungeon.rewards.experienceMultiplier || 1;
        window.dungeonExperienceMultiplier = experienceMultiplier;
    },
    
    /**
     * Open the dungeon selection UI
     */
    openDungeonSelectionUI: function() {
        // Create or get the dungeon selection modal
        let dungeonModal = document.getElementById('dungeon-selection-modal');
        if (!dungeonModal) {
            dungeonModal = this.createDungeonSelectionModal();
        }
        
        // Show the modal
        Utils.showModal('dungeon-selection-modal');
        
        // Initialize the Three.js environment after the modal is shown
        setTimeout(() => {
            if (typeof DungeonThreeEnvironment !== 'undefined' && DungeonThreeEnvironment.init) {
                // Initialize the environment if not already initialized
                if (!DungeonThreeEnvironment.scene) {
                    DungeonThreeEnvironment.init('dungeon-three-container');
                }
                
                // Update the info panel with current dungeon details
                this.updateSelectedDungeonInfo();
            } else {
                console.error('DungeonThreeEnvironment not available');
                // Fallback to traditional dungeon list if Three.js not available
                this.updateDungeonList(dungeonModal);
            }
        }, 100);
    },
    
    /**
     * Generate HTML for difficulty star rating
     * @param {number} difficulty - Difficulty level (1-5)
     * @returns {string} - HTML string with star rating
     */
    getStarsHtml: function(difficulty) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= difficulty) {
                stars += '<span class="star">★</span>';
            } else {
                stars += '<span class="star-empty">★</span>';
            }
        }
        return stars;
    },
    
    /**
     * Update the selected dungeon information in the info panel
     */
    updateSelectedDungeonInfo: function() {
        const dungeonInfoPanel = document.getElementById('dungeon-selected-info');
        if (!dungeonInfoPanel || !this.currentDungeon) return;
        
        // Create dungeon selection dropdown
        let dungeonOptions = '';
        this.dungeons.forEach(dungeon => {
            const selected = (dungeon.id === this.currentDungeon.id) ? 'selected' : '';
            dungeonOptions += `<option value="${dungeon.id}" ${selected}>${dungeon.name}</option>`;
        });
        
        // Update with current dungeon info
        dungeonInfoPanel.innerHTML = `
            <button class="enter-dungeon-button" id="enter-selected-dungeon">ENTER DUNGEON</button>
            
            <div class="dungeon-navigation">
                <div class="dungeon-selector">
                    <label for="dungeon-select">SELECT DUNGEON:</label>
                    <select id="dungeon-select" class="cyberpunk-select">
                        ${dungeonOptions}
                    </select>
                </div>
                <div class="dungeon-navigation-hint">
                    <span>TIP: Click on a dungeon in the list below to select</span>
                </div>
            </div>
            
            <div class="dungeon-list-view">
                <h3 class="dungeon-list-title">AVAILABLE DUNGEONS</h3>
                <div class="dungeon-quick-list">
                    ${this.dungeons.map(dungeon => `
                        <div class="dungeon-list-item ${dungeon.id === this.currentDungeon.id ? 'active' : ''}" data-id="${dungeon.id}">
                            <span class="dungeon-difficulty-indicator">
                                ${this.getStarsHtml(dungeon.difficulty)}
                            </span>
                            <span class="dungeon-list-name">${dungeon.name}</span>
                            <span class="dungeon-level-req">Lvl ${dungeon.recommendedLevel}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="dungeon-detail-header">
                <div class="dungeon-detail-name">${this.currentDungeon.name}</div>
                <div class="dungeon-difficulty">
                    ${this.getStarsHtml(this.currentDungeon.difficulty)}
                    <span class="difficulty-level">LVL ${this.currentDungeon.difficulty}</span>
                </div>
            </div>
            
            <div class="dungeon-description">
                ${this.currentDungeon.description}
            </div>
            
            <div class="dungeon-detail-stats">
                <div class="stat-block">
                    <div class="stat-block-title">RECOMMENDED LEVEL</div>
                    <div class="stat-block-value">${this.currentDungeon.recommendedLevel}</div>
                </div>
                
                <div class="stat-block">
                    <div class="stat-block-title">COPPER REWARD</div>
                    <div class="stat-block-value">${this.currentDungeon.rewards.copperMultiplier}x</div>
                </div>
                
                <div class="stat-block">
                    <div class="stat-block-title">XP REWARD</div>
                    <div class="stat-block-value">${this.currentDungeon.rewards.experienceMultiplier}x</div>
                </div>
                
                <div class="stat-block">
                    <div class="stat-block-title">MONSTER TYPES</div>
                    <div class="stat-block-value">${this.currentDungeon.monsterTypes.join(', ')}</div>
                </div>
            </div>
        `;
        
        // Add event listener to dropdown selector
        const dungeonSelect = document.getElementById('dungeon-select');
        if (dungeonSelect) {
            dungeonSelect.addEventListener('change', (e) => {
                const selectedDungeonId = e.target.value;
                // Use DungeonThreeEnvironment to select the dungeon if available
                if (typeof DungeonThreeEnvironment !== 'undefined' && DungeonThreeEnvironment.selectDungeon) {
                    DungeonThreeEnvironment.selectDungeon(selectedDungeonId);
                } else {
                    // Fallback to direct selection
                    this.selectDungeon(selectedDungeonId);
                    this.updateSelectedDungeonInfo();
                }
            });
        }
        
        // Add event listeners to dungeon list items
        const dungeonListItems = document.querySelectorAll('.dungeon-list-item');
        dungeonListItems.forEach(item => {
            item.addEventListener('click', () => {
                const dungeonId = item.getAttribute('data-id');
                if (dungeonId) {
                    // Use DungeonThreeEnvironment to select the dungeon if available
                    if (typeof DungeonThreeEnvironment !== 'undefined' && DungeonThreeEnvironment.selectDungeon) {
                        DungeonThreeEnvironment.selectDungeon(dungeonId);
                    } else {
                        // Fallback to direct selection
                        this.selectDungeon(dungeonId);
                        this.updateSelectedDungeonInfo();
                    }
                    
                    // Update active state in UI
                    dungeonListItems.forEach(el => el.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        });
        
        // Add event listener to enter button
        const enterButton = document.getElementById('enter-selected-dungeon');
        if (enterButton) {
            enterButton.addEventListener('click', () => {
                // Get the currently selected dungeon from the dropdown to ensure correct selection
                const dungeonSelect = document.getElementById('dungeon-select');
                let dungeonId;
                
                if (dungeonSelect && dungeonSelect.value) {
                    // Use the value from the dropdown which should be up-to-date
                    dungeonId = dungeonSelect.value;
                } else if (this.currentDungeon) {
                    // Fallback to current dungeon if dropdown not found
                    dungeonId = this.currentDungeon.id;
                } else {
                    // Final fallback to first dungeon
                    dungeonId = this.dungeons[0].id;
                }
                
                console.log("Entering dungeon: " + dungeonId);
                
                // Force selection of the dungeon (even if it's already selected, this ensures proper application)
                this.selectDungeon(dungeonId);
                
                // Update UI to reflect the selection
                if (dungeonSelect) {
                    dungeonSelect.value = dungeonId;
                }
                
                // Then hide the modal to return to gameplay
                Utils.hideModal('dungeon-selection-modal');
                
                // Give user feedback that they've entered the dungeon
                Utils.showNotification(
                    `Entering ${this.currentDungeon.name}`,
                    `Difficulty: ${this.currentDungeon.difficulty} | Level: ${this.currentDungeon.recommendedLevel}`,
                    3000
                );
                
                // Dispose of Three.js resources when leaving
                if (typeof DungeonThreeEnvironment !== 'undefined' && DungeonThreeEnvironment.dispose) {
                    DungeonThreeEnvironment.dispose();
                }
            });
        }
    },
    
    /**
     * Create the dungeon selection modal
     * @returns {HTMLElement} The dungeon selection modal element
     */
    createDungeonSelectionModal: function() {
        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'dungeon-selection-modal';
        modal.className = 'modal';
        
        // Modal content with cyberpunk styling and Three.js container
        modal.innerHTML = `
            <div class="modal-content cyberpunk-modal">
                <div class="modal-header">
                    <h2 class="modal-title">NEURAL IMMERSION: DUNGEONS</h2>
                    <span class="close-modal" onclick="Utils.hideModal('dungeon-selection-modal')">&times;</span>
                </div>
                <div class="modal-body">
                    <!-- Three.js container for dungeon visualization -->
                    <div id="dungeon-three-container" class="dungeon-three-container"></div>
                    
                    <!-- Text information about the selected dungeon -->
                    <div class="dungeon-info-panel">
                        <div class="dungeon-selected-info" id="dungeon-selected-info">
                            <div class="info-message">Interact with the holographic displays to select a dungeon</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the document
        document.body.appendChild(modal);
        
        // Add styles for the dungeon selection modal
        const style = document.createElement('style');
        style.textContent = `
            .dungeon-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-height: 70vh;
                overflow-y: auto;
            }
            
            .dungeon-item {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                padding: 15px;
                background-color: rgba(0, 0, 0, 0.3);
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            .dungeon-item:hover {
                background-color: rgba(0, 0, 0, 0.5);
            }
            
            .dungeon-item.selected {
                background-color: rgba(40, 80, 120, 0.5);
                border: 1px solid #4e8cc2;
            }
            
            .dungeon-info {
                display: flex;
                flex-direction: column;
            }
            
            .dungeon-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
                color: #ffcc00;
            }
            
            .dungeon-description {
                font-size: 14px;
                color: #cccccc;
                margin-bottom: 10px;
            }
            
            .dungeon-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 5px;
                font-size: 12px;
            }
            
            .dungeon-stat {
                display: flex;
                align-items: center;
            }
            
            .dungeon-stat-name {
                font-weight: bold;
                margin-right: 5px;
                color: #aaaaaa;
            }
            
            .dungeon-stat-value {
                color: #ffffff;
            }
            
            .dungeon-preview {
                background-size: cover;
                background-position: center;
                border-radius: 3px;
                height: 100px;
            }
            
            .enter-dungeon-button {
                grid-column: span 2;
                width: 100%;
                padding: 10px;
                background-color: #4e8cc2;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                margin-top: 10px;
            }
            
            .enter-dungeon-button:hover {
                background-color: #3a6b94;
            }
            
            /* Difficulty stars */
            .difficulty-stars {
                display: flex;
                gap: 2px;
                margin-bottom: 5px;
            }
            
            .star {
                color: #ffcc00;
            }
            
            .star-empty {
                color: #555555;
            }
        `;
        document.head.appendChild(style);
        
        return modal;
    },
    
    /**
     * Update the dungeon list in the selection modal
     * @param {HTMLElement} modal - Dungeon selection modal element
     */
    updateDungeonList: function(modal) {
        const dungeonList = modal.querySelector('#dungeon-list');
        if (!dungeonList) return;
        
        // Clear existing list
        dungeonList.innerHTML = '';
        
        // Add each dungeon
        this.dungeons.forEach(dungeon => {
            // Create dungeon item element
            const dungeonItem = document.createElement('div');
            dungeonItem.className = `dungeon-item ${this.currentDungeon && this.currentDungeon.id === dungeon.id ? 'selected' : ''}`;
            dungeonItem.dataset.id = dungeon.id;
            
            // Difficulty stars
            const difficultyStars = document.createElement('div');
            difficultyStars.className = 'difficulty-stars';
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('span');
                star.textContent = '★';
                star.className = i <= dungeon.difficulty ? 'star' : 'star-empty';
                difficultyStars.appendChild(star);
            }
            
            // Dungeon info
            const dungeonInfo = document.createElement('div');
            dungeonInfo.className = 'dungeon-info';
            
            const dungeonName = document.createElement('div');
            dungeonName.className = 'dungeon-name';
            dungeonName.textContent = dungeon.name;
            dungeonInfo.appendChild(dungeonName);
            
            dungeonInfo.appendChild(difficultyStars);
            
            const dungeonDescription = document.createElement('div');
            dungeonDescription.className = 'dungeon-description';
            dungeonDescription.textContent = dungeon.description;
            dungeonInfo.appendChild(dungeonDescription);
            
            const dungeonStats = document.createElement('div');
            dungeonStats.className = 'dungeon-stats';
            
            // Recommended level
            const levelStat = document.createElement('div');
            levelStat.className = 'dungeon-stat';
            
            const levelName = document.createElement('span');
            levelName.className = 'dungeon-stat-name';
            levelName.textContent = 'Level:';
            levelStat.appendChild(levelName);
            
            const levelValue = document.createElement('span');
            levelValue.className = 'dungeon-stat-value';
            levelValue.textContent = dungeon.recommendedLevel;
            levelStat.appendChild(levelValue);
            
            dungeonStats.appendChild(levelStat);
            
            // Copper multiplier
            const copperStat = document.createElement('div');
            copperStat.className = 'dungeon-stat';
            
            const copperName = document.createElement('span');
            copperName.className = 'dungeon-stat-name';
            copperName.textContent = 'Copper:';
            copperStat.appendChild(copperName);
            
            const copperValue = document.createElement('span');
            copperValue.className = 'dungeon-stat-value';
            copperValue.textContent = `${dungeon.rewards.copperMultiplier}x`;
            copperStat.appendChild(copperValue);
            
            dungeonStats.appendChild(copperStat);
            
            // Experience multiplier
            const expStat = document.createElement('div');
            expStat.className = 'dungeon-stat';
            
            const expName = document.createElement('span');
            expName.className = 'dungeon-stat-name';
            expName.textContent = 'XP:';
            expStat.appendChild(expName);
            
            const expValue = document.createElement('span');
            expValue.className = 'dungeon-stat-value';
            expValue.textContent = `${dungeon.rewards.experienceMultiplier}x`;
            expStat.appendChild(expValue);
            
            dungeonStats.appendChild(expStat);
            
            // Monsters
            const monsterStat = document.createElement('div');
            monsterStat.className = 'dungeon-stat';
            
            const monsterName = document.createElement('span');
            monsterName.className = 'dungeon-stat-name';
            monsterName.textContent = 'Monsters:';
            monsterStat.appendChild(monsterName);
            
            const monsterValue = document.createElement('span');
            monsterValue.className = 'dungeon-stat-value';
            monsterValue.textContent = dungeon.monsterTypes.join(', ');
            monsterStat.appendChild(monsterValue);
            
            dungeonStats.appendChild(monsterStat);
            
            dungeonInfo.appendChild(dungeonStats);
            
            dungeonItem.appendChild(dungeonInfo);
            
            // Dungeon preview
            const dungeonPreview = document.createElement('div');
            dungeonPreview.className = 'dungeon-preview';
            dungeonPreview.style.backgroundImage = `url(${dungeon.backgroundImage})`;
            dungeonPreview.style.backgroundSize = '100% 100%'; // Prevent image from being cut off
            dungeonItem.appendChild(dungeonPreview);
            
            // Enter dungeon button
            const enterButton = document.createElement('button');
            enterButton.className = 'enter-dungeon-button';
            enterButton.textContent = this.currentDungeon && this.currentDungeon.id === dungeon.id ? 'Current Dungeon' : 'Enter Dungeon';
            enterButton.disabled = this.currentDungeon && this.currentDungeon.id === dungeon.id;
            enterButton.dataset.id = dungeon.id;
            dungeonItem.appendChild(enterButton);
            
            // Add click event to enter button
            enterButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent item click event
                this.selectDungeon(dungeon.id);
                this.updateDungeonList(modal); // Update list to reflect new selection
            });
            
            dungeonList.appendChild(dungeonItem);
        });
    },
    
    /**
     * Get the current dungeon
     * @returns {Object} Current dungeon
     */
    getCurrentDungeon: function() {
        return this.currentDungeon;
    },
    
    /**
     * Save dungeon data
     */
    saveData: function() {
        Utils.saveToStorage('dungeon', {
            currentDungeonId: this.currentDungeon ? this.currentDungeon.id : null
        });
    },
    
    /**
     * Load dungeon data
     * @returns {Object|null} Loaded dungeon data or null if not found
     */
    loadData: function() {
        return Utils.loadFromStorage('dungeon');
    },
    
    /**
     * Update the map background with a new image
     * @param {string} backgroundImage - Path to the background image
     */
    updateMapBackground: function(backgroundImage) {
        // Verify the image exists
        const img = new Image();
        
        img.onload = () => {
            console.log(`Successfully loaded background: ${backgroundImage}`);
            // Store the background image in Utils for map system to use
            Utils.setMapBackground(backgroundImage);
            
            // Force MapSystem to recreate the backgrounds with the new image
            MapSystem.createBackgrounds();
        };
        
        img.onerror = () => {
            console.error(`Failed to load dungeon background: ${backgroundImage}, using fallback`);
            
            // Use known fallback background that definitely exists
            const fallbackBg = 'img/mainmap1.png';
            Utils.setMapBackground(fallbackBg);
            
            // Force MapSystem to recreate the backgrounds with the fallback image
            MapSystem.createBackgrounds();
        };
        
        // Attempt to load the image
        img.src = backgroundImage;
    },
    
    onDungeonLevelAdvance: function(newLevel) {
        if (!this.currentDungeon) return;
        
        // Update monster types and difficulty
        this.updateDungeonLevel(newLevel);
        
        // Play transition sound (fixed method name)
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.playSound('level_transition');
        }
        
        // Update UI elements
        this.updateDungeonUI(newLevel);
        
        // Scale monster difficulty
        this.currentDungeon.currentLevel = newLevel;
        this.currentDungeon.monsterScaling = Math.pow(1.5, newLevel - 1);
        
        // Save progress
        this.saveData();
    },
    
    updateDungeonLevel: function(level) {
        if (!this.currentDungeon) return;
        
        // Update allowed monster types based on level
        const progress = level / MapSystem.maxDungeonLevels;
        
        if (progress < 0.3) {
            this.currentDungeon.allowedMonsterTypes = ['slime', 'goblin'];
        } else if (progress < 0.6) {
            this.currentDungeon.allowedMonsterTypes = ['goblin', 'skeleton', 'orc'];
        } else if (progress < 0.9) {
            this.currentDungeon.allowedMonsterTypes = ['skeleton', 'orc', 'dragon'];
        } else {
            // Final level - boss heavy
            this.currentDungeon.allowedMonsterTypes = ['orc', 'dragon'];
        }
        
        // Update MapSystem's monster types
        MapSystem.allowedMonsterTypes = this.currentDungeon.allowedMonsterTypes;
    },
    
    onDungeonComplete: function() {
        // Mark dungeon as completed
        if (this.currentDungeon) {
            this.currentDungeon.completed = true;
            this.currentDungeon.highestLevel = MapSystem.maxDungeonLevels;
        }
        
        // Show completion rewards
        this.showDungeonRewards();
        
        // Create and show confirmation dialog
        const nextDungeon = this.getNextAvailableDungeon();
        
        Utils.showConfirmDialog({
            title: 'Dungeon Completed!',
            message: `Congratulations! You've completed ${this.currentDungeon.name}!${
                nextDungeon ? `\n\nWould you like to proceed to ${nextDungeon.name}?` : '\n\nThis was the final dungeon!'
            }`,
            confirmText: nextDungeon ? 'Enter Next Dungeon' : 'Return to Selection',
            cancelText: 'Stay Here',
            onConfirm: () => {
                if (nextDungeon) {
                    // Select the next dungeon
                    this.selectDungeon(nextDungeon.id);
                    
                    // Show notification
                    Utils.showNotification(
                        `Entering ${nextDungeon.name}`,
                        `Difficulty: ${nextDungeon.difficulty} | Level: ${nextDungeon.recommendedLevel}`,
                        3000
                    );
                } else {
                    // Show dungeon selection if no next dungeon
                    this.showDungeonSelection();
                }
            },
            onCancel: () => {
                // Player chose to stay in current dungeon
                // Reset the current dungeon level
                if (typeof MapSystem !== 'undefined') {
                    MapSystem.currentDistance = 0;
                    MapSystem.currentDungeonLevel = 1;
                    MapSystem.lastMonsterSpawnDistance = 0;
                }
            }
        });
        
        // Unlock next dungeon if available
        this.unlockNextDungeon();
        
        // Save completion data
        this.saveData();
    },
    
    showDungeonRewards: function() {
        // Calculate completion rewards
        const rewards = this.calculateDungeonRewards();
        
        // Show rewards modal
        Utils.showModal('dungeon-rewards-modal', {
            title: 'Dungeon Completed!',
            rewards: rewards
        });
    },
    
    /**
     * Get the next available dungeon after the current one
     * @returns {Object|null} Next dungeon object or null if none available
     */
    getNextAvailableDungeon: function() {
        if (!this.currentDungeon) return null;
        
        const currentIndex = this.dungeons.findIndex(d => d.id === this.currentDungeon.id);
        if (currentIndex === -1 || currentIndex === this.dungeons.length - 1) return null;
        
        return this.dungeons[currentIndex + 1];
    }
};
