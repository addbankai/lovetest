/**
 * Combat Mechanics System
 * Handles critical hits, evasion, and damage calculation adjustments.
 */
const CombatMechanics = {

    /**
     * Calculates the final damage dealt after considering critical hits and evasion.
     * Assumes attacker and defender objects have stats like 'critChance', 'evasion', 'attack', 'defense'.
     *
     * @param {object} attacker - The character performing the attack.
     * @param {object} defender - The character receiving the attack.
     * @param {number} baseDamage - The initial calculated damage before crit/evasion.
     * @returns {object} An object containing { damage: number, isCrit: boolean, isMiss: boolean }
     */
    calculateDamage: function(attacker, defender, baseDamage) {
        let finalDamage = baseDamage;
        let isCrit = false;
        let isMiss = false;

        // --- Evasion Check ---
        // Ensure stats exist, default to 0 if not
        const evasionChance = defender.stats?.evasion || 0;
        if (Math.random() * 100 < evasionChance) {
            isMiss = true;
            finalDamage = 0; // No damage on miss
            console.log(`${defender.name} evaded the attack!`);
        }

        // --- Critical Hit Check (Only if not missed) ---
        if (!isMiss) {
            // Ensure stats exist, default to 0 if not
            const critChance = attacker.stats?.critical || 0; // Corrected stat name
            const critRoll = Math.random() * 100; // Generate random number for crit check
            console.log(`Crit Check: Roll ${critRoll.toFixed(2)} vs Chance ${critChance}`); // Log the roll and chance
            if (critRoll < critChance) {
                isCrit = true;
                const damageBeforeCrit = finalDamage; // Log damage before crit
                finalDamage *= 2; // Double damage on crit
                console.log(`%c${attacker.name} landed a CRITICAL HIT! (Damage: ${damageBeforeCrit} -> ${finalDamage}) (Roll: ${critRoll.toFixed(2)} < Chance: ${critChance})`, 'color: yellow; font-weight: bold;');
            }
        }

        // --- Apply Defense Reduction (if not missed) ---
        // Basic defense reduction example, can be more complex
        if (!isMiss) {
             const defense = defender.stats?.defense || 0;
             const damageBeforeDefense = finalDamage; // Log damage before defense
             // Simple flat reduction for now, ensure damage doesn't go below 1 (or 0 if you prefer)
             finalDamage = Math.max(1, finalDamage - defense);
             console.log(`Defense Reduction: Damage ${damageBeforeDefense} -> ${finalDamage} (Defense: ${defense})`); // Log defense reduction
        }


        return {
            damage: Math.round(finalDamage), // Return whole numbers for damage
            isCrit: isCrit,
            isMiss: isMiss
        };
    },

    /**
     * Displays the damage number or "MISS" text above the target.
     *
     * @param {object} target - The character object (needs position info like x, y).
     * @param {number} damage - The amount of damage dealt.
     * @param {boolean} isCrit - Whether the hit was critical.
     * @param {boolean} isMiss - Whether the attack missed.
     */
    displayDamageNumber: function(target, damage, isCrit, isMiss) {
        const damageTextElement = document.createElement('div');
        damageTextElement.classList.add('damage-number');

        if (isMiss) {
            damageTextElement.textContent = 'MISS';
            damageTextElement.classList.add('miss');
        } else {
            damageTextElement.textContent = damage;
            if (isCrit) {
                damageTextElement.classList.add('crit');
                console.log("Applying .crit class for damage:", damage); // <-- Add log for crit class
            }
        }

        // --- Positioning Logic ---
        // Find the correct DOM element for the target (character or monster)
        let targetElement = null;
        if (target.mapElement) { // Check if it's a character with mapElement
            targetElement = target.mapElement;
        } else if (target.element) { // Check if it's a monster with element
             targetElement = target.element;
        } else {
             // Fallback: Try finding by ID patterns if direct element reference isn't available
             targetElement = document.getElementById(`character-${target.id}`) || document.getElementById(`monster-${target.id}`);
        }

        // Get target position (use object properties if element not found)
        let targetX = target.x || 0;
        let targetY = target.y || 0;
        let targetWidth = target.width || 64; // Default width

        if (targetElement) {
             // Prefer getBoundingClientRect if element exists for more accurate screen position
             try {
                 const rect = targetElement.getBoundingClientRect();
                 // Adjust for scroll position if necessary (though maybe not needed if game container is full screen)
                 targetX = rect.left + window.scrollX;
                 targetY = rect.top + window.scrollY;
                 targetWidth = rect.width;
             } catch (e) {
                  console.warn("Could not get bounding rect for target element, using object coords.", e);
                  // Fallback to object coords if getBoundingClientRect fails
             }
        } else {
             console.warn(`Target element not found for target ID: ${target.id}. Using object coordinates.`);
        }

        // Position the damage number element
        damageTextElement.style.position = 'absolute';
        damageTextElement.style.left = `${targetX + targetWidth / 2}px`; // Center horizontally above target
        damageTextElement.style.top = `${targetY - 20}px`; // Position above target
        damageTextElement.style.transform = 'translateX(-50%)'; // Adjust centering
        damageTextElement.style.zIndex = '1001'; // Ensure it's visible (increased from 1000)
        damageTextElement.style.pointerEvents = 'none'; // Prevent interaction

        // Append to body (or a specific game layer if you have one)
        document.body.appendChild(damageTextElement);

        // --- Animation ---
        // Simple fade-up and out animation
        damageTextElement.animate([
            { transform: 'translate(-50%, 0)', opacity: 1 },
            { transform: 'translate(-50%, -40px)', opacity: 0 } // Increased upward movement
        ], {
            duration: 1200, // Slightly longer duration
            easing: 'ease-out'
        }).onfinish = () => {
            if (damageTextElement.parentNode) {
                 damageTextElement.remove(); // Clean up the element after animation
            }
        };
        // Removed the 'else' block as positioning is now handled regardless of finding a specific element ID
    }
};
