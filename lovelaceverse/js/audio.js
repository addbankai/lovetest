/**
 * Audio system for the Cyberpunk MMORPG game
 * Handles sound effects, background music and volume control
 */

const AudioSystem = {
    // Add initialized flag
    initialized: false,
    
    // Sound effects
    soundEffects: {
        click: 'music/click.mp3',
        attackSprite: 'music/attackSprite.mp3',
        rangedSprite: 'music/rangedSprite.mp3',
        magicSprite: 'music/magicSprite.mp3',
        level_transition: 'music/level_transition.mp3',
        level_up: 'https://cdn.freesound.org/previews/573/573343_5674468-lq.mp3', // Level up fanfare
        critical_hit: 'https://cdn.freesound.org/previews/435/435417_4929074-lq.mp3' // Critical hit impact
    },
    
    // Background music mapping dungeon IDs to their music files
    backgroundMusic: {
        cyber_slums: 'music/neon_district.mp3',     // Verified file exists
        neon_district: 'music/neon_district.mp3',   // Verified file exists
        corporate_plaza: 'music/corporate_plaza.mp3', // Verified file exists
        data_nexus: 'music/data_nexus.mp3',         // Verified file exists
        quantum_void: 'music/quantum_void.mp3',     // Verified file exists
        lovecity: 'music/lovecity.mp3'              // Verified file exists
    },
    
    // Audio elements
    bgmElement: null,
    
    // Volume settings
    volume: 0.05, // Default volume 50%
    isMuted: false,
    currentBgm: null,
    
    /**
     * Initialize the audio system
     * @returns {boolean} True if initialization was successful
     */
    init: function() {
        // Prevent multiple initializations
        if (this.initialized) {
            return true;
        }

        console.log('Initializing AudioSystem...');
        
        try {
            // Create BGM element
            this.bgmElement = document.createElement('audio');
            this.bgmElement.id = 'bgm-player';
            this.bgmElement.loop = true;
            document.body.appendChild(this.bgmElement);
            
            // Load volume settings from storage or use defaults
            const savedVolume = Utils.loadFromStorage('audio_volume');
            if (savedVolume !== null) {
                this.volume = parseFloat(savedVolume);
            }
            
            const savedMuted = Utils.loadFromStorage('audio_muted');
            if (savedMuted !== null) {
                this.isMuted = savedMuted === 'true';
            }
            
            // Set up user interaction tracking
            const markUserInteraction = () => {
                document.documentElement.setAttribute('data-user-interacted', 'true');
                // If there's pending BGM, play it
                if (this.pendingBgm) {
                    this.playBackgroundMusic(this.pendingBgm);
                    this.pendingBgm = null;
                }
                // Remove listeners after first interaction
                ['click', 'keydown', 'touchstart'].forEach(event => {
                    document.removeEventListener(event, markUserInteraction);
                });
            };
            
            // Add interaction listeners
            ['click', 'keydown', 'touchstart'].forEach(event => {
                document.addEventListener(event, markUserInteraction, { once: true });
            });
            
            // Create audio controls UI
            this.createAudioControls();
            
            // Set initial volume
            this.updateVolumeUI();
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize AudioSystem:', error);
            return false;
        }
    },
    
    /**
     * Create audio controls UI
     */
    createAudioControls: function() {
        const container = document.createElement('div');
        container.id = 'audio-controls';
        container.className = 'audio-controls';
        
        const audioIconClass = this.isMuted ? 'muted' : 'unmuted';
        
        // Create dropdown for volume levels
        let volumeOptions = '';
        const volumeLevels = [
            { value: '0', label: 'Mute' },
            { value: '0.2', label: 'Low' },
            { value: '0.5', label: 'Med' },
            { value: '0.8', label: 'High' },
            { value: '1', label: 'Max' }
        ];
        
        // Find closest volume match
        let selectedValue = this.isMuted ? '0' : 
            volumeLevels.reduce((prev, curr) => 
                Math.abs(parseFloat(curr.value) - this.volume) < Math.abs(parseFloat(prev.value) - this.volume) 
                    ? curr : prev
            ).value;
        
        volumeLevels.forEach(level => {
            const selected = level.value === selectedValue ? 'selected' : '';
            volumeOptions += `<option value="${level.value}" ${selected}>${level.label}</option>`;
        });
        
        container.innerHTML = 
            '<div class="audio-controls-panel">' +
                '<button id="audio-toggle" class="audio-button">' +
                    '<i class="audio-icon ' + audioIconClass + '"></i>' +
                '</button>' +
                '<div class="volume-dropdown-container">' +
                    '<select id="volume-dropdown" class="volume-dropdown">' +
                        volumeOptions +
                    '</select>' +
                '</div>' +
            '</div>';
        
        document.body.appendChild(container);
        
        // Add event listeners
        const panel = container.querySelector('.audio-controls-panel');
        const audioToggle = document.getElementById('audio-toggle');
        const volumeDropdown = document.getElementById('volume-dropdown');
        
        // Toggle expanded state on button click
        audioToggle.addEventListener('click', () => {
            panel.classList.toggle('expanded');
            if (!panel.classList.contains('expanded')) {
                this.toggleMute();
            }
        });
        
        // Handle volume changes
        if (volumeDropdown) {
            volumeDropdown.addEventListener('change', (e) => {
                const newVolume = parseFloat(e.target.value);
                this.setVolume(newVolume);
                if (newVolume > 0 && this.isMuted) {
                    this.toggleMute();
                } else if (newVolume === 0 && !this.isMuted) {
                    this.toggleMute();
                }
            });
        }
        
        // Close expanded panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                panel.classList.remove('expanded');
            }
        });
    },
    
    /**
     * Update volume UI to match current settings
     */
    updateVolumeUI: function() {
        const audioToggle = document.getElementById('audio-toggle');
        const volumeDropdown = document.getElementById('volume-dropdown');
        
        if (audioToggle) {
            const icon = audioToggle.querySelector('.audio-icon');
            if (icon) {
                if (this.isMuted) {
                    icon.classList.remove('unmuted');
                    icon.classList.add('muted');
                } else {
                    icon.classList.remove('muted');
                    icon.classList.add('unmuted');
                }
            }
        }
        
        if (volumeDropdown) {
            if (this.isMuted) {
                volumeDropdown.value = '0';
            } else {
                // Find closest volume preset
                const currentVolume = this.volume;
                let closestValue = '0.5';
                let minDiff = 1;
                
                Array.from(volumeDropdown.options).forEach(option => {
                    const diff = Math.abs(parseFloat(option.value) - currentVolume);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestValue = option.value;
                    }
                });
                
                volumeDropdown.value = closestValue;
            }
        }
        
        // Update BGM volume
        if (this.bgmElement) {
            this.bgmElement.volume = this.isMuted ? 0 : this.volume;
        }
    },
    
    /**
     * Play a sound effect
     * @param {string} soundName - Name of the sound effect to play
     */
    playSoundEffect: function(soundName) {
        if (this.isMuted) return;
        
        const soundPath = this.soundEffects[soundName];
        if (!soundPath) {
            console.error(`Sound effect not found: ${soundName}`);
            return;
        }
        
        const audio = new Audio(soundPath);
        audio.volume = this.volume;
        
        // Play audio only if user has interacted with the document
        if (document.documentElement.getAttribute('data-user-interacted') === 'true') {
            audio.play().catch(error => {
                console.error(`Error playing sound effect: ${error}`);
            });
        }
    },
    
    /**
     * Play background music
     * @param {string} musicId - ID of the music to play
     */
    playBackgroundMusic: function(musicId) {
        // Initialize if not already done
        if (!this.bgmElement) {
            this.init();
        }
        
        if (!this.bgmElement) {
            console.error('BGM element failed to initialize');
            return;
        }
        
        const musicPath = this.backgroundMusic[musicId];
        if (!musicPath) {
            console.error(`Background music not found for ID: ${musicId}`);
            return;
        }
        
        // If already playing this BGM, don't restart it
        if (this.currentBgm === musicId && !this.bgmElement.paused) {
            return;
        }
        
        // Stop current BGM if playing
        this.stopBackgroundMusic();
        
        // Set new BGM
        this.bgmElement.src = musicPath;
        this.bgmElement.volume = this.isMuted ? 0 : this.volume;
        this.currentBgm = musicId;
        
        // Add error handling for audio loading
        this.bgmElement.onerror = (e) => {
            console.error(`Failed to load BGM file: ${musicPath}`, e);
        };
        
        // Check if user has interacted with the page
        if (document.documentElement.getAttribute('data-user-interacted') === 'true') {
            this.bgmElement.play().catch(error => {
                console.error('Failed to play BGM:', error);
            });
        } else {
            // Queue the music to play on first interaction
            const playOnInteraction = () => {
                this.bgmElement.play().catch(error => {
                    console.error('Failed to play BGM:', error);
                });
                
                // Remove listeners after first interaction
                ['click', 'keydown', 'touchstart'].forEach(event => {
                    document.removeEventListener(event, playOnInteraction);
                });
            };
            
            // Add interaction listeners
            ['click', 'keydown', 'touchstart'].forEach(event => {
                document.addEventListener(event, playOnInteraction, { once: true });
            });
            
            // Store the pending music ID
            this.pendingBgm = musicId;
        }
    },
    
    /**
     * Stop background music
     */
    stopBackgroundMusic: function() {
        if (!this.bgmElement) return;
        
        this.bgmElement.pause();
        this.bgmElement.currentTime = 0;
        this.currentBgm = null;
    },
    
    /**
     * Set volume level
     * @param {number} volume - Volume level from 0 to 1
     */
    setVolume: function(volume) {
        // Ensure volume is between 0 and 1
        this.volume = Math.max(0, Math.min(1, parseFloat(volume)));
        
        // Update BGM volume
        if (this.bgmElement) {
            this.bgmElement.volume = this.isMuted ? 0 : this.volume;
        }
        
        // Save volume setting
        Utils.saveToStorage('audio_volume', this.volume.toString());
        
        // Update UI
        this.updateVolumeUI();
    },
    
    /**
     * Toggle mute state
     */
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        
        // Update BGM volume
        if (this.bgmElement) {
            this.bgmElement.volume = this.isMuted ? 0 : this.volume;
        }
        
        // Save mute setting
        Utils.saveToStorage('audio_muted', this.isMuted.toString());
        
        // Update UI
        this.updateVolumeUI();
    },
    
    /**
     * Play click sound effect
     * Used for button clicks
     */
    playClickSound: function() {
        this.playSoundEffect('click');
    },
    
    /**
     * Play a sound effect
     * @param {string} soundName - Name of the sound effect to play
     */
    playSound: function(soundName) {
        this.playSoundEffect(soundName);
    },
    
    /**
     * Play dungeon music
     * @param {string} dungeonId - ID of the dungeon to play music for
     */
    playDungeonMusic: function(dungeonId) {
        console.log('Playing dungeon music for:', dungeonId);
        this.playBackgroundMusic(dungeonId);
    }
};
