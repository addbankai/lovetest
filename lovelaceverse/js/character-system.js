const CharacterSystem = {
    // ... existing code ...

    /**
     * Form a team with synergy consideration
     * @param {Array} characterIds - Array of character IDs to form team
     * @returns {Object} Team information with active synergies
     */
    formTeamWithSynergies: function(characterIds) {
        const teamCharacters = characterIds.map(id => 
            this.characters.find(char => char.id === id)
        ).filter(char => char !== undefined);

        // Get active synergies for this team composition
        const activeSynergies = CharacterSynergy.checkTeamSynergies(characterIds);

        // Apply synergy bonuses to team members
        CharacterSynergy.applySynergyBonuses(teamCharacters, activeSynergies);

        return {
            characters: teamCharacters,
            synergies: activeSynergies,
            totalBonuses: this.calculateTeamBonuses(activeSynergies)
        };
    },

    /**
     * Calculate total team bonuses from active synergies
     * @param {Array} activeSynergies - Active synergy effects
     * @returns {Object} Combined bonus stats
     */
    calculateTeamBonuses: function(activeSynergies) {
        const totalBonuses = {};

        for (const synergy of activeSynergies) {
            for (const [stat, value] of Object.entries(synergy.bonus)) {
                if (stat !== 'specialEffect') {
                    totalBonuses[stat] = (totalBonuses[stat] || 0) + value;
                }
            }
        }

        return totalBonuses;
    }
};