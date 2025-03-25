/**
 * Enhanced attack system for the Cyberpunk MMORPG game
 * Handles attacks between characters and monsters with critical hit system
 */

// Override CharacterSystem's attackMonster function with our enhanced version
(function() {
    // Store the original function if it exists
    const originalAttackMonster = CharacterSystem.attackMonster;

    /**
     * Enhanced attack monster function with critical hit system
     * @param {Object} character - Attacking character
     * @param {Object} monster - Target monster
     */
    CharacterSystem.attackMonster = function(character, monster) {
        // Only attack if not in cooldown and not already attacking
        const now = Date.now();
        if (character.isAttacking || (character.lastAttackTime && now - character.lastAttackTime < 1000/character.stats.attackSpeed)) {
            return;
        }
        
        // Prevent rapid attack reset when repositioning
        if (character.isPositionedForAttack && Date.now() - character.positionTime < 100) {
            return;
        }
        
        character.isAttacking = true;
        character.attackTarget = monster.id;
        const charCenterX = character.x + character.width / 2;
        const monsterCenterX = monster.x + monster.width / 2;
        const direction = monsterCenterX > charCenterX ? 1 : -1;
        
        // Calculate cooldown based on attack speed
        character.attackCooldown = 1000 / character.stats.attackSpeed;
        character.lastAttackTime = now;
        if (character.mapElement) {
            character.mapElement.style.transform = direction > 0 ? "scaleX(1)" : "scaleX(-1)";
        }
        
        // Get character's equipped weapon
        const equipment = Inventory.getCharacterEquipment(character.id);
        const weapon = equipment.rightHand;
        
        // Choose animation based on weapon type
        let animationType = "attack"; // Default melee attack
        let projectileType = null;
        let soundEffect = "attackSprite"; // Default attack sound
        
        if (weapon && weapon.equipmentType) {
            // Ranged weapons (bows, crossbows)
            if (["bow", "crossbow", "rifle"].includes(weapon.equipmentType)) {
                animationType = "ranged";
                projectileType = "ARROW";
                soundEffect = "rangedSprite";
            } 
            // Magic weapons (staffs, wands, grimoires)
            else if (["staff", "wand", "grimoire"].includes(weapon.equipmentType)) {
                animationType = "magic";
                projectileType = "FIREBALL";
                soundEffect = "magicSprite";
            }
        }
        
        // Play the appropriate sound effect if AudioSystem is available
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.playSoundEffect(soundEffect);
        }
        
        // Set the animation based on weapon type
        this.setAnimation(character, animationType);
        
        character.currentFrame = 0;
        if (character.mapElement) {
            character.mapElement.style.backgroundPosition = "0 0";
        }
        
        // Calculate if this is a critical hit
        let isCritical = false;
        let critMultiplier = 2.0; // Standard 2x damage for critical hits
        
        // Critical chance based on character's critical stat (as a percentage)
        if (character.stats && character.stats.critical) {
            const critChance = character.stats.critical / 100;
            isCritical = Math.random() < critChance;
            
            // Play critical hit sound if it's a critical hit
            if (isCritical && typeof AudioSystem !== 'undefined') {
                AudioSystem.playSoundEffect('critical_hit');
            }
        }
        
        // For ranged and magic attacks, schedule projectile creation
        if (projectileType) {
            // Store the target info for projectile launch at the end of animation
            character.pendingProjectile = {
                type: projectileType,
                target: monster,
                isCritical: isCritical
            };
        } else {
            // For melee attacks, apply damage immediately
            let damage = Math.round(character.stats.damage);
            
            // Apply critical damage multiplier if it's a critical hit
            if (isCritical) {
                damage = Math.round(damage * critMultiplier);
            }
            
            MonsterSystem.damageMonster(monster.id, damage, character, isCritical);
        }
    };

    // Override the ProjectileEffects.onProjectileHit function if it exists
    if (typeof ProjectileEffects !== 'undefined' && ProjectileEffects.onProjectileHit) {
        const originalOnProjectileHit = ProjectileEffects.onProjectileHit;
        
        ProjectileEffects.onProjectileHit = function(projectile, target) {
            if (originalOnProjectileHit) {
                originalOnProjectileHit.call(ProjectileEffects, projectile, target);
            }
            
            // If the projectile has a source and target, and the target is a monster
            if (projectile.source && target && target.id && MonsterSystem.getMonsterById(target.id)) {
                // Get the character
                const character = projectile.source;
                
                // Calculate damage based on projectile type
                let damage = character.stats.damage; // Default to physical damage
                
                // Use the appropriate damage stat based on projectile type
                if (projectile.type === 'FIREBALL') {
                    damage = character.stats.magicDamage || character.stats.damage;
                } else if (projectile.type === 'ARROW') {
                    damage = character.stats.rangeDamage || character.stats.damage;
                }
                
                // Apply critical hit multiplier if this is a critical projectile
                if (projectile.isCritical) {
                    damage = Math.round(damage * 2.0); // Apply 2x damage for critical hits
                }
                
                // Apply damage to monster
                MonsterSystem.damageMonster(target.id, damage, character, projectile.isCritical);
            }
        };
    }
})();
