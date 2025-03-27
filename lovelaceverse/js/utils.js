/**
 * Utility functions for the Cyberpunk MMORPG game
 */

const Utils = {
    /**
     * Format a number with commas for thousands
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    /**
     * Initialize utilities
     */
    init: function() {
        // Set default map background to love_city.png
        this.setMapBackground('img/love_city.png');
        
        // Create fallback map background (only used if image fails to load)
        this.createMapBackground();
    },
    
    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId: function() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    },
    
    /**
     * Get a random integer between min and max (inclusive)
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
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * Check if two objects overlap
     * @param {Object} obj1 - First object {x, y, width, height}
     * @param {Object} obj2 - Second object {x, y, width, height}
     * @param {number} threshold - Minimum overlap in pixels
     * @returns {boolean} True if objects overlap
     */
    checkOverlap: function(obj1, obj2, threshold = 0) {
        return (
            obj1.x < obj2.x + obj2.width - threshold &&
            obj1.x + obj1.width > obj2.x + threshold &&
            obj1.y < obj2.y + obj2.height - threshold &&
            obj1.y + obj1.height > obj2.y + threshold
        );
    },
    
    /**
     * Calculate level based on experience
     * @param {number} experience - Experience points
     * @returns {number} Level
     */
    calculateLevel: function(experience) {
        // Simple level calculation: level = sqrt(experience / 100) + 1
        return Math.floor(Math.sqrt(experience / 100)) + 1;
    },
    
    /**
     * Create a damage text element
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string|number} text - Text to display
     * @param {string} color - Text color
     */
    createDamageText: function(x, y, text, color = '#ff0000') {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;
        
        // Create element
        const element = document.createElement('div');
        element.className = 'damage-text';
        element.textContent = text;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.color = color;
        
        // Add to container
        gameContainer.appendChild(element);
        
        // Animate
        let opacity = 1;
        let posY = y;
        
        const animate = () => {
            opacity -= 0.02;
            posY -= 1;
            
            element.style.opacity = opacity;
            element.style.top = `${posY}px`;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                element.remove();
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    /**
     * Show a modal
     * @param {string} modalId - Modal ID
     */
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    },
    
    /**
     * Hide a modal
     * @param {string} modalId - Modal ID
     */
    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {*} data - Data to save
     */
    saveToStorage: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving to localStorage: ${error}`);
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
        } catch (error) {
            console.error(`Error loading from localStorage: ${error}`);
            return null;
        }
    },
    
    /**
     * Remove data from localStorage
     * @param {string} key - Storage key to remove
     */
    removeFromStorage: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage: ${error}`);
        }
    },
    
    /**
     * Create a map background image
     */
    createMapBackground: function() {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Draw sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, 400);
        skyGradient.addColorStop(0, '#000033');
        skyGradient.addColorStop(1, '#0066cc');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, 400);
        
        // Draw ground
        const groundGradient = ctx.createLinearGradient(0, 400, 0, canvas.height);
        groundGradient.addColorStop(0, '#333333');
        groundGradient.addColorStop(1, '#111111');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, 400, canvas.width, 200);
        
        // Draw stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * 300;
            const size = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw distant buildings
        ctx.fillStyle = '#222222';
        for (let i = 0; i < 20; i++) {
            const x = i * 60;
            const height = 100 + Math.random() * 150;
            const width = 40 + Math.random() * 30;
            ctx.fillRect(x, 400 - height, width, height);
        }
        
        // Draw neon lights
        const neonColors = ['#ff00ff', '#00ffff', '#ffff00', '#ff6600'];
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * canvas.width;
            const y = 250 + Math.random() * 150;
            const width = 5 + Math.random() * 20;
            const height = 2 + Math.random() * 5;
            ctx.fillStyle = neonColors[Math.floor(Math.random() * neonColors.length)];
            ctx.fillRect(x, y, width, height);
        }
        
        // Create image element
        const img = new Image();
        img.src = canvas.toDataURL();
        
        // Save to localStorage for reuse
        localStorage.setItem('map_background', img.src);
    },
    
    /**
     * Get the map background image URL
     * @returns {string} Image URL
     */
    getMapBackground: function() {
        // First check if a custom dungeon background is set
        const customBackground = localStorage.getItem('current_map_background');
        if (customBackground) {
            return customBackground;
        }
        // Fall back to the default generated background
        return localStorage.getItem('map_background');
    },
    
    /**
     * Set the current map background image
     * @param {string} backgroundImage - Path to the background image
     */
    setMapBackground: function(backgroundImage) {
        localStorage.setItem('current_map_background', backgroundImage);
    },
    
    /**
     * Show a notification message
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {number} duration - Duration in milliseconds
     */
    showNotification: function(title, message, duration = 3000) {
        // Create notification container if it doesn't exist
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '20px';
            notificationContainer.style.left = '50%';
            notificationContainer.style.transform = 'translateX(-50%)';
            notificationContainer.style.zIndex = '1000';
            notificationContainer.style.width = '300px';
            notificationContainer.style.pointerEvents = 'none';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        notification.style.color = '#fff';
        notification.style.borderRadius = '5px';
        notification.style.padding = '15px';
        notification.style.marginBottom = '10px';
        notification.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        notification.style.transform = 'translateY(-20px)';
        notification.style.opacity = '0';
        notification.style.transition = 'transform 0.3s, opacity 0.3s';
        
        // Add title
        const titleElement = document.createElement('div');
        titleElement.className = 'notification-title';
        titleElement.textContent = title;
        titleElement.style.fontSize = '18px';
        titleElement.style.fontWeight = 'bold';
        titleElement.style.marginBottom = '5px';
        titleElement.style.color = '#ffcc00';
        notification.appendChild(titleElement);
        
        // Add message
        const messageElement = document.createElement('div');
        messageElement.className = 'notification-message';
        messageElement.textContent = message;
        messageElement.style.fontSize = '14px';
        notification.appendChild(messageElement);
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.style.transform = 'translateY(-20px)';
            notification.style.opacity = '0';
            
            // Remove element after animation completes
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    },
    
    /**
     * Show a confirmation dialog
     * @param {Object} options - Dialog options
     */
    showConfirmDialog: function(options) {
        const modal = document.createElement('div');
        modal.className = 'modal cyberpunk-modal confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${options.title}</h2>
                </div>
                <div class="modal-body">
                    <p>${options.message.replace(/\n/g, '<br>')}</p>
                </div>
                <div class="modal-footer">
                    <button class="confirm-button">${options.confirmText || 'Confirm'}</button>
                    <button class="cancel-button">${options.cancelText || 'Cancel'}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.confirm-button').addEventListener('click', () => {
            modal.remove();
            if (options.onConfirm) options.onConfirm();
        });
        
        modal.querySelector('.cancel-button').addEventListener('click', () => {
            modal.remove();
            if (options.onCancel) options.onCancel();
        });
    }
};
