const CharacterSynergy = {
    // Synergy type definitions
    synergyTypes: {
        HACKER_TEAM: {
            name: 'Digital Infiltration',
            description: 'Team of expert hackers',
            requiredCount: 2,
            characters: ['devin', 'tap', 'voltaire'],
            bonus: {
                intelligence: 20,
                specialEffect: 'All hacking abilities cooldown reduced by 25%'
            }
        },
        COMBAT_SQUAD: {
            name: 'Strike Force',
            description: 'Elite combat specialists',
            requiredCount: 2,
            characters: ['chad', 'titan', 'chrome'],
            bonus: {
                strength: 15,
                specialEffect: 'Team damage increased by 20%'
            }
        },
        STEALTH_OPS: {
            name: 'Shadow Protocol',
            description: 'Stealth operation experts',
            requiredCount: 2,
            characters: ['lovelace', 'sneak', 'beemo'],
            bonus: {
                agility: 15,
                specialEffect: 'Team evasion increased by 20%'
            }
        },
        TECH_SUPPORT: {
            name: 'Tech Harmony',
            description: 'Advanced technical support',
            requiredCount: 2,
            characters: ['alonzo', 'byron', 'ether'],
            bonus: {
                vitality: 10,
                specialEffect: 'Team healing increased by 30%'
            }
        }
    },

    /**
     * Check active synergies for a team
     * @param {Array} teamMembers - Array of character IDs
     * @returns {Array} Active synergies
     */
    checkTeamSynergies: function(teamMembers) {
        const activeSynergies = [];

        for (const [synergyId, synergy] of Object.entries(this.synergyTypes)) {
            const matchingCharacters = teamMembers.filter(
                memberId => synergy.characters.includes(memberId)
            );

            if (matchingCharacters.length >= synergy.requiredCount) {
                activeSynergies.push({
                    id: synergyId,
                    ...synergy,
                    activeCharacters: matchingCharacters
                });
            }
        }

        return activeSynergies;
    },

    /**
     * Apply synergy bonuses to team members
     * @param {Array} characters - Array of character objects
     * @param {Array} activeSynergies - Active synergy effects
     */
    applySynergyBonuses: function(characters, activeSynergies) {
        for (const synergy of activeSynergies) {
            const affectedCharacters = characters.filter(
                char => synergy.characters.includes(char.id)
            );

            for (const char of affectedCharacters) {
                // Direct stat modification instead of buffs
                for (const [stat, value] of Object.entries(synergy.bonus)) {
                    if (stat !== 'specialEffect') {
                        char.baseStats[stat] = (char.baseStats[stat] || 0) + value;
                    }
                }
            }
        }
    }
};
