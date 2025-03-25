/**
 * Equipment Modal and Tooltip Enhancer for Cyberpunk RPG Game
 * Adds improved styling and functionality to character equipment modals and item tooltips
 */

const EquipmentEnhancer = {
    // Initialized flag
    initialized: false,
    
    /**
     * Initialize the equipment enhancer
     */
    init: function() {
        if (this.initialized) return;
        
        // Add CSS stylesheet to head
        this.addStylesheet();
        
        console.log("Equipment Modal Enhancer initialized");
        this.initialized = true;
    },
    
    /**
     * Add CSS stylesheets to page head
     */
    addStylesheet: function() {
        // Equipment tooltips CSS
        const tooltipsLink = document.createElement('link');
        tooltipsLink.rel = 'stylesheet';
        tooltipsLink.type = 'text/css';
        tooltipsLink.href = 'css/equipment-tooltips.css';
        document.head.appendChild(tooltipsLink);
        
        // Character popover CSS
        const popoverLink = document.createElement('link');
        popoverLink.rel = 'stylesheet';
        popoverLink.type = 'text/css';
        popoverLink.href = 'css/character-popover.css';
        document.head.appendChild(popoverLink);
    }
};

// Initialize the equipment enhancer when the page loads
document.addEventListener('DOMContentLoaded', function() {
    EquipmentEnhancer.init();
});
