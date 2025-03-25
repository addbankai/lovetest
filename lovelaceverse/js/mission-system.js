    /**
 * Mission system for the Cyberpunk MMORPG game
 * Handles daily and weekly missions, tracking, and rewards
 */

    const MissionSystem = {
        // Active missions for the player
        activeMissions: {
            daily: [],
            weekly: []
        },
    
        // Mission templates
        missionTemplates: {
            daily: [
                {
                    id: 'monster_hunt',
                    type: 'kill',
                    name: 'Cyber Extermination',
                    description: 'Eliminate 10 monsters in any dungeon',
                    objectives: [
                        { type: 'kill_monsters', count: 10 }
                    ],
                    rewards: {
                        copper: 1000,
                        items: [
                            { id: 'plasma_cell', quantity: 50 }
                        ]
                    }
                },
                {
                    id: 'item_collect',
                    type: 'collect',
                    name: 'Scrap Collector',
                    description: 'Collect 20 scrap metal',
                    objectives: [
                        { type: 'collect_item', itemId: 'scrap_metal', count: 20 }
                    ],
                    rewards: {
                        copper: 800,
                        items: [
                            { id: 'circuit_board', quantity: 50 }
                        ]
                    }
                },
                {
                    id: 'craft_items',
                    type: 'craft',
                    name: 'Master Crafter',
                    description: 'Craft 5 items of any type',
                    objectives: [
                        { type: 'craft_items', count: 5 }
                    ],
                    rewards: {
                        copper: 1500,
                        items: [
                            { id: 'dark_matter_shard', quantity: 1 }
                        ]
                    }
                },
                {
                    id: 'gacha_pulls',
                    type: 'gacha',
                    name: 'DNA Researcher',
                    description: 'Perform 3 DNA extractions',
                    objectives: [
                        { type: 'perform_gacha', count: 3 }
                    ],
                    rewards: {
                        silver: 10,
                        items: [
                            { id: 'quantum_core', quantity: 1 }
                        ]
                    }
                }
            ],
            weekly: [
                {
                    id: 'boss_hunter',
                    type: 'boss',
                    name: 'Corporate Takedown',
                    description: 'Defeat 5 dungeon bosses', // Fixed description
                    objectives: [
                        { type: 'kill_bosses', count: 5 }
                    ],
                    rewards: {
                        gold: 1,
                        items: [
                            { id: 'quantum_core', quantity: 2 }
                        ]
                    }
                }
            ]
        },
    
        missionChains: {
            cyber_initiation: {
                id: 'cyber_initiation',
                name: 'Cyber Initiation',
                steps: [
                    {
                        id: 'step1',
                        name: 'First Steps',
                        description: 'Complete a dungeon run',
                        objectives: [
                            { type: 'complete_dungeons', count: 1 }
                        ],
                        rewards: {
                            copper: 1000
                        }
                    },
                    {
                        id: 'step2',
                        name: 'Growing Stronger',
                        description: 'Defeat 5 monsters',
                        objectives: [
                            { type: 'kill_monsters', count: 5 }
                        ],
                        rewards: {
                            silver: 5
                        }
                    }
                ]
            }
        },
    
        // Add a flag to track initialization
        initialized: false,
    
        /**
         * Initialize the mission system
         */
        init: function() {
            // Prevent multiple initializations
            if (this.initialized) {
                console.log('Mission system already initialized, skipping...');
                return;
            }
    
            console.log('Initializing mission system...');
            
            // Clean up any existing listeners first
            this.cleanup();
            
            this.loadMissionProgress();
            this.setupEventListeners();
            this.checkAndResetMissions();
            
            if (this.activeMissions.daily.length === 0) {
                this.generateDailyMissions();
            }
            if (this.activeMissions.weekly.length === 0) {
                this.generateMissions('weekly');
            }
            
            this.updateUI();
            this.initialized = true;
            
            console.log('Mission system initialized with missions:', this.activeMissions);
        },
    
        /**
         * Load saved mission progress
         */
        loadMissionProgress: function() {
            const savedProgress = Utils.loadFromStorage('mission_progress') || {};
            this.activeMissions = savedProgress.activeMissions || { daily: [], weekly: [] };
            this.lastDailyReset = savedProgress.lastDailyReset || 0;
            this.lastWeeklyReset = savedProgress.lastWeeklyReset || 0;
        },
    
        /**
         * Generate new missions for the player
         * @param {string} type - 'daily' or 'weekly'
         */
        generateMissions: function(type) {
            const templates = this.missionTemplates[type];
            this.activeMissions[type] = templates.map(template => {
                const objective = template.objectives[0];
                const description = template.description.replace('{count}', objective.count);
                return {
                    ...template,
                    description: description,
                    progress: 0,
                    completed: false,
                    claimed: false
                };
            });
            this.saveMissionProgress();
        },
    
        /**
         * Update progress for a specific mission objective
         * @param {string} objectiveType - Type of objective
         * @param {Object} data - Progress data
         */
        updateProgress: function(objectiveType, data) {
            console.log('Updating progress for:', objectiveType, data);
            
            ['daily', 'weekly'].forEach(type => {
                this.activeMissions[type].forEach(mission => {
                    if (mission.completed || mission.claimed) return;
    
                    mission.objectives.forEach(objective => {
                        if (objective.type === objectiveType) {
                            // Handle gacha pulls
                            if (objectiveType === 'perform_gacha') {
                                objective.progress = (objective.progress || 0) + 1;
                                console.log('Updated gacha progress:', objective.progress);
                            }
                            // Handle item collection objectives
                            else if (objectiveType === 'collect_item') {
                                if (objective.itemId === data.itemId) {
                                    objective.progress = (objective.progress || 0) + data.quantity;
                                }
                            }
                            // Handle crafting objectives
                            else if (objectiveType === 'craft_items') {
                                objective.progress = (objective.progress || 0) + data.quantity;
                            }
                            // Handle other objective types
                            else {
                                objective.progress = (objective.progress || 0) + data.quantity;
                            }
    
                            console.log(`Updated ${objectiveType} progress:`, objective.progress);
                            
                            // Check if mission is completed
                            if (objective.progress >= objective.count) {
                                this.checkMissionCompletion(mission);
                            }
                        }
                    });
                });
            });
    
            this.saveMissionProgress();
            this.updateUI();
        },
    
        /**
         * Check if a mission is completed
         * @param {Object} mission - Mission to check
         */
        checkMissionCompletion: function(mission) {
            const allCompleted = mission.objectives.every(obj => 
                (obj.progress || 0) >= obj.count
            );
            
            if (allCompleted && !mission.completed) {
                mission.completed = true;
                this.onMissionComplete(mission);
            }
        },
    
        /**
         * Handle mission completion
         * @param {Object} mission - Completed mission
         */
        onMissionComplete: function(mission) {
            console.log(`Mission completed: ${mission.name}`);
            
            // Show completion notification
            if (window.UIManager && UIManager.showNotification) {
                UIManager.showNotification({
                    title: 'Mission Complete!',
                    message: `${mission.name} is ready to claim!`,
                    type: 'success'
                });
            }
            
            this.saveMissionProgress();
            this.updateUI();
        },
    
        /**
         * Claim mission rewards
         * @param {string} missionId - ID of the mission
         * @returns {boolean} Success status
         */
        claimRewards: function(missionId) {
            const mission = this.findMission(missionId);
            if (!mission || !mission.completed || mission.claimed) {
                return false;
            }
    
            // Award rewards
            if (mission.rewards.copper) {
                Currency.addCopper(mission.rewards.copper);
            }
            if (mission.rewards.silver) {
                Currency.addSilver(mission.rewards.silver);
            }
            if (mission.rewards.gold) {
                Currency.addGold(mission.rewards.gold);
            }
    
            // Award items if any
            if (mission.rewards.items && Array.isArray(mission.rewards.items)) {
                mission.rewards.items.forEach(item => {
                    if (Inventory && typeof Inventory.addItem === 'function') {
                        Inventory.addItem(item.id, item.quantity);
                    }
                });
            }
    
            // Mark as claimed
            mission.claimed = true;
    
            // Remove from active missions
            this.removeClaimedMission(missionId);
    
            // Save progress
            this.saveMissionProgress();
    
            return true;
        },
    
        /**
         * Remove a claimed mission from active missions
         * @param {string} missionId - ID of the mission to remove
         */
        removeClaimedMission: function(missionId) {
            this.activeMissions.daily = this.activeMissions.daily.filter(m => m.id !== missionId);
            this.activeMissions.weekly = this.activeMissions.weekly.filter(m => m.id !== missionId);
        },
    
        /**
         * Check and reset missions if needed
         */
        checkAndResetMissions: function() {
            const now = Date.now();
            const dayInMs = 24 * 60 * 60 * 1000;
            const weekInMs = 7 * dayInMs;
    
            // Check daily missions
            if (!this.lastDailyReset || now - this.lastDailyReset >= dayInMs) {
                this.generateMissions('daily');
                this.lastDailyReset = now;
            }
    
            // Check weekly missions
            if (!this.lastWeeklyReset || now - this.lastWeeklyReset >= weekInMs) {
                this.generateMissions('weekly');
                this.lastWeeklyReset = now;
            }
    
            this.saveMissionProgress();
        },
    
        /**
         * Save mission progress to storage
         */
        saveMissionProgress: function() {
            Utils.saveToStorage('mission_progress', {
                activeMissions: this.activeMissions,
                lastDailyReset: this.lastDailyReset,
                lastWeeklyReset: this.lastWeeklyReset
            });
        },
    
        /**
         * Find a mission by ID
         * @param {string} missionId - ID of the mission to find
         * @returns {Object|null} - Mission object or null if not found
         */
        findMission: function(missionId) {
            for (const type of ['daily', 'weekly']) {
                const mission = this.activeMissions[type].find(m => m.id === missionId);
                if (mission) return mission;
            }
            return null;
        },
    
        /**
         * Set up event listeners for mission-related events
         */
        setupEventListeners: function() {
            console.log('Setting up mission system event listeners');
            
            // Clean up existing listeners first
            this.cleanup();
    
            // Monster kill event listener
            this.boundMonsterKilled = (e) => {
                console.log('Monster killed event received:', e.detail);
                // Update regular monster kill objectives
                this.updateProgress('kill_monsters', { quantity: 1 });
                
                // If it's a boss, update boss kill objectives
                if (e.detail.isBoss) {
                    this.updateProgress('kill_bosses', { quantity: 1 });
                }
            };
    
            // Item collection event listener
            this.boundItemCollected = (e) => {
                console.log('Item collected event received:', e.detail);
                const { itemId, quantity } = e.detail;
                this.updateProgress('collect_item', { itemId, quantity });
            };
    
            // Add crafting event listener
            this.boundItemCrafted = (e) => {
                console.log('Item crafted event received:', e.detail);
                this.updateProgress('craft_items', { quantity: 1 });
            };
    
            // Add gacha pull event listener
            this.boundGachaPull = (e) => {
                console.log('Gacha pull event received:', e.detail);
                this.updateProgress('perform_gacha', { quantity: 1 });
            };
    
            // Add event listeners
            document.addEventListener('monsterKilled', this.boundMonsterKilled);
            document.addEventListener('itemCollected', this.boundItemCollected);
            document.addEventListener('itemCrafted', this.boundItemCrafted);
            document.addEventListener('gachaPull', this.boundGachaPull);
            
            console.log('Mission system event listeners set up');
        },
    
        /**
         * Update the mission UI
         */
        updateUI: function() {
            if (typeof MissionUI !== 'undefined' && MissionUI.updateMissionList) {
                MissionUI.updateMissionList();
            }
        },
    
        generateDailyMissions: function() {
            // Add some default missions
            this.activeMissions.daily = [
                {
                    id: 'daily_monster_hunt',
                    name: 'Monster Hunter',
                    description: 'Kill 10 monsters',
                    objectives: [{ type: 'kill_monsters', count: 10 }],
                    progress: 0,
                    completed: false,
                    claimed: false,
                    rewards: {
                        copper: 1000,
                        experience: 500,
                        items: [{ id: 'health_stim', quantity: 3 }]
                    }
                }
                // Add more daily missions as needed
            ];
        },
    
        startMissionChain: function(chainId) {
            const chain = this.missionChains[chainId];
            if (!chain) return;
            
            const firstStep = chain.steps[0];
            this.activeMissions.daily.push({
                ...firstStep,
                chainId: chainId,
                stepIndex: 0,
                progress: 0,
                completed: false,
                claimed: false
            });
            
            this.saveMissionProgress();
        },
    
        cleanup: function() {
            console.log('Cleaning up mission system event listeners');
            // Remove ALL event listeners
            if (this.boundMonsterKilled) {
                document.removeEventListener('monsterKilled', this.boundMonsterKilled);
            }
            if (this.boundItemCollected) {
                document.removeEventListener('itemCollected', this.boundItemCollected);
            }
            if (this.boundCraftingCompleted) {
                document.removeEventListener('itemCrafted', this.boundCraftingCompleted);
            }
            if (this.boundGachaPullCompleted) {
                document.removeEventListener('gachaPull', this.boundGachaPullCompleted);
            }
            // Reset bound functions
            this.boundMonsterKilled = null;
            this.boundItemCollected = null;
            this.boundCraftingCompleted = null;
            this.boundGachaPullCompleted = null;
        }
    };
    
    // Initialize mission system when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            MissionSystem.init();
        });
    } else {
        MissionSystem.init();
    }
    
    function createMissionElement(mission) {
        return `
            <div class="mission-item mission-item-new">
                <div class="mission-title">${mission.name}</div>
                <div class="mission-description">${mission.description}</div>
                <div class="mission-progress">
                    <div class="mission-progress-bar" style="width: ${(mission.progress / mission.target) * 100}%"></div>
                </div>
                <div class="mission-rewards">
                    ${mission.rewards.map(reward => `
                        <div class="reward-item">
                            <span class="reward-icon">${getRewardIcon(reward.type)}</span>
                            <span>${reward.amount}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    function createMissionPanel() {
        const panel = document.createElement('div');
        panel.className = 'mission-panel';
        panel.innerHTML = `
            <div class="mission-header">
                <h2>Active Missions</h2>
                <span class="mission-minimize">−</span>
            </div>
            <div class="mission-content">
                <!-- Mission items will be inserted here -->
            </div>
        `;
    
        // Add minimize functionality
        const minimizeBtn = panel.querySelector('.mission-minimize');
        minimizeBtn.addEventListener('click', () => {
            panel.classList.toggle('minimized');
            minimizeBtn.textContent = panel.classList.contains('minimized') ? '+' : '−';
        });
    
        return panel;
    }
    
    // Helper function to get reward icons
    function getRewardIcon(type) {
        const icons = {
            copper: '₵',
            silver: 'Ⓢ',
            gold: 'Ⓖ',
            diamond: '◈',
            exp: '✧',
            item: '◈'
        };
        return icons[type] || '•';
    }
    
    // Example of how to dispatch the itemCollected event
    function dispatchItemCollected(itemId, quantity = 1) {
        document.dispatchEvent(new CustomEvent('itemCollected', {
            detail: {
                itemId: itemId,
                quantity: quantity
            }
        }));
    }
    
    
