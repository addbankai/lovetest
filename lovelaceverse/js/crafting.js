const Crafting = {
    recipes: {},
    currentCategory: 'cybernetics',
    
    // Add character crafting category
    CATEGORIES: {
        CYBERNETICS: 'cybernetics',
        EQUIPMENT: 'equipment',
        CHARACTERS: 'characters'
    },

    init: function() {
        console.log('Initializing Crafting System...');
        this.registerDefaultRecipes();
        this.setupEventListeners();
    },

    /**
     * Get item count from inventory
     * @param {string} itemId - Item ID to count
     * @returns {number} - Total count of the item in inventory
     */
    getItemCount: function(itemId) {
        return Inventory.slots.reduce((count, slot) => {
            if (slot && slot.id === itemId) {
                return count + (slot.quantity || 1);
            }
            return count;
        }, 0);
    },

    /**
     * Register a new recipe
     * @param {Object} recipe - Recipe configuration
     */
    registerRecipe: function(recipe) {
        console.log('Registering recipe:', recipe.id);
        this.recipes[recipe.id] = recipe;
    },
    
    /**
     * Register default crafting recipes
     */
    registerDefaultRecipes: function() {
        console.log('Registering default recipes...');
        
// Recipes will be added in here
this.registerRecipe({
    id: 'razor_sword_recipe',
    name: 'Razor Sword Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 18,
        'circuit_board': 12,
        'plasma_cell': 6
    },
    result: {
        itemId: 'razor_sword',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_sword_recipe',
    name: 'Guardian Sword Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 16,
        'circuit_board': 11,
        'smart_polymer': 3
    },
    result: {
        itemId: 'guardian_sword',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_sword_recipe',
    name: 'Apocalypse Sword Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 75,
        'circuit_board': 35,
        'plasma_cell': 30,
        'quantum_core': 10
    },
    result: {
        itemId: 'apocalypse_sword',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_sword_recipe',
    name: 'Aegis Sword Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 80,
        'neural_interface_gel': 7
    },
    result: {
        itemId: 'aegis_sword',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_dagger_recipe',
    name: 'Razor Dagger Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'circuit_board': 11,
        'quantum_alloy': 2
    },
    result: {
        itemId: 'razor_dagger',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_dagger_recipe',
    name: 'Guardian Dagger Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 6,
        'smart_polymer': 4
    },
    result: {
        itemId: 'guardian_dagger',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_dagger_recipe',
    name: 'Apocalypse Dagger Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 40,
        'quantum_core': 10,
        'dark_matter_shard': 6
    },
    result: {
        itemId: 'apocalypse_dagger',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_dagger_recipe',
    name: 'Aegis Dagger Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 90,
        'plasma_cell': 35,
        'neural_interface_gel': 8
    },
    result: {
        itemId: 'aegis_dagger',
        amount: 1
    }
});

this.registerRecipe({
    id: 'twin_fangs_recipe',
    name: 'Twin Fangs Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'circuit_board': 10,
        'quantum_alloy': 3
    },
    result: {
        itemId: 'twin_fangs',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_dual_dagger_recipe',
    name: 'Razor Dual Dagger Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 6,
        'quantum_alloy': 4
    },
    result: {
        itemId: 'razor_dual_dagger',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_dual_dagger_recipe',
    name: 'Guardian Dual Dagger Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 17,
        'smart_polymer': 2
    },
    result: {
        itemId: 'guardian_dual_dagger',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_dual_dagger_recipe',
    name: 'Apocalypse Dual Dagger Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 40,
        'quantum_core': 10,
        'dark_matter_shard': 7
    },
    result: {
        itemId: 'apocalypse_dual_dagger',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_dual_dagger_recipe',
    name: 'Aegis Dual Dagger Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 70,
        'plasma_cell': 20,
        'neural_interface_gel': 5
    },
    result: {
        itemId: 'aegis_dual_dagger',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_dual_blade_recipe',
    name: 'Razor Dual Blade Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 6,
        'quantum_alloy': 4
    },
    result: {
        itemId: 'razor_dual_blade',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_dual_blade_recipe',
    name: 'Guardian Dual Blade Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 18,
        'smart_polymer': 3
    },
    result: {
        itemId: 'guardian_dual_blade',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_dual_blade_recipe',
    name: 'Apocalypse Dual Blade Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 45,
        'quantum_core': 10,
        'dark_matter_shard': 8
    },
    result: {
        itemId: 'apocalypse_dual_blade',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_dual_blade_recipe',
    name: 'Aegis Dual Blade Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 75,
        'plasma_cell': 25,
        'neural_interface_gel': 6
    },
    result: {
        itemId: 'aegis_dual_blade',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_bow_recipe',
    name: 'Razor Bow Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'circuit_board': 10,
        'quantum_alloy': 2
    },
    result: {
        itemId: 'razor_bow',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_bow_recipe',
    name: 'Guardian Bow Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 19,
        'smart_polymer': 4
    },
    result: {
        itemId: 'guardian_bow',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_bow_recipe',
    name: 'Apocalypse Bow Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 40,
        'quantum_core': 10,
        'dark_matter_shard': 7
    },
    result: {
        itemId: 'apocalypse_bow',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_bow_recipe',
    name: 'Aegis Bow Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 90,
        'plasma_cell': 35,
        'neural_interface_gel': 8
    },
    result: {
        itemId: 'aegis_bow',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_crossbow_recipe',
    name: 'Razor Crossbow Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 5,
        'quantum_alloy': 3
    },
    result: {
        itemId: 'razor_crossbow',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_crossbow_recipe',
    name: 'Guardian Crossbow Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 18,
        'smart_polymer': 4
    },
    result: {
        itemId: 'guardian_crossbow',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_crossbow_recipe',
    name: 'Apocalypse Crossbow Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 40,
        'quantum_core': 10,
        'dark_matter_shard': 7
    },
    result: {
        itemId: 'apocalypse_crossbow',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_crossbow_recipe',
    name: 'Aegis Crossbow Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 70,
        'plasma_cell': 20,
        'neural_interface_gel': 5
    },
    result: {
        itemId: 'aegis_crossbow',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_staff_recipe',
    name: 'Razor Staff Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 6,
        'quantum_alloy': 4
    },
    result: {
        itemId: 'razor_staff',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_staff_recipe',
    name: 'Guardian Staff Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 18,
        'smart_polymer': 3
    },
    result: {
        itemId: 'guardian_staff',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_staff_recipe',
    name: 'Apocalypse Staff Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 45,
        'quantum_core': 10,
        'dark_matter_shard': 8
    },
    result: {
        itemId: 'apocalypse_staff',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_staff_recipe',
    name: 'Aegis Staff Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 75,
        'plasma_cell': 25,
        'neural_interface_gel': 6
    },
    result: {
        itemId: 'aegis_staff',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_katana_recipe',
    name: 'Razor Katana Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 5,
        'quantum_alloy': 3
    },
    result: {
        itemId: 'razor_katana',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_katana_recipe',
    name: 'Guardian Katana Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 18,
        'smart_polymer': 4
    },
    result: {
        itemId: 'guardian_katana',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_katana_recipe',
    name: 'Apocalypse Katana Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 40,
        'quantum_core': 10,
        'dark_matter_shard': 7
    },
    result: {
        itemId: 'apocalypse_katana',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_katana_recipe',
    name: 'Aegis Katana Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 70,
        'plasma_cell': 20,
        'neural_interface_gel': 5
    },
    result: {
        itemId: 'aegis_katana',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_knuckles_recipe',
    name: 'Razor Knuckles Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 6,
        'quantum_alloy': 4
    },
    result: {
        itemId: 'razor_knuckles',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_knuckles_recipe',
    name: 'Guardian Knuckles Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 18,
        'smart_polymer': 3
    },
    result: {
        itemId: 'guardian_knuckles',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_knuckles_recipe',
    name: 'Apocalypse Knuckles Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 45,
        'quantum_core': 10,
        'dark_matter_shard': 8
    },
    result: {
        itemId: 'apocalypse_knuckles',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_knuckles_recipe',
    name: 'Aegis Knuckles Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 75,
        'plasma_cell': 25,
        'neural_interface_gel': 6
    },
    result: {
        itemId: 'aegis_knuckles',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_spear_recipe',
    name: 'Razor Spear Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 4,
        'quantum_alloy': 2
    },
    result: {
        itemId: 'razor_spear',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_spear_recipe',
    name: 'Guardian Spear Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 19,
        'smart_polymer': 4
    },
    result: {
        itemId: 'guardian_spear',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_spear_recipe',
    name: 'Apocalypse Spear Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 40,
        'quantum_core': 10,
        'dark_matter_shard': 7
    },
    result: {
        itemId: 'apocalypse_spear',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_spear_recipe',
    name: 'Aegis Spear Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 90,
        'plasma_cell': 35,
        'neural_interface_gel': 8
    },
    result: {
        itemId: 'aegis_spear',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_scythe_recipe',
    name: 'Razor Scythe Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 5,
        'quantum_alloy': 3
    },
    result: {
        itemId: 'razor_scythe',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_scythe_recipe',
    name: 'Guardian Scythe Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 18,
        'smart_polymer': 4
    },
    result: {
        itemId: 'guardian_scythe',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_scythe_recipe',
    name: 'Apocalypse Scythe Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 45,
        'quantum_core': 10,
        'dark_matter_shard': 8
    },
    result: {
        itemId: 'apocalypse_scythe',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_scythe_recipe',
    name: 'Aegis Scythe Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 75,
        'plasma_cell': 25,
        'neural_interface_gel': 6
    },
    result: {
        itemId: 'aegis_scythe',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_rifle_recipe',
    name: 'Razor Rifle Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 6,
        'quantum_alloy': 4
    },
    result: {
        itemId: 'razor_rifle',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_rifle_recipe',
    name: 'Guardian Rifle Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 18,
        'smart_polymer': 3
    },
    result: {
        itemId: 'guardian_rifle',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_rifle_recipe',
    name: 'Apocalypse Rifle Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 40,
        'quantum_core': 10,
        'dark_matter_shard': 7
    },
    result: {
        itemId: 'apocalypse_rifle',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_rifle_recipe',
    name: 'Aegis Rifle Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 70,
        'plasma_cell': 20,
        'neural_interface_gel': 5
    },
    result: {
        itemId: 'aegis_rifle',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_wand_recipe',
    name: 'Razor Wand Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 5,
        'quantum_alloy': 3
    },
    result: {
        itemId: 'razor_wand',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_wand_recipe',
    name: 'Guardian Wand Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 18,
        'smart_polymer': 4
    },
    result: {
        itemId: 'guardian_wand',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_wand_recipe',
    name: 'Apocalypse Wand Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 45,
        'quantum_core': 10,
        'dark_matter_shard': 8
    },
    result: {
        itemId: 'apocalypse_wand',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_wand_recipe',
    name: 'Aegis Wand Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 75,
        'plasma_cell': 25,
        'neural_interface_gel': 6
    },
    result: {
        itemId: 'aegis_wand',
        amount: 1
    }
});

this.registerRecipe({
    id: 'razor_grimoire_recipe',
    name: 'Razor Grimoire Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 6,
        'quantum_alloy': 4
    },
    result: {
        itemId: 'razor_grimoire',
        amount: 1
    }
});

this.registerRecipe({
    id: 'guardian_grimoire_recipe',
    name: 'Guardian Grimoire Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 17,
        'smart_polymer': 2
    },
    result: {
        itemId: 'guardian_grimoire',
        amount: 1
    }
});

this.registerRecipe({
    id: 'apocalypse_grimoire_recipe',
    name: 'Apocalypse Grimoire Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 40,
        'quantum_core': 10,
        'dark_matter_shard': 7
    },
    result: {
        itemId: 'apocalypse_grimoire',
        amount: 1
    }
});

this.registerRecipe({
    id: 'aegis_grimoire_recipe',
    name: 'Aegis Grimoire Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 70,
        'plasma_cell': 20,
        'neural_interface_gel': 5
    },
    result: {
        itemId: 'aegis_grimoire',
        amount: 1
    }
});

this.registerRecipe({
    id: 'cybernetic_plate_recipe',
    name: 'Cybernetic Plate Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'circuit_board': 13,
        'synth_leather': 6
    },
    result: {
        itemId: 'cybernetic_plate',
        amount: 1
    }
});

this.registerRecipe({
    id: 'exoskeletal_suit_recipe',
    name: 'Exoskeletal Suit Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 18,
        'synth_leather': 5
    },
    result: {
        itemId: 'exoskeletal_suit',
        amount: 1
    }
});

this.registerRecipe({
    id: 'quantum_shield_recipe',
    name: 'Quantum Shield Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 45,
        'quantum_core': 10
    },
    result: {
        itemId: 'quantum_shield',
        amount: 1
    }
});

this.registerRecipe({
    id: 'fortified_light_armor_recipe',
    name: 'Fortified Light Armor Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'circuit_board': 11,
        'synth_leather': 4
    },
    result: {
        itemId: 'fortified_light_armor',
        amount: 1
    }
});

this.registerRecipe({
    id: 'assault_light_armor_recipe',
    name: 'Assault Light Armor Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 16,
        'synth_leather': 3
    },
    result: {
        itemId: 'assault_light_armor',
        amount: 1
    }
});

this.registerRecipe({
    id: 'invincible_light_armor_recipe',
    name: 'Invincible Light Armor Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 40,
        'quantum_core': 10
    },
    result: {
        itemId: 'invincible_light_armor',
        amount: 1
    }
});

this.registerRecipe({
    id: 'berserker_light_armor_recipe',
    name: 'Berserker Light Armor Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 90,
        'plasma_cell': 35
    },
    result: {
        itemId: 'berserker_light_armor',
        amount: 1
    }
});

this.registerRecipe({
    id: 'fortified_light_gloves_recipe',
    name: 'Fortified Light Gloves Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'circuit_board': 12,
        'synth_leather': 5
    },
    result: {
        itemId: 'fortified_light_gloves',
        amount: 1
    }
});

this.registerRecipe({
    id: 'assault_light_gloves_recipe',
    name: 'Assault Light Gloves Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 17,
        'synth_leather': 4
    },
    result: {
        itemId: 'assault_light_gloves',
        amount: 1
    }
});

this.registerRecipe({
    id: 'invincible_light_gloves_recipe',
    name: 'Invincible Light Gloves Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 40,
        'quantum_core': 10
    },
    result: {
        itemId: 'invincible_light_gloves',
        amount: 1
    }
});

this.registerRecipe({
    id: 'berserker_light_gloves_recipe',
    name: 'Berserker Light Gloves Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 90,
        'plasma_cell': 35
    },
    result: {
        itemId: 'berserker_light_gloves',
        amount: 1
    }
});

this.registerRecipe({
    id: 'fortified_light_boots_recipe',
    name: 'Fortified Light Boots Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'circuit_board': 10,
        'synth_leather': 3
    },
    result: {
        itemId: 'fortified_light_boots',
        amount: 1
    }
});

this.registerRecipe({
    id: 'assault_light_boots_recipe',
    name: 'Assault Light Boots Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'cyber_scrap': 19,
        'synth_leather': 6
    },
    result: {
        itemId: 'assault_light_boots',
        amount: 1
    }
});

this.registerRecipe({
    id: 'invincible_light_boots_recipe',
    name: 'Invincible Light Boots Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 45,
        'quantum_core': 10
    },
    result: {
        itemId: 'invincible_light_boots',
        amount: 1
    }
});

this.registerRecipe({
    id: 'berserker_light_boots_recipe',
    name: 'Berserker Light Boots Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'cyber_scrap': 70,
        'plasma_cell': 20
    },
    result: {
        itemId: 'berserker_light_boots',
        amount: 1
    }
});

this.registerRecipe({
    id: 'chrono_amulet_recipe',
    name: 'Chrono Amulet Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 45,
        'quantum_core': 10
    },
    result: {
        itemId: 'chrono_amulet',
        amount: 1
    }
});

this.registerRecipe({
    id: 'neural_necklace_recipe',
    name: 'Neural Necklace Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'circuit_board': 12,
        'neon_circuit': 5
    },
    result: {
        itemId: 'neural_necklace',
        amount: 1
    }
});

this.registerRecipe({
    id: 'luck_charm_recipe',
    name: 'Digital Fortune Charm Recipe',
    category: 'equipment',
    level: 10,
    materials: {
        'circuit_board': 11,
        'neon_circuit': 4
    },
    result: {
        itemId: 'luck_charm',
        amount: 1
    }
});

this.registerRecipe({
    id: 'fortified_ring_recipe',
    name: 'Fortified Ring Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'plasma_cell': 6,
        'neon_circuit': 5
    },
    result: {
        itemId: 'fortified_ring',
        amount: 1
    }
});

this.registerRecipe({
    id: 'assault_ring_recipe',
    name: 'Assault Ring Recipe',
    category: 'equipment',
    level: 20,
    materials: {
        'circuit_board': 12,
        'neon_circuit': 4
    },
    result: {
        itemId: 'assault_ring',
        amount: 1
    }
});

this.registerRecipe({
    id: 'invincible_ring_recipe',
    name: 'Invincible Ring Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'circuit_board': 40,
        'quantum_core': 10
    },
    result: {
        itemId: 'invincible_ring',
        amount: 1
    }
});

this.registerRecipe({
    id: 'berserker_ring_recipe',
    name: 'Berserker Ring Recipe',
    category: 'equipment',
    level: 30,
    materials: {
        'plasma_cell': 20,
        'quantum_core': 10
    },
    result: {
        itemId: 'berserker_ring',
        amount: 1
    }
});

        // Add character recipes
        this.registerRecipe({
            id: 'phantom',
            name: 'Phantom',
            category: 'characters',
            level: 10,
            materials: {
                'circuit_board': 5,
                'cyber_scrap': 8,
                'quantum_core': 1
            },
            result: {
                characterId: 'phantom', // Links to character system
                amount: 1
            }
        });

        this.registerRecipe({
            id: 'tap',
            name: 'Tap',
            category: 'characters',
            level: 15,
            materials: {
                'circuit_board': 8,
                'cyber_scrap': 12,
                'quantum_core': 2
            },
            result: {
                characterId: 'tap',
                amount: 1
            }
        });
    },
    
    /**
     * Setup event listeners for crafting UI
     */
    setupEventListeners: function() {
        // Tab switching
        const tabs = document.querySelectorAll('.crafting-tabs .tab-button');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const category = e.target.dataset.category;
                this.currentCategory = category;
                this.updateCraftingUI(category);
            });
        });

        // Close button
        const closeBtn = document.querySelector('#crafting-modal .close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Global ESC key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('crafting-modal');
                if (modal && modal.style.display === 'block') {
                    this.hide();
                }
            }
        });
    },
    
    /**
     * Open crafting modal and initialize UI
     */
    show: function() {
        const modal = document.getElementById('crafting-modal');
        if (modal) {
            modal.style.display = 'block';
            this.updateCraftingUI(this.currentCategory);
        }
    },

    /**
     * Close crafting modal
     */
    hide: function() {
        const modal = document.getElementById('crafting-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    /**
     * Update crafting UI based on selected tab
     */
    updateCraftingUI: function(category) {
        console.log('Updating UI for category:', category);
        const recipesContainer = document.getElementById('crafting-recipes');
        if (!recipesContainer) {
            console.error('Recipes container not found');
            return;
        }

        // Add sorting dropdown if category is equipment
        const sortingContainer = document.getElementById('crafting-sorting');
        if (category === 'equipment') {
            // Group equipment types
            const weaponTypes = [
                'SWORD', 'DAGGER', 'DUAL_DAGGER', 'DUAL_BLADE', 'BOW', 'CROSSBOW',
                'STAFF', 'KATANA', 'KNUCKLES', 'SPEAR', 'SCYTHE', 'RIFLE', 'WAND', 'GRIMOIRE'
            ];
            
            const armorTypes = [
                'LIGHT_ARMOR', 'MEDIUM_ARMOR', 'HEAVY_ARMOR'
            ];

            const gloveTypes = [
                'LIGHT_GLOVES', 'HEAVY_GLOVES'
            ];

            const bootTypes = [
                'LIGHT_BOOTS', 'HEAVY_BOOTS'
            ];

            const accessoryTypes = [
                'RING', 'NECKLACE', 'AMULET', 'CHARM', 'BRACELET'
            ];

            sortingContainer.innerHTML = `
                <div class="sorting-dropdown">
                    <select id="equipment-type-filter" class="equipment-filter">
                        <option value="all">All Types</option>
                        <optgroup label="Weapons">
                            ${weaponTypes.map(type => `
                                <option value="${Items.EQUIPMENT_TYPES[type]}">${type.toLowerCase()
                                    .split('_')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}
                                </option>
                            `).join('')}
                        </optgroup>
                        <optgroup label="Armor">
                            ${armorTypes.map(type => `
                                <option value="${Items.EQUIPMENT_TYPES[type]}">${type.toLowerCase()
                                    .split('_')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}
                                </option>
                            `).join('')}
                        </optgroup>
                        <optgroup label="Gloves">
                            ${gloveTypes.map(type => `
                                <option value="${Items.EQUIPMENT_TYPES[type]}">${type.toLowerCase()
                                    .split('_')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}
                                </option>
                            `).join('')}
                        </optgroup>
                        <optgroup label="Boots">
                            ${bootTypes.map(type => `
                                <option value="${Items.EQUIPMENT_TYPES[type]}">${type.toLowerCase()
                                    .split('_')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}
                                </option>
                            `).join('')}
                        </optgroup>
                        <optgroup label="Accessories">
                            ${accessoryTypes.map(type => `
                                <option value="${Items.EQUIPMENT_TYPES[type]}">${type.toLowerCase()
                                    .split('_')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}
                                </option>
                            `).join('')}
                        </optgroup>
                    </select>
                </div>
            `;

            // Add event listener for dropdown
            const equipmentFilter = document.getElementById('equipment-type-filter');
            equipmentFilter.addEventListener('change', (e) => {
                const selectedType = e.target.value;
                this.filterRecipes(category, selectedType);
            });
        } else {
            sortingContainer.innerHTML = '';
        }
        
        const recipes = this.getAvailableRecipes(category);
        this.renderRecipes(recipes);
    },

    filterRecipes: function(category, equipmentType) {
        const recipes = this.getAvailableRecipes(category);
        const filteredRecipes = equipmentType === 'all' 
            ? recipes 
            : recipes.filter(recipe => {
                const item = Items.registry[recipe.result.itemId];
                return item && item.equipmentType === equipmentType;
            });
        this.renderRecipes(filteredRecipes);
    },

    renderRecipes: function(recipes) {
        const recipesContainer = document.getElementById('crafting-recipes');
        recipesContainer.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" data-recipe-id="${recipe.id}">
                <div class="recipe-info" data-item-id="${recipe.result.itemId}">
                    <div class="recipe-preview ${recipe.result.characterId ? 'character-preview' : 'equipment-preview'}">
                        ${recipe.result.characterId ? `
                            <img src="${GachaSystem.characterTemplates.find(char => char.id === recipe.result.characterId)?.thumbnail}" 
                                 alt="${recipe.name}" 
                                 class="recipe-thumbnail">
                        ` : `
                            <img src="${Items.getItem(recipe.result.itemId)?.icon || 
                                      Items.createPlaceholderImage(recipe.result.itemId)}" 
                                 alt="${recipe.name}" 
                                 class="recipe-thumbnail">
                        `}
                    </div>
                    <h3>${recipe.name}</h3>
                    <div class="recipe-level">Level ${recipe.level}</div>
                    <div class="recipe-materials">
                        ${Object.entries(recipe.materials).map(([itemId, amount]) => {
                            const itemCount = this.getItemCount(itemId);
                            return `
                                <div class="material-requirement ${itemCount >= amount ? 'has-materials' : 'missing-materials'}">
                                    <img src="img/items/${itemId}.png" alt="${itemId}">
                                    <span>${amount}x ${itemId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                                    <span class="material-count">(${itemCount} available)</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <button class="craft-button" 
                            onclick="Crafting.craftItem('${recipe.id}')"
                            ${this.canCraftItem(recipe) ? '' : 'disabled'}>
                        CRAFT
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners for tooltips
        const recipeCards = recipesContainer.querySelectorAll('.recipe-card');
        recipeCards.forEach(card => {
            const recipeId = card.dataset.recipeId;
            const recipe = recipes.find(r => r.id === recipeId);
            
            card.addEventListener('mouseenter', (e) => {
                this.showRecipeTooltip(recipe, card);
            });

            card.addEventListener('mouseleave', () => {
                const tooltip = document.getElementById('item-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
    },

    /**
     * Get available recipes for a specific category
     * @param {string} category - Category of recipes to fetch
     * @returns {Array} Array of available recipes
     */
    getAvailableRecipes: function(category) {
        console.log('Getting recipes for category:', category);
        return Object.values(this.recipes).filter(recipe => {
            return recipe.category === category;
        });
    },

    /**
     * Check if player can craft an item
     * @param {Object} recipe - The recipe to check
     * @returns {boolean} - Whether the item can be crafted
     */
    canCraftItem: function(recipe) {
        return Object.entries(recipe.materials).every(([itemId, amount]) => {
            return this.getItemCount(itemId) >= amount;
        });
    },

    /**
     * Craft an item using the specified recipe
     * @param {string} recipeId - ID of the recipe to craft
     */
    craftItem: function(recipeId) {
        const recipe = this.recipes[recipeId];
        if (!recipe) return;
        
        if (!this.canCraftItem(recipe)) {
            Utils.showNotification('Insufficient materials!', 'error');
            return;
        }

        let success = false;
        
        try {
            // Find slots for all required materials first
            const materialsToRemove = [];
            for (const [itemId, amount] of Object.entries(recipe.materials)) {
                // Find slots containing this item
                const slots = Inventory.slots.reduce((acc, slot, index) => {
                    if (slot && slot.id === itemId) {
                        acc.push({ index, quantity: slot.quantity || 1 });
                    }
                    return acc;
                }, []);

                // Calculate how many items we need to remove from which slots
                let remainingAmount = amount;
                const removals = [];
                for (const slot of slots) {
                    if (remainingAmount <= 0) break;
                    const removeAmount = Math.min(remainingAmount, slot.quantity);
                    removals.push({
                        slotIndex: slot.index,
                        amount: removeAmount
                    });
                    remainingAmount -= removeAmount;
                }

                if (remainingAmount > 0) {
                    throw new Error(`Not enough ${itemId} available`);
                }

                materialsToRemove.push(...removals);
            }

            // Remove all materials
            for (const removal of materialsToRemove) {
                if (!Inventory.removeItem(removal.slotIndex, removal.amount)) {
                    throw new Error('Failed to remove materials');
                }
            }

            // Handle character crafting
            if (recipe.result.characterId) {
                const characterTemplate = GachaSystem.characterTemplates.find(
                    char => char.id === recipe.result.characterId
                );
                
                if (!characterTemplate) {
                    throw new Error('Character template not found!');
                }

                // Create new character with template data
                const newCharacter = {
                    ...characterTemplate,
                    level: 1,
                    experience: 0,
                    dateAcquired: new Date().toISOString(),
                    stats: characterTemplate.baseStats ? 
                           { ...CharacterSystem.getDefaultStats(), ...characterTemplate.baseStats } : 
                           CharacterSystem.getDefaultStats()
                };

                // Add character using CharacterSystem
                success = CharacterSystem.createCharacter(newCharacter);
            } else {
                // Handle regular item crafting
                success = Inventory.addItem(recipe.result.itemId, recipe.result.amount);
            }

            if (success) {
                // Remove materials after successful craft
                Object.entries(recipe.materials).forEach(([itemId, amount]) => {
                    Inventory.removeItem(itemId, amount);
                });

                // Show cyberpunk toast notification
                const toastMessage = `${recipe.name} successfully crafted!`;
                showCyberpunkToast(toastMessage);

                // Dispatch itemCrafted event
                document.dispatchEvent(new CustomEvent('itemCrafted', {
                    detail: {
                        recipeId: recipe.id,
                        characterId: recipe.result.characterId,
                        itemId: recipe.result.itemId,
                        quantity: recipe.result.amount || 1
                    }
                }));
            } else {
                throw new Error('Failed to create crafted item');
            }

        } catch (error) {
            console.error('Crafting error:', error);
            Utils.showNotification('Crafting failed: ' + error.message, 'error');
            success = false;
        }
        
        // Update UI
        this.updateCraftingUI(this.currentCategory);
        return success;
    },

    /**
     * Show recipe tooltip
     * @param {Object} recipe - Recipe data
     * @param {HTMLElement} element - Element to attach tooltip to
     */
    showRecipeTooltip: function(recipe, element) {
        // Remove any existing tooltip
        const existingTooltip = document.getElementById('item-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'item-tooltip';
        tooltip.id = 'item-tooltip';

        if (recipe.result.characterId) {
            // For character recipes - show name, thumbnail and stats
            const characterTemplate = GachaSystem.characterTemplates.find(
                char => char.id === recipe.result.characterId
            );
            
            if (characterTemplate) {
                tooltip.innerHTML = `
                    <div class="tooltip-character">
                        <img src="${characterTemplate.thumbnail}" alt="${characterTemplate.name}" class="tooltip-character-img">
                        <h4>${characterTemplate.name}</h4>
                        <div class="character-stats">
                            ${Object.entries(characterTemplate.baseStats)
                                .map(([stat, value]) => `
                                    <div class="stat-line">
                                        <span>${stat.charAt(0).toUpperCase() + stat.slice(1)}:</span> 
                                        <span>${value}</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                `;
            }
        } else if (recipe.result.itemId) {
            // For item recipes - show name, image and item details
            const resultItem = Items.getItem(recipe.result.itemId);
            if (resultItem) {
                // Add rarity class for styling
                if (resultItem.rarity) {
                    let rarityName = typeof resultItem.rarity === 'string' ? 
                        resultItem.rarity.toLowerCase() : 
                        resultItem.rarity.name.toLowerCase();
                    tooltip.classList.add(rarityName);
                }

                // Format equipment type for display
                let equipmentTypeDisplay = '';
                if (resultItem.equipmentType) {
                    equipmentTypeDisplay = resultItem.equipmentType
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                }

                tooltip.innerHTML = `
                    <div class="tooltip-equipment">
                        <img src="${resultItem.icon || Items.createPlaceholderImage(recipe.result.itemId)}" 
                             alt="${resultItem.name}" 
                             class="tooltip-equipment-img">
                        <h4>${resultItem.name} x${recipe.result.amount || 1}</h4>
                        <div class="item-type">
                            ${equipmentTypeDisplay}
                            ${resultItem.category ? `(${resultItem.category})` : ''}
                        </div>
                        <div class="item-level">Required Level: ${recipe.level}</div>
                        ${resultItem.description ? `<div class="item-description">${resultItem.description}</div>` : ''}
                        ${resultItem.stats ? `
                            <div class="equipment-stats">
                                ${Object.entries(resultItem.stats).map(([stat, value]) => 
                                    `<div class="stat-line">
                                        <span>${stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
                                        <span class="${value > 0 ? 'stat-buff' : 'stat-debuff'}">${value > 0 ? '+' : ''}${value}</span>
                                    </div>`
                                ).join('')}
                            </div>
                        ` : ''}
                        ${resultItem.effects && resultItem.effects.length > 0 ? `
                            <div class="item-effects">
                                ${resultItem.effects.map(effect => `<div>${effect}</div>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        }

        // Position the tooltip
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        tooltip.style.top = `${rect.top + scrollTop - tooltip.offsetHeight - 10}px`;
        tooltip.style.left = `${rect.left + scrollLeft + (rect.width / 2)}px`;
        tooltip.style.transform = 'translateX(-50%)';

        document.body.appendChild(tooltip);
    }
};

// Initialize crafting system when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    Crafting.init();
});

// Example of how to define a character recipe
const characterRecipes = {
    'devin': {
        id: 'craft_devin',
        name: 'Devin',
        category: 'characters',
        level: 10,
        materials: {
            cyber_core: 5,
            neural_matrix: 3,
            quantum_shard: 2
        },
        result: {
            characterId: 'devin'  // This matches the id in GachaSystem.characterTemplates
        }
    },
    'gowdie': {
        id: 'craft_gowdie',
        name: 'Gowdie',
        category: 'characters',
        level: 5,
        materials: {
            cyber_core: 3,
            neural_matrix: 2,
            quantum_shard: 1
        },
        result: {
            characterId: 'gowdie'  // This matches the id in GachaSystem.characterTemplates
        }
    }
    // Add more character recipes as needed
};

// Add this function to handle toast display
function showCyberpunkToast(message) {
    const toast = document.createElement('div');
    toast.className = 'cyberpunk-craft-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-glitch-text" data-text="${message}">${message}</div>
            <div class="toast-line"></div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}









