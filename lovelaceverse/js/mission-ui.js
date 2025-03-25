/**
 * Mission UI handler
 */
const MissionUI = {
    /**
     * Initialize mission UI
     */
    init: function() {
        console.log('Initializing Mission UI...');
        // Check if container exists
        const container = document.getElementById('mission-container');
        if (!container) {
            console.error('Mission container not found! Creating it...');
            const newContainer = document.createElement('div');
            newContainer.id = 'mission-container';
            document.body.appendChild(newContainer);
        }
        
        this.createMissionPanel();
        this.updateMissionList();
        this.setupEventListeners();
    },

    /**
     * Create mission panel in the game UI
     */
    createMissionPanel: function() {
        console.log('Creating mission panel...');
        const existingPanel = document.getElementById('mission-panel');
        if (existingPanel) {
            console.log('Panel already exists, removing old one');
            existingPanel.remove();
        }

        const panel = document.createElement('div');
        panel.id = 'mission-panel';
        panel.innerHTML = `
            <div id="mission-panel-canvas"></div>
            <div class="panel-header">
                <h2>Active Missions</h2>
                <button id="mission-minimize-btn" class="mission-minimize" type="button">−</button>
            </div>
            <div class="mission-list"></div>
        `;

        const container = document.getElementById('mission-container');
        if (container) {
            container.appendChild(panel);
            // Initialize p5.js effects
            MissionPanelEffects.init();
            console.log('Mission panel created and effects initialized');
        } else {
            console.error('Container not found after creation attempt');
        }
    },

    /**
     * Setup event listeners for mission UI
     */
    setupEventListeners: function() {
        console.log('Setting up event listeners...');
        
        const minimizeBtn = document.getElementById('mission-minimize-btn');
        const panel = document.getElementById('mission-panel');
        
        console.log('Minimize button found:', minimizeBtn);
        console.log('Panel found:', panel);
        
        if (minimizeBtn && panel) {
            // Set initial icon (underscore for open panel)
            minimizeBtn.textContent = '─';
            
            minimizeBtn.addEventListener('click', (e) => {
                console.log('Minimize button clicked!');
                panel.classList.toggle('minimized');
                // Change icon based on minimized state
                minimizeBtn.textContent = panel.classList.contains('minimized') ? '📜' : '─';
                e.preventDefault();
                e.stopPropagation();
            });
            console.log('Event listener attached to minimize button');
        } else {
            console.error('Failed to find minimize button or panel');
        }

        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                // Update mission list
                this.updateMissionList();
            });
        });

        // Add click handlers for claim buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('claim-button')) {
                const missionId = e.target.dataset.missionId;
                if (missionId) {
                    // Disable button immediately to prevent double-clicks
                    e.target.disabled = true;
                    
                    if (this.claimReward(missionId)) {
                        // Add temporary visual feedback
                        e.target.textContent = 'Claimed!';
                        setTimeout(() => {
                            this.updateMissionList(); // Refresh the entire list
                        }, 500);
                    } else {
                        // Re-enable button if claim failed
                        e.target.disabled = false;
                    }
                }
            }
        });
    },

    /**
     * Claim reward for a mission
     * @param {string} missionId - ID of the mission
     * @returns {boolean} - Whether the claim was successful
     */
    claimReward: function(missionId) {
        if (MissionSystem.claimRewards(missionId)) {
            // Show a notification
            if (window.NotificationSystem) {
                NotificationSystem.show({
                    title: 'Rewards Claimed!',
                    message: 'Mission rewards have been added to your inventory.',
                    type: 'success',
                    duration: 3000
                });
            }

            // Add a brief animation before removing
            const missionElement = document.querySelector(`[data-mission-id="${missionId}"]`);
            if (missionElement) {
                missionElement.style.animation = 'fadeOutAndSlideUp 0.5s forwards';
                setTimeout(() => {
                    this.updateMissionList(); // Refresh the list after animation
                }, 500);
            }

            return true;
        }
        return false;
    },

    /**
     * Update mission list display
     */
    updateMissionList: function() {
        const missionList = document.querySelector('.mission-list');
        if (!missionList) return;

        const missions = MissionSystem.activeMissions.daily.concat(MissionSystem.activeMissions.weekly);
        
        if (missions.length === 0) {
            missionList.innerHTML = `
                <div class="mission-item">
                    <div class="mission-description">No active missions available.</div>
                </div>
            `;
            return;
        }

        missionList.innerHTML = missions.map(mission => {
            // Calculate progress percentage
            const objective = mission.objectives[0]; // Assuming first objective for now
            const progress = objective.progress || 0;
            const progressPercent = Math.min((progress / objective.count) * 100, 100);
            
            return `
                <div class="mission-item ${mission.completed ? 'completed' : ''}" data-mission-id="${mission.id}">
                    <div class="mission-title">${mission.name}</div>
                    <div class="mission-description">${mission.description}</div>
                    
                    <div class="mission-progress-container">
                        <div class="mission-progress-bar">
                            <div class="mission-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="mission-progress-text">${progress}/${objective.count}</div>
                    </div>
                    
                    <div class="mission-rewards">
                        ${this.formatRewards(mission.rewards)}
                    </div>
                    
                    ${mission.completed && !mission.claimed ? `
                        <button class="claim-button" data-mission-id="${mission.id}">
                            Claim Rewards
                        </button>
                    ` : mission.claimed ? `
                        <div class="claimed-text">Claimed</div>
                    ` : ''}
                </div>
            `;
        }).join('');
    },

    /**
     * Format rewards for display
     * @param {Object} rewards - Reward object
     */
    formatRewards: function(rewards) {
        let rewardText = [];
        
        if (rewards.copper) {
            rewardText.push(`<span class="reward copper">₵${rewards.copper}</span>`);
        }
        if (rewards.experience) {
            rewardText.push(`<span class="reward exp">✧${rewards.experience} EXP</span>`);
        }
        if (rewards.items) {
            rewards.items.forEach(item => {
                rewardText.push(`<span class="reward item">◈${item.quantity}x ${item.id}</span>`);
            });
        }
        
        return rewardText.join(' ');
    },

    /**
     * Get display name for an item
     * @param {string} itemId - ID of the item
     * @returns {string} Display name of the item
     */
    getItemDisplayName: function(itemId) {
        const itemNames = {
            'health_stim': 'Health Stimulant',
            'cyber_blade': 'Cyber Blade',
            'rare_gacha_ticket': 'Rare Gacha Ticket',
            // Add more items as needed
        };
        
        return itemNames[itemId] || itemId;
    }
};

// Ensure initialization happens after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing MissionUI');
    MissionUI.init();
});


