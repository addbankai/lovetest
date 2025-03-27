/**
 * Item system for the Cyberpunk MMORPG game
 * Defines item types, properties, and effects
 */

const Items = {
    // Item registry
    registry: {},
    
    // Item categories
    CATEGORIES: {
        WEAPON: 'weapon',
        ARMOR: 'armor',
        GLOVES: 'gloves',
        BOOTS: 'boots',
        ACCESSORY: 'accessory',
        CONSUMABLE: 'consumable',
        MATERIAL: 'material',
        UTILITY: 'utility',
        QUEST: 'quest'
    },
    
    // Equipment types
    EQUIPMENT_TYPES: {
        // Right hand weapons
        SWORD: 'sword',
        DAGGER: 'dagger', 
        DUAL_DAGGER: 'dual_dagger',
        DUAL_BLADE: 'dual_blade',
        BOW: 'bow',
        CROSSBOW: 'crossbow',
        STAFF: 'staff',
        KATANA: 'katana',
        KNUCKLES: 'knuckles',
        SPEAR: 'spear',
        SCYTHE: 'scythe',
        RIFLE: 'rifle',
        WAND: 'wand',
        GRIMOIRE: 'grimoire',

        
        // Armor types
        LIGHT_ARMOR: 'light_armor',
        MEDIUM_ARMOR: 'medium_armor',
        HEAVY_ARMOR: 'heavy_armor',
        
        // Glove types
        LIGHT_GLOVES: 'light_gloves',
        HEAVY_GLOVES: 'heavy_gloves',
        
        // Boot types
        LIGHT_BOOTS: 'light_boots',
        HEAVY_BOOTS: 'heavy_boots',
        
        // Accessory types
        RING: 'ring',
        NECKLACE: 'necklace',
        AMULET: 'amulet',
        CHARM: 'charm',
        BRACELET: 'bracelet'
    },
    
    // Dual wield weapon types
    DUAL_WIELD_TYPES: ['dual_dagger', 'dual_blade', 'bow', 'crossbow', 'katana', 'knuckles'],
    
    // Item rarities
    RARITIES: {
        COMMON: {
            name: 'Common',
            color: '#aaaaaa',
            statMultiplier: 1.0
        },
        UNCOMMON: {
            name: 'Uncommon',
            color: '#00ff66',
            statMultiplier: 1.2
        },
        RARE: {
            name: 'Rare',
            color: '#00f3ff',
            statMultiplier: 1.5
        },
        EPIC: {
            name: 'Epic',
            color: '#ff00ff',
            statMultiplier: 2.0
        },
        LEGENDARY: {
            name: 'Legendary',
            color: '#f7ff00',
            statMultiplier: 3.0
        }
    },
    
    /**
     * Initialize the item system
     */
    init: function() {
        this.registerItems();
    },
    
    /**
     * Register all game items
     */
    registerItems: function() {
        // =============== WEAPONS ===============
        
// ================= Existing Items =================

// =============== WEAPONS ===============

// SWORD
this.registerItem({
    id: 'cyber_blade',
    name: 'Cyber Blade',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SWORD,
    rarity: this.RARITIES.UNCOMMON,
    description: 'A sharp blade with neon edges.',
    stats: {
        damage: 15,
        attackSpeed: 1.2
    },
    effects: ['Deals 5 bonus damage to robotic enemies'],
    icon: 'img/items/cyber_blade.jpg'
});

// DAGGER
this.registerItem({
    id: 'quantum_dagger',
    name: 'Quantum Dagger',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DAGGER,
    rarity: this.RARITIES.RARE,
    description: 'A dagger that can phase through armor.',
    stats: {
        damage: 12,
        attackSpeed: 1.5,
        critical: 10
    },
    effects: ['15% chance to ignore target defense'],
    icon: 'img/items/quantum_dagger.jpg'
});

// DUAL_DAGGER
this.registerItem({
    id: 'twin_fangs',
    name: 'Twin Fangs',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DUAL_DAGGER,
    rarity: this.RARITIES.EPIC,
    description: 'A pair of venomous daggers that strike like serpents.',
    stats: {
        damage: 10,
        attackSpeed: 1.8,
        critical: 15
    },
    effects: ['Each hit has 10% chance to poison target'],
    icon: 'img/items/twin_fangs.jpg'
});

// DUAL_BLADE
this.registerItem({
    id: 'binary_blades',
    name: 'Binary Blades',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DUAL_BLADE,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Twin energy blades that cut through code and matter alike.',
    stats: {
        damage: 25,
        attackSpeed: 1.4,
        critical: 8
    },
    effects: ['Attacks hit twice, with the second hit dealing 50% damage'],
    icon: 'img/items/binary_blades.jpg'
});

// BOW
this.registerItem({
    id: 'pulse_bow',
    name: 'Pulse Bow',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.BOW,
    rarity: this.RARITIES.RARE,
    description: 'A bow that fires concentrated energy pulses.',
    stats: {
        damage: 10,
        attackSpeed: 1,
        range: 180
    },
    effects: ['Arrows penetrate through up to 3 targets'],
    icon: 'img/items/pulse_bow.jpg'
});

// CROSSBOW
this.registerItem({
    id: 'auto_crossbow',
    name: 'Auto-Crossbow',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.CROSSBOW,
    rarity: this.RARITIES.EPIC,
    description: 'An automated crossbow with rapid-fire capability.',
    stats: {
        damage: 16,
        attackSpeed: 200,
        range: 180
    },
    effects: ['25% chance to fire an additional bolt'],
    icon: 'img/items/auto_crossbow.jpg'
});

// STAFF
this.registerItem({
    id: 'data_staff',
    name: 'Data Staff',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.STAFF,
    rarity: this.RARITIES.RARE,
    description: 'A staff channeling digital energies.',
    stats: {
        magicDamage: 15,
        attackSpeed: 0.5,
        intelligence: 5
    },
    effects: ['Spells cost 15% less energy'],
    icon: 'img/items/data_staff.jpg'
});

// KATANA
this.registerItem({
    id: 'neon_katana',
    name: 'Neon Katana',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.KATANA,
    rarity: this.RARITIES.EPIC,
    description: 'A razor-sharp blade with neon edge technology.',
    stats: {
        damage: 22,
        attackSpeed: 1.2,
        critical: 12
    },
    effects: ['Critical hits cause bleeding for 3 seconds'],
    icon: 'img/items/neon_katana.jpg'
});

// KNUCKLES
this.registerItem({
    id: 'shock_knuckles',
    name: 'Shock Knuckles',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.KNUCKLES,
    rarity: this.RARITIES.UNCOMMON,
    description: 'Electrified knuckles that deliver stunning punches.',
    stats: {
        damage: 8,
        attackSpeed: 1.8,
        evasion: 5
    },
    effects: ['15% chance to stun target for 1 second'],
    icon: 'img/items/shock_knuckles.jpg'
});

// SPEAR
this.registerItem({
    id: 'volt_lance',
    name: 'Volt Lance',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SPEAR,
    rarity: this.RARITIES.RARE,
    description: 'A spear charged with electrical energy.',
    stats: {
        damage: 20,
        attackSpeed: 1.0,
        range: 80
    },
    effects: ['Attacks chain to nearby enemies for 30% damage'],
    icon: 'img/items/volt_lance.jpg'
});

// SCYTHE
this.registerItem({
    id: 'data_reaper',
    name: 'Data Reaper',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SCYTHE,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A scythe that harvests digital souls.',
    stats: {
        damage: 30,
        attackSpeed: 0.7,
        critical: 15
    },
    effects: ['Defeated enemies explode, dealing damage to nearby foes'],
    icon: 'img/items/data_reaper.jpg'
});

// WAND
this.registerItem({
    id: 'code_wand',
    name: 'Code Wand',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.WAND,
    rarity: this.RARITIES.UNCOMMON,
    description: 'A wand that manipulates code structures.',
    stats: {
        magicDamage: 15,
        attackSpeed: 1.2,
        intelligence: 8
    },
    effects: ['10% chance to temporarily disable enemy abilities'],
    icon: 'img/items/code_wand.jpg'
});

// GRIMOIRE
this.registerItem({
    id: 'algorithm_grimoire',
    name: 'Algorithm Grimoire',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.GRIMOIRE,
    rarity: this.RARITIES.EPIC,
    description: 'A tome containing powerful algorithms and spells.',
    stats: {
        magicDamage: 28,
        attackSpeed: 0.9,
        intelligence: 15
    },
    effects: ['Spells have 20% increased area of effect'],
    icon: 'img/items/algorithm_grimoire.jpg'
});

// RIFLE
this.registerItem({
    id: 'laser_rifle',
    name: 'Laser Rifle',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.RIFLE,
    rarity: this.RARITIES.COMMON,
    description: 'A basic rifle that fires concentrated laser beams.',
    stats: {
        damage: 18,
        attackSpeed: 1.0,
        range: 250
    },
    effects: ['Slight chance to overheat enemy circuits'],
    icon: 'img/items/laser_rifle.jpg'
});

this.registerItem({
    id: 'plasma_carbine',
    name: 'Plasma Carbine',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.RIFLE,
    rarity: this.RARITIES.UNCOMMON,
    description: 'A mid-range carbine that shoots searing plasma bolts.',
    stats: {
        damage: 22,
        attackSpeed: 1.1,
        range: 220
    },
    effects: ['20% chance to cause a burn effect'],
    icon: 'img/items/plasma_carbine.jpg'
});

this.registerItem({
    id: 'railgun',
    name: 'Railgun',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.RIFLE,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A high-precision railgun that uses electromagnetic force to launch projectiles.',
    stats: {
        damage: 35,
        attackSpeed: 0.8,
        range: 300,
        critical: 20
    },
    effects: ['Pierces through enemy armor with devastating impact'],
    icon: 'img/items/railgun.jpg'
});

// Legacy Weapons (No specific equipmentType)
this.registerItem({
    id: 'plasma_pistol',
    name: 'Plasma Pistol',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.RIFLE,
    rarity: this.RARITIES.RARE,
    description: 'A pistol that fires concentrated plasma bolts.',
    stats: {
        damage: 20,
        attackSpeed: 1.0,
        range: 150
    },
    effects: ['20% chance to apply a burn effect'],
    icon: 'img/items/plasma_pistol.jpg'
});



// =============== ARMOR ===============

// LIGHT_ARMOR
this.registerItem({
    id: 'synth_vest',
    name: 'Synthetic Vest',
    category: this.CATEGORIES.ARMOR,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_ARMOR,
    rarity: this.RARITIES.COMMON,
    description: 'Basic protection made from synthetic fibers.',
    stats: {
        defense: 10,
        hp: 20
    },
    effects: [],
    icon: 'img/items/synth_vest.jpg'
});

this.registerItem({
    id: 'nano_jacket',
    name: 'Nano Jacket',
    category: this.CATEGORIES.ARMOR,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_ARMOR,
    rarity: this.RARITIES.UNCOMMON,
    description: 'A flexible jacket reinforced with nanofibers for enhanced agility.',
    stats: {
        defense: 15,
        hp: 30,
        agility: 5
    },
    effects: ['Boosts dodge chance by 5%'],
    icon: 'img/items/nano_jacket.jpg'
});

// MEDIUM_ARMOR
this.registerItem({
    id: 'nano_armor',
    name: 'Nano Armor',
    category: this.CATEGORIES.ARMOR,
    equipmentType: this.EQUIPMENT_TYPES.MEDIUM_ARMOR,
    rarity: this.RARITIES.RARE,
    description: 'Armor made from nanobots that adapt to damage.',
    stats: {
        defense: 25,
        hp: 50,
        magicDefense: 15
    },
    effects: ['Regenerates 1 HP per second'],
    icon: 'img/items/nano_armor.jpg'
});

this.registerItem({
    id: 'reactive_body_armor',
    name: 'Reactive Body Armor',
    category: this.CATEGORIES.ARMOR,
    equipmentType: this.EQUIPMENT_TYPES.MEDIUM_ARMOR,
    rarity: this.RARITIES.RARE,
    description: 'Armor that adapts to incoming attacks to reduce damage.',
    stats: {
        defense: 30,
        hp: 60,
        magicDefense: 20
    },
    effects: ['Triggers a damage absorption shield for 2 seconds when hit'],
    icon: 'img/items/reactive_body_armor.jpg'
});

// HEAVY_ARMOR
this.registerItem({
    id: 'cybernetic_plate',
    name: 'Cybernetic Plate',
    category: this.CATEGORIES.ARMOR,
    equipmentType: this.EQUIPMENT_TYPES.HEAVY_ARMOR,
    rarity: this.RARITIES.EPIC,
    description: 'Heavy armor augmented with cybernetic enhancements.',
    stats: {
        defense: 40,
        hp: 80,
        strength: 10
    },
    effects: ['Reduces physical damage by 15%'],
    icon: 'img/items/cybernetic_plate.jpg'
});

this.registerItem({
    id: 'exoskeletal_suit',
    name: 'Exoskeletal Suit',
    category: this.CATEGORIES.ARMOR,
    equipmentType: this.EQUIPMENT_TYPES.HEAVY_ARMOR,
    rarity: this.RARITIES.EPIC,
    description: 'An advanced suit that enhances physical prowess and durability.',
    stats: {
        defense: 45,
        hp: 90,
        strength: 15
    },
    effects: ['Increases strength by 10% and reduces knockback'],
    icon: 'img/items/exoskeletal_suit.jpg'
});

// SHIELD
this.registerItem({
    id: 'quantum_shield',
    name: 'Quantum Shield',
    category: this.CATEGORIES.ARMOR,
    equipmentType: 'shield', // Using string directly for backward compatibility
    rarity: this.RARITIES.LEGENDARY,
    description: 'A shield that exists in multiple dimensions simultaneously.',
    stats: {
        defense: 50,
        hp: 100,
        magicDefense: 50,
        evasion: 10
    },
    effects: ['15% chance to completely negate damage'],
    icon: 'img/items/quantum_shield.jpg'
});

// =============== GLOVES ===============

// LIGHT_GLOVES
this.registerItem({
    id: 'cyber_gloves',
    name: 'Cyber Gloves',
    category: this.CATEGORIES.GLOVES,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_GLOVES,
    rarity: this.RARITIES.UNCOMMON,
    description: 'Lightweight gloves with enhanced grip and dexterity.',
    stats: {
        dexterity: 8,
        attackSpeed: 0.1,
        critical: 5
    },
    effects: ['Increases critical hit damage by 10%'],
    icon: 'img/items/cyber_gloves.jpg'
});

// HEAVY_GLOVES
this.registerItem({
    id: 'power_gauntlets',
    name: 'Power Gauntlets',
    category: this.CATEGORIES.GLOVES,
    equipmentType: this.EQUIPMENT_TYPES.HEAVY_GLOVES,
    rarity: this.RARITIES.RARE,
    description: 'Heavy-duty gauntlets that enhance physical strength.',
    stats: {
        strength: 12,
        damage: 15,
        defense: 8
    },
    effects: ['Melee attacks deal 5% splash damage to nearby enemies'],
    icon: 'img/items/power_gauntlets.jpg'
});

// =============== BOOTS ===============

// LIGHT_BOOTS
this.registerItem({
    id: 'speed_runners',
    name: 'Speed Runners',
    category: this.CATEGORIES.BOOTS,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_BOOTS,
    rarity: this.RARITIES.UNCOMMON,
    description: 'Lightweight boots that enhance movement speed.',
    stats: {
        agility: 10,
        evasion: 8,
        attackSpeed: 0.1
    },
    effects: ['Increases movement speed by 15%'],
    icon: 'img/items/speed_runners.jpg'
});

// HEAVY_BOOTS
this.registerItem({
    id: 'gravity_stompers',
    name: 'Gravity Stompers',
    category: this.CATEGORIES.BOOTS,
    equipmentType: this.EQUIPMENT_TYPES.HEAVY_BOOTS,
    rarity: this.RARITIES.RARE,
    description: 'Heavy boots that manipulate gravity for powerful kicks.',
    stats: {
        strength: 8,
        defense: 12,
        damage: 10
    },
    effects: ['Jump attacks deal 30% increased damage'],
    icon: 'img/items/gravity_stompers.jpg'
});

// =============== ACCESSORIES ===============

// RING
this.registerItem({
    id: 'neural_implant',
    name: 'Neural Implant',
    category: this.CATEGORIES.ACCESSORY,
    equipmentType: this.EQUIPMENT_TYPES.RING,
    rarity: this.RARITIES.UNCOMMON,
    description: 'An implant that enhances cognitive functions.',
    stats: {
        intelligence: 10,
        magicDamage: 15
    },
    effects: ['Reduces skill cooldowns by 10%'],
    icon: 'img/items/neural_implant.jpg'
});

// BRACELET
this.registerItem({
    id: 'reflex_booster',
    name: 'Reflex Booster',
    category: this.CATEGORIES.ACCESSORY,
    equipmentType: this.EQUIPMENT_TYPES.BRACELET,
    rarity: this.RARITIES.RARE,
    description: 'A device that enhances reflexes and reaction time.',
    stats: {
        agility: 15,
        attackSpeed: 0.2,
        evasion: 5
    },
    effects: ['20% chance to dodge attacks'],
    icon: 'img/items/reflex_booster.jpg'
});

// AMULET
this.registerItem({
    id: 'chrono_amulet',
    name: 'Chrono Amulet',
    category: this.CATEGORIES.ACCESSORY,
    equipmentType: this.EQUIPMENT_TYPES.AMULET,
    rarity: this.RARITIES.LEGENDARY,
    description: 'An amulet that manipulates the flow of time.',
    stats: {
        attackSpeed: 0.5,
        cooldownReduction: 25,
        evasion: 15
    },
    effects: ['5% chance to reset skill cooldowns after use'],
    icon: 'img/items/chrono_amulet.jpg'
});

// NECKLACE
this.registerItem({
    id: 'neural_necklace',
    name: 'Neural Necklace',
    category: this.CATEGORIES.ACCESSORY,
    equipmentType: this.EQUIPMENT_TYPES.NECKLACE,
    rarity: this.RARITIES.EPIC,
    description: 'A necklace embedded with neural interface chips.',
    stats: {
        intelligence: 18,
        magicDamage: 20,
        magicDefense: 15
    },
    effects: ['Spells have 15% chance to critically hit'],
    icon: 'img/items/neural_necklace.jpg'
});

// CHARM
this.registerItem({
    id: 'luck_charm',
    name: 'Digital Fortune Charm',
    category: this.CATEGORIES.ACCESSORY,
    equipmentType: this.EQUIPMENT_TYPES.CHARM,
    rarity: this.RARITIES.RARE,
    description: 'A charm that manipulates probability algorithms in your favor.',
    stats: {
        luck: 20,
        critical: 10,
        evasion: 8
    },
    effects: ['10% chance to find additional loot'],
    icon: 'img/items/luck_charm.jpg'
});

// =============== CONSUMABLES ===============

this.registerItem({
    id: 'health_stim',
    name: 'Health Stimulator',
    category: this.CATEGORIES.CONSUMABLE,
    rarity: this.RARITIES.COMMON,
    description: 'A stimulant that restores health.',
    stats: {},
    effects: ['Restores 50 HP'],
    icon: 'img/items/health_stim.jpg',
    level: 1,
    stackable: true,
    maxStack: 10,
    useEffect: function(character) {
        character.heal(50);
        return true; // Item was consumed
    }
});

this.registerItem({
    id: 'energy_drink',
    name: 'Neon Energy Drink',
    category: this.CATEGORIES.CONSUMABLE,
    rarity: this.RARITIES.UNCOMMON,
    description: 'A drink that temporarily boosts energy and reflexes.',
    stats: {},
    effects: ['Increases attack speed by 50% for 30 seconds'],
    icon: 'img/items/energy_drink.jpg',
    level: 5,
    stackable: true,
    maxStack: 5,
    useEffect: function(character) {
        character.addBuff('attackSpeed', 0.5, 30);
        return true; // Item was consumed
    }
});

this.registerItem({
    id: 'nano_repair',
    name: 'Nano Repair Kit',
    category: this.CATEGORIES.CONSUMABLE,
    rarity: this.RARITIES.RARE,
    description: 'A kit that deploys nanobots to repair damage over time.',
    stats: {},
    effects: ['Restores 10 HP per second for 10 seconds'],
    icon: 'img/items/nano_repair.jpg',
    level: 10,
    stackable: true,
    maxStack: 3,
    useEffect: function(character) {
        character.addHealOverTime(10, 10);
        return true; // Item was consumed
    }
});

// =============== MATERIALS ===============

this.registerItem({
    id: 'scrap_metal',
    name: 'Scrap Metal',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.COMMON,
    description: 'Common metal scraps used for crafting.',
    stats: {},
    effects: [],
    icon: 'img/items/scrap_metal.jpg',
    stackable: true,
    maxStack: 99
});

this.registerItem({
    id: 'circuit_board',
    name: 'Circuit Board',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.UNCOMMON,
    description: 'Electronic components used for advanced crafting.',
    stats: {},
    effects: [],
    icon: 'img/items/circuit_board.jpg',
    stackable: true,
    maxStack: 50
});

this.registerItem({
    id: 'quantum_core',
    name: 'Quantum Core',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.EPIC,
    description: 'A rare material that can manipulate quantum states.',
    stats: {},
    effects: [],
    icon: 'img/items/quantum_core.jpg',
    stackable: true,
    maxStack: 10
});

this.registerItem({
    id: 'cyber_scrap',
    name: 'Cyber Scrap',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.COMMON,
    description: 'Scrap components from dismantled cybernetic devices.',
    stats: {},
    effects: [],
    icon: 'img/items/cyber_scrap.jpg',
    stackable: true,
    maxStack: 99
});

this.registerItem({
    id: 'encrypted_data_shard',
    name: 'Encrypted Data Shard',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.RARE,
    description: 'A mysterious shard containing encrypted corporate data. (Quest Item)',
    stats: {},
    effects: [],
    icon: 'img/items/encrypted_data_shard.jpg',
    stackable: true,
    maxStack: 99
});

// Materials
// 
this.registerItem({
    id: 'quantum_alloy',
    name: 'Quantum Alloy',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.RARE,
    description: 'A metal that shifts its properties based on quantum states, making it highly adaptable for various uses.',
    stats: {},
    effects: [],
    icon: 'img/items/quantum_alloy.jpg',
    stackable: true,
    maxStack: 99
});

//
this.registerItem({
    id: 'encrypted_data_chip',
    name: 'Encrypted Data Chip',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.UNCOMMON,
    description: 'A compact chip containing highly sensitive data, sought after by hackers and corporations alike.',
    stats: {},
    effects: [],
    icon: 'img/items/encrypted_data_chip.jpg',
    stackable: true,
    maxStack: 99
});

//
this.registerItem({
    id: 'synth_leather',
    name: 'Synth-Leather',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.COMMON,
    description: 'A synthetic leather alternative, durable and stylish, commonly used in cyberpunk fashion.',
    stats: {},
    effects: [],
    icon: 'img/items/synth_leather.jpg',
    stackable: true,
    maxStack: 99
});

// 
this.registerItem({
    id: 'plasma_cell',
    name: 'Plasma Cell',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.RARE,
    description: 'A small but powerful energy source, used to power advanced technology and weapons.',
    stats: {},
    effects: [],
    icon: 'img/items/plasma_cell.jpg',
    stackable: true,
    maxStack: 99
});

// 
this.registerItem({
    id: 'nano_concrete',
    name: 'Nano-Concrete',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.UNCOMMON,
    description: 'Concrete infused with nanobots, capable of self-repair and used in the construction of megastructures.',
    stats: {},
    effects: [],
    icon: 'img/items/nano_concrete.jpg',
    stackable: true,
    maxStack: 99
});

// 
this.registerItem({
    id: 'carbon_fiber_weave',
    name: 'Carbon Fiber Weave',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.COMMON,
    description: 'A lightweight yet strong material, perfect for reinforcing armor or building fast vehicles.',
    stats: {},
    effects: [],
    icon: 'img/items/carbon_fiber_weave.jpg',
    stackable: true,
    maxStack: 99
});

// 
this.registerItem({
    id: 'dark_matter_shard',
    name: 'Dark Matter Shard',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.EPIC,
    description: 'A fragment of exotic matter with mysterious properties, highly coveted by scientists and tech innovators.',
    stats: {},
    effects: [],
    icon: 'img/items/dark_matter_shard.jpg',
    stackable: true,
    maxStack: 10
});

// 
this.registerItem({
    id: 'neural_interface_gel',
    name: 'Neural Interface Gel',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.RARE,
    description: 'A conductive gel used to connect cybernetic implants to the human nervous system.',
    stats: {},
    effects: [],
    icon: 'img/items/neural_interface_gel.jpg',
    stackable: true,
    maxStack: 99
});

// 
this.registerItem({
    id: 'chang_chip',
    name: 'Chang Chip',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.UNCOMMON,
    description: 'A physical chip containing digital currency, used in the underground markets of the cyberpunk world.',
    stats: {},
    effects: [],
    icon: 'img/items/chang_chip.jpg',
    stackable: true,
    maxStack: 100000000
});

// 
this.registerItem({
    id: 'smart_polymer',
    name: 'Smart Polymer',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.RARE,
    description: 'A programmable material that can change its shape and properties, offering endless possibilities.',
    stats: {},
    effects: [],
    icon: 'img/items/smart_polymer.jpg',
    stackable: true,
    maxStack: 99
});

this.registerItem({
    id: 'neon_circuit',
    name: 'Neon Circuit',
    category: this.CATEGORIES.MATERIAL,
    rarity: this.RARITIES.UNCOMMON,
    description: 'A discarded circuit board with neon traces, rumored to power advanced tech.',
    stats: {},
    effects: [],
    icon: 'img/items/neon_circuit.jpg',
    stackable: true,
    maxStack: 50
});


// Epic Defense Ring
this.registerItem({
    id: 'fortified_ring',
    name: 'Fortified Ring',
    category: this.CATEGORIES.ACCESSORY,
    equipmentType: this.EQUIPMENT_TYPES.RING,
    rarity: this.RARITIES.EPIC,
    description: 'A ring pulsing with protective energy.',
    stats: { hp: 100, defense: 10, magicDefense: 10 },
    effects: ['Increases max HP by 10%'],
    icon: 'img/items/fortified_ring.jpg'
});

// Epic Attack Ring
this.registerItem({
    id: 'assault_ring',
    name: 'Assault Ring',
    category: this.CATEGORIES.ACCESSORY,
    equipmentType: this.EQUIPMENT_TYPES.RING,
    rarity: this.RARITIES.EPIC,
    description: 'A ring that sharpens the wearer’s combat edge.',
    stats: { damage: 15, critical: 5 },
    effects: ['Increases critical chance by 5%'],
    icon: 'img/items/assault_ring.jpg'
});

// Legendary Defense Ring
this.registerItem({
    id: 'invincible_ring',
    name: 'Invincible Ring',
    category: this.CATEGORIES.ACCESSORY,
    equipmentType: this.EQUIPMENT_TYPES.RING,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A ring that defies damage with ancient tech.',
    stats: { hp: 150, defense: 15, magicDefense: 15 },
    effects: ['Grants a 10% chance to negate damage'],
    icon: 'img/items/invincible_ring.jpg'
});

// Legendary Attack Ring
this.registerItem({
    id: 'berserker_ring',
    name: 'Berserker Ring',
    category: this.CATEGORIES.ACCESSORY,
    equipmentType: this.EQUIPMENT_TYPES.RING,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A ring that thrives on bloodshed.',
    stats: { damage: 25, critical: 10 },
    effects: ['Each kill increases damage by 5% for 10 seconds, stacks up to 5 times'],
    icon: 'img/items/berserker_ring.jpg'
});

// Epic Defense Light Boots
this.registerItem({
    id: 'fortified_light_boots',
    name: 'Fortified Light Boots',
    category: this.CATEGORIES.BOOTS,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_BOOTS,
    rarity: this.RARITIES.EPIC,
    description: 'Boots with shock-absorbing tech for survival.',
    stats: { defense: 10, hp: 40, evasion: 5 },
    effects: ['Increases movement speed by 10% when health is below 50%'],
    icon: 'img/items/fortified_light_boots.jpg'
});

// Epic Attack Light Boots
this.registerItem({
    id: 'assault_light_boots',
    name: 'Assault Light Boots',
    category: this.CATEGORIES.BOOTS,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_BOOTS,
    rarity: this.RARITIES.EPIC,
    description: 'Boots built for swift and deadly maneuvers.',
    stats: { attackSpeed: 0.1, critical: 5, movementSpeed: 10 },
    effects: ['Dash attacks deal 20% more damage'],
    icon: 'img/items/assault_light_boots.jpg'
});

// Legendary Defense Light Boots
this.registerItem({
    id: 'invincible_light_boots',
    name: 'Invincible Light Boots',
    category: this.CATEGORIES.BOOTS,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_BOOTS,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Boots that make the wearer untouchable in motion.',
    stats: { defense: 20, hp: 60, evasion: 10 },
    effects: ['Grants a 15% chance to dodge attacks'],
    icon: 'img/items/invincible_light_boots.jpg'
});

// Legendary Attack Light Boots
this.registerItem({
    id: 'berserker_light_boots',
    name: 'Berserker Light Boots',
    category: this.CATEGORIES.BOOTS,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_BOOTS,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Boots that accelerate combat rage.',
    stats: { attackSpeed: 0.15, critical: 8, movementSpeed: 15 },
    effects: ['Each kill increases movement speed by 5% for 5 seconds, stacks up to 5 times'],
    icon: 'img/items/berserker_light_boots.jpg'
});



// Epic Defense Light Gloves
this.registerItem({
    id: 'fortified_light_gloves',
    name: 'Fortified Light Gloves',
    category: this.CATEGORIES.GLOVES,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_GLOVES,
    rarity: this.RARITIES.EPIC,
    description: 'Gloves with embedded plating for enhanced resilience.',
    stats: { defense: 15, hp: 50 },
    effects: ['Increases block chance by 5%'],
    icon: 'img/items/fortified_light_gloves.jpg'
});

// Epic Attack Light Gloves
this.registerItem({
    id: 'assault_light_gloves',
    name: 'Assault Light Gloves',
    category: this.CATEGORIES.GLOVES,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_GLOVES,
    rarity: this.RARITIES.EPIC,
    description: 'Gloves optimized for rapid, lethal strikes.',
    stats: { attackSpeed: 0.1, critical: 5 },
    effects: ['Increases critical damage by 10%'],
    icon: 'img/items/assault_light_gloves.jpg'
});

// Legendary Defense Light Gloves
this.registerItem({
    id: 'invincible_light_gloves',
    name: 'Invincible Light Gloves',
    category: this.CATEGORIES.GLOVES,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_GLOVES,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Gloves that turn hands into unbreakable shields.',
    stats: { defense: 25, hp: 80 },
    effects: ['Reflects 10% of incoming damage back to the attacker'],
    icon: 'img/items/invincible_light_gloves.jpg'
});

// Legendary Attack Light Gloves
this.registerItem({
    id: 'berserker_light_gloves',
    name: 'Berserker Light Gloves',
    category: this.CATEGORIES.GLOVES,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_GLOVES,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Gloves that amplify every punch with fury.',
    stats: { attackSpeed: 0.2, critical: 10 },
    effects: ['Each consecutive hit on the same target increases damage by 5%, up to 25%'],
    icon: 'img/items/berserker_light_gloves.jpg'
});

// Epic Defense Light Armor
this.registerItem({
    id: 'fortified_light_armor',
    name: 'Fortified Light Armor',
    category: this.CATEGORIES.ARMOR,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_ARMOR,
    rarity: this.RARITIES.EPIC,
    description: 'A sleek suit with reinforced nanomesh for urban survival.',
    stats: { defense: 40, hp: 100 },
    effects: ['Reduces incoming damage by 10%'],
    icon: 'img/items/fortified_light_armor.jpg'
});

// Epic Attack Light Armor
this.registerItem({
    id: 'assault_light_armor',
    name: 'Assault Light Armor',
    category: this.CATEGORIES.ARMOR,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_ARMOR,
    rarity: this.RARITIES.EPIC,
    description: 'Light armor wired to amplify combat aggression.',
    stats: { defense: 30, damage: 10, critical: 5 },
    effects: ['Increases damage by 5%'],
    icon: 'img/items/assault_light_armor.jpg'
});

// Legendary Defense Light Armor
this.registerItem({
    id: 'invincible_light_armor',
    name: 'Invincible Light Armor',
    category: this.CATEGORIES.ARMOR,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_ARMOR,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A masterpiece of cybernetic defense technology.',
    stats: { defense: 60, hp: 150 },
    effects: ['Grants immunity to critical hits'],
    icon: 'img/items/invincible_light_armor.jpg'
});

// Legendary Attack Light Armor
this.registerItem({
    id: 'berserker_light_armor',
    name: 'Berserker Light Armor',
    category: this.CATEGORIES.ARMOR,
    equipmentType: this.EQUIPMENT_TYPES.LIGHT_ARMOR,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Armor that fuels a relentless assault in neon-lit streets.',
    stats: { defense: 40, damage: 20, critical: 10 },
    effects: ['Each kill increases damage by 2% for 10 seconds, stacks up to 10 times'],
    icon: 'img/items/berserker_light_armor.jpg'
});

// Epic Attack Sword
this.registerItem({
    id: 'razor_sword',
    name: 'Razor Sword',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SWORD,
    rarity: this.RARITIES.EPIC,
    description: 'A neon-edged blade that slices through armor with precision.',
    stats: { damage: 50, attackSpeed: 1.2, critical: 15 },
    effects: ['Increases critical damage by 20%'],
    icon: 'img/items/razor_sword.jpg'
});

// Epic Defense Sword
this.registerItem({
    id: 'guardian_sword',
    name: 'Guardian Sword',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SWORD,
    rarity: this.RARITIES.EPIC,
    description: 'A blade with integrated shielding tech for the wielder’s safety.',
    stats: { damage: 40, defense: 20 },
    effects: ['Each hit has a 10% chance to grant a shield absorbing 30 damage'],
    icon: 'img/items/guardian_sword.jpg'
});

// Legendary Attack Sword
this.registerItem({
    id: 'apocalypse_sword',
    name: 'Apocalypse Sword',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SWORD,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A devastating weapon forged in the fires of a dying city.',
    stats: { damage: 70, attackSpeed: 1.3, critical: 20 },
    effects: ['Attacks have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_sword.jpg'
});

// Legendary Defense Sword
this.registerItem({
    id: 'aegis_sword',
    name: 'Aegis Sword',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SWORD,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A blade that channels energy into a protective barrier.',
    stats: { damage: 55, defense: 30 },
    effects: ['Killing an enemy grants a shield equal to 15% of max HP'],
    icon: 'img/items/aegis_sword.jpg'
});

// Register Epic and Legendary items for each equipment type

// =============== DAGGER ===============
// Epic Attack Dagger
this.registerItem({
    id: 'razor_dagger',
    name: 'Razor Dagger',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DAGGER,
    rarity: this.RARITIES.EPIC,
    description: 'A swift blade with a neon edge, perfect for quick strikes.',
    stats: { damage: 40, attackSpeed: 1.5, critical: 10 },
    effects: ['Increases critical damage by 15%'],
    icon: 'img/items/razor_dagger.jpg'
});

// Epic Defense Dagger
this.registerItem({
    id: 'guardian_dagger',
    name: 'Guardian Dagger',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DAGGER,
    rarity: this.RARITIES.EPIC,
    description: 'A dagger with a built-in energy shield for protection.',
    stats: { damage: 30, defense: 15 },
    effects: ['Each hit has a 10% chance to grant a shield absorbing 20 damage'],
    icon: 'img/items/guardian_dagger.jpg'
});

// Legendary Attack Dagger
this.registerItem({
    id: 'apocalypse_dagger',
    name: 'Apocalypse Dagger',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DAGGER,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A dagger forged in the heart of a collapsing star, dealing massive damage.',
    stats: { damage: 60, attackSpeed: 1.6, critical: 15 },
    effects: ['Attacks have a 15% chance to deal triple damage'],
    icon: 'img/items/apocalypse_dagger.jpg'
});

// Legendary Defense Dagger
this.registerItem({
    id: 'aegis_dagger',
    name: 'Aegis Dagger',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DAGGER,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A dagger that channels defensive energy, protecting the wielder.',
    stats: { damage: 45, defense: 25 },
    effects: ['Killing an enemy grants a shield equal to 20% of max HP'],
    icon: 'img/items/aegis_dagger.jpg'
});

// =============== DUAL_DAGGER ===============
// Epic Attack Dual Dagger
this.registerItem({
    id: 'razor_dual_dagger',
    name: 'Razor Dual Dagger',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DUAL_DAGGER,
    rarity: this.RARITIES.EPIC,
    description: 'Twin daggers with neon edges, designed for rapid slashes.',
    stats: { damage: 35, attackSpeed: 1.8, critical: 12 },
    effects: ['Each hit has a 10% chance to strike twice'],
    icon: 'img/items/razor_dual_dagger.jpg'
});

// Epic Defense Dual Dagger
this.registerItem({
    id: 'guardian_dual_dagger',
    name: 'Guardian Dual Dagger',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DUAL_DAGGER,
    rarity: this.RARITIES.EPIC,
    description: 'Dual daggers with integrated shielding for the agile fighter.',
    stats: { damage: 25, defense: 20 },
    effects: ['Each hit has a 10% chance to grant a shield absorbing 25 damage'],
    icon: 'img/items/guardian_dual_dagger.jpg'
});

// Legendary Attack Dual Dagger
this.registerItem({
    id: 'apocalypse_dual_dagger',
    name: 'Apocalypse Dual Dagger',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DUAL_DAGGER,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Twin blades that bring destruction with every slash.',
    stats: { damage: 55, attackSpeed: 1.9, critical: 18 },
    effects: ['Each hit has a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_dual_dagger.jpg'
});

// Legendary Defense Dual Dagger
this.registerItem({
    id: 'aegis_dual_dagger',
    name: 'Aegis Dual Dagger',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DUAL_DAGGER,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Dual daggers that create a protective aura with each strike.',
    stats: { damage: 40, defense: 30 },
    effects: ['Killing an enemy grants a shield equal to 15% of max HP'],
    icon: 'img/items/aegis_dual_dagger.jpg'
});

// =============== DUAL_BLADE ===============
// Epic Attack Dual Blade
this.registerItem({
    id: 'razor_dual_blade',
    name: 'Razor Dual Blade',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DUAL_BLADE,
    rarity: this.RARITIES.EPIC,
    description: 'Twin blades with energy edges, slicing through foes effortlessly.',
    stats: { damage: 45, attackSpeed: 1.4, critical: 10 },
    effects: ['Increases critical damage by 20%'],
    icon: 'img/items/razor_dual_blade.jpg'
});

// Epic Defense Dual Blade
this.registerItem({
    id: 'guardian_dual_blade',
    name: 'Guardian Dual Blade',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DUAL_BLADE,
    rarity: this.RARITIES.EPIC,
    description: 'Dual blades with defensive tech for the balanced warrior.',
    stats: { damage: 35, defense: 20 },
    effects: ['Each hit has a 10% chance to grant a shield absorbing 30 damage'],
    icon: 'img/items/guardian_dual_blade.jpg'
});

// Legendary Attack Dual Blade
this.registerItem({
    id: 'apocalypse_dual_blade',
    name: 'Apocalypse Dual Blade',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DUAL_BLADE,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Twin blades that bring ruin to all who oppose them.',
    stats: { damage: 65, attackSpeed: 1.5, critical: 15 },
    effects: ['Attacks have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_dual_blade.jpg'
});

// Legendary Defense Dual Blade
this.registerItem({
    id: 'aegis_dual_blade',
    name: 'Aegis Dual Blade',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.DUAL_BLADE,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Dual blades that protect the wielder with each swing.',
    stats: { damage: 50, defense: 30 },
    effects: ['Killing an enemy grants a shield equal to 15% of max HP'],
    icon: 'img/items/aegis_dual_blade.jpg'
});

// =============== BOW ===============
// Epic Attack Bow
this.registerItem({
    id: 'razor_bow',
    name: 'Razor Bow',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.BOW,
    rarity: this.RARITIES.EPIC,
    description: 'A high-tech bow with laser-guided arrows for precision.',
    stats: { damage: 45, attackSpeed: 1.0, range: 200 },
    effects: ['Increases critical damage by 20%'],
    icon: 'img/items/razor_bow.jpg'
});

// Epic Defense Bow
this.registerItem({
    id: 'guardian_bow',
    name: 'Guardian Bow',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.BOW,
    rarity: this.RARITIES.EPIC,
    description: 'A bow with a built-in energy shield for the archer.',
    stats: { damage: 35, defense: 20, range: 180 },
    effects: ['Each hit has a 10% chance to grant a shield absorbing 25 damage'],
    icon: 'img/items/guardian_bow.jpg'
});

// Legendary Attack Bow
this.registerItem({
    id: 'apocalypse_bow',
    name: 'Apocalypse Bow',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.BOW,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A bow that fires arrows of pure energy, devastating foes.',
    stats: { damage: 65, attackSpeed: 1.1, range: 220 },
    effects: ['Attacks have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_bow.jpg'
});

// Legendary Defense Bow
this.registerItem({
    id: 'aegis_bow',
    name: 'Aegis Bow',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.BOW,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A bow that creates a protective barrier with each shot.',
    stats: { damage: 50, defense: 30, range: 200 },
    effects: ['Killing an enemy grants a shield equal to 15% of max HP'],
    icon: 'img/items/aegis_bow.jpg'
});

// =============== CROSSBOW ===============
// Epic Attack Crossbow
this.registerItem({
    id: 'razor_crossbow',
    name: 'Razor Crossbow',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.CROSSBOW,
    rarity: this.RARITIES.EPIC,
    description: 'A compact crossbow with auto-reloading bolts.',
    stats: { damage: 50, attackSpeed: 0.9, range: 180 },
    effects: ['Increases critical damage by 20%'],
    icon: 'img/items/razor_crossbow.jpg'
});

// Epic Defense Crossbow
this.registerItem({
    id: 'guardian_crossbow',
    name: 'Guardian Crossbow',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.CROSSBOW,
    rarity: this.RARITIES.EPIC,
    description: 'A crossbow with integrated defensive systems.',
    stats: { damage: 40, defense: 20, range: 160 },
    effects: ['Each hit has a 10% chance to grant a shield absorbing 25 damage'],
    icon: 'img/items/guardian_crossbow.jpg'
});

// Legendary Attack Crossbow
this.registerItem({
    id: 'apocalypse_crossbow',
    name: 'Apocalypse Crossbow',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.CROSSBOW,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A crossbow that fires bolts of destructive energy.',
    stats: { damage: 70, attackSpeed: 1.0, range: 200 },
    effects: ['Attacks have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_crossbow.jpg'
});

// Legendary Defense Crossbow
this.registerItem({
    id: 'aegis_crossbow',
    name: 'Aegis Crossbow',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.CROSSBOW,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A crossbow that shields the user with each shot.',
    stats: { damage: 55, defense: 30, range: 180 },
    effects: ['Killing an enemy grants a shield equal to 15% of max HP'],
    icon: 'img/items/aegis_crossbow.jpg'
});

// =============== STAFF ===============
// Epic Attack Staff
this.registerItem({
    id: 'razor_staff',
    name: 'Razor Staff',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.STAFF,
    rarity: this.RARITIES.EPIC,
    description: 'A staff channeling neon energy for devastating spells.',
    stats: { magicDamage: 50, attackSpeed: 0.8, intelligence: 15 },
    effects: ['Increases spell damage by 10%'],
    icon: 'img/items/razor_staff.jpg'
});

// Epic Defense Staff
this.registerItem({
    id: 'guardian_staff',
    name: 'Guardian Staff',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.STAFF,
    rarity: this.RARITIES.EPIC,
    description: 'A staff with protective runes for the caster.',
    stats: { magicDamage: 40, magicDefense: 20, intelligence: 10 },
    effects: ['Each spell cast has a 10% chance to grant a magic shield absorbing 30 damage'],
    icon: 'img/items/guardian_staff.jpg'
});

// Legendary Attack Staff
this.registerItem({
    id: 'apocalypse_staff',
    name: 'Apocalypse Staff',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.STAFF,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A staff that unleashes cataclysmic magic.',
    stats: { magicDamage: 70, attackSpeed: 0.9, intelligence: 20 },
    effects: ['Spells have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_staff.jpg'
});

// Legendary Defense Staff
this.registerItem({
    id: 'aegis_staff',
    name: 'Aegis Staff',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.STAFF,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A staff that fortifies the caster with each spell.',
    stats: { magicDamage: 55, magicDefense: 30, intelligence: 15 },
    effects: ['Killing an enemy with a spell grants a magic shield equal to 20% of max HP'],
    icon: 'img/items/aegis_staff.jpg'
});

// =============== KATANA ===============
// Epic Attack Katana
this.registerItem({
    id: 'razor_katana',
    name: 'Razor Katana',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.KATANA,
    rarity: this.RARITIES.EPIC,
    description: 'A katana with a neon blade, slicing through enemies with precision.',
    stats: { damage: 55, attackSpeed: 1.1, critical: 12 },
    effects: ['Increases critical damage by 20%'],
    icon: 'img/items/razor_katana.jpg'
});

// Epic Defense Katana
this.registerItem({
    id: 'guardian_katana',
    name: 'Guardian Katana',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.KATANA,
    rarity: this.RARITIES.EPIC,
    description: 'A katana with defensive enhancements for the samurai.',
    stats: { damage: 45, defense: 20 },
    effects: ['Each hit has a 10% chance to grant a shield absorbing 30 damage'],
    icon: 'img/items/guardian_katana.jpg'
});

// Legendary Attack Katana
this.registerItem({
    id: 'apocalypse_katana',
    name: 'Apocalypse Katana',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.KATANA,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A katana that brings doom to all who face it.',
    stats: { damage: 75, attackSpeed: 1.2, critical: 18 },
    effects: ['Attacks have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_katana.jpg'
});

// Legendary Defense Katana
this.registerItem({
    id: 'aegis_katana',
    name: 'Aegis Katana',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.KATANA,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A katana that shields the wielder with each strike.',
    stats: { damage: 60, defense: 30 },
    effects: ['Killing an enemy grants a shield equal to 15% of max HP'],
    icon: 'img/items/aegis_katana.jpg'
});

// =============== KNUCKLES ===============
// Epic Attack Knuckles
this.registerItem({
    id: 'razor_knuckles',
    name: 'Razor Knuckles',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.KNUCKLES,
    rarity: this.RARITIES.EPIC,
    description: 'Electrified knuckles that deliver shocking punches.',
    stats: { damage: 35, attackSpeed: 1.6, critical: 10 },
    effects: ['Increases critical damage by 15%'],
    icon: 'img/items/razor_knuckles.jpg'
});

// Epic Defense Knuckles
this.registerItem({
    id: 'guardian_knuckles',
    name: 'Guardian Knuckles',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.KNUCKLES,
    rarity: this.RARITIES.EPIC,
    description: 'Knuckles with reinforced plating for protection.',
    stats: { damage: 25, defense: 20 },
    effects: ['Each hit has a 10% chance to grant a shield absorbing 20 damage'],
    icon: 'img/items/guardian_knuckles.jpg'
});

// Legendary Attack Knuckles
this.registerItem({
    id: 'apocalypse_knuckles',
    name: 'Apocalypse Knuckles',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.KNUCKLES,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Knuckles that unleash devastating power with each punch.',
    stats: { damage: 55, attackSpeed: 1.7, critical: 15 },
    effects: ['Attacks have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_knuckles.jpg'
});

// Legendary Defense Knuckles
this.registerItem({
    id: 'aegis_knuckles',
    name: 'Aegis Knuckles',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.KNUCKLES,
    rarity: this.RARITIES.LEGENDARY,
    description: 'Knuckles that protect the user with each strike.',
    stats: { damage: 40, defense: 30 },
    effects: ['Killing an enemy grants a shield equal to 15% of max HP'],
    icon: 'img/items/aegis_knuckles.jpg'
});

// =============== SPEAR ===============
// Epic Attack Spear
this.registerItem({
    id: 'razor_spear',
    name: 'Razor Spear',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SPEAR,
    rarity: this.RARITIES.EPIC,
    description: 'A spear with a neon tip, piercing through armor.',
    stats: { damage: 50, attackSpeed: 1.0, range: 100 },
    effects: ['Increases critical damage by 20%'],
    icon: 'img/items/razor_spear.jpg'
});

// Epic Defense Spear
this.registerItem({
    id: 'guardian_spear',
    name: 'Guardian Spear',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SPEAR,
    rarity: this.RARITIES.EPIC,
    description: 'A spear with defensive enhancements for the lancer.',
    stats: { damage: 40, defense: 20, range: 90 },
    effects: ['Each hit has a 10% chance to grant a shield absorbing 30 damage'],
    icon: 'img/items/guardian_spear.jpg'
});

// Legendary Attack Spear
this.registerItem({
    id: 'apocalypse_spear',
    name: 'Apocalypse Spear',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SPEAR,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A spear that brings destruction with each thrust.',
    stats: { damage: 70, attackSpeed: 1.1, range: 120 },
    effects: ['Attacks have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_spear.jpg'
});

// Legendary Defense Spear
this.registerItem({
    id: 'aegis_spear',
    name: 'Aegis Spear',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SPEAR,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A spear that shields the wielder with each strike.',
    stats: { damage: 55, defense: 30, range: 100 },
    effects: ['Killing an enemy grants a shield equal to 15% of max HP'],
    icon: 'img/items/aegis_spear.jpg'
});

// =============== SCYTHE ===============
// Epic Attack Scythe
this.registerItem({
    id: 'razor_scythe',
    name: 'Razor Scythe',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SCYTHE,
    rarity: this.RARITIES.EPIC,
    description: 'A scythe with a glowing blade, reaping souls with ease.',
    stats: { damage: 60, attackSpeed: 0.9, critical: 10 },
    effects: ['Increases critical damage by 20%'],
    icon: 'img/items/razor_scythe.jpg'
});

// Epic Defense Scythe
this.registerItem({
    id: 'guardian_scythe',
    name: 'Guardian Scythe',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SCYTHE,
    rarity: this.RARITIES.EPIC,
    description: 'A scythe with protective enchantments for the reaper.',
    stats: { damage: 50, defense: 25 },
    effects: ['Each hit has a 10% chance to grant a shield absorbing 35 damage'],
    icon: 'img/items/guardian_scythe.jpg'
});

// Legendary Attack Scythe
this.registerItem({
    id: 'apocalypse_scythe',
    name: 'Apocalypse Scythe',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SCYTHE,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A scythe that brings the end to all who face it.',
    stats: { damage: 80, attackSpeed: 1.0, critical: 15 },
    effects: ['Attacks have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_scythe.jpg'
});

// Legendary Defense Scythe
this.registerItem({
    id: 'aegis_scythe',
    name: 'Aegis Scythe',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.SCYTHE,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A scythe that protects the wielder with each swing.',
    stats: { damage: 65, defense: 35 },
    effects: ['Killing an enemy grants a shield equal to 15% of max HP'],
    icon: 'img/items/aegis_scythe.jpg'
});

// =============== RIFLE ===============
// Epic Attack Rifle
this.registerItem({
    id: 'razor_rifle',
    name: 'Razor Rifle',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.RIFLE,
    rarity: this.RARITIES.EPIC,
    description: 'A high-powered rifle with neon sights for precision.',
    stats: { damage: 55, attackSpeed: 0.8, range: 250 },
    effects: ['Increases critical damage by 20%'],
    icon: 'img/items/razor_rifle.jpg'
});

// Epic Defense Rifle
this.registerItem({
    id: 'guardian_rifle',
    name: 'Guardian Rifle',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.RIFLE,
    rarity: this.RARITIES.EPIC,
    description: 'A rifle with integrated shielding for the marksman.',
    stats: { damage: 45, defense: 20, range: 230 },
    effects: ['Each hit has a 10% chance to grant a shield absorbing 30 damage'],
    icon: 'img/items/guardian_rifle.jpg'
});

// Legendary Attack Rifle
this.registerItem({
    id: 'apocalypse_rifle',
    name: 'Apocalypse Rifle',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.RIFLE,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A rifle that fires bolts of pure destruction.',
    stats: { damage: 75, attackSpeed: 0.9, range: 270 },
    effects: ['Attacks have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_rifle.jpg'
});

// Legendary Defense Rifle
this.registerItem({
    id: 'aegis_rifle',
    name: 'Aegis Rifle',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.RIFLE,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A rifle that shields the user with each shot.',
    stats: { damage: 60, defense: 30, range: 250 },
    effects: ['Killing an enemy grants a shield equal to 15% of max HP'],
    icon: 'img/items/aegis_rifle.jpg'
});

// =============== WAND ===============
// Epic Attack Wand
this.registerItem({
    id: 'razor_wand',
    name: 'Razor Wand',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.WAND,
    rarity: this.RARITIES.EPIC,
    description: 'A wand that channels neon energy for powerful spells.',
    stats: { magicDamage: 45, attackSpeed: 1.2, intelligence: 12 },
    effects: ['Increases spell damage by 10%'],
    icon: 'img/items/razor_wand.jpg'
});

// Epic Defense Wand
this.registerItem({
    id: 'guardian_wand',
    name: 'Guardian Wand',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.WAND,
    rarity: this.RARITIES.EPIC,
    description: 'A wand with protective enchantments for the caster.',
    stats: { magicDamage: 35, magicDefense: 20, intelligence: 10 },
    effects: ['Each spell cast has a 10% chance to grant a magic shield absorbing 25 damage'],
    icon: 'img/items/guardian_wand.jpg'
});

// Legendary Attack Wand
this.registerItem({
    id: 'apocalypse_wand',
    name: 'Apocalypse Wand',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.WAND,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A wand that unleashes devastating magic.',
    stats: { magicDamage: 65, attackSpeed: 1.3, intelligence: 18 },
    effects: ['Spells have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_wand.jpg'
});

// Legendary Defense Wand
this.registerItem({
    id: 'aegis_wand',
    name: 'Aegis Wand',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.WAND,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A wand that fortifies the caster with each spell.',
    stats: { magicDamage: 50, magicDefense: 30, intelligence: 15 },
    effects: ['Killing an enemy with a spell grants a magic shield equal to 20% of max HP'],
    icon: 'img/items/aegis_wand.jpg'
});

// =============== GRIMOIRE ===============
// Epic Attack Grimoire
this.registerItem({
    id: 'razor_grimoire',
    name: 'Razor Grimoire',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.GRIMOIRE,
    rarity: this.RARITIES.EPIC,
    description: 'A tome filled with neon spells for destruction.',
    stats: { magicDamage: 50, attackSpeed: 0.7, intelligence: 15 },
    effects: ['Increases spell damage by 10%'],
    icon: 'img/items/razor_grimoire.jpg'
});

// Epic Defense Grimoire
this.registerItem({
    id: 'guardian_grimoire',
    name: 'Guardian Grimoire',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.GRIMOIRE,
    rarity: this.RARITIES.EPIC,
    description: 'A tome with protective spells for the mage.',
    stats: { magicDamage: 40, magicDefense: 25, intelligence: 10 },
    effects: ['Each spell cast has a 10% chance to grant a magic shield absorbing 30 damage'],
    icon: 'img/items/guardian_grimoire.jpg'
});

// Legendary Attack Grimoire
this.registerItem({
    id: 'apocalypse_grimoire',
    name: 'Apocalypse Grimoire',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.GRIMOIRE,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A tome that brings cataclysmic magic to the battlefield.',
    stats: { magicDamage: 70, attackSpeed: 0.8, intelligence: 20 },
    effects: ['Spells have a 15% chance to deal double damage'],
    icon: 'img/items/apocalypse_grimoire.jpg'
});

// Legendary Defense Grimoire
this.registerItem({
    id: 'aegis_grimoire',
    name: 'Aegis Grimoire',
    category: this.CATEGORIES.WEAPON,
    equipmentType: this.EQUIPMENT_TYPES.GRIMOIRE,
    rarity: this.RARITIES.LEGENDARY,
    description: 'A tome that shields the caster with each spell.',
    stats: { magicDamage: 55, magicDefense: 35, intelligence: 15 },
    effects: ['Killing an enemy with a spell grants a magic shield equal to 20% of max HP'],
    icon: 'img/items/aegis_grimoire.jpg'
});

    // Placeholder Materials for Recycling
    this.registerItem({ id: 'common_material', name: 'Common Material', category: this.CATEGORIES.MATERIAL, rarity: this.RARITIES.COMMON, description: 'A common material obtained from recycling.', stackable: true, icon: 'img/items/cyber_scrap.png', maxStack: 99 });
    this.registerItem({ id: 'uncommon_material', name: 'Uncommon Material', category: this.CATEGORIES.MATERIAL, rarity: this.RARITIES.UNCOMMON, description: 'An uncommon material obtained from recycling.', stackable: true, icon: 'img/items/circuit_board.png', maxStack: 99 });
    this.registerItem({ id: 'rare_material', name: 'Rare Material', category: this.CATEGORIES.MATERIAL, rarity: this.RARITIES.RARE, description: 'A rare material obtained from recycling.', stackable: true, icon: 'img/items/quantum_alloy.jpg', maxStack: 99 });
    this.registerItem({ id: 'epic_material', name: 'Epic Material', category: this.CATEGORIES.MATERIAL, rarity: this.RARITIES.EPIC, description: 'An epic material obtained from recycling.', stackable: true, icon: 'img/items/dark_matter_shard.jpg', maxStack: 99 });
    this.registerItem({ id: 'legendary_material', name: 'Legendary Material', category: this.CATEGORIES.MATERIAL, rarity: this.RARITIES.LEGENDARY, description: 'A legendary material obtained from recycling.', stackable: true, icon: 'img/items/quantum_core.jpg', maxStack: 99 });
    },

    /**
     * Register a new item
     * @param {Object} itemData - Item data
     */
    registerItem: function(itemData) {
        this.registry[itemData.id] = itemData;
    },
    
    /**
     * Get an item by ID
     * @param {string} id - Item ID
     * @returns {Object|null} Item data or null if not found
     */
    getItem: function(id) {
        return this.registry[id] || null;
    },
    
    /**
     * Get an item's icon URL, falling back to a placeholder
     * @param {string} id - Item ID
     * @returns {string} Icon URL or placeholder data URL
     */
    getItemIcon: function(id) {
        const item = this.getItem(id);
        if (!item) return null;
        
        // Create placeholder regardless to avoid network errors
        const placeholderUrl = this.createPlaceholderImage(id);
        
        // Return the placeholder image URL
        return placeholderUrl;
    },
    
    /**
     * Create a new item instance
     * @param {string} id - Item ID
     * @param {number} quantity - Item quantity (for stackable items)
     * @returns {Object|null} Item instance or null if item not found
     */
    createItem: function(id, quantity = 1) {
        const itemData = this.getItem(id);
        if (!itemData) {
            return null;
        }
        
        const item = Object.assign({}, itemData);
        
        if (item.stackable) {
            item.quantity = Math.min(quantity, item.maxStack);
        } else {
            item.quantity = 1;
        }
        
        // Generate a unique instance ID
        item.instanceId = Utils.generateId();
        
        return item;
    },
    
    /**
     * Check if an item is equippable
     * @param {Object} item - Item data
     * @returns {boolean} True if item is equippable
     */
    isEquippable: function(item) {
        return item.category === this.CATEGORIES.WEAPON || 
               item.category === this.CATEGORIES.ARMOR || 
               item.category === this.CATEGORIES.GLOVES || 
               item.category === this.CATEGORIES.BOOTS || 
               item.category === this.CATEGORIES.ACCESSORY;
    },
    
    /**
     * Check if an item is usable
     * @param {Object} item - Item data
     * @returns {boolean} True if item is usable
     */
    isUsable: function(item) {
        return item.category === this.CATEGORIES.CONSUMABLE && typeof item.useEffect === 'function';
    },
    
    /**
     * Use an item on a character
     * @param {Object} item - Item data
     * @param {Object} character - Character to use item on
     * @returns {boolean} True if item was used successfully
     */
    useItem: function(item, character) {
        // Explicitly prevent using material or quest items
        if (item.category === this.CATEGORIES.MATERIAL || item.category === this.CATEGORIES.QUEST) {
            console.log(`Item ${item.id} is a ${item.category} and cannot be used.`);
            return false;
        }

        if (!this.isUsable(item)) {
            console.log(`Item ${item.id} is not usable.`);
            return false;
        }
        
        // Ensure useEffect exists before calling
        if (typeof item.useEffect === 'function') {
            return item.useEffect(character);
        } else {
            console.log(`Item ${item.id} has no useEffect function.`);
            return false;
        }
    },
    
    /**
     * Get items by category
     * @param {string} category - Item category
     * @returns {Array} Array of items in the category
     */
    getItemsByCategory: function(category) {
        return Object.values(this.registry).filter(item => item.category === category);
    },
    
    /**
     * Get items by rarity
     * @param {Object} rarity - Item rarity
     * @returns {Array} Array of items with the rarity
     */
    getItemsByRarity: function(rarity) {
        return Object.values(this.registry).filter(item => item.rarity === rarity);
    },
    
    /**
     * Get items by level range
     * @param {number} minLevel - Minimum level
     * @param {number} maxLevel - Maximum level
     * @returns {Array} Array of items in the level range
     */
    getItemsByLevelRange: function(minLevel, maxLevel) {
        return Object.values(this.registry).filter(item => 
            item.level >= minLevel && item.level <= maxLevel
        );
    },
    
    /**
     * Get a random item
     * @param {Object} options - Filter options (category, rarity, minLevel, maxLevel)
     * @returns {Object|null} Random item or null if no items match
     */
    getRandomItem: function(options = {}) {
        let items = Object.values(this.registry);
        
        if (options.category) {
            items = items.filter(item => item.category === options.category);
        }
        
        if (options.rarity) {
            items = items.filter(item => item.rarity === options.rarity);
        }
        
        if (options.minLevel !== undefined) {
            items = items.filter(item => item.level >= options.minLevel);
        }
        
        if (options.maxLevel !== undefined) {
            items = items.filter(item => item.level <= options.maxLevel);
        }
        
        if (items.length === 0) {
            return null;
        }
        
        return items[Utils.randomInt(0, items.length - 1)];
    },
    
    /**
     * Create a placeholder image for an item
     * @param {string} itemId - Item ID
     * @returns {string} Data URL for the placeholder image
     */
    createPlaceholderImage: function(itemId) {
        const item = this.getItem(itemId);
        if (!item) return null;
        
        // Create a canvas to draw the placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Background color based on rarity
        ctx.fillStyle = item.rarity.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Item name (first letter)
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.name.charAt(0), canvas.width / 2, canvas.height / 2);
        
        // Category icon
        let categorySymbol = '';
        switch (item.category) {
            case this.CATEGORIES.WEAPON: categorySymbol = '⚔️'; break;
            case this.CATEGORIES.ARMOR: categorySymbol = '🛡️'; break;
            case this.CATEGORIES.ACCESSORY: categorySymbol = '💍'; break;
            case this.CATEGORIES.CONSUMABLE: categorySymbol = '🧪'; break;
            case this.CATEGORIES.MATERIAL: categorySymbol = '⚙️'; break;
            case this.CATEGORIES.QUEST: categorySymbol = '📜'; break;
        }
        
        ctx.font = '16px Arial';
        ctx.fillText(categorySymbol, canvas.width / 2, canvas.height - 12);
        
        return canvas.toDataURL();
    }
};
