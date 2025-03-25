/**
 * Abilities system for the Cyberpunk MMORPG game
 * Defines character abilities, special attacks, and effects
 */

const Abilities = {
    // Ability registry
    registry: {},
    
    // Ability types
    TYPES: {
        MELEE: 'melee',
        RANGED: 'ranged',
        MAGIC: 'magic',
        SPECIAL: 'special',
        DEFENSIVE: 'defensive',
        HEAL: 'heal',
        UTILITY: 'utility'
    },
    
    /**
     * Initialize the abilities system
     */
    init: function() {
        this.registerAbilities();
    },
    
    /**
     * Register all abilities
     */
    registerAbilities: function() {
        // Melee abilities
        this.registerAbility({
            id: 'power_strike',
            name: 'Power Strike',
            type: this.TYPES.MELEE,
            description: 'A powerful strike that deals 150% damage.',
            cooldown: 5, // seconds
            energyCost: 10,
            damageMultiplier: 1.5,
            range: 100, // Base melee range
            animation: 'attack',
            effect: function(character, target) {
                const damage = Math.round(character.stats.damage * this.damageMultiplier);
                target.takeDamage(damage, character);
                Utils.createDamageText(target.x, target.y - 20, damage);
                return true;
            }
        });
        
        this.registerAbility({
            id: 'whirlwind',
            name: 'Whirlwind',
            type: this.TYPES.MELEE,
            description: 'Spin and hit all enemies within range for 120% damage.',
            cooldown: 8,
            energyCost: 15,
            damageMultiplier: 1.2,
            range: 50,
            animation: 'attack',
            aoe: true,
            effect: function(character, targets) {
                const damage = Math.round(character.stats.damage * this.damageMultiplier);
                
                targets.forEach(target => {
                    target.takeDamage(damage, character);
                    Utils.createDamageText(target.x, target.y - 20, damage);
                });
                
                return true;
            }
        });
        
        // Ranged abilities
        this.registerAbility({
            id: 'precision_shot',
            name: 'Precision Shot',
            type: this.TYPES.RANGED,
            description: 'A precise shot that deals 180% damage and has a 20% chance to critically hit.',
            cooldown: 6,
            energyCost: 12,
            damageMultiplier: 1.8,
            critChance: 0.2,
            critMultiplier: 2.0,
            range: 900,  // Increased from 600 to 900
            animation: 'ranged',
            effect: function(character, target) {
                let damage = Math.round(character.stats.rangeDamage * this.damageMultiplier);
                
                // Check for critical hit
                const isCrit = Math.random() < this.critChance;
                if (isCrit) {
                    damage = Math.round(damage * this.critMultiplier);
                    Utils.createDamageText(target.x, target.y - 20, damage, '#ff00ff');
                } else {
                    Utils.createDamageText(target.x, target.y - 20, damage);
                }
                
                target.takeDamage(damage, character);
                return true;
            }
        });
        
        this.registerAbility({
            id: 'multi_shot',
            name: 'Multi Shot',
            type: this.TYPES.RANGED,
            description: 'Fire multiple shots at up to 3 targets for 100% damage each.',
            cooldown: 10,
            energyCost: 18,
            damageMultiplier: 1.0,
            maxTargets: 3,
            range: 900,  // Increased from 540 to 900
            animation: 'ranged',
            aoe: true,
            effect: function(character, targets) {
                const damage = Math.round(character.stats.rangeDamage * this.damageMultiplier);
                
                // Limit to max targets
                const targetCount = Math.min(targets.length, this.maxTargets);
                
                for (let i = 0; i < targetCount; i++) {
                    targets[i].takeDamage(damage, character);
                    Utils.createDamageText(targets[i].x, targets[i].y - 20, damage);
                }
                
                return true;
            }
        });
        
        // Magic abilities
        this.registerAbility({
            id: 'cyber_blast',
            name: 'Cyber Blast',
            type: this.TYPES.MAGIC,
            description: 'A blast of cyber energy that deals 200% magic damage.',
            cooldown: 7,
            energyCost: 20,
            damageMultiplier: 2.0,
            range: 900,  // Increased from 150 to 900
            animation: 'magic',
            effect: function(character, target) {
                const damage = Math.round(character.stats.magicDamage * this.damageMultiplier);
                target.takeDamage(damage, character, 'magic');
                Utils.createDamageText(target.x, target.y - 20, damage, '#00f3ff');
                return true;
            }
        });
        
        this.registerAbility({
            id: 'neural_overload',
            name: 'Neural Overload',
            type: this.TYPES.MAGIC,
            description: 'Overload enemy neural systems, dealing 150% magic damage and stunning for 2 seconds.',
            cooldown: 12,
            energyCost: 25,
            damageMultiplier: 1.5,
            stunDuration: 2,
            range: 900,  // Increased from 120 to 900
            animation: 'magic',
            effect: function(character, target) {
                const damage = Math.round(character.stats.magicDamage * this.damageMultiplier);
                target.takeDamage(damage, character, 'magic');
                Utils.createDamageText(target.x, target.y - 20, damage, '#00f3ff');
                
                // Apply stun
                target.applyEffect('stun', this.stunDuration);
                
                return true;
            }
        });
        
        // Special abilities
        this.registerAbility({
            id: 'overclock',
            name: 'Overclock',
            type: this.TYPES.SPECIAL,
            description: 'Overclock your systems for a quick burst of speed.',
            cooldown: 20,
            energyCost: 15,
            effect: function(character) {
                // Direct stat modification instead of buff
                character.temporaryStats = character.temporaryStats || {};
                character.temporaryStats.attackSpeed = 1.5;
                
                setTimeout(() => {
                    character.temporaryStats.attackSpeed = 1;
                }, 10000); // 10 seconds
                
                return true;
            }
        });
        
        this.registerAbility({
            id: 'nano_shield',
            name: 'Nano Shield',
            type: this.TYPES.DEFENSIVE,
            description: 'Quick defensive nanite deployment.',
            cooldown: 25,
            energyCost: 20,
            effect: function(character) {
                character.temporaryStats = character.temporaryStats || {};
                character.temporaryStats.defense = 1.3;
                
                setTimeout(() => {
                    character.temporaryStats.defense = 1;
                }, 8000); // 8 seconds
                
                return true;
            }
        });
        
        // Heal abilities
        this.registerAbility({
            id: 'repair_protocol',
            name: 'Repair Protocol',
            type: this.TYPES.HEAL,
            description: 'Activate repair protocols, healing for 30% of max HP.',
            cooldown: 15,
            energyCost: 25,
            healPercent: 0.3,
            animation: 'idle',
            effect: function(character) {
                const healAmount = Math.round(character.stats.maxHp * this.healPercent);
                character.heal(healAmount);
                Utils.createDamageText(character.x, character.y - 20, healAmount, '#00ff66');
                return true;
            }
        });
        
        // Utility abilities
        this.registerAbility({
            id: 'stealth_mode',
            name: 'Stealth Mode',
            type: this.TYPES.UTILITY,
            description: 'Activate stealth mode, becoming invisible to enemies for 5 seconds.',
            cooldown: 30,
            energyCost: 30,
            duration: 5,
            animation: 'idle',
            effect: function(character) {
                character.addEffect('stealth', true, this.duration);
                return true;
            }
        });
        
        // Character-specific special abilities
        
        // Devin's special ability
        this.registerAbility({
            id: 'time_warp',
            name: 'Time Warp',
            type: this.TYPES.UTILITY,
            description: 'Manipulate time, reducing all cooldowns by 50% for 8 seconds.',
            cooldown: 45,
            energyCost: 40,
            duration: 8,
            cooldownReduction: 0.5,
            animation: 'magic',
            effect: function(character) {
                character.addEffect('cooldownReduction', this.cooldownReduction, this.duration);
                return true;
            }
        });
        
        // Example special ability for another character
        this.registerAbility({
            id: 'neural_hack',
            name: 'Neural Hack',
            type: this.TYPES.DEBUFF,
            description: 'Hack into enemy systems, reducing their attack and defense by 40% for 6 seconds.',
            cooldown: 40,
            energyCost: 35,
            duration: 6,
            statReductions: {
                damage: 0.4,
                defense: 0.4
            },
            range: 100,
            animation: 'magic',
            effect: function(character, target) {
                // Apply stat reductions
                for (const [stat, value] of Object.entries(this.statReductions)) {
                    target.addDebuff(stat, value, this.duration);
                }
                
                return true;
            }
        });
    },
    
    /**
     * Register a new ability
     * @param {Object} abilityData - Ability data
     */
    registerAbility: function(abilityData) {
        this.registry[abilityData.id] = abilityData;
    },
    
    /**
     * Get an ability by ID
     * @param {string} id - Ability ID
     * @returns {Object|null} Ability data or null if not found
     */
    getAbility: function(id) {
        return this.registry[id] || null;
    },
    
    /**
     * Use an ability
     * @param {string} abilityId - Ability ID
     * @param {Object} character - Character using the ability
     * @param {Object|Array} target - Target(s) of the ability
     * @returns {boolean} True if ability was used successfully
     */
    useAbility: function(abilityId, character, target) {
        const ability = this.getAbility(abilityId);
        if (!ability) {
            console.error(`Ability not found: ${abilityId}`);
            return false;
        }
        
        // Check if ability is on cooldown
        if (character.isAbilityOnCooldown(abilityId)) {
            console.error(`Ability is on cooldown: ${abilityId}`);
            return false;
        }
        
        // Check if character has enough energy
        if (character.stats.currentSp < ability.energyCost) {
            console.error(`Not enough energy for ability: ${abilityId}`);
            return false;
        }
        
        // Check range if applicable
        if (ability.range && target && !ability.aoe) {
            const distance = Utils.distance(
                { x: character.x, y: character.y },
                { x: target.x, y: target.y }
            );
            
            if (distance > ability.range) {
                console.error(`Target is out of range for ability: ${abilityId}`);
                return false;
            }
        }
        
        // Use ability
        let success = false;
        
        // Set animation
        if (ability.animation) {
            character.setAnimation(ability.animation);
        }
        
        // Apply effect
        if (typeof ability.effect === 'function') {
            success = ability.effect.call(ability, character, target);
        }
        
        if (success) {
            // Consume energy
            character.stats.currentSp -= ability.energyCost;
            
            // Start cooldown
            character.startAbilityCooldown(abilityId, ability.cooldown);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Get abilities by type
     * @param {string} type - Ability type
     * @returns {Array} Array of abilities of the specified type
     */
    getAbilitiesByType: function(type) {
        return Object.values(this.registry).filter(ability => ability.type === type);
    },
    
    /**
     * Get abilities suitable for a character based on their stats
     * @param {Object} character - Character data
     * @returns {Array} Array of suitable abilities
     */
    getSuitableAbilities: function(character) {
        const abilities = [];
        
        // Get abilities based on character's highest stats
        const stats = character.stats;
        
        // For characters with high strength, add melee abilities
        if (stats.strength >= 10) {
            abilities.push(...this.getAbilitiesByType(this.TYPES.MELEE));
        }
        
        // For characters with high dexterity, add ranged abilities
        if (stats.dexterity >= 10) {
            abilities.push(...this.getAbilitiesByType(this.TYPES.RANGED));
        }
        
        // For characters with high intelligence, add magic abilities
        if (stats.intelligence >= 10) {
            abilities.push(...this.getAbilitiesByType(this.TYPES.MAGIC));
        }
        
        // Add some utility abilities for everyone
        abilities.push(...this.getAbilitiesByType(this.TYPES.BUFF));
        abilities.push(...this.getAbilitiesByType(this.TYPES.HEAL));
        
        // Remove duplicates
        return [...new Set(abilities)];
    },
    
    /**
     * Create a placeholder icon for an ability
     * @param {string} abilityId - Ability ID
     * @returns {string} Data URL for the placeholder icon
     */
    createPlaceholderIcon: function(abilityId) {
        const ability = this.getAbility(abilityId);
        if (!ability) return null;
        
        // Create a canvas to draw the placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        
        // Background color based on ability type
        let bgColor = '#333333';
        switch (ability.type) {
            case this.TYPES.MELEE: bgColor = '#ff6666'; break;
            case this.TYPES.RANGED: bgColor = '#66ff66'; break;
            case this.TYPES.MAGIC: bgColor = '#6666ff'; break;
            case this.TYPES.BUFF: bgColor = '#ffff66'; break;
            case this.TYPES.DEBUFF: bgColor = '#ff66ff'; break;
            case this.TYPES.HEAL: bgColor = '#66ffff'; break;
            case this.TYPES.UTILITY: bgColor = '#ffffff'; break;
        }
        
        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Ability name (first letter)
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ability.name.charAt(0), canvas.width / 2, canvas.height / 2);
        
        return canvas.toDataURL();
    }
};
