/**
 * Utility functions for the game
 */
const Utils = {
    /**
     * Generate a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Calculate distance between two points
     * @param {Object} point1 - First point {x, y}
     * @param {Object} point2 - Second point {x, y}
     * @returns {number} Distance
     */
    distance: function(point1, point2) {
        return Math.sqrt(
            Math.pow(point2.x - point1.x, 2) + 
            Math.pow(point2.y - point1.y, 2)
        );
    },
    
    /**
     * Check if two objects overlap
     * @param {Object} obj1 - First object {x, y, width, height}
     * @param {Object} obj2 - Second object {x, y, width, height}
     * @param {number} threshold - Overlap threshold in pixels
     * @returns {boolean} True if objects overlap
     */
    checkOverlap: function(obj1, obj2, threshold = 0) {
        return (
            obj1.x < obj2.x + obj2.width - threshold &&
            obj1.x + obj1.width - threshold > obj2.x &&
            obj1.y < obj2.y + obj2.height - threshold &&
            obj1.y + obj1.height - threshold > obj2.y
        );
    },
    
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {*} data - Data to save
     */
    saveToStorage: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },
    
    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @returns {*} Loaded data or null if not found
     */
    loadFromStorage: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return null;
        }
    },
    
    /**
     * Clear data from localStorage
     * @param {string} key - Storage key
     */
    clearStorage: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error clearing localStorage:', e);
        }
    },
    
    /**
     * Remove data from localStorage (alias for clearStorage)
     * @param {string} key - Storage key
     */
    removeFromStorage: function(key) {
        this.clearStorage(key);
    },
    
    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },
    
    /**
     * Create a damage text animation
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string|number} text - Text to display
     * @param {string} color - Text color (default: #ff0000)
     * @param {boolean} isCritical - Whether this is a critical hit
     */
    createDamageText: function(x, y, text, color = "#ff0000", isCritical = false) {
        // Get or create the damage text container
        let container = document.getElementById('damage-text-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'damage-text-container';
            container.style.position = 'absolute';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.pointerEvents = 'none';
            container.style.zIndex = '1000';
            document.body.appendChild(container);
        }
        
        // Create the damage text element
        const damageText = document.createElement('div');
        damageText.className = isCritical ? 'damage-text critical' : 'damage-text';
        damageText.textContent = text;
        damageText.style.position = 'absolute';
        damageText.style.left = `${x}px`;
        damageText.style.top = `${y}px`;
        damageText.style.color = color;
        damageText.style.transform = 'translate(-50%, 0)';
        damageText.style.animation = isCritical ? 'critical-damage-fade 1.2s forwards' : 'damage-fade 1s forwards';
        
        // Add a splash effect for critical hits
        if (isCritical) {
            const splash = document.createElement('div');
            splash.className = 'critical-splash';
            splash.style.position = 'absolute';
            splash.style.top = '50%';
            splash.style.left = '50%';
            splash.style.width = '120px';
            splash.style.height = '120px';
            splash.style.borderRadius = '50%';
            splash.style.background = 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%)';
            splash.style.animation = 'critical-splash 0.8s forwards';
            splash.style.transform = 'translate(-50%, -50%)';
            splash.style.zIndex = '-1';
            damageText.appendChild(splash);
        }
        
        // Add to container
        container.appendChild(damageText);
        
        // Remove after animation completes
        setTimeout(() => {
            if (damageText.parentNode) {
                damageText.remove();
            }
        }, isCritical ? 1200 : 1000);
    },
    
    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {string} type - Notification type (default, success, warning, error)
     * @param {number} duration - Duration in milliseconds
     */
    showNotification: function(message, type = 'default', duration = 3000) {
        // Get or create notifications container
        let container = document.getElementById('notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.maxWidth = '300px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.marginBottom = '10px';
        notification.style.padding = '10px 15px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50px)';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
                notification.style.color = 'white';
                break;
            case 'warning':
                notification.style.backgroundColor = 'rgba(255, 152, 0, 0.9)';
                notification.style.color = 'white';
                break;
            case 'error':
                notification.style.backgroundColor = 'rgba(244, 67, 54, 0.9)';
                notification.style.color = 'white';
                break;
            case 'loot':
                notification.style.backgroundColor = 'rgba(156, 39, 176, 0.9)';
                notification.style.color = 'white';
                break;
            default:
                notification.style.backgroundColor = 'rgba(33, 33, 33, 0.9)';
                notification.style.color = 'white';
        }
        
        // Add close button
        const closeButton = document.createElement('span');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '5px';
        closeButton.style.right = '10px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '16px';
        closeButton.style.fontWeight = 'bold';
        closeButton.addEventListener('click', () => {
            closeNotification();
        });
        notification.appendChild(closeButton);
        
        // Add to container
        container.appendChild(notification);
        
        // Trigger animation after a short delay
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Close the notification
        const closeNotification = () => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(50px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        };
        
        // Auto-close after duration
        if (duration > 0) {
            setTimeout(() => {
                closeNotification();
            }, duration);
        }
    },
    
    /**
     * Show a modal dialog
     * @param {string} modalId - Modal element ID
     */
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.style.display = 'block';
        
        // Add fade-in animation
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        // Set focus trap
        this.trapFocusInModal(modal);
    },
    
    /**
     * Hide a modal dialog
     * @param {string} modalId - Modal element ID
     */
    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Add fade-out animation
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        
        // Release focus trap
        this.releaseFocusTrap();
    },
    
    /**
     * Trap focus within a modal
     * @param {HTMLElement} modal - Modal element
     */
    trapFocusInModal: function(modal) {
        // Get all focusable elements
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Set initial focus
        firstElement.focus();
        
        // Add keydown event listener
        this.focusTrapListener = function(e) {
            // Check for Tab key
            if (e.key === 'Tab') {
                // Shift + Tab
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } 
                // Tab
                else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
            
            // Close on Escape
            if (e.key === 'Escape') {
                // Find the active modal
                const activeModal = document.querySelector('.modal[style*="display: block"]');
                if (activeModal) {
                    const modalId = activeModal.id;
                    Utils.hideModal(modalId);
                }
            }
        };
        
        document.addEventListener('keydown', this.focusTrapListener);
    },
    
    /**
     * Release focus trap
     */
    releaseFocusTrap: function() {
        if (this.focusTrapListener) {
            document.removeEventListener('keydown', this.focusTrapListener);
            this.focusTrapListener = null;
        }
    },
    
    /**
     * Calculate level based on experience
     * @param {number} experience - Total experience
     * @returns {number} Character level
     */
    calculateLevel: function(experience) {
        if (experience < 0) return 1;
        
        // Simple level formula: level = 1 + floor(experience / 1000)
        // This gives one level per 1000 experience
        return 1 + Math.floor(experience / 1000);
    },
    
    /**
     * Format a number with commas as thousands separators
     * @param {number} number - Number to format
     * @returns {string} Formatted number string
     */
    formatNumber: function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    /**
     * Get the appropriate map background based on dungeon or context
     * @returns {string} Path to background image
     */
    getMapBackground: function() {
        // Check if we have a stored background
        if (this._currentBackground) {
            return this._currentBackground;
        }
        
        // Check if DungeonSystem is available and has a current dungeon
        if (typeof DungeonSystem !== 'undefined' && DungeonSystem.currentDungeon) {
            return DungeonSystem.currentDungeon.backgroundImage || 'img/mainmap1.png';
        }
        
        // Default background if no dungeon system or current dungeon
        return 'img/mainmap1.png';
    },
    
    /**
     * Set the current map background
     * @param {string} backgroundPath - Path to the background image
     */
    setMapBackground: function(backgroundPath) {
        if (!backgroundPath) return;
        this._currentBackground = backgroundPath;
    }
};
