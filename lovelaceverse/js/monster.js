/**
 * Monster system for the Cyberpunk MMORPG game
 * Defines monster types, behaviors, and combat mechanics
 */

const MonsterSystem = {
    // Active monsters
    activeMonsters: [],
    
    // Monster types registry
    monsterTypes: {
        slime: { 
            type: 'basic', 
            maxHealth: 250, 
            attack: 10, 
            defense: 1, 
            speed: 0.8, 
            experienceValue: 70, 
            behavior: 'aggressive',
            sprite: 'img/monster/slime.png',
            hitSprite: 'img/monster/slimehit.png',
            attackHitSprite: 'img/monster/slimehit2.png',
            width: 128,
            height: 64,
            frameCount: 5,
            frameDuration: 200,
            dropRate: 0.8,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.1, quantity: [1, 1] },
                { itemId: 'laser_rifle', chance: 0.5, quantity: [1, 1] },
                { itemId: 'cyber_blade', chance: 0.01, quantity: [1, 1] },
                { itemId: 'shock_knuckles', chance: 0.01, quantity: [1, 1] },
                { itemId: 'code_wand', chance: 0.01, quantity: [1, 1] },
                { itemId: 'plasma_carbine', chance: 0.01, quantity: [1, 1] },
                { itemId: 'nano_jacket', chance: 0.01, quantity: [1, 1] },
                { itemId: 'cyber_gloves', chance: 0.01, quantity: [1, 1] },
                { itemId: 'speed_runners', chance: 0.01, quantity: [1, 1] },
                { itemId: 'neural_implant', chance: 0.01, quantity: [1, 1] },
                { itemId: 'laser_rifle', chance: 0.05, quantity: [1, 1] },
                { itemId: 'synth_vest', chance: 0.05, quantity: [1, 1] },
                { itemId: 'quantum_dagger', chance: 0.005, quantity: [1, 1] },
                { itemId: 'pulse_bow', chance: 0.005, quantity: [1, 1] },
                { itemId: 'data_staff', chance: 0.005, quantity: [1, 1] },
                { itemId: 'volt_lance', chance: 0.005, quantity: [1, 1] },
                { itemId: 'plasma_pistol', chance: 0.005, quantity: [1, 1] },
                { itemId: 'nano_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reactive_body_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'power_gauntlets', chance: 0.005, quantity: [1, 1] },
                { itemId: 'gravity_stompers', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reflex_booster', chance: 0.005, quantity: [1, 1] },
                { itemId: 'luck_charm', chance: 0.005, quantity: [1, 1] },
                { itemId: 'neon_circuit', chance: 0.1, quantity: [1, 1] },
                { itemId: "scrap_metal", chance: 0.1, quantity: [1, 1] },      // Common
                { itemId: "cyber_scrap", chance: 0.1, quantity: [1, 1] },       // Common
                { itemId: "circuit_board", chance: 0.1, quantity: [1, 1] }
            ]
        },
        snekk: { 
            type: 'basic', 
            maxHealth: 400, 
            attack: 10, 
            defense: 1, 
            speed: 0.8, 
            experienceValue: 70, 
            behavior: 'aggressive',
            sprite: 'img/monster/snekk.png',
            hitSprite: 'img/monster/snekkhit.png',
            attackHitSprite: 'img/monster/snekkhit2.png',
            width: 128,
            height: 64,
            frameCount: 5,
            frameDuration: 200,
            dropRate: 0.8,
            dropTable: [
                { itemId: 'circuit_board', chance: 0.1, quantity: [1, 1] },
                { itemId: 'laser_rifle', chance: 0.5, quantity: [1, 1] },
                { itemId: 'pulse_bow', chance: 0.5, quantity: [1, 1] },
                { itemId: 'synth_leather', chance: 0.1, quantity: [1, 1] },
                { itemId: 'cyber_blade', chance: 0.5, quantity: [1, 1] },
                { itemId: 'laser_rifle', chance: 0.5, quantity: [1, 1] },
                { itemId: 'cyber_blade', chance: 0.01, quantity: [1, 1] },
                { itemId: 'shock_knuckles', chance: 0.01, quantity: [1, 1] },
                { itemId: 'code_wand', chance: 0.01, quantity: [1, 1] },
                { itemId: 'plasma_carbine', chance: 0.01, quantity: [1, 1] },
                { itemId: 'nano_jacket', chance: 0.01, quantity: [1, 1] },
                { itemId: 'cyber_gloves', chance: 0.01, quantity: [1, 1] },
                { itemId: 'speed_runners', chance: 0.01, quantity: [1, 1] },
                { itemId: 'neural_implant', chance: 0.01, quantity: [1, 1] },
                { itemId: 'laser_rifle', chance: 0.05, quantity: [1, 1] },
                { itemId: 'synth_vest', chance: 0.05, quantity: [1, 1] },
                { itemId: 'quantum_dagger', chance: 0.005, quantity: [1, 1] },
                { itemId: 'pulse_bow', chance: 0.005, quantity: [1, 1] },
                { itemId: 'data_staff', chance: 0.005, quantity: [1, 1] },
                { itemId: 'volt_lance', chance: 0.005, quantity: [1, 1] },
                { itemId: 'plasma_pistol', chance: 0.005, quantity: [1, 1] },
                { itemId: 'nano_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reactive_body_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'power_gauntlets', chance: 0.005, quantity: [1, 1] },
                { itemId: 'gravity_stompers', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reflex_booster', chance: 0.005, quantity: [1, 1] },
                { itemId: 'luck_charm', chance: 0.005, quantity: [1, 1] },
                { itemId: 'encrypted_data_shard', chance: 0.5, quantity: [1, 1] },
                { itemId: 'neural_interface_gel', chance: 0.5, quantity: [1, 1] },
                { itemId: 'chang_chip', chance: 0.1, quantity: [1, 1] },
                { itemId: 'quantum_core', chance: 0.01, quantity: [1, 1] }
            ]
        },
        mindflayer: { 
            type: 'basic', 
            maxHealth: 400, 
            attack: 10, 
            defense: 1, 
            speed: 0.8, 
            experienceValue: 70, 
            behavior: 'aggressive',
            sprite: 'img/monster/mindflayer.png',
            hitSprite: 'img/monster/mindflayerhit.png',
            attackHitSprite: 'img/monster/mindflayerhit2.png',
            width: 128,
            height: 128,
            frameCount: 8,
            frameDuration: 200,
            dropRate: 0.8,
            dropTable: [
                { itemId: 'circuit_board', chance: 0.1, quantity: [1, 1] },
                { itemId: 'laser_rifle', chance: 0.5, quantity: [1, 1] },
                { itemId: 'pulse_bow', chance: 0.5, quantity: [1, 1] },
                { itemId: 'synth_leather', chance: 0.1, quantity: [1, 1] },
                { itemId: 'laser_rifle', chance: 0.5, quantity: [1, 1] },
                { itemId: 'cyber_blade', chance: 0.01, quantity: [1, 1] },
                { itemId: 'shock_knuckles', chance: 0.01, quantity: [1, 1] },
                { itemId: 'code_wand', chance: 0.01, quantity: [1, 1] },
                { itemId: 'plasma_carbine', chance: 0.01, quantity: [1, 1] },
                { itemId: 'nano_jacket', chance: 0.01, quantity: [1, 1] },
                { itemId: 'cyber_gloves', chance: 0.01, quantity: [1, 1] },
                { itemId: 'speed_runners', chance: 0.01, quantity: [1, 1] },
                { itemId: 'neural_implant', chance: 0.01, quantity: [1, 1] },
                { itemId: 'laser_rifle', chance: 0.05, quantity: [1, 1] },
                { itemId: 'synth_vest', chance: 0.05, quantity: [1, 1] },
                { itemId: 'quantum_dagger', chance: 0.005, quantity: [1, 1] },
                { itemId: 'pulse_bow', chance: 0.005, quantity: [1, 1] },
                { itemId: 'data_staff', chance: 0.005, quantity: [1, 1] },
                { itemId: 'volt_lance', chance: 0.005, quantity: [1, 1] },
                { itemId: 'plasma_pistol', chance: 0.005, quantity: [1, 1] },
                { itemId: 'nano_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reactive_body_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'power_gauntlets', chance: 0.005, quantity: [1, 1] },
                { itemId: 'gravity_stompers', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reflex_booster', chance: 0.005, quantity: [1, 1] },
                { itemId: 'luck_charm', chance: 0.005, quantity: [1, 1] },
                { itemId: 'cyber_blade', chance: 0.5, quantity: [1, 1] },
                { itemId: 'encrypted_data_shard', chance: 0.5, quantity: [1, 1] },
                { itemId: 'neural_interface_gel', chance: 0.5, quantity: [1, 1] },
                { itemId: 'chang_chip', chance: 0.1, quantity: [1, 1] },
                { itemId: 'quantum_core', chance: 0.01, quantity: [1, 1] }
            ]
        },
        goblin: { 
            type: 'basic', 
            maxHealth: 200, 
            attack: 10, 
            defense: 1, 
            speed: 0.8,  
            experienceValue: 70, 
            behavior: 'aggressive',
            sprite: 'img/monster/glitch.png',
            hitSprite: 'img/monster/glitchhit.png',
            attackHitSprite: 'img/monster/glitchhit2.png',
            width: 128,
            height: 128,
            frameCount: 8,
            frameDuration: 150,
            dropRate: 0.85,
            dropTable: [
                { itemId: 'circuit_board', chance: 0.1, quantity: [1, 1] },
                { itemId: 'laser_rifle', chance: 0.5, quantity: [1, 1] },
                { itemId: 'pulse_bow', chance: 0.5, quantity: [1, 1] },
                { itemId: 'synth_leather', chance: 0.1, quantity: [1, 1] },
                { itemId: 'laser_rifle', chance: 0.5, quantity: [1, 1] },
                { itemId: 'cyber_blade', chance: 0.01, quantity: [1, 1] },
                { itemId: 'shock_knuckles', chance: 0.01, quantity: [1, 1] },
                { itemId: 'code_wand', chance: 0.01, quantity: [1, 1] },
                { itemId: 'plasma_carbine', chance: 0.01, quantity: [1, 1] },
                { itemId: 'nano_jacket', chance: 0.01, quantity: [1, 1] },
                { itemId: 'cyber_gloves', chance: 0.01, quantity: [1, 1] },
                { itemId: 'speed_runners', chance: 0.01, quantity: [1, 1] },
                { itemId: 'neural_implant', chance: 0.01, quantity: [1, 1] },
                { itemId: 'laser_rifle', chance: 0.05, quantity: [1, 1] },
                { itemId: 'synth_vest', chance: 0.05, quantity: [1, 1] },
                { itemId: 'quantum_dagger', chance: 0.005, quantity: [1, 1] },
                { itemId: 'pulse_bow', chance: 0.005, quantity: [1, 1] },
                { itemId: 'data_staff', chance: 0.005, quantity: [1, 1] },
                { itemId: 'volt_lance', chance: 0.005, quantity: [1, 1] },
                { itemId: 'plasma_pistol', chance: 0.005, quantity: [1, 1] },
                { itemId: 'nano_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reactive_body_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'power_gauntlets', chance: 0.005, quantity: [1, 1] },
                { itemId: 'gravity_stompers', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reflex_booster', chance: 0.005, quantity: [1, 1] },
                { itemId: 'luck_charm', chance: 0.005, quantity: [1, 1] },
                { itemId: 'cyber_blade', chance: 0.5, quantity: [1, 1] },
                { itemId: 'encrypted_data_shard', chance: 0.5, quantity: [1, 1] },
                { itemId: 'neural_interface_gel', chance: 0.5, quantity: [1, 1] },
                { itemId: 'chang_chip', chance: 0.1, quantity: [1, 1] },
                { itemId: 'quantum_core', chance: 0.01, quantity: [1, 1] }
            ]
        },
        glitch: { 
            type: 'elite', 
            maxHealth: 600, 
            attack: 10, 
            defense: 1, 
            speed: 0.8,  
            experienceValue: 150, 
            behavior: 'aggressive',
            sprite: 'img/monster/glitch.png',
            hitSprite: 'img/monster/glitchhit.png',
            attackHitSprite: 'img/monster/glitchhit2.png',
            width: 128,
            height: 128,
            frameCount: 8,
            frameDuration: 150,
            dropRate: 0.85,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.6, quantity: [2, 4] },
                { itemId: 'circuit_board', chance: 0.3, quantity: [1, 2] },
                { itemId: 'neon_circuit', chance: 0.1, quantity: [1, 1] },
                { itemId: 'quantum_alloy', chance: 0.5, quantity: [1, 1] },
                { itemId: 'quantum_dagger', chance: 0.005, quantity: [1, 1] },
                { itemId: 'pulse_bow', chance: 0.005, quantity: [1, 1] },
                { itemId: 'data_staff', chance: 0.005, quantity: [1, 1] },
                { itemId: 'volt_lance', chance: 0.005, quantity: [1, 1] },
                { itemId: 'plasma_pistol', chance: 0.005, quantity: [1, 1] },
                { itemId: 'nano_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reactive_body_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'power_gauntlets', chance: 0.005, quantity: [1, 1] },
                { itemId: 'gravity_stompers', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reflex_booster', chance: 0.005, quantity: [1, 1] },
                { itemId: 'luck_charm', chance: 0.005, quantity: [1, 1] },
                { itemId: 'twin_fangs', chance: 0.001, quantity: [1, 1] },
                { itemId: 'auto_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'neon_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'cybernetic_plate', chance: 0.001, quantity: [1, 1] },
                { itemId: 'exoskeletal_suit', chance: 0.001, quantity: [1, 1] },
                { itemId: 'algorithm_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'neural_necklace', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_ring', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_ring', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_boots', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_boots', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_gloves', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_gloves', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_armor', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_armor', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_sword', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_sword', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dual_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dual_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dual_blade', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dual_blade', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_bow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_bow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_staff', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_staff', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_knuckles', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_knuckles', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_spear', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_spear', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_scythe', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_scythe', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_rifle', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_rifle', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_wand', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_wand', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'encrypted_data_shard', chance: 0.5, quantity: [1, 1] },
                { itemId: 'dark_matter_shard', chance: 0.01, quantity: [1, 1] }
            ]
        },
        draco: { 
            type: 'elite', 
            maxHealth: 700, 
            attack: 8, 
            defense: 3, 
            speed: 0.8, 
            experienceValue: 150, 
            behavior: 'aggressive',
            sprite: 'img/monster/draco.png',
            hitSprite: 'img/monster/dracohit.png',
            attackHitSprite: 'img/monster/dracohit2.png',
            width: 256,
            height: 128,
            frameCount: 4,
            frameDuration: 220,
            dropRate: 0.9,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.5, quantity: [3, 5] },
                { itemId: 'circuit_board', chance: 0.4, quantity: [1, 3] },
                { itemId: 'plasma_cell', chance: 0.5, quantity: [1, 1] },
                { itemId: 'pulse_bow', chance: 0.005, quantity: [1, 1] },
                { itemId: 'data_staff', chance: 0.005, quantity: [1, 1] },
                { itemId: 'volt_lance', chance: 0.005, quantity: [1, 1] },
                { itemId: 'plasma_pistol', chance: 0.005, quantity: [1, 1] },
                { itemId: 'nano_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reactive_body_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'power_gauntlets', chance: 0.005, quantity: [1, 1] },
                { itemId: 'gravity_stompers', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reflex_booster', chance: 0.005, quantity: [1, 1] },
                { itemId: 'luck_charm', chance: 0.005, quantity: [1, 1] },
                { itemId: 'twin_fangs', chance: 0.001, quantity: [1, 1] },
                { itemId: 'auto_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'neon_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'cybernetic_plate', chance: 0.001, quantity: [1, 1] },
                { itemId: 'exoskeletal_suit', chance: 0.001, quantity: [1, 1] },
                { itemId: 'algorithm_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'neural_necklace', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_ring', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_ring', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_boots', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_boots', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_gloves', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_gloves', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_armor', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_armor', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_sword', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_sword', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dual_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dual_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dual_blade', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dual_blade', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_bow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_bow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_staff', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_staff', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_knuckles', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_knuckles', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_spear', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_spear', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_scythe', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_scythe', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_rifle', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_rifle', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_wand', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_wand', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'smart_polymer', chance: 0.5, quantity: [1, 1] },
                { itemId: 'carbon_fiber_weave', chance: 0.1, quantity: [1, 1] },
                { itemId: 'quantum_core', chance: 0.01, quantity: [1, 1] }
            ]
        },
        skeleton: { 
            type: 'basic', 
            maxHealth: 800, 
            attack: 8, 
            defense: 3, 
            speed: 0.8, 
            experienceValue: 150, 
            behavior: 'aggressive',
            sprite: 'img/monster/glitch.png',
            hitSprite: 'img/monster/glitchhit.png',
            attackHitSprite: 'img/monster/glitchhit2.png',
            width: 128,
            height: 128,
            frameCount: 8,
            frameDuration: 220,
            dropRate: 0.9,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.5, quantity: [3, 5] },
                { itemId: 'circuit_board', chance: 0.4, quantity: [1, 3] },
                { itemId: 'nano_concrete', chance: 0.1, quantity: [1, 1] },
                { itemId: 'scrap_metal', chance: 0.1, quantity: [1, 1] },
                { itemId: 'synth_leather', chance: 0.1, quantity: [1, 1] }
            ]
        },
        chip: { 
            type: 'basic', 
            maxHealth: 600, 
            attack: 8, 
            defense: 3, 
            speed: 0.8, 
            experienceValue: 150, 
            behavior: 'aggressive',
            sprite: 'img/monster/chip.png',
            hitSprite: 'img/monster/chiphit.png',
            attackHitSprite: 'img/monster/chiphit2.png',
            width: 128,
            height: 64,
            frameCount: 6,
            frameDuration: 220,
            dropRate: 0.9,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.5, quantity: [3, 5] },
                { itemId: 'circuit_board', chance: 0.4, quantity: [1, 3] },
                { itemId: 'pulse_bow', chance: 0.005, quantity: [1, 1] },
                { itemId: 'data_staff', chance: 0.005, quantity: [1, 1] },
                { itemId: 'volt_lance', chance: 0.005, quantity: [1, 1] },
                { itemId: 'plasma_pistol', chance: 0.005, quantity: [1, 1] },
                { itemId: 'nano_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reactive_body_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'power_gauntlets', chance: 0.005, quantity: [1, 1] },
                { itemId: 'gravity_stompers', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reflex_booster', chance: 0.005, quantity: [1, 1] },
                { itemId: 'luck_charm', chance: 0.005, quantity: [1, 1] },
                { itemId: 'twin_fangs', chance: 0.001, quantity: [1, 1] },
                { itemId: 'auto_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'neon_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'cybernetic_plate', chance: 0.001, quantity: [1, 1] },
                { itemId: 'exoskeletal_suit', chance: 0.001, quantity: [1, 1] },
                { itemId: 'algorithm_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'neural_necklace', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_ring', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_ring', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_boots', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_boots', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_gloves', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_gloves', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_armor', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_armor', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_sword', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_sword', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dual_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dual_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dual_blade', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dual_blade', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_bow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_bow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_staff', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_staff', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_knuckles', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_knuckles', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_spear', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_spear', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_scythe', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_scythe', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_rifle', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_rifle', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_wand', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_wand', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'chang_chip', chance: 0.1, quantity: [1, 1] },
                { itemId: 'circuit_board', chance: 0.1, quantity: [1, 1] },
                { itemId: 'cyber_scrap', chance: 0.1, quantity: [1, 1] }
            ]
        },
        chimeradog: { 
            type: 'basic', 
            maxHealth: 700, 
            attack: 8, 
            defense: 3, 
            speed: 0.8, 
            experienceValue: 150, 
            behavior: 'aggressive',
            sprite: 'img/monster/chimeradog.png',
            hitSprite: 'img/monster/chimeradoghit.png',
            attackHitSprite: 'img/monster/chimeradoghit2.png',
            width: 320,
            height: 192,
            frameCount: 6,
            frameDuration: 220,
            dropRate: 0.9,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.5, quantity: [3, 5] },
                { itemId: 'circuit_board', chance: 0.4, quantity: [1, 3] },
                { itemId: 'energy_drink', chance: 0.2, quantity: [1, 1] },
				{ itemId: 'synth_leather', chance: 0.1, quantity: [1, 1] },
                { itemId: 'pulse_bow', chance: 0.005, quantity: [1, 1] },
                { itemId: 'data_staff', chance: 0.005, quantity: [1, 1] },
                { itemId: 'volt_lance', chance: 0.005, quantity: [1, 1] },
                { itemId: 'plasma_pistol', chance: 0.005, quantity: [1, 1] },
                { itemId: 'nano_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reactive_body_armor', chance: 0.005, quantity: [1, 1] },
                { itemId: 'power_gauntlets', chance: 0.005, quantity: [1, 1] },
                { itemId: 'gravity_stompers', chance: 0.005, quantity: [1, 1] },
                { itemId: 'reflex_booster', chance: 0.005, quantity: [1, 1] },
                { itemId: 'luck_charm', chance: 0.005, quantity: [1, 1] },
                { itemId: 'twin_fangs', chance: 0.001, quantity: [1, 1] },
                { itemId: 'auto_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'neon_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'cybernetic_plate', chance: 0.001, quantity: [1, 1] },
                { itemId: 'exoskeletal_suit', chance: 0.001, quantity: [1, 1] },
                { itemId: 'algorithm_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'neural_necklace', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_ring', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_ring', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_boots', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_boots', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_gloves', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_gloves', chance: 0.001, quantity: [1, 1] },
                { itemId: 'fortified_light_armor', chance: 0.001, quantity: [1, 1] },
                { itemId: 'assault_light_armor', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_sword', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_sword', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dual_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dual_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_dual_blade', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_dual_blade', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_bow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_bow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_staff', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_staff', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_knuckles', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_knuckles', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_spear', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_spear', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_scythe', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_scythe', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_rifle', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_rifle', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_wand', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_wand', chance: 0.001, quantity: [1, 1] },
                { itemId: 'razor_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'guardian_grimoire', chance: 0.001, quantity: [1, 1] },
				{ itemId: 'neural_interface_gel', chance: 0.5, quantity: [1, 1] },
				{ itemId: 'carbon_fiber_weave', chance: 0.1, quantity: [1, 1] }
            ]
        },
        orc: { 
            type: 'elite', 
            maxHealth: 100, 
            attack: 12, 
            defense: 5, 
            speed: 0.8, 
            experienceValue: 150, 
            behavior: 'aggressive',
            sprite: 'img/enemy.png',
            hitSprite: 'img/enemyhit.png',
            attackHitSprite: 'img/enemyattackhit.png',
            width: 80,
            height: 80,
            frameCount: 4,
            frameDuration: 250,
            dropRate: 0.95,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.1, quantity: [5, 8] },
                { itemId: 'circuit_board', chance: 0.5, quantity: [2, 4] },
                { itemId: 'energy_drink', chance: 0.3, quantity: [1, 2] },
                { itemId: 'quantum_alloy', chance: 0.5, quantity: [1, 1] },
                { itemId: 'scrap_metal', chance: 0.1, quantity: [1, 1] },
                { itemId: 'encrypted_data_shard', chance: 0.5, quantity: [1, 1] },
                { itemId: 'dark_matter_shard', chance: 0.01, quantity: [1, 1] }
            ]
        },
        bitzee: { 
            type: 'boss', 
            maxHealth: 5000, 
            attack: 12, 
            defense: 5, 
            speed: 0.8, 
            experienceValue: 1000, 
            behavior: 'aggressive',
            sprite: 'img/monster/bitzee.png',
            hitSprite: 'img/monster/bitzee.png',
            attackHitSprite: 'img/monster/bitzee.png',
            width: 448,
            height: 256,
            frameCount: 8,
            frameDuration: 250,
            dropRate: 0.95,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.1, quantity: [5, 8] },
                { itemId: 'circuit_board', chance: 0.5, quantity: [2, 4] },
                { itemId: 'energy_drink', chance: 0.3, quantity: [1, 2] },
                { itemId: 'dark_matter_shard', chance: 0.1, quantity: [1, 1] },
                { itemId: 'quantum_core', chance: 0.1, quantity: [1, 1] },
                { itemId: 'twin_fangs', chance: 0.01, quantity: [1, 1] },
                { itemId: 'auto_crossbow', chance: 0.01, quantity: [1, 1] },
                { itemId: 'neon_katana', chance: 0.01, quantity: [1, 1] },
                { itemId: 'cybernetic_plate', chance: 0.01, quantity: [1, 1] },
                { itemId: 'exoskeletal_suit', chance: 0.01, quantity: [1, 1] },
                { itemId: 'algorithm_grimoire', chance: 0.01, quantity: [1, 1] },
                { itemId: 'neural_necklace', chance: 0.01, quantity: [1, 1] },
                { itemId: 'fortified_ring', chance: 0.01, quantity: [1, 1] },
                { itemId: 'assault_ring', chance: 0.01, quantity: [1, 1] },
                { itemId: 'fortified_light_boots', chance: 0.01, quantity: [1, 1] },
                { itemId: 'assault_light_boots', chance: 0.01, quantity: [1, 1] },
                { itemId: 'fortified_light_gloves', chance: 0.01, quantity: [1, 1] },
                { itemId: 'assault_light_gloves', chance: 0.01, quantity: [1, 1] },
                { itemId: 'fortified_light_armor', chance: 0.01, quantity: [1, 1] },
                { itemId: 'assault_light_armor', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_sword', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_sword', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_dagger', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_dagger', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_dual_dagger', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_dual_dagger', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_dual_blade', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_dual_blade', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_bow', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_bow', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_crossbow', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_crossbow', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_staff', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_staff', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_katana', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_katana', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_knuckles', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_knuckles', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_spear', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_spear', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_scythe', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_scythe', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_rifle', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_rifle', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_wand', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_wand', chance: 0.01, quantity: [1, 1] },
                { itemId: 'razor_grimoire', chance: 0.01, quantity: [1, 1] },
                { itemId: 'guardian_grimoire', chance: 0.01, quantity: [1, 1] },
                { itemId: 'binary_blades', chance: 0.001, quantity: [1, 1] },
                { itemId: 'data_reaper', chance: 0.001, quantity: [1, 1] },
                { itemId: 'railgun', chance: 0.001, quantity: [1, 1] },
                { itemId: 'quantum_shield', chance: 0.001, quantity: [1, 1] },
                { itemId: 'chrono_amulet', chance: 0.001, quantity: [1, 1] },
                { itemId: 'invincible_ring', chance: 0.001, quantity: [1, 1] },
                { itemId: 'berserker_ring', chance: 0.001, quantity: [1, 1] },
                { itemId: 'invincible_light_boots', chance: 0.001, quantity: [1, 1] },
                { itemId: 'berserker_light_boots', chance: 0.001, quantity: [1, 1] },
                { itemId: 'invincible_light_gloves', chance: 0.001, quantity: [1, 1] },
                { itemId: 'berserker_light_gloves', chance: 0.001, quantity: [1, 1] },
                { itemId: 'invincible_light_armor', chance: 0.001, quantity: [1, 1] },
                { itemId: 'berserker_light_armor', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_sword', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_sword', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_dual_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_dual_dagger', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_dual_blade', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_dual_blade', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_bow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_bow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_crossbow', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_staff', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_staff', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_katana', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_knuckles', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_knuckles', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_spear', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_spear', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_scythe', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_scythe', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_rifle', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_rifle', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_wand', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_wand', chance: 0.001, quantity: [1, 1] },
                { itemId: 'apocalypse_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'aegis_grimoire', chance: 0.001, quantity: [1, 1] },
                { itemId: 'smart_polymer', chance: 2, quantity: [1, 1] },
                { itemId: 'encrypted_data_shard', chance: 2, quantity: [1, 1] },
                { itemId: 'circuit_board', chance: 0.1, quantity: [1, 1] }
            ]
        },
        dragon: { 
            type: 'boss', 
            maxHealth: 1, 
            attack: 20, 
            defense: 10, 
            speed: 0.8, 
            experienceValue: 100, 
            behavior: 'aggressive',
            sprite: 'img/enemy.png',
            hitSprite: 'img/enemyhit.png',
            attackHitSprite: 'img/enemyattackhit.png',
            width: 120,
            height: 120,
            frameCount: 4,
            frameDuration: 300,
            dropRate: 1.0,
            dropTable: [
                { itemId: 'scrap_metal', chance: 0.1, quantity: [10, 15] },
                { itemId: 'circuit_board', chance: 0.1, quantity: [5, 8] },
                { itemId: 'quantum_core', chance: 0.5, quantity: [1, 2] },
                { itemId: 'nano_repair', chance: 0.6, quantity: [1, 3] }
            ]
        }
    },
    
    /**
     * Initialize the monster system
     */
    init: function() {
        this.activeMonsters = [];
    },
    
    /**
     * Create a new monster
     * @param {string} type - Monster type
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object} Created monster
     */
    createMonster: function(type, x, y) {
        const monsterType = this.monsterTypes[type];
        let element, levelIndicator; // Declare variables once at top
        if (!monsterType) {
            console.error('Invalid monster type:', type);
            return null;
        }
        
        // Create base monster object
        const monster = {
            id: Date.now() + Math.random(), // Unique ID for the monster
            type: type,
            maxHealth: monsterType.maxHealth,
            health: monsterType.maxHealth,
            attack: monsterType.attack,
            defense: monsterType.defense,
            speed: monsterType.speed,
            attackCooldown: 2000, // Base cooldown in ms (2 seconds)
            lastAttackTime: 0, // Timestamp of last attack
            experienceValue: monsterType.experienceValue,
            behavior: monsterType.behavior,
            sprite: monsterType.sprite,
            hitSprite: monsterType.hitSprite,
            attackHitSprite: monsterType.attackHitSprite,
            width: monsterType.width,
            height: monsterType.height,
            frameCount: monsterType.frameCount,
            frameDuration: monsterType.frameDuration,
            x: x,
            y: y,
            state: 'idle',
            nextStateChangeTime: Date.now() + Math.random() * 3000,
            verticalDirection: Math.random() < 0.5 ? 1 : -1,
            verticalSpeed: Math.random() * 0.05 + 0.02,
            waitDuration: 0,
            baseY: y,
            verticalRange: Math.floor(Math.random() * 120) + 80,
            effects: [],
            dropRate: monsterType.dropRate,
            dropTable: monsterType.dropTable,
            currentFrame: 0,
            lastFrameTime: Date.now(),
            level: MapSystem.currentDungeonLevel || 1,
            stunDuration: 500 // Added: Duration monster is stunned after being hit (in ms)
        };
        
        // Apply level scaling
        this.applyLevelScaling(monster);
        
        // Create and set up the DOM element
        element = document.createElement('div');
        element.className = 'monster';
        element.style.width = `${monster.width}px`;
        element.style.height = `${monster.height}px`;
        element.style.left = `${monster.x}px`;
        element.style.top = `${monster.y}px`;
        element.style.backgroundImage = `url(${monster.sprite})`;
        element.style.backgroundPosition = '0 0';
        element.style.backgroundRepeat = 'no-repeat';

        // Create container for Name, Level, and HP Bar
        const overheadInfo = document.createElement('div');
        overheadInfo.className = 'monster-overhead-info';

        // Add Name and Level Indicator (inline)
        const nameLevelContainer = document.createElement('div');
        nameLevelContainer.className = 'monster-name-level';

        const namePlate = document.createElement('span'); // Use span for inline display
        namePlate.className = 'monster-name';
        namePlate.textContent = monster.type.charAt(0).toUpperCase() + monster.type.slice(1); // Capitalize name

        levelIndicator = document.createElement('span'); // Use span for inline display
        levelIndicator.className = 'monster-level-indicator';
        levelIndicator.textContent = `Lv.${monster.level}`;

        nameLevelContainer.appendChild(namePlate);
        nameLevelContainer.appendChild(levelIndicator);
        overheadInfo.appendChild(nameLevelContainer);

        // Add HP Bar Container
        const healthBarContainer = document.createElement('div');
        healthBarContainer.className = 'monster-health-bar-container';
        const healthBarFill = document.createElement('div');
        healthBarFill.className = 'monster-health-bar-fill';
        healthBarFill.style.width = '100%'; // Start full
        healthBarContainer.appendChild(healthBarFill);
        overheadInfo.appendChild(healthBarContainer); // Add HP bar to the overhead container

        // Append the whole overhead info container to the monster element
        element.appendChild(overheadInfo);

        // Add monster element to the map
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.appendChild(element);
            monster.element = element;
        } else {
            console.error('Map container not found');
            return null;
        }
        
        // Add to active monsters array
        this.activeMonsters.push(monster);
        
        return monster;
    },
    
    /**
     * Create a DOM element for a monster
     * @param {Object} monster - Monster data
     * @returns {HTMLElement} Monster element
     */
    createMonsterElement: function(monster) {
        const element = document.createElement('div');
        element.className = 'monster';
        element.style.width = `${monster.width}px`;
        element.style.height = `${monster.height}px`;
        element.style.left = `${monster.x}px`;
        element.style.top = `${monster.y}px`;
        element.style.backgroundImage = `url(${monster.sprite})`;
        
        // Add level indicator
        const levelIndicator = document.createElement('div');
        levelIndicator.className = 'monster-level-indicator';
        levelIndicator.textContent = `Lv.${monster.level}`;
        element.appendChild(levelIndicator);
        
        // Add monster to the map
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.appendChild(element);
        }
        
        return element;
    },
    
    /**
     * Update all monsters - optimized for performance
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateMonsters: function(deltaTime) {
        const now = Date.now();
        let i, monster, frameElapsed, dx, dy, distanceSq; // Declare variables once
        
        // Use for loop instead of forEach for better performance
        for (let i = this.activeMonsters.length - 1; i >= 0; i--) {
            const monster = this.activeMonsters[i];
            
            // Check if monster is dead
            if (monster.health <= 0 || monster.isDead) {
                // Remove from array immediately to avoid processing again
                if (monster.element) {
                    monster.element.remove();
                }
                this.activeMonsters.splice(i, 1);
                continue;
            }
            
            // Check if monster is off-screen (do this early to avoid unnecessary updates)
            if (monster.x + monster.width < -100) {
                if (monster.element) {
                    monster.element.remove();
                }
                this.activeMonsters.splice(i, 1);
                continue;
            }
            
            // Optimize animation update (only if monster is visible on screen)
            if (monster.x < window.innerWidth + 100) {
                // Update animation less frequently for off-screen monsters
                const frameElapsed = now - monster.lastFrameTime;
                if (frameElapsed >= monster.frameDuration) {
                    monster.currentFrame = (monster.currentFrame + 1) % monster.frameCount;
                    monster.lastFrameTime = now;
                    
                    // Update sprite based on state
                    if (monster.element) {
                        let spriteUrl;
                        if (monster.isHit) {
                            spriteUrl = monster.hitSprite;
                        } else if (monster.isAttacking) {
                            spriteUrl = monster.attackHitSprite;
                        } else {
                            spriteUrl = monster.sprite;
                        }
                        
                        // Only update if changed to avoid unnecessary DOM operations
                        if (monster.currentSpriteUrl !== spriteUrl || monster.lastFramePosition !== monster.currentFrame) {
                            monster.element.style.backgroundImage = `url(${spriteUrl})`;
                            monster.element.style.backgroundPosition = `-${monster.currentFrame * monster.width}px 0`;
                            monster.currentSpriteUrl = spriteUrl;
                            monster.lastFramePosition = monster.currentFrame;
                        }
                    }
                }
            }
            
            // Check if hit animation should end
            if (monster.isHit && now - monster.hitTime >= monster.hitDuration) {
                monster.isHit = false;
                
                // Attack after hit animation with a small probability (throttle attacks)
                if (!monster.isAttacking && Math.random() < 0.5) {
                    monster.isAttacking = true;
                    monster.attackTime = now;
                    
                    // Find nearest character to attack
                    const nearestChar = this.findNearestCharacter(monster);
                    if (nearestChar && Date.now() - monster.lastAttackTime >= monster.attackCooldown) {
                        this.monsterAttack(monster, nearestChar);
                        monster.lastAttackTime = Date.now();
                    }
                }
            }
            
            // Check for stun status
            const isStunned = monster.hitTime && (now - monster.hitTime < monster.stunDuration);
            
            // Check if attack animation should end
            if (monster.isAttacking && now - monster.attackTime >= 2000) {
                monster.isAttacking = false;
            }
            
            // Update horizontal position - only if not stunned
            if (!isStunned) {
                monster.x -= MapSystem.currentSpeed * (deltaTime / 1000) * 1.5;
            }
            
            // Check for characters in range (with throttling)
            // Only check every few frames to reduce CPU usage
            if (!isStunned && !monster.isAttacking && monster.x < window.innerWidth + 50 && now % 10 === 0) {
                const nearestChar = this.findNearestCharacter(monster);
                if (nearestChar) {
                    const dx = (monster.x + monster.width / 2) - (nearestChar.x + nearestChar.width / 2);
                    const dy = (monster.y + monster.height / 2) - (nearestChar.y + nearestChar.height / 2);
                    const distanceSq = dx * dx + dy * dy;
                    
                    // Only trigger attack if cooldown has expired and in range
                    if (distanceSq <= monster.detectionRange * monster.detectionRange && 
                        Date.now() - monster.lastAttackTime >= monster.attackCooldown) {
                        monster.isAttacking = true;
                        monster.attackTime = now;
                        this.monsterAttack(monster, nearestChar);
                        monster.lastAttackTime = now;
                    }
                }
            }
            
            // Handle movement state changes - but less frequently
            if (!isStunned && !monster.isAttacking && now % 3 === 0) {
                if (now >= monster.nextStateChangeTime) {
                    // Simplified state change logic
                    switch (monster.movementState) {
                        case 'idle':
                            monster.movementState = 'moving';
                            monster.verticalDirection = Math.random() < 0.5 ? -1 : 1;
                            monster.nextStateChangeTime = now + 2000; // Fixed time for simplicity
                            break;
                        case 'moving':
                        case 'waiting':
                            monster.movementState = 'idle';
                            monster.nextStateChangeTime = now + 1000;
                            break;
                        default:
                            monster.movementState = 'idle';
                            monster.nextStateChangeTime = now + 1000;
                    }
                }
                
                // Simplified movement update
                if (monster.movementState === 'moving') {
                    const verticalMove = monster.verticalSpeed * monster.verticalDirection * deltaTime;
                    monster.y += verticalMove;
                    
                    // Simple boundary check
                    if (Math.abs(monster.y - monster.baseY) >= monster.verticalRange / 2) {
                        monster.verticalDirection *= -1;
                    }
                }
            }
            
            // Update element position and z-index
            if (monster.element) {
                monster.element.style.left = `${monster.x}px`;
                monster.element.style.top = `${monster.y}px`;
                // Set z-index based on y-coordinate (higher y = higher z-index)
                monster.element.style.zIndex = Math.round(monster.y);
            }

            // Update status effects less frequently
            if (now % 4 === 0) {
                this.updateMonsterEffects(monster, deltaTime);
            }
        }
    },
    
    /**
     * Find the nearest character to a monster - optimized for performance
     * @param {Object} monster - Monster to check
     * @returns {Object|null} Nearest character or null if none
     */
    findNearestCharacter: function(monster) {
        if (!CharacterSystem || !CharacterSystem.getActiveCharacters) return null;
        
        const activeChars = CharacterSystem.getActiveCharacters();
        if (!activeChars || activeChars.length === 0) return null;
        
        // For single character case (most common), optimize by returning directly
        if (activeChars.length === 1) return activeChars[0];
        
        let nearestChar = null;
        let nearestDistanceSq = Infinity; // Use squared distance to avoid sqrt operations
        
        const monsterCenterX = monster.x + monster.width / 2;
        const monsterCenterY = monster.y + monster.height / 2;
        
        for (let i = 0; i < activeChars.length; i++) {
            const char = activeChars[i];
            
            // Calculate squared distance (faster than actual distance)
            dx = monsterCenterX - (char.x + char.width / 2);
            dy = monsterCenterY - (char.y + char.height / 2);
            distanceSq = dx * dx + dy * dy;
            
            if (distanceSq < nearestDistanceSq) {
                nearestDistanceSq = distanceSq;
                nearestChar = char;
            }
        }
        
        return nearestChar;
    },
    
    /**
     * Monster attacks a character
     * @param {Object} monster - Attacking monster
     * @param {Object} character - Target character
     */
    monsterAttack: function(monster, character) {
        let damage; // Declare variable once
        // Enforce minimum 100ms between attacks regardless of animation
        if (Date.now() - monster.lastAttackTime < monster.attackCooldown || !character.stats) return;
        
        // Calculate damage based on monster's attack and character's defense
        
        // Calculate base damage
        const baseDamage = monster.attack;

        // Calculate final damage using CombatMechanics
        // Note: Monsters might need 'critChance' and 'evasion' stats added to their definition for this to be fully effective.
        // Assuming default 0 for now if they don't exist.
        const combatResult = CombatMechanics.calculateDamage(monster, character, baseDamage);

        // Display the result (damage number or MISS)
        CombatMechanics.displayDamageNumber(character, combatResult.damage, combatResult.isCrit, combatResult.isMiss);

        // Apply damage only if it wasn't a miss
        if (!combatResult.isMiss && character.stats.currentHp) {
            character.stats.currentHp = Math.max(0, character.stats.currentHp - combatResult.damage);

            // Update UI if necessary
            if (window.UIManager && UIManager.updateCharacterHpBar) {
                UIManager.updateCharacterHpBar(character);
            }

            // Check for character death (might need a dedicated function in CharacterSystem)
            if (character.stats.currentHp <= 0) {
                 console.log(`${character.name} has been defeated by ${monster.type}!`);
                 // TODO: Implement proper character death handling in CharacterSystem
                 if (typeof CharacterDeath !== 'undefined' && CharacterDeath.handleDeath) {
                     CharacterDeath.handleDeath(character);
                 }
            }

            // Add attack animation class
            if (monster.element) {
                monster.element.classList.add('attacking');
                setTimeout(() => {
                    monster.element.classList.remove('attacking');
                }, 500); // Adjust timing based on your animation duration
            }
        }
    },
    
    /**
     * Update monster status effects
     * @param {Object} monster - Monster to update
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateMonsterEffects: function(monster, deltaTime) {
        const now = Date.now();
        
        // Filter out expired effects
        monster.effects = monster.effects.filter(effect => {
            const elapsed = now - effect.startTime;
            return elapsed < effect.duration;
        });
    },
    
    /**
     * Apply damage to a monster
     * @param {string} monsterId - Monster ID
     * @param {number} damage - Damage amount
     * @param {Object} source - Damage source (character)
     * @returns {boolean} True if monster was hit
     */
    damageMonster: function(monsterId, damage, source) {
        const monster = this.getMonsterById(monsterId);
        if (!monster) return false;
        
        // Calculate actual damage (accounting for defense)
        const actualDamage = Math.max(1, damage - monster.defense);
        
        // Apply damage
        monster.health -= actualDamage;
        
        // Update health bar
        if (monster.element) {
            const healthBarFill = monster.element.querySelector('.monster-health-bar-fill'); // Correct selector
            if (healthBarFill) {
                const healthPercent = (monster.health / monster.maxHealth) * 100;
                healthBarFill.style.width = `${Math.max(0, healthPercent)}%`;

                // Change color based on health
                if (healthPercent <= 0) {
                     healthBarFill.style.opacity = '0'; // Hide bar when dead
                } else if (healthPercent < 25) {
                    healthBarFill.style.background = '#ff0000'; // Red
                    healthBarFill.style.opacity = '1';
                } else if (healthPercent < 50) {
                    healthBarFill.style.background = '#ff6600'; // Orange
                    healthBarFill.style.opacity = '1';
                } else {
                     healthBarFill.style.background = '#00ff00'; // Green (Default)
                     healthBarFill.style.opacity = '1';
                }
            }
            
            // Add damage gauge - visual effect showing damage amount
            // this.showDamageGauge(monster, actualDamage); // Commented out to remove duplicate red damage numbers
            
            // Visual feedback for getting hit
            monster.element.style.filter = 'brightness(2) contrast(1.5)';
            setTimeout(() => {
                if (monster.element) {
                    monster.element.style.filter = 'none';
                }
            }, 150);
        }
        
        // Set hit state
        monster.isHit = true;
        monster.hitTime = Date.now();
        
        // Show damage text - This is now handled by CombatMechanics.displayDamageNumber called from CharacterSystem.attackMonster
        // The call was removed previously, ensuring it's gone now.

        // Check if monster is dead
        if (monster.health <= 0) {
            this.killMonster(monster, source);
        }
        
        return true;
    },

    // Removed showDamageGauge function entirely to prevent duplicate red damage numbers

    /**
     * Kill a monster and handle rewards
     * @param {Object} monster - Monster to kill
     * @param {Object} source - Source of the kill (usually the player)
     */
    killMonster: function(monster, source) {
        if (!monster || monster.isDead) return;
        
        console.log('Monster killed:', monster.type);
        
        // Mark monster as dead immediately to prevent double counting
        monster.isDead = true;
        
        // Get the monster type definition
        const monsterTypeDef = this.monsterTypes[monster.type];

        // Award experience to the attacking character (with validation)
        if (source?.id && typeof CharacterSystem?.addExperience === 'function' && typeof monster.experienceValue === 'number') {
            const character = CharacterSystem.getCharacterById(source.id);
            if (character) {
                console.log(`Awarding ${monster.experienceValue} XP to ${character.name}`);
                CharacterSystem.addExperience(character, monster.experienceValue);
            }
        }
        
        // Dispatch monster killed event with additional type information
        try {
            const killedEvent = new CustomEvent('monsterKilled', {
                detail: {
                    monsterId: monster.id,
                    monsterType: monster.type,
                    isBoss: monsterTypeDef.type === 'boss', // Add this flag
                    level: monster.level || 1,
                    source: source
                },
                bubbles: true,
                cancelable: true
            });
            
            document.dispatchEvent(killedEvent);
        } catch (error) {
            console.error('Error dispatching monster killed event:', error);
        }
        
        // Drop items
        this.dropItems(monster);
        
        // Base copper reward is 2, scaled by dungeon level
        const levelMultiplier = MapSystem.currentDungeonLevel || 1;
        const dungeonMultiplier = window.dungeonCopperMultiplier || 1;
        const copperReward = Math.round(2 * levelMultiplier * dungeonMultiplier);
        
        Currency.addCopper(copperReward);
        
        // Show currency reward text
        Utils.createDamageText(
            monster.x + monster.width / 2, 
            monster.y - 20, 
            `+${copperReward} copper`, 
            '#cd7f32'
        );
        
        // Add death animation with fade out effect
        if (monster.element) {
            // Mark monster as dead to prevent further interactions
            monster.isDead = true;
            
            // Apply fade out effect
            monster.element.style.transition = 'opacity 800ms ease-out';
            monster.element.style.opacity = '0';
            
            // Remove element after animation completes
            setTimeout(() => {
                if (monster.element) {
                    monster.element.remove();
                }
                
                // Remove from active monsters
                this.removeMonster(monster.id);
            }, 800);
        }
    },
    
    /**
     * Drop items from a monster
     * @param {Object} monster - Monster that was killed
     */
    dropItems: function(monster) {
        // Check if monster drops anything
        if (Math.random() > monster.dropRate) {
            return;
        }
        
        // Roll for each item in drop table
        monster.dropTable.forEach(drop => {
            if (Math.random() <= drop.chance) {
                // Determine quantity
                const quantity = Utils.randomInt(drop.quantity[0], drop.quantity[1]);
                
                try {
                    // Add item to inventory
                    const success = Inventory.addItem(drop.itemId, quantity);
                    
                    if (success) {
                        // Dispatch the itemCollected event for mission tracking
                        document.dispatchEvent(new CustomEvent('itemCollected', {
                            detail: {
                                itemId: drop.itemId,
                                quantity: quantity
                            }
                        }));
                        
                        
                        // Create visual drop effect
                        this.createItemDropEffect(monster.x, monster.y, drop.itemId, quantity);
                    }
                } catch (error) {
                    console.error("Error handling loot drop:", error);
                }
            }
        });
    },
    
    /**
     * Create a visual effect for an item drop - limit based on performance
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} itemId - Item ID
     * @param {number} quantity - Item quantity
     */
    createItemDropEffect: function(x, y, itemId, quantity) {
        // Limit active item drop effects
        const maxDropEffects = 5;
        const itemsContainer = document.getElementById('items-container');
        if (!itemsContainer) return;
        
        // Count existing drop effects
        const existingDrops = itemsContainer.querySelectorAll('.item-drop');
        if (existingDrops.length >= maxDropEffects) {
            return;
        }
        
        // Get item data
        const item = Items.getItem(itemId);
        if (!item) return;
        
        // Create drop element
        const dropElement = document.createElement('div');
        dropElement.className = 'item-drop';
        dropElement.style.left = `${x + Utils.randomInt(-20, 20)}px`;
        dropElement.style.top = `${y + Utils.randomInt(-10, 10)}px`;
        
        // Get the correct item image
        let imgSrc = item.icon;
        if (!imgSrc || imgSrc.includes("undefined")) {
            // Use placeholder image if icon doesn't exist
            imgSrc = Items.createPlaceholderImage ? Items.createPlaceholderImage(itemId) : '';
        }
        
        // Set background image
        dropElement.style.backgroundImage = `url(${imgSrc})`;
        
        // Add quantity text if more than 1
        if (quantity > 1) {
            const quantityText = document.createElement('div');
            quantityText.className = 'item-drop-quantity';
            quantityText.textContent = quantity;
            dropElement.appendChild(quantityText);
        }
        
        // Add to container
        itemsContainer.appendChild(dropElement);
        
        // Remove after animation
        setTimeout(() => {
            if (dropElement.parentNode) {
                dropElement.remove();
            }
        }, 1500); // Match this with CSS animation duration
    },
    
    /**
     * Apply a status effect to a monster
     * @param {string} monsterId - Monster ID
     * @param {string} effectType - Effect type
     * @param {*} effectValue - Effect value
     * @param {number} duration - Effect duration in milliseconds
     * @returns {boolean} True if effect was applied
     */
    applyEffect: function(monsterId, effectType, effectValue, duration) {
        const monster = this.getMonsterById(monsterId);
        if (!monster) return false;
        
        // Remove existing effect of the same type
        monster.effects = monster.effects.filter(effect => effect.type !== effectType);
        
        // Add new effect
        monster.effects.push({
            type: effectType,
            value: effectValue,
            duration: duration,
            startTime: Date.now()
        });
        
        return true;
    },
    
    /**
     * Get a monster by ID
     * @param {string} id - Monster ID
     * @returns {Object|null} Monster object or null if not found
     */
    getMonsterById: function(id) {
        return this.activeMonsters.find(monster => monster.id === id);
    },
    
    /**
     * Remove a monster by ID
     * @param {string} id - Monster ID
     * @returns {boolean} True if monster was removed
     */
    removeMonster: function(id) {
        const index = this.activeMonsters.findIndex(monster => monster.id === id);
        if (index === -1) return false;
        
        // Remove element
        const monster = this.activeMonsters[index];
        if (monster.element) {
            monster.element.remove();
        }
        
        // Remove from array
        this.activeMonsters.splice(index, 1);
        
        return true;
    },
    
    /**
     * Get all monsters in range of a character
     * @param {Object} character - Character to check
     * @param {number} range - Range to check
     * @returns {Array} Array of monsters in range
     */
    getMonstersInRange: function(character, range) {
        return this.activeMonsters.filter(monster => {
            const distance = Utils.distance(
                { x: character.x + character.width / 2, y: character.y + character.height / 2 },
                { x: monster.x + monster.width / 2, y: monster.y + monster.height / 2 }
            );
            
            return distance <= range;
        });
    },
    
    /**
     * Check if a character is overlapping with any monsters
     * @param {Object} character - Character to check
     * @param {number} overlapThreshold - Minimum overlap in pixels
     * @returns {Object|null} Overlapping monster or null if none
     */
    getOverlappingMonster: function(character, overlapThreshold = 10) {
        return this.activeMonsters.find(monster => 
            Utils.checkOverlap(
                { x: character.x, y: character.y, width: character.width, height: character.height },
                { x: monster.x, y: monster.y, width: monster.width, height: monster.height },
                overlapThreshold
            )
        );
    },
    
    /**
     * Get the number of active monsters
     * @returns {number} Number of active monsters
     */
    getMonsterCount: function() {
        return this.activeMonsters.length;
    },
    
    /**
     * Clear all monsters
     */
    clearAllMonsters: function() {
        // Remove all monster elements
        this.activeMonsters.forEach(monster => {
            if (monster.element) {
                monster.element.remove();
            }
        });
        
        // Clear array
        this.activeMonsters = [];
    },
    
    /**
     * Apply level scaling to a monster
     * @param {Object} monster - Monster to scale
     */
    applyLevelScaling: function(monster) {
        const level = MapSystem.currentDungeonLevel || 1;
        
        // Scale base stats
        monster.maxHealth *= level;
        monster.health = monster.maxHealth;
        monster.attack *= level;
        monster.defense *= level;
        monster.experienceValue *= level;
        
        // Scale size - changed to additive 5% per level
        const sizeMultiplier = 1 + (0.05 * (level - 1)); // +5% per level
        monster.width = Math.round(this.monsterTypes[monster.type].width * sizeMultiplier);
        monster.height = Math.round(this.monsterTypes[monster.type].height * sizeMultiplier);
        
        // Update level
        monster.level = level;
    },
    
    handleLootDrop: function(drop) {
        if (drop && drop.itemId) {
            // Calculate quantity based on drop rates
            const quantity = drop.quantity || 1;
            
            try {
                if (Inventory && typeof Inventory.addItem === 'function') {
                    // Add item to inventory
                    const success = Inventory.addItem(drop.itemId, quantity);
                    
                    if (success) {
                        // Dispatch the itemCollected event for mission tracking
                        document.dispatchEvent(new CustomEvent('itemCollected', {
                            detail: {
                                itemId: drop.itemId,
                                quantity: quantity
                            }
                        }));
                        
                        // Show loot notification
                        const item = Items.getItem(drop.itemId);
                        if (item) {
                            Utils.showNotification(`Obtained ${quantity}x ${item.name}`, 'loot');
                        }
                    }
                }
            } catch (error) {
                console.error("Error handling loot drop:", error);
            }
        }
    },
    
    /**
     * Update monster position and state
     * @param {Object} monster - Monster object
     * @param {number} deltaTime - Time since last update
     * @param {number} now - Current timestamp
     */
    updateMonster: function(monster, deltaTime, now) {
        if (!monster || !monster.element || monster.isDead) return;
        
        // Check if hit animation should end
        if (monster.isHit && now - monster.hitTime >= monster.hitDuration) {
            monster.isHit = false;
        }
        
        // Check for stun status
        const isStunned = monster.hitTime && (now - monster.hitTime < monster.stunDuration);
        
        // Check if attack animation should end
        if (monster.isAttacking && now - monster.attackTime >= 2000) {
            monster.isAttacking = false;
        }
        
        // Only proceed with movement and attacks if not stunned
        if (!isStunned) {
            const nearestChar = this.findNearestCharacter(monster);
            if (nearestChar) {
                // Calculate distance to character
                const dx = (monster.x + monster.width / 2) - (nearestChar.x + nearestChar.width / 2);
                const dy = (monster.y + monster.height / 2) - (nearestChar.y + nearestChar.height / 2);
                const distanceSq = dx * dx + dy * dy;
                
                // Define attack range (closer than detection range)
                const attackRange = 100; // Melee attack range
                const approachRange = monster.detectionRange || 300; // Distance to start approaching
                
                if (distanceSq <= attackRange * attackRange) {
                    // Stop moving when in attack range
                    monster.movementState = 'stopped';
                    monster.isAttacking = true;
                    monster.attackTime = now;
                    
                    // Update facing direction
                    if (monster.element) {
                        monster.element.style.transform = dx > 0 ? "scaleX(-1)" : "scaleX(1)";
                    }
                    
                    // Attack character
                    if (!monster.lastAttackTime || now - monster.lastAttackTime >= monster.attackCooldown) {
                        this.monsterAttack(monster, nearestChar);
                        monster.lastAttackTime = now;
                    }
                } else if (distanceSq <= approachRange * approachRange) {
                    // Stop moving when character is in approach range
                    monster.movementState = 'stopped';
                    // Update facing direction towards character
                    if (monster.element) {
                        monster.element.style.transform = dx > 0 ? "scaleX(-1)" : "scaleX(1)";
                    }
                } else {
                    // Resume default movement when character is out of range
                    this.updateDefaultMovement(monster, deltaTime, now);
                }
            } else {
                // No character nearby - resume default movement
                this.updateDefaultMovement(monster, deltaTime, now);
            }
        }
        
        // Update element position
        if (monster.element) {
            monster.element.style.left = `${monster.x}px`;
            monster.element.style.top = `${monster.y}px`;
        }
        
        // Update status effects less frequently
        if (now % 4 === 0) {
            this.updateMonsterEffects(monster, deltaTime);
        }
    },
    
    /**
     * Move monster towards character
     * @param {Object} monster - Monster object
     * @param {Object} character - Target character
     * @param {number} deltaTime - Time since last update
     */
    moveTowardsCharacter: function(monster, character, deltaTime) {
        // Calculate direction to character
        const monsterCenterX = monster.x + monster.width / 2;
        const monsterCenterY = monster.y + monster.height / 2;
        const charCenterX = character.x + character.width / 2;
        const charCenterY = character.y + character.height / 2;
        
        // Calculate movement vector
        const dx = charCenterX - monsterCenterX;
        const dy = charCenterY - monsterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Define attack range
        const attackRange = 100; // Same as in updateMonster
        
        // Only move if not within attack range
        if (distance > attackRange) {
            // Normalize and apply speed
            const speed = monster.speed || 0.5;
            const moveX = (dx / distance) * speed * deltaTime;
            const moveY = (dy / distance) * speed * deltaTime;
            
            // Update monster position
            monster.x += moveX;
            
            // Vertical movement with boundaries
            const newY = monster.y + moveY;
            const maxVerticalDeviation = 100; // Maximum vertical movement from base position
            
            monster.y = Math.max(
                monster.baseY - maxVerticalDeviation,
                Math.min(monster.baseY + maxVerticalDeviation, newY)
            );
            
            // Update monster facing direction
            if (monster.element) {
                monster.element.style.transform = dx > 0 ? "scaleX(1)" : "scaleX(-1)";
            }
        }
    },
    
    /**
     * Update default movement pattern when not approaching character
     * @param {Object} monster - Monster object
     * @param {number} deltaTime - Time since last update
     * @param {number} now - Current timestamp
     */
    updateDefaultMovement: function(monster, deltaTime, now) {
        // Skip movement if monster is stopped
        if (monster.movementState === 'stopped') return;

        // Handle movement state changes
        if (now >= monster.nextStateChangeTime) {
            switch (monster.movementState) {
                case 'idle':
                    monster.movementState = 'moving';
                    monster.verticalDirection = Math.random() < 0.5 ? -1 : 1;
                    monster.nextStateChangeTime = now + 2000;
                    break;
                case 'moving':
                case 'waiting':
                    monster.movementState = 'idle';
                    monster.nextStateChangeTime = now + 1000;
                    break;
                default:
                    monster.movementState = 'idle';
                    monster.nextStateChangeTime = now + 1000;
            }
        }

        // Apply movement based on state
        if (monster.movementState === 'moving') {
            // Existing movement logic...
        }
    }
};
