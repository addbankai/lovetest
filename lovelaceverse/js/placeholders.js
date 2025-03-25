/**
 * Placeholder image generator for the Cyberpunk MMORPG game
 * Creates placeholder images for items, characters, and other game elements
 */

const Placeholders = {
    /**
     * Generate placeholder images for the game
     */
    generatePlaceholders: function() {
        console.log('Generating placeholder images...');
        
        // Create item placeholders
        this.createItemPlaceholders();
        
        // Create monster placeholders
        this.createMonsterPlaceholders();
        
        // Create character placeholders
        this.createCharacterPlaceholders();
    },
    
    /**
     * Create item placeholder images
     */
    createItemPlaceholders: function() {
        // Weapon placeholders
        this.createItemImage('cyber_blade', '#ff6666', '⚔️');
        this.createItemImage('plasma_pistol', '#66ffff', '🔫');
        this.createItemImage('neural_whip', '#ff66ff', '⚡');
        
        // Armor placeholders
        this.createItemImage('synth_vest', '#6666ff', '🛡️');
        this.createItemImage('nano_armor', '#66ff66', '🛡️');
        this.createItemImage('quantum_shield', '#ffff66', '🛡️');
        
        // Accessory placeholders
        this.createItemImage('neural_implant', '#ff66ff', '💎');
        this.createItemImage('reflex_booster', '#66ffff', '⚡');
        this.createItemImage('chrono_amulet', '#ffff66', '⏱️');
        
        // Consumable placeholders
        this.createItemImage('health_stim', '#ff6666', '💉');
        this.createItemImage('energy_drink', '#66ffff', '🧪');
        this.createItemImage('nano_repair', '#66ff66', '🔧');
        
        // Material placeholders
        this.createItemImage('scrap_metal', '#aaaaaa', '🔩');
        this.createItemImage('circuit_board', '#66ff66', '📟');
        this.createItemImage('quantum_core', '#ff66ff', '💠');
    },
    
    /**
     * Create monster placeholder images
     */
    createMonsterPlaceholders: function() {
        // Create enemy placeholder
        this.createMonsterImage('enemy', '#ff6666', '👾');
        this.createMonsterImage('enemyhit', '#ff0000', '👾');
    },
    
    /**
     * Create character placeholder images
     */
    createCharacterPlaceholders: function() {
        // Create character placeholders for different animations
        this.createCharacterImage('devinsit', '#66ffff', '🧍');
        this.createCharacterImage('devinidle', '#66ffff', '🧍');
        this.createCharacterImage('devin', '#66ffff', '🏃');
        this.createCharacterImage('devinattack', '#66ffff', '⚔️');
        this.createCharacterImage('devinranged', '#66ffff', '🏹');
        this.createCharacterImage('devinmagic', '#66ffff', '✨');
    },
    
    /**
     * Create an item placeholder image
     * @param {string} name - Item name
     * @param {string} color - Background color
     * @param {string} symbol - Item symbol
     */
    createItemImage: function(name, color, symbol) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Draw symbol
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, canvas.width / 2, canvas.height / 2);
        
        // Create image element
        const img = new Image();
        img.src = canvas.toDataURL();
        
        // Add to document for debugging
        // document.body.appendChild(img);
        
        // Save to localStorage for reuse
        localStorage.setItem(`placeholder_${name}`, img.src);
    },
    
    /**
     * Create a monster placeholder image
     * @param {string} name - Monster name
     * @param {string} color - Background color
     * @param {string} symbol - Monster symbol
     */
    createMonsterImage: function(name, color, symbol) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Draw symbol
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, canvas.width / 2, canvas.height / 2);
        
        // Create image element
        const img = new Image();
        img.src = canvas.toDataURL();
        
        // Add to document for debugging
        // document.body.appendChild(img);
        
        // Save to localStorage for reuse
        localStorage.setItem(`placeholder_${name}`, img.src);
    },
    
    /**
     * Create a character placeholder image
     * @param {string} name - Character animation name
     * @param {string} color - Background color
     * @param {string} symbol - Character symbol
     */
    createCharacterImage: function(name, color, symbol) {
        const canvas = document.createElement('canvas');
        
        // Determine frame count based on animation type
        let frameCount = 2; // Default for idle and sit
        if (name.includes('attack') || name.includes('ranged')) {
            frameCount = 13;
        } else if (name.includes('magic')) {
            frameCount = 7;
        } else if (!name.includes('idle') && !name.includes('sit')) {
            frameCount = 8; // Running
        }
        
        canvas.width = 64 * frameCount;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Draw frames
        for (let i = 0; i < frameCount; i++) {
            // Draw background
            ctx.fillStyle = color;
            ctx.fillRect(i * 64, 0, 64, 64);
            
            // Draw border
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(i * 64, 0, 64, 64);
            
            // Draw symbol
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbol, i * 64 + 32, 32);
            
            // Draw frame number
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(`${i + 1}`, i * 64 + 32, 54);
        }
        
        // Create image element
        const img = new Image();
        img.src = canvas.toDataURL();
        
        // Add to document for debugging
        // document.body.appendChild(img);
        
        // Save to localStorage for reuse
        localStorage.setItem(`placeholder_${name}`, img.src);
    },
    
    /**
     * Get a placeholder image URL
     * @param {string} name - Placeholder name
     * @returns {string} Image URL
     */
    getPlaceholder: function(name) {
        return localStorage.getItem(`placeholder_${name}`);
    }
};

// Generate placeholders when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Placeholders.generatePlaceholders();
});
