const CharacterDeath = {
    /**
     * Handle character death
     * @param {Object} character - The character that died
     */
    handleDeath: function(character) {
        if (!character || character.isDead) return;
        
        // Mark character as dead
        character.isDead = true;
        
        // Disable all actions
        character.canMove = false;
        character.canAttack = false;
        character.isAttacking = false;
        
        // Clear any ongoing animations or states
        character.currentAnimation = "sit";
        character.attackTarget = null;
        character.pendingProjectile = null;
        
        // Update sprite to sitting (death) pose
        if (character.mapElement) {
            character.mapElement.style.backgroundImage = `url(${character.sitSprite})`;
            character.mapElement.style.backgroundPosition = "0 0";
            character.mapElement.style.width = `${character.width}px`;
            
            // Add death visual effects
            character.mapElement.style.filter = "grayscale(100%) brightness(70%)";
            character.mapElement.style.opacity = "0.8";
        }
        
        // Show death message
        Utils.createDamageText(
            character.x + character.width / 2,
            character.y,
            "TERMINATED",
            "#ff0000"
        );
        
        // Update UI if necessary
        if (window.UIManager) {
            UIManager.updateCharacterHpBar(character);
            UIManager.updateCharacterStatsDisplay(character);
        }
        
        // Disable character controls
        this.disableCharacterControls(character);
    },
    
    /**
     * Disable all character controls
     * @param {Object} character - The dead character
     */
    disableCharacterControls: function(character) {
        // Remove event listeners or disable controls
        if (character.controlsEnabled) {
            document.removeEventListener('keydown', character.handleKeyDown);
            document.removeEventListener('keyup', character.handleKeyUp);
            character.controlsEnabled = false;
        }
        
        // Clear any movement or combat intervals
        if (character.movementInterval) {
            clearInterval(character.movementInterval);
            character.movementInterval = null;
        }
        
        if (character.combatInterval) {
            clearInterval(character.combatInterval);
            character.combatInterval = null;
        }
    }
};