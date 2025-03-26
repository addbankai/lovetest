// Global references
const itemDatabaseContainer = document.getElementById('item-database');
const clickSound = document.getElementById('click-sound');
let currentSearchTerm = ''; // Global variable for search term

// Helper function to play sound
function playSound() {
    if (clickSound) {
        clickSound.currentTime = 0; // Rewind to start
        clickSound.play().catch(e => console.error("Audio play failed:", e));
    }
}

// Basic setup on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    // --- Sound Effects for Nav Links (already existed) ---
    const links = document.querySelectorAll('.nav-link, .cta-button, .tab-button');
    links.forEach(link => {
        link.addEventListener('click', playSound); // Use helper function
    });

    // --- Clock ---
    const clockElement = document.getElementById('clock');
    function updateClock() {
        if (clockElement) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    }
    if (clockElement) {
        setInterval(updateClock, 1000);
        updateClock(); // Initial call
    }

    // --- Year in Footer ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Pre-process Monster Drop Data ---
    buildDropSources(); // Create the lookup table for drops

    // --- Setup Sorting Controls ---
    const sortDefaultButton = document.getElementById('sortDefault');
    // const sortNameAscButton = document.getElementById('sortNameAsc'); // Removed
    // const sortNameDescButton = document.getElementById('sortNameDesc'); // Removed
    // const sortCategoryButton = document.getElementById('sortCategory'); // Removed
    // const sortEquipmentTypeButton = document.getElementById('sortEquipmentType'); // Removed
    // const sortRarityButton = document.getElementById('sortRarity'); // Removed

    // Keep sortDefaultButton reference for now, might remove later if not needed
    // if(sortDefaultButton) { ... } // Commented out default button listener as dropdown handles default

    // --- Dropdown Sort ---
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (event) => {
            playSound();
            const selectedSort = event.target.value;
            sortData(selectedSort); // Sort based on dropdown value
        });
    }

    // --- Search Input ---
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            currentSearchTerm = event.target.value.toLowerCase();
            filterAndRenderItems(); // Re-filter and render on input change
        });
    }

    // --- Initial Item Load and Sort ---
    filterAndRenderItems(); // Perform initial filter and render on page load (will use default sort)
});

// --- Item Data ---
// [ ... Full itemData array as previously provided ... ]
const itemData = [
    // WEAPONS - SWORD
    { id: 'cyber_blade', name: 'Cyber Blade', category: 'weapon', equipmentType: 'sword', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'A sharp blade with neon edges.', stats: { damage: 15, attackSpeed: 1.2 }, effects: ['Deals 5 bonus damage to robotic enemies'], icon: 'img/items/cyber_blade.jpg', level: 1 },
    { id: 'razor_sword', name: 'Razor Sword', category: 'weapon', equipmentType: 'sword', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A neon-edged blade that slices through armor with precision.', stats: { damage: 50, attackSpeed: 1.2, critical: 15 }, effects: ['Increases critical damage by 20%'], icon: 'img/items/razor_sword.jpg', level: 20 },
    { id: 'guardian_sword', name: 'Guardian Sword', category: 'weapon', equipmentType: 'sword', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A blade with integrated shielding tech for the wielder’s safety.', stats: { damage: 40, defense: 20 }, effects: ['Each hit has a 10% chance to grant a shield absorbing 30 damage'], icon: 'img/items/guardian_sword.jpg', level: 20 },
    { id: 'apocalypse_sword', name: 'Apocalypse Sword', category: 'weapon', equipmentType: 'sword', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A devastating weapon forged in the fires of a dying city.', stats: { damage: 70, attackSpeed: 1.3, critical: 20 }, effects: ['Attacks have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_sword.jpg', level: 30 },
    { id: 'aegis_sword', name: 'Aegis Sword', category: 'weapon', equipmentType: 'sword', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A blade that channels energy into a protective barrier.', stats: { damage: 55, defense: 30 }, effects: ['Killing an enemy grants a shield equal to 15% of max HP'], icon: 'img/items/aegis_sword.jpg', level: 30 },

    // WEAPONS - DAGGER
    { id: 'quantum_dagger', name: 'Quantum Dagger', category: 'weapon', equipmentType: 'dagger', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A dagger that can phase through armor.', stats: { damage: 12, attackSpeed: 1.5, critical: 10 }, effects: ['15% chance to ignore target defense'], icon: 'img/items/quantum_dagger.jpg', level: 5 },
    { id: 'razor_dagger', name: 'Razor Dagger', category: 'weapon', equipmentType: 'dagger', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A swift blade with a neon edge, perfect for quick strikes.', stats: { damage: 40, attackSpeed: 1.5, critical: 10 }, effects: ['Increases critical damage by 15%'], icon: 'img/items/razor_dagger.jpg', level: 20 },
    { id: 'guardian_dagger', name: 'Guardian Dagger', category: 'weapon', equipmentType: 'dagger', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A dagger with a built-in energy shield for protection.', stats: { damage: 30, defense: 15 }, effects: ['Each hit has a 10% chance to grant a shield absorbing 20 damage'], icon: 'img/items/guardian_dagger.jpg', level: 20 },
    { id: 'apocalypse_dagger', name: 'Apocalypse Dagger', category: 'weapon', equipmentType: 'dagger', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A dagger forged in the heart of a collapsing star, dealing massive damage.', stats: { damage: 60, attackSpeed: 1.6, critical: 15 }, effects: ['Attacks have a 15% chance to deal triple damage'], icon: 'img/items/apocalypse_dagger.jpg', level: 30 },
    { id: 'aegis_dagger', name: 'Aegis Dagger', category: 'weapon', equipmentType: 'dagger', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A dagger that channels defensive energy, protecting the wielder.', stats: { damage: 45, defense: 25 }, effects: ['Killing an enemy grants a shield equal to 20% of max HP'], icon: 'img/items/aegis_dagger.jpg', level: 30 },

    // WEAPONS - DUAL DAGGER
    { id: 'twin_fangs', name: 'Twin Fangs', category: 'weapon', equipmentType: 'dual_dagger', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A pair of venomous daggers that strike like serpents.', stats: { damage: 5, attackSpeed: 2, critical: 10 }, effects: ['Each hit has 10% chance to poison target'], icon: 'img/items/twin_fangs.jpg', level: 15 },
    { id: 'razor_dual_dagger', name: 'Razor Dual Dagger', category: 'weapon', equipmentType: 'dual_dagger', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Twin daggers with neon edges, designed for rapid slashes.', stats: { damage: 35, attackSpeed: 1.8, critical: 12 }, effects: ['Each hit has a 10% chance to strike twice'], icon: 'img/items/razor_dual_dagger.jpg', level: 20 },
    { id: 'guardian_dual_dagger', name: 'Guardian Dual Dagger', category: 'weapon', equipmentType: 'dual_dagger', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Dual daggers with integrated shielding for the agile fighter.', stats: { damage: 25, defense: 20 }, effects: ['Each hit has a 10% chance to grant a shield absorbing 25 damage'], icon: 'img/items/guardian_dual_dagger.jpg', level: 20 },
    { id: 'apocalypse_dual_dagger', name: 'Apocalypse Dual Dagger', category: 'weapon', equipmentType: 'dual_dagger', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Twin blades that bring destruction with every slash.', stats: { damage: 55, attackSpeed: 1.9, critical: 18 }, effects: ['Each hit has a 15% chance to deal double damage'], icon: 'img/items/apocalypse_dual_dagger.jpg', level: 30 },
    { id: 'aegis_dual_dagger', name: 'Aegis Dual Dagger', category: 'weapon', equipmentType: 'dual_dagger', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Dual daggers that create a protective aura with each strike.', stats: { damage: 40, defense: 30 }, effects: ['Killing an enemy grants a shield equal to 15% of max HP'], icon: 'img/items/aegis_dual_dagger.jpg', level: 30 },

    // WEAPONS - DUAL BLADE
    { id: 'binary_blades', name: 'Binary Blades', category: 'weapon', equipmentType: 'dual_blade', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Twin energy blades that cut through code and matter alike.', stats: { damage: 25, attackSpeed: 1.4, critical: 8 }, effects: ['Attacks hit twice, with the second hit dealing 50% damage'], icon: 'img/items/binary_blades.jpg', level: 20 },
    { id: 'razor_dual_blade', name: 'Razor Dual Blade', category: 'weapon', equipmentType: 'dual_blade', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Twin blades with energy edges, slicing through foes effortlessly.', stats: { damage: 45, attackSpeed: 1.4, critical: 10 }, effects: ['Increases critical damage by 20%'], icon: 'img/items/razor_dual_blade.jpg', level: 20 },
    { id: 'guardian_dual_blade', name: 'Guardian Dual Blade', category: 'weapon', equipmentType: 'dual_blade', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Dual blades with defensive tech for the balanced warrior.', stats: { damage: 35, defense: 20 }, effects: ['Each hit has a 10% chance to grant a shield absorbing 30 damage'], icon: 'img/items/guardian_dual_blade.jpg', level: 20 },
    { id: 'apocalypse_dual_blade', name: 'Apocalypse Dual Blade', category: 'weapon', equipmentType: 'dual_blade', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Twin blades that bring ruin to all who oppose them.', stats: { damage: 65, attackSpeed: 1.5, critical: 15 }, effects: ['Attacks have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_dual_blade.jpg', level: 30 },
    { id: 'aegis_dual_blade', name: 'Aegis Dual Blade', category: 'weapon', equipmentType: 'dual_blade', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Dual blades that protect the wielder with each swing.', stats: { damage: 50, defense: 30 }, effects: ['Killing an enemy grants a shield equal to 15% of max HP'], icon: 'img/items/aegis_dual_blade.jpg', level: 30 },

    // WEAPONS - BOW
    { id: 'pulse_bow', name: 'Pulse Bow', category: 'weapon', equipmentType: 'bow', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A bow that fires concentrated energy pulses.', stats: { damage: 20, attackSpeed: 1.2, range: 50 }, effects: ['Arrows penetrate through up to 3 targets'], icon: 'img/items/pulse_bow.jpg', level: 12 },
    { id: 'razor_bow', name: 'Razor Bow', category: 'weapon', equipmentType: 'bow', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A high-tech bow with laser-guided arrows for precision.', stats: { damage: 45, attackSpeed: 1.0, range: 200 }, effects: ['Increases critical damage by 20%'], icon: 'img/items/razor_bow.jpg', level: 20 },
    { id: 'guardian_bow', name: 'Guardian Bow', category: 'weapon', equipmentType: 'bow', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A bow with a built-in energy shield for the archer.', stats: { damage: 35, defense: 20, range: 180 }, effects: ['Each hit has a 10% chance to grant a shield absorbing 25 damage'], icon: 'img/items/guardian_bow.jpg', level: 20 },
    { id: 'apocalypse_bow', name: 'Apocalypse Bow', category: 'weapon', equipmentType: 'bow', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A bow that fires arrows of pure energy, devastating foes.', stats: { damage: 65, attackSpeed: 1.1, range: 220 }, effects: ['Attacks have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_bow.jpg', level: 30 },
    { id: 'aegis_bow', name: 'Aegis Bow', category: 'weapon', equipmentType: 'bow', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A bow that creates a protective barrier with each shot.', stats: { damage: 50, defense: 30, range: 200 }, effects: ['Killing an enemy grants a shield equal to 15% of max HP'], icon: 'img/items/aegis_bow.jpg', level: 30 },

    // WEAPONS - CROSSBOW
    { id: 'auto_crossbow', name: 'Auto-Crossbow', category: 'weapon', equipmentType: 'crossbow', rarity: 'Epic', rarityColor: '#ff00ff', description: 'An automated crossbow with rapid-fire capability.', stats: { damage: 16, attackSpeed: 1.1, range: 180 }, effects: ['25% chance to fire an additional bolt'], icon: 'img/items/auto_crossbow.jpg', level: 18 },
    { id: 'razor_crossbow', name: 'Razor Crossbow', category: 'weapon', equipmentType: 'crossbow', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A compact crossbow with auto-reloading bolts.', stats: { damage: 50, attackSpeed: 0.9, range: 180 }, effects: ['Increases critical damage by 20%'], icon: 'img/items/razor_crossbow.jpg', level: 20 },
    { id: 'guardian_crossbow', name: 'Guardian Crossbow', category: 'weapon', equipmentType: 'crossbow', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A crossbow with integrated defensive systems.', stats: { damage: 40, defense: 20, range: 160 }, effects: ['Each hit has a 10% chance to grant a shield absorbing 25 damage'], icon: 'img/items/guardian_crossbow.jpg', level: 20 },
    { id: 'apocalypse_crossbow', name: 'Apocalypse Crossbow', category: 'weapon', equipmentType: 'crossbow', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A crossbow that fires bolts of destructive energy.', stats: { damage: 70, attackSpeed: 1.0, range: 200 }, effects: ['Attacks have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_crossbow.jpg', level: 30 },
    { id: 'aegis_crossbow', name: 'Aegis Crossbow', category: 'weapon', equipmentType: 'crossbow', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A crossbow that shields the user with each shot.', stats: { damage: 55, defense: 30, range: 180 }, effects: ['Killing an enemy grants a shield equal to 15% of max HP'], icon: 'img/items/aegis_crossbow.jpg', level: 30 },

    // WEAPONS - STAFF
    { id: 'data_staff', name: 'Data Staff', category: 'weapon', equipmentType: 'staff', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A staff channeling digital energies.', stats: { magicDamage: 25, attackSpeed: 0.8, intelligence: 10 }, effects: ['Spells cost 15% less energy'], icon: 'img/items/data_staff.jpg', level: 14 },
    { id: 'razor_staff', name: 'Razor Staff', category: 'weapon', equipmentType: 'staff', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A staff channeling neon energy for devastating spells.', stats: { magicDamage: 50, attackSpeed: 0.8, intelligence: 15 }, effects: ['Increases spell damage by 10%'], icon: 'img/items/razor_staff.jpg', level: 20 },
    { id: 'guardian_staff', name: 'Guardian Staff', category: 'weapon', equipmentType: 'staff', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A staff with protective runes for the caster.', stats: { magicDamage: 40, magicDefense: 20, intelligence: 10 }, effects: ['Each spell cast has a 10% chance to grant a magic shield absorbing 30 damage'], icon: 'img/items/guardian_staff.jpg', level: 20 },
    { id: 'apocalypse_staff', name: 'Apocalypse Staff', category: 'weapon', equipmentType: 'staff', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A staff that unleashes cataclysmic magic.', stats: { magicDamage: 70, attackSpeed: 0.9, intelligence: 20 }, effects: ['Spells have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_staff.jpg', level: 30 },
    { id: 'aegis_staff', name: 'Aegis Staff', category: 'weapon', equipmentType: 'staff', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A staff that fortifies the caster with each spell.', stats: { magicDamage: 55, magicDefense: 30, intelligence: 15 }, effects: ['Killing an enemy with a spell grants a magic shield equal to 20% of max HP'], icon: 'img/items/aegis_staff.jpg', level: 30 },

    // WEAPONS - KATANA
    { id: 'neon_katana', name: 'Neon Katana', category: 'weapon', equipmentType: 'katana', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A razor-sharp blade with neon edge technology.', stats: { damage: 22, attackSpeed: 1.2, critical: 12 }, effects: ['Critical hits cause bleeding for 3 seconds'], icon: 'img/items/neon_katana.jpg', level: 16 },
    { id: 'razor_katana', name: 'Razor Katana', category: 'weapon', equipmentType: 'katana', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A katana with a neon blade, slicing through enemies with precision.', stats: { damage: 55, attackSpeed: 1.1, critical: 12 }, effects: ['Increases critical damage by 20%'], icon: 'img/items/razor_katana.jpg', level: 20 },
    { id: 'guardian_katana', name: 'Guardian Katana', category: 'weapon', equipmentType: 'katana', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A katana with defensive enhancements for the samurai.', stats: { damage: 45, defense: 20 }, effects: ['Each hit has a 10% chance to grant a shield absorbing 30 damage'], icon: 'img/items/guardian_katana.jpg', level: 20 },
    { id: 'apocalypse_katana', name: 'Apocalypse Katana', category: 'weapon', equipmentType: 'katana', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A katana that brings doom to all who face it.', stats: { damage: 75, attackSpeed: 1.2, critical: 18 }, effects: ['Attacks have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_katana.jpg', level: 30 },
    { id: 'aegis_katana', name: 'Aegis Katana', category: 'weapon', equipmentType: 'katana', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A katana that shields the wielder with each strike.', stats: { damage: 60, defense: 30 }, effects: ['Killing an enemy grants a shield equal to 15% of max HP'], icon: 'img/items/aegis_katana.jpg', level: 30 },

    // WEAPONS - KNUCKLES
    { id: 'shock_knuckles', name: 'Shock Knuckles', category: 'weapon', equipmentType: 'knuckles', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'Electrified knuckles that deliver stunning punches.', stats: { damage: 8, attackSpeed: 1.8, evasion: 5 }, effects: ['15% chance to stun target for 1 second'], icon: 'img/items/shock_knuckles.jpg', level: 8 },
    { id: 'razor_knuckles', name: 'Razor Knuckles', category: 'weapon', equipmentType: 'knuckles', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Electrified knuckles that deliver shocking punches.', stats: { damage: 35, attackSpeed: 1.6, critical: 10 }, effects: ['Increases critical damage by 15%'], icon: 'img/items/razor_knuckles.jpg', level: 20 },
    { id: 'guardian_knuckles', name: 'Guardian Knuckles', category: 'weapon', equipmentType: 'knuckles', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Knuckles with reinforced plating for protection.', stats: { damage: 25, defense: 20 }, effects: ['Each hit has a 10% chance to grant a shield absorbing 20 damage'], icon: 'img/items/guardian_knuckles.jpg', level: 20 },
    { id: 'apocalypse_knuckles', name: 'Apocalypse Knuckles', category: 'weapon', equipmentType: 'knuckles', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Knuckles that unleash devastating power with each punch.', stats: { damage: 55, attackSpeed: 1.7, critical: 15 }, effects: ['Attacks have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_knuckles.jpg', level: 30 },
    { id: 'aegis_knuckles', name: 'Aegis Knuckles', category: 'weapon', equipmentType: 'knuckles', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Knuckles that protect the user with each strike.', stats: { damage: 40, defense: 30 }, effects: ['Killing an enemy grants a shield equal to 15% of max HP'], icon: 'img/items/aegis_knuckles.jpg', level: 30 },

    // WEAPONS - SPEAR
    { id: 'volt_lance', name: 'Volt Lance', category: 'weapon', equipmentType: 'spear', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A spear charged with electrical energy.', stats: { damage: 20, attackSpeed: 1.0, range: 80 }, effects: ['Attacks chain to nearby enemies for 30% damage'], icon: 'img/items/volt_lance.jpg', level: 12 },
    { id: 'razor_spear', name: 'Razor Spear', category: 'weapon', equipmentType: 'spear', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A spear with a neon tip, piercing through armor.', stats: { damage: 50, attackSpeed: 1.0, range: 100 }, effects: ['Increases critical damage by 20%'], icon: 'img/items/razor_spear.jpg', level: 20 },
    { id: 'guardian_spear', name: 'Guardian Spear', category: 'weapon', equipmentType: 'spear', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A spear with defensive enhancements for the lancer.', stats: { damage: 40, defense: 20, range: 90 }, effects: ['Each hit has a 10% chance to grant a shield absorbing 30 damage'], icon: 'img/items/guardian_spear.jpg', level: 20 },
    { id: 'apocalypse_spear', name: 'Apocalypse Spear', category: 'weapon', equipmentType: 'spear', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A spear that brings destruction with each thrust.', stats: { damage: 70, attackSpeed: 1.1, range: 120 }, effects: ['Attacks have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_spear.jpg', level: 30 },
    { id: 'aegis_spear', name: 'Aegis Spear', category: 'weapon', equipmentType: 'spear', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A spear that shields the wielder with each strike.', stats: { damage: 55, defense: 30, range: 100 }, effects: ['Killing an enemy grants a shield equal to 15% of max HP'], icon: 'img/items/aegis_spear.jpg', level: 30 },

    // WEAPONS - SCYTHE
    { id: 'data_reaper', name: 'Data Reaper', category: 'weapon', equipmentType: 'scythe', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A scythe that harvests digital souls.', stats: { damage: 30, attackSpeed: 0.7, critical: 15 }, effects: ['Defeated enemies explode, dealing damage to nearby foes'], icon: 'img/items/data_reaper.jpg', level: 25 },
    { id: 'razor_scythe', name: 'Razor Scythe', category: 'weapon', equipmentType: 'scythe', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A scythe with a glowing blade, reaping souls with ease.', stats: { damage: 60, attackSpeed: 0.9, critical: 10 }, effects: ['Increases critical damage by 20%'], icon: 'img/items/razor_scythe.jpg', level: 20 },
    { id: 'guardian_scythe', name: 'Guardian Scythe', category: 'weapon', equipmentType: 'scythe', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A scythe with protective enchantments for the reaper.', stats: { damage: 50, defense: 25 }, effects: ['Each hit has a 10% chance to grant a shield absorbing 35 damage'], icon: 'img/items/guardian_scythe.jpg', level: 20 },
    { id: 'apocalypse_scythe', name: 'Apocalypse Scythe', category: 'weapon', equipmentType: 'scythe', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A scythe that brings the end to all who face it.', stats: { damage: 80, attackSpeed: 1.0, critical: 15 }, effects: ['Attacks have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_scythe.jpg', level: 30 },
    { id: 'aegis_scythe', name: 'Aegis Scythe', category: 'weapon', equipmentType: 'scythe', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A scythe that protects the wielder with each swing.', stats: { damage: 65, defense: 35 }, effects: ['Killing an enemy grants a shield equal to 15% of max HP'], icon: 'img/items/aegis_scythe.jpg', level: 30 },

    // WEAPONS - WAND
    { id: 'code_wand', name: 'Code Wand', category: 'weapon', equipmentType: 'wand', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'A wand that manipulates code structures.', stats: { magicDamage: 15, attackSpeed: 1.2, intelligence: 8 }, effects: ['10% chance to temporarily disable enemy abilities'], icon: 'img/items/code_wand.jpg', level: 10 },
    { id: 'razor_wand', name: 'Razor Wand', category: 'weapon', equipmentType: 'wand', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A wand that channels neon energy for powerful spells.', stats: { magicDamage: 45, attackSpeed: 1.2, intelligence: 12 }, effects: ['Increases spell damage by 10%'], icon: 'img/items/razor_wand.jpg', level: 20 },
    { id: 'guardian_wand', name: 'Guardian Wand', category: 'weapon', equipmentType: 'wand', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A wand with protective enchantments for the caster.', stats: { magicDamage: 35, magicDefense: 20, intelligence: 10 }, effects: ['Each spell cast has a 10% chance to grant a magic shield absorbing 25 damage'], icon: 'img/items/guardian_wand.jpg', level: 20 },
    { id: 'apocalypse_wand', name: 'Apocalypse Wand', category: 'weapon', equipmentType: 'wand', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A wand that unleashes devastating magic.', stats: { magicDamage: 65, attackSpeed: 1.3, intelligence: 18 }, effects: ['Spells have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_wand.jpg', level: 30 },
    { id: 'aegis_wand', name: 'Aegis Wand', category: 'weapon', equipmentType: 'wand', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A wand that fortifies the caster with each spell.', stats: { magicDamage: 50, magicDefense: 30, intelligence: 15 }, effects: ['Killing an enemy with a spell grants a magic shield equal to 20% of max HP'], icon: 'img/items/aegis_wand.jpg', level: 30 },

    // WEAPONS - GRIMOIRE
    { id: 'algorithm_grimoire', name: 'Algorithm Grimoire', category: 'weapon', equipmentType: 'grimoire', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A tome containing powerful algorithms and spells.', stats: { magicDamage: 28, attackSpeed: 0.9, intelligence: 15 }, effects: ['Spells have 20% increased area of effect'], icon: 'img/items/algorithm_grimoire.jpg', level: 20 },
    { id: 'razor_grimoire', name: 'Razor Grimoire', category: 'weapon', equipmentType: 'grimoire', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A tome filled with neon spells for destruction.', stats: { magicDamage: 50, attackSpeed: 0.7, intelligence: 15 }, effects: ['Increases spell damage by 10%'], icon: 'img/items/razor_grimoire.jpg', level: 20 },
    { id: 'guardian_grimoire', name: 'Guardian Grimoire', category: 'weapon', equipmentType: 'grimoire', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A tome with protective spells for the mage.', stats: { magicDamage: 40, magicDefense: 25, intelligence: 10 }, effects: ['Each spell cast has a 10% chance to grant a magic shield absorbing 30 damage'], icon: 'img/items/guardian_grimoire.jpg', level: 20 },
    { id: 'apocalypse_grimoire', name: 'Apocalypse Grimoire', category: 'weapon', equipmentType: 'grimoire', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A tome that brings cataclysmic magic to the battlefield.', stats: { magicDamage: 70, attackSpeed: 0.8, intelligence: 20 }, effects: ['Spells have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_grimoire.jpg', level: 30 },
    { id: 'aegis_grimoire', name: 'Aegis Grimoire', category: 'weapon', equipmentType: 'grimoire', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A tome that shields the caster with each spell.', stats: { magicDamage: 55, magicDefense: 35, intelligence: 15 }, effects: ['Killing an enemy with a spell grants a magic shield equal to 20% of max HP'], icon: 'img/items/aegis_grimoire.jpg', level: 30 },

    // WEAPONS - RIFLE
    { id: 'laser_rifle', name: 'Laser Rifle', category: 'weapon', equipmentType: 'rifle', rarity: 'Common', rarityColor: '#aaaaaa', description: 'A basic rifle that fires concentrated laser beams.', stats: { damage: 18, attackSpeed: 1.0, range: 250 }, effects: ['Slight chance to overheat enemy circuits'], icon: 'img/items/laser_rifle.jpg', level: 3 },
    { id: 'plasma_carbine', name: 'Plasma Carbine', category: 'weapon', equipmentType: 'rifle', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'A mid-range carbine that shoots searing plasma bolts.', stats: { damage: 22, attackSpeed: 1.1, range: 220 }, effects: ['20% chance to cause a burn effect'], icon: 'img/items/plasma_carbine.jpg', level: 7 },
    { id: 'railgun', name: 'Railgun', category: 'weapon', equipmentType: 'rifle', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A high-precision railgun that uses electromagnetic force to launch projectiles.', stats: { damage: 35, attackSpeed: 0.8, range: 300, critical: 20 }, effects: ['Pierces through enemy armor with devastating impact'], icon: 'img/items/railgun.jpg', level: 15 },
    { id: 'plasma_pistol', name: 'Plasma Pistol', category: 'weapon', equipmentType: 'rifle', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A pistol that fires concentrated plasma bolts.', stats: { damage: 20, attackSpeed: 1.0, range: 150 }, effects: ['20% chance to apply a burn effect'], icon: 'img/items/plasma_pistol.jpg', level: 5 }, // Note: Marked as Rifle type based on original data
    { id: 'razor_rifle', name: 'Razor Rifle', category: 'weapon', equipmentType: 'rifle', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A high-powered rifle with neon sights for precision.', stats: { damage: 55, attackSpeed: 0.8, range: 250 }, effects: ['Increases critical damage by 20%'], icon: 'img/items/razor_rifle.jpg', level: 20 },
    { id: 'guardian_rifle', name: 'Guardian Rifle', category: 'weapon', equipmentType: 'rifle', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A rifle with integrated shielding for the marksman.', stats: { damage: 45, defense: 20, range: 230 }, effects: ['Each hit has a 10% chance to grant a shield absorbing 30 damage'], icon: 'img/items/guardian_rifle.jpg', level: 20 },
    { id: 'apocalypse_rifle', name: 'Apocalypse Rifle', category: 'weapon', equipmentType: 'rifle', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A rifle that fires bolts of pure destruction.', stats: { damage: 75, attackSpeed: 0.9, range: 270 }, effects: ['Attacks have a 15% chance to deal double damage'], icon: 'img/items/apocalypse_rifle.jpg', level: 30 },
    { id: 'aegis_rifle', name: 'Aegis Rifle', category: 'weapon', equipmentType: 'rifle', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A rifle that shields the user with each shot.', stats: { damage: 60, defense: 30, range: 250 }, effects: ['Killing an enemy grants a shield equal to 15% of max HP'], icon: 'img/items/aegis_rifle.jpg', level: 30 },

    // ARMOR - LIGHT
    { id: 'synth_vest', name: 'Synthetic Vest', category: 'armor', equipmentType: 'light_armor', rarity: 'Common', rarityColor: '#aaaaaa', description: 'Basic protection made from synthetic fibers.', stats: { defense: 10, hp: 20 }, effects: [], icon: 'img/items/synth_vest.jpg', level: 1 },
    { id: 'nano_jacket', name: 'Nano Jacket', category: 'armor', equipmentType: 'light_armor', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'A flexible jacket reinforced with nanofibers for enhanced agility.', stats: { defense: 15, hp: 30, agility: 5 }, effects: ['Boosts dodge chance by 5%'], icon: 'img/items/nano_jacket.jpg', level: 4 },
    { id: 'fortified_light_armor', name: 'Fortified Light Armor', category: 'armor', equipmentType: 'light_armor', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A sleek suit with reinforced nanomesh for urban survival.', stats: { defense: 40, hp: 100 }, effects: ['Reduces incoming damage by 10%'], icon: 'img/items/fortified_light_armor.jpg', level: 20 },
    { id: 'assault_light_armor', name: 'Assault Light Armor', category: 'armor', equipmentType: 'light_armor', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Light armor wired to amplify combat aggression.', stats: { defense: 30, damage: 10, critical: 5 }, effects: ['Increases damage by 5%'], icon: 'img/items/assault_light_armor.jpg', level: 20 },
    { id: 'invincible_light_armor', name: 'Invincible Light Armor', category: 'armor', equipmentType: 'light_armor', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A masterpiece of cybernetic defense technology.', stats: { defense: 60, hp: 150 }, effects: ['Grants immunity to critical hits'], icon: 'img/items/invincible_light_armor.jpg', level: 30 },
    { id: 'berserker_light_armor', name: 'Berserker Light Armor', category: 'armor', equipmentType: 'light_armor', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Armor that fuels a relentless assault in neon-lit streets.', stats: { defense: 40, damage: 20, critical: 10 }, effects: ['Each kill increases damage by 2% for 10 seconds, stacks up to 10 times'], icon: 'img/items/berserker_light_armor.jpg', level: 30 },

    // ARMOR - MEDIUM
    { id: 'nano_armor', name: 'Nano Armor', category: 'armor', equipmentType: 'medium_armor', rarity: 'Rare', rarityColor: '#00f3ff', description: 'Armor made from nanobots that adapt to damage.', stats: { defense: 25, hp: 50, magicDefense: 15 }, effects: ['Regenerates 1 HP per second'], icon: 'img/items/nano_armor.jpg', level: 8 },
    { id: 'reactive_body_armor', name: 'Reactive Body Armor', category: 'armor', equipmentType: 'medium_armor', rarity: 'Rare', rarityColor: '#00f3ff', description: 'Armor that adapts to incoming attacks to reduce damage.', stats: { defense: 30, hp: 60, magicDefense: 20 }, effects: ['Triggers a damage absorption shield for 2 seconds when hit'], icon: 'img/items/reactive_body_armor.jpg', level: 10 },
    // Add Epic/Legendary Medium Armor if available

    // ARMOR - HEAVY
    { id: 'cybernetic_plate', name: 'Cybernetic Plate', category: 'armor', equipmentType: 'heavy_armor', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Heavy armor augmented with cybernetic enhancements.', stats: { defense: 40, hp: 80, strength: 10 }, effects: ['Reduces physical damage by 15%'], icon: 'img/items/cybernetic_plate.jpg', level: 12 },
    { id: 'exoskeletal_suit', name: 'Exoskeletal Suit', category: 'armor', equipmentType: 'heavy_armor', rarity: 'Epic', rarityColor: '#ff00ff', description: 'An advanced suit that enhances physical prowess and durability.', stats: { defense: 45, hp: 90, strength: 15 }, effects: ['Increases strength by 10% and reduces knockback'], icon: 'img/items/exoskeletal_suit.jpg', level: 14 },
    // Add Legendary Heavy Armor if available

    // ARMOR - SHIELD
    { id: 'quantum_shield', name: 'Quantum Shield', category: 'armor', equipmentType: 'shield', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A shield that exists in multiple dimensions simultaneously.', stats: { defense: 50, hp: 100, magicDefense: 50, evasion: 10 }, effects: ['15% chance to completely negate damage'], icon: 'img/items/quantum_shield.jpg', level: 15 },

    // GLOVES - LIGHT
    { id: 'cyber_gloves', name: 'Cyber Gloves', category: 'gloves', equipmentType: 'light_gloves', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'Lightweight gloves with enhanced grip and dexterity.', stats: { dexterity: 8, attackSpeed: 0.1, critical: 5 }, effects: ['Increases critical hit damage by 10%'], icon: 'img/items/cyber_gloves.jpg', level: 5 },
    { id: 'fortified_light_gloves', name: 'Fortified Light Gloves', category: 'gloves', equipmentType: 'light_gloves', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Gloves with embedded plating for enhanced resilience.', stats: { defense: 15, hp: 50 }, effects: ['Increases block chance by 5%'], icon: 'img/items/fortified_light_gloves.jpg', level: 20 },
    { id: 'assault_light_gloves', name: 'Assault Light Gloves', category: 'gloves', equipmentType: 'light_gloves', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Gloves optimized for rapid, lethal strikes.', stats: { attackSpeed: 0.1, critical: 5 }, effects: ['Increases critical damage by 10%'], icon: 'img/items/assault_light_gloves.jpg', level: 20 },
    { id: 'invincible_light_gloves', name: 'Invincible Light Gloves', category: 'gloves', equipmentType: 'light_gloves', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Gloves that turn hands into unbreakable shields.', stats: { defense: 25, hp: 80 }, effects: ['Reflects 10% of incoming damage back to the attacker'], icon: 'img/items/invincible_light_gloves.jpg', level: 30 },
    { id: 'berserker_light_gloves', name: 'Berserker Light Gloves', category: 'gloves', equipmentType: 'light_gloves', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Gloves that amplify every punch with fury.', stats: { attackSpeed: 0.2, critical: 10 }, effects: ['Each consecutive hit on the same target increases damage by 5%, up to 25%'], icon: 'img/items/berserker_light_gloves.jpg', level: 30 },

    // GLOVES - HEAVY
    { id: 'power_gauntlets', name: 'Power Gauntlets', category: 'gloves', equipmentType: 'heavy_gloves', rarity: 'Rare', rarityColor: '#00f3ff', description: 'Heavy-duty gauntlets that enhance physical strength.', stats: { strength: 12, damage: 15, defense: 8 }, effects: ['Melee attacks deal 5% splash damage to nearby enemies'], icon: 'img/items/power_gauntlets.jpg', level: 10 },
    // Add Epic/Legendary Heavy Gloves if available

    // BOOTS - LIGHT
    { id: 'speed_runners', name: 'Speed Runners', category: 'boots', equipmentType: 'light_boots', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'Lightweight boots that enhance movement speed.', stats: { agility: 10, evasion: 8, attackSpeed: 0.1 }, effects: ['Increases movement speed by 15%'], icon: 'img/items/speed_runners.jpg', level: 6 },
    { id: 'fortified_light_boots', name: 'Fortified Light Boots', category: 'boots', equipmentType: 'light_boots', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Boots with shock-absorbing tech for survival.', stats: { defense: 10, hp: 40, evasion: 5 }, effects: ['Increases movement speed by 10% when health is below 50%'], icon: 'img/items/fortified_light_boots.jpg', level: 20 },
    { id: 'assault_light_boots', name: 'Assault Light Boots', category: 'boots', equipmentType: 'light_boots', rarity: 'Epic', rarityColor: '#ff00ff', description: 'Boots built for swift and deadly maneuvers.', stats: { attackSpeed: 0.1, critical: 5, movementSpeed: 10 }, effects: ['Dash attacks deal 20% more damage'], icon: 'img/items/assault_light_boots.jpg', level: 20 },
    { id: 'invincible_light_boots', name: 'Invincible Light Boots', category: 'boots', equipmentType: 'light_boots', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Boots that make the wearer untouchable in motion.', stats: { defense: 20, hp: 60, evasion: 10 }, effects: ['Grants a 15% chance to dodge attacks'], icon: 'img/items/invincible_light_boots.jpg', level: 30 },
    { id: 'berserker_light_boots', name: 'Berserker Light Boots', category: 'boots', equipmentType: 'light_boots', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'Boots that accelerate combat rage.', stats: { attackSpeed: 0.15, critical: 8, movementSpeed: 15 }, effects: ['Each kill increases movement speed by 5% for 5 seconds, stacks up to 5 times'], icon: 'img/items/berserker_light_boots.jpg', level: 30 },

    // BOOTS - HEAVY
    { id: 'gravity_stompers', name: 'Gravity Stompers', category: 'boots', equipmentType: 'heavy_boots', rarity: 'Rare', rarityColor: '#00f3ff', description: 'Heavy boots that manipulate gravity for powerful kicks.', stats: { strength: 8, defense: 12, damage: 10 }, effects: ['Jump attacks deal 30% increased damage'], icon: 'img/items/gravity_stompers.jpg', level: 12 },
    // Add Epic/Legendary Heavy Boots if available

    // ACCESSORIES - RING
    { id: 'neural_implant', name: 'Neural Implant', category: 'accessory', equipmentType: 'ring', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'An implant that enhances cognitive functions.', stats: { intelligence: 10, magicDamage: 15 }, effects: ['Reduces skill cooldowns by 10%'], icon: 'img/items/neural_implant.jpg', level: 3 },
    { id: 'fortified_ring', name: 'Fortified Ring', category: 'accessory', equipmentType: 'ring', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A ring pulsing with protective energy.', stats: { hp: 100, defense: 10, magicDefense: 10 }, effects: ['Increases max HP by 10%'], icon: 'img/items/fortified_ring.jpg', level: 20 },
    { id: 'assault_ring', name: 'Assault Ring', category: 'accessory', equipmentType: 'ring', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A ring that sharpens the wearer’s combat edge.', stats: { damage: 15, critical: 5 }, effects: ['Increases critical chance by 5%'], icon: 'img/items/assault_ring.jpg', level: 20 },
    { id: 'invincible_ring', name: 'Invincible Ring', category: 'accessory', equipmentType: 'ring', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A ring that defies damage with ancient tech.', stats: { hp: 150, defense: 15, magicDefense: 15 }, effects: ['Grants a 10% chance to negate damage'], icon: 'img/items/invincible_ring.jpg', level: 30 },
    { id: 'berserker_ring', name: 'Berserker Ring', category: 'accessory', equipmentType: 'ring', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'A ring that thrives on bloodshed.', stats: { damage: 25, critical: 10 }, effects: ['Each kill increases damage by 5% for 10 seconds, stacks up to 5 times'], icon: 'img/items/berserker_ring.jpg', level: 30 },

    // ACCESSORIES - BRACELET
    { id: 'reflex_booster', name: 'Reflex Booster', category: 'accessory', equipmentType: 'bracelet', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A device that enhances reflexes and reaction time.', stats: { agility: 15, attackSpeed: 0.2, evasion: 5 }, effects: ['20% chance to dodge attacks'], icon: 'img/items/reflex_booster.jpg', level: 7 },
    // Add Epic/Legendary Bracelets if available

    // ACCESSORIES - AMULET
    { id: 'chrono_amulet', name: 'Chrono Amulet', category: 'accessory', equipmentType: 'amulet', rarity: 'Legendary', rarityColor: '#f7ff00', description: 'An amulet that manipulates the flow of time.', stats: { attackSpeed: 0.5, cooldownReduction: 25, evasion: 15 }, effects: ['5% chance to reset skill cooldowns after use'], icon: 'img/items/chrono_amulet.jpg', level: 20 },
    // Add Epic Amulets if available

    // ACCESSORIES - NECKLACE
    { id: 'neural_necklace', name: 'Neural Necklace', category: 'accessory', equipmentType: 'necklace', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A necklace embedded with neural interface chips.', stats: { intelligence: 18, magicDamage: 20, magicDefense: 15 }, effects: ['Spells have 15% chance to critically hit'], icon: 'img/items/neural_necklace.jpg', level: 15 },
    // Add Legendary Necklaces if available

    // ACCESSORIES - CHARM
    { id: 'luck_charm', name: 'Digital Fortune Charm', category: 'accessory', equipmentType: 'charm', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A charm that manipulates probability algorithms in your favor.', stats: { luck: 20, critical: 10, evasion: 8 }, effects: ['10% chance to find additional loot'], icon: 'img/items/luck_charm.jpg', level: 10 },
    // Add Epic/Legendary Charms if available

    // CONSUMABLES
    { id: 'health_stim', name: 'Health Stimulator', category: 'consumable', equipmentType: 'consumable', rarity: 'Common', rarityColor: '#aaaaaa', description: 'A stimulant that restores health.', stats: {}, effects: ['Restores 50 HP'], icon: 'img/items/health_stim.jpg', level: 1, stackable: true, maxStack: 10 },
    { id: 'energy_drink', name: 'Neon Energy Drink', category: 'consumable', equipmentType: 'consumable', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'A drink that temporarily boosts energy and reflexes.', stats: {}, effects: ['Increases attack speed by 50% for 30 seconds'], icon: 'img/items/energy_drink.jpg', level: 5, stackable: true, maxStack: 5 },
    { id: 'nano_repair', name: 'Nano Repair Kit', category: 'consumable', equipmentType: 'consumable', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A kit that deploys nanobots to repair damage over time.', stats: {}, effects: ['Restores 10 HP per second for 10 seconds'], icon: 'img/items/nano_repair.jpg', level: 10, stackable: true, maxStack: 3 },

    // MATERIALS
    { id: 'scrap_metal', name: 'Scrap Metal', category: 'material', equipmentType: 'material', rarity: 'Common', rarityColor: '#aaaaaa', description: 'Common metal scraps used for crafting.', stats: {}, effects: [], icon: 'img/items/scrap_metal.jpg', stackable: true, maxStack: 99 },
    { id: 'circuit_board', name: 'Circuit Board', category: 'material', equipmentType: 'material', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'Electronic components used for advanced crafting.', stats: {}, effects: [], icon: 'img/items/circuit_board.jpg', stackable: true, maxStack: 99 },
    { id: 'quantum_core', name: 'Quantum Core', category: 'material', equipmentType: 'material', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A rare material that can manipulate quantum states.', stats: {}, effects: [], icon: 'img/items/quantum_core.jpg', stackable: true, maxStack: 99 },
    { id: 'cyber_scrap', name: 'Cyber Scrap', category: 'material', equipmentType: 'material', rarity: 'Common', rarityColor: '#aaaaaa', description: 'Scrap components from dismantled cybernetic devices.', stats: {}, effects: [], icon: 'img/items/cyber_scrap.jpg', stackable: true, maxStack: 99 },
    { id: 'encrypted_data_shard', name: 'Encrypted Data Shard', category: 'material', equipmentType: 'material', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A mysterious shard containing encrypted corporate data. (Quest Item)', stats: {}, effects: [], icon: 'img/items/encrypted_data_shard.jpg', level: 0, stackable: true, maxStack: 99 },
    { id: 'quantum_alloy', name: 'Quantum Alloy', category: 'material', equipmentType: 'material', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A metal that shifts its properties based on quantum states, making it highly adaptable for various uses.', stats: {}, effects: [], icon: 'img/items/quantum_alloy.jpg', stackable: true, maxStack: 99 },
    { id: 'encrypted_data_chip', name: 'Encrypted Data Chip', category: 'material', equipmentType: 'material', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'A compact chip containing highly sensitive data, sought after by hackers and corporations alike.', stats: {}, effects: [], icon: 'img/items/encrypted_data_chip.jpg', stackable: true, maxStack: 99 },
    { id: 'synth_leather', name: 'Synth-Leather', category: 'material', equipmentType: 'material', rarity: 'Common', rarityColor: '#aaaaaa', description: 'A synthetic leather alternative, durable and stylish, commonly used in cyberpunk fashion.', stats: {}, effects: [], icon: 'img/items/synth_leather.jpg', stackable: true, maxStack: 99 },
    { id: 'plasma_cell', name: 'Plasma Cell', category: 'material', equipmentType: 'material', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A small but powerful energy source, used to power advanced technology and weapons.', stats: {}, effects: [], icon: 'img/items/plasma_cell.jpg', stackable: true, maxStack: 99 },
    { id: 'nano_concrete', name: 'Nano-Concrete', category: 'material', equipmentType: 'material', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'Concrete infused with nanobots, capable of self-repair and used in the construction of megastructures.', stats: {}, effects: [], icon: 'img/items/nano_concrete.jpg', stackable: true, maxStack: 99 },
    { id: 'carbon_fiber_weave', name: 'Carbon Fiber Weave', category: 'material', equipmentType: 'material', rarity: 'Common', rarityColor: '#aaaaaa', description: 'A lightweight yet strong material, perfect for reinforcing armor or building fast vehicles.', stats: {}, effects: [], icon: 'img/items/carbon_fiber_weave.jpg', stackable: true, maxStack: 99 },
    { id: 'dark_matter_shard', name: 'Dark Matter Shard', category: 'material', equipmentType: 'material', rarity: 'Epic', rarityColor: '#ff00ff', description: 'A fragment of exotic matter with mysterious properties, highly coveted by scientists and tech innovators.', stats: {}, effects: [], icon: 'img/items/dark_matter_shard.jpg', stackable: true, maxStack: 99 },
    { id: 'neural_interface_gel', name: 'Neural Interface Gel', category: 'material', equipmentType: 'material', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A conductive gel used to connect cybernetic implants to the human nervous system.', stats: {}, effects: [], icon: 'img/items/neural_interface_gel.jpg', stackable: true, maxStack: 99 },
    { id: 'chang_chip', name: 'Chang Chip', category: 'material', equipmentType: 'material', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'A physical chip containing digital currency, used in the underground markets of the cyberpunk world.', stats: {}, effects: [], icon: 'img/items/chang_chip.jpg', stackable: true, maxStack: 100000000 },
    { id: 'smart_polymer', name: 'Smart Polymer', category: 'material', equipmentType: 'material', rarity: 'Rare', rarityColor: '#00f3ff', description: 'A programmable material that can change its shape and properties, offering endless possibilities.', stats: {}, effects: [], icon: 'img/items/smart_polymer.jpg', stackable: true, maxStack: 99 },
    { id: 'neon_circuit', name: 'Neon Circuit', category: 'material', equipmentType: 'material', rarity: 'Uncommon', rarityColor: '#00ff66', description: 'A discarded circuit board with neon traces, rumored to power advanced tech.', stats: {}, effects: [], icon: 'img/items/neon_circuit.jpg', stackable: true, maxStack: 50 },
];

// --- Monster Data ---
// [ ... Full monsterTypes object as previously provided ... ]
const monsterTypes = {
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
            { itemId: 'laser_rifle', chance: 0.05, quantity: [1, 1] }, // Duplicate laser_rifle? Keeping highest chance.
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
            { itemId: 'neon_circuit', chance: 0.3, quantity: [1, 1] },
            { itemId: "cyber_scrap", chance: 0.3, quantity: [1, 1] },      // Common
            { itemId: "circuit_board", chance: 0.8, quantity: [1, 1] }
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
             { itemId: 'circuit_board', chance: 0.3, quantity: [1, 1] },
             { itemId: 'laser_rifle', chance: 0.5, quantity: [1, 1] },
             { itemId: 'pulse_bow', chance: 0.5, quantity: [1, 1] },
             { itemId: 'synth_leather', chance: 0.3, quantity: [1, 1] },
             { itemId: 'cyber_blade', chance: 0.5, quantity: [1, 1] },
             { itemId: 'shock_knuckles', chance: 0.01, quantity: [1, 1] },
             { itemId: 'code_wand', chance: 0.01, quantity: [1, 1] },
             { itemId: 'plasma_carbine', chance: 0.01, quantity: [1, 1] },
             { itemId: 'nano_jacket', chance: 0.01, quantity: [1, 1] },
             { itemId: 'cyber_gloves', chance: 0.01, quantity: [1, 1] },
             { itemId: 'speed_runners', chance: 0.01, quantity: [1, 1] },
             { itemId: 'neural_implant', chance: 0.01, quantity: [1, 1] },
             { itemId: 'laser_rifle', chance: 0.05, quantity: [1, 1] }, // Duplicate laser_rifle
             { itemId: 'synth_vest', chance: 0.05, quantity: [1, 1] },
             { itemId: 'quantum_dagger', chance: 0.005, quantity: [1, 1] },
             { itemId: 'pulse_bow', chance: 0.005, quantity: [1, 1] }, // Duplicate pulse_bow
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
             { itemId: 'chang_chip', chance: 0.3, quantity: [1, 1] },
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
             { itemId: 'circuit_board', chance: 0.3, quantity: [1, 1] },
             { itemId: 'laser_rifle', chance: 0.5, quantity: [1, 1] },
             { itemId: 'pulse_bow', chance: 0.5, quantity: [1, 1] },
             { itemId: 'synth_leather', chance: 0.3, quantity: [1, 1] },
             { itemId: 'cyber_blade', chance: 0.01, quantity: [1, 1] },
             { itemId: 'shock_knuckles', chance: 0.01, quantity: [1, 1] },
             { itemId: 'code_wand', chance: 0.01, quantity: [1, 1] },
             { itemId: 'plasma_carbine', chance: 0.01, quantity: [1, 1] },
             { itemId: 'nano_jacket', chance: 0.01, quantity: [1, 1] },
             { itemId: 'cyber_gloves', chance: 0.01, quantity: [1, 1] },
             { itemId: 'speed_runners', chance: 0.01, quantity: [1, 1] },
             { itemId: 'neural_implant', chance: 0.01, quantity: [1, 1] },
             { itemId: 'synth_vest', chance: 0.05, quantity: [1, 1] },
             { itemId: 'quantum_dagger', chance: 0.005, quantity: [1, 1] },
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
             { itemId: 'chang_chip', chance: 0.3, quantity: [1, 1] },
             { itemId: 'quantum_core', chance: 0.01, quantity: [1, 1] }
        ]
    },
    goblin: { // Assuming this was meant to be distinct from glitch
        type: 'basic',
        maxHealth: 200,
        attack: 10,
        defense: 1,
        speed: 0.8,
        experienceValue: 70,
        behavior: 'aggressive',
        sprite: 'img/monster/goblin.png', // Changed sprite name for clarity
        hitSprite: 'img/monster/goblinhit.png',
        attackHitSprite: 'img/monster/goblinhit2.png',
        width: 128,
        height: 128,
        frameCount: 8,
        frameDuration: 150,
        dropRate: 0.85,
        dropTable: [
             { itemId: 'circuit_board', chance: 0.3, quantity: [1, 1] },
             { itemId: 'laser_rifle', chance: 0.5, quantity: [1, 1] },
             { itemId: 'pulse_bow', chance: 0.5, quantity: [1, 1] },
             { itemId: 'synth_leather', chance: 0.3, quantity: [1, 1] },
             { itemId: 'cyber_blade', chance: 0.01, quantity: [1, 1] },
             { itemId: 'shock_knuckles', chance: 0.01, quantity: [1, 1] },
             { itemId: 'code_wand', chance: 0.01, quantity: [1, 1] },
             { itemId: 'plasma_carbine', chance: 0.01, quantity: [1, 1] },
             { itemId: 'nano_jacket', chance: 0.01, quantity: [1, 1] },
             { itemId: 'cyber_gloves', chance: 0.01, quantity: [1, 1] },
             { itemId: 'speed_runners', chance: 0.01, quantity: [1, 1] },
             { itemId: 'neural_implant', chance: 0.01, quantity: [1, 1] },
             { itemId: 'synth_vest', chance: 0.05, quantity: [1, 1] },
             { itemId: 'quantum_dagger', chance: 0.005, quantity: [1, 1] },
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
             { itemId: 'chang_chip', chance: 0.3, quantity: [1, 1] },
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
             { itemId: 'neon_circuit', chance: 0.8, quantity: [1, 1] },
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
             { itemId: 'carbon_fiber_weave', chance: 0.3, quantity: [1, 1] },
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
        sprite: 'img/monster/skeleton.png', // Assumed sprite name
        hitSprite: 'img/monster/skeletonhit.png',
        attackHitSprite: 'img/monster/skeletonhit2.png',
        width: 128,
        height: 128,
        frameCount: 8, // Assuming based on goblin/glitch
        frameDuration: 220,
        dropRate: 0.9,
        dropTable: [
             { itemId: 'scrap_metal', chance: 0.5, quantity: [3, 5] },
             { itemId: 'circuit_board', chance: 0.4, quantity: [1, 3] },
             { itemId: 'nano_concrete', chance: 0.8, quantity: [1, 1] },
             { itemId: 'scrap_metal', chance: 0.3, quantity: [1, 1] }, // Duplicate scrap_metal
             { itemId: 'synth_leather', chance: 0.3, quantity: [1, 1] }
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
             { itemId: 'chang_chip', chance: 0.3, quantity: [1, 1] },
             { itemId: 'cyber_scrap', chance: 0.3, quantity: [1, 1] }
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
             { itemId: 'synth_leather', chance: 0.3, quantity: [1, 1] },
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
             { itemId: 'carbon_fiber_weave', chance: 0.3, quantity: [1, 1] }
        ]
    },
    orc: {
        type: 'elite',
        maxHealth: 100, // Note: Very low health for an elite
        attack: 12,
        defense: 5,
        speed: 0.8,
        experienceValue: 150,
        behavior: 'aggressive',
        sprite: 'img/enemy.png', // Generic sprite name
        hitSprite: 'img/enemyhit.png',
        attackHitSprite: 'img/enemyattackhit.png',
        width: 80,
        height: 80,
        frameCount: 4,
        frameDuration: 250,
        dropRate: 0.95,
        dropTable: [
             { itemId: 'scrap_metal', chance: 0.7, quantity: [5, 8] },
             { itemId: 'circuit_board', chance: 0.5, quantity: [2, 4] },
             { itemId: 'energy_drink', chance: 0.3, quantity: [1, 2] },
             { itemId: 'quantum_alloy', chance: 0.5, quantity: [1, 1] },
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
        dropRate: 0.95, // Drop rate itself is high, but individual item chances vary
        dropTable: [
             { itemId: 'scrap_metal', chance: 0.7, quantity: [5, 8] },
             { itemId: 'circuit_board', chance: 0.5, quantity: [2, 4] },
             { itemId: 'energy_drink', chance: 0.3, quantity: [1, 2] },
             { itemId: 'dark_matter_shard', chance: 0.3, quantity: [1, 1] },
             { itemId: 'quantum_core', chance: 0.3, quantity: [1, 1] },
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
             { itemId: 'smart_polymer', chance: 2, quantity: [1, 1] }, // Chance > 1? Assuming 100%
             { itemId: 'encrypted_data_shard', chance: 2, quantity: [1, 1] }, // Chance > 1? Assuming 100%
             { itemId: 'circuit_board', chance: 0.3, quantity: [1, 1] } // Duplicate
        ]
    },
    dragon: { // Note: Very low health for a boss
        type: 'boss',
        maxHealth: 1,
        attack: 20,
        defense: 10,
        speed: 0.8,
        experienceValue: 100,
        behavior: 'aggressive',
        sprite: 'img/enemy.png', // Generic sprite name
        hitSprite: 'img/enemyhit.png',
        attackHitSprite: 'img/enemyattackhit.png',
        width: 120,
        height: 120,
        frameCount: 4,
        frameDuration: 300,
        dropRate: 1.0,
        dropTable: [
             { itemId: 'scrap_metal', chance: 0.3, quantity: [10, 15] },
             { itemId: 'circuit_board', chance: 0.8, quantity: [5, 8] },
             { itemId: 'quantum_core', chance: 0.5, quantity: [1, 2] },
             { itemId: 'nano_repair', chance: 0.6, quantity: [1, 3] }
        ]
    }
};

// --- Drop Source Pre-processing ---
const itemDropSources = {}; // This will store: { itemId: [{ monsterName, chance }, ...], ... }

function formatMonsterName(key) {
    // Simple formatter: Capitalize first letter
    return key.charAt(0).toUpperCase() + key.slice(1);
}

function buildDropSources() {
    // console.log("Building drop sources..."); // Debug log
    for (const monsterKey in monsterTypes) {
        const monster = monsterTypes[monsterKey];
        const monsterName = formatMonsterName(monsterKey);

        if (monster.dropTable && Array.isArray(monster.dropTable)) {
            const uniqueDrops = new Map(); // Use a map to handle duplicates within a single monster's table

            monster.dropTable.forEach(drop => {
                 // If item already listed for this monster, keep the highest chance
                 if (!uniqueDrops.has(drop.itemId) || drop.chance > uniqueDrops.get(drop.itemId)) {
                     uniqueDrops.set(drop.itemId, drop.chance);
                 }
            });

            uniqueDrops.forEach((chance, itemId) => {
                if (!itemDropSources[itemId]) {
                    itemDropSources[itemId] = [];
                }
                // Add monster and highest chance found
                itemDropSources[itemId].push({
                    monsterName: monsterName,
                    monsterKey: monsterKey,
                    chance: chance
                });
            });
        }
    }

    // Optional: Sort the sources for each item by chance (descending)
    for (const itemId in itemDropSources) {
        itemDropSources[itemId].sort((a, b) => b.chance - a.chance);
    }
    // console.log("Drop sources built:", itemDropSources); // Debug log
}


// --- Item Rendering ---
function formatStatName(name) {
    // Converts camelCase or underscore_case to Title Case
    const formatted = name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Renders a SINGLE item object into an HTML element
function renderItem(item) {
    const itemEntry = document.createElement('div');
    itemEntry.classList.add('item-entry', `rarity-${item.rarity.toLowerCase()}`); // Add rarity class

    // Icon
    const icon = document.createElement('img');
    icon.src = item.icon || 'img/items/default.png'; // Default icon if none specified
    icon.alt = item.name;
    icon.classList.add('item-icon');
    itemEntry.appendChild(icon);

    // Details Container
    const details = document.createElement('div');
    details.classList.add('item-details');

    // Name
    const name = document.createElement('h3');
    name.classList.add('item-name');
    name.textContent = item.name;
    name.style.color = item.rarityColor; // Apply rarity color to name
    details.appendChild(name);

    // Meta Info (Category, Type, Rarity, Level)
    const meta = document.createElement('div');
    meta.classList.add('item-meta');
    let metaText = `${formatStatName(item.category)} / ${formatStatName(item.equipmentType)} - <span style="color:${item.rarityColor}; font-weight: bold;">${item.rarity}</span>`;
    if (item.level !== undefined && item.level !== null && item.level > 0) { // Only show level if relevant
         metaText += ` (Lvl ${item.level})`;
    }
     if (item.stackable) {
         metaText += ` (Stack: ${item.maxStack})`;
     }
    meta.innerHTML = metaText;
    details.appendChild(meta);

    // Stats
    if (item.stats && Object.keys(item.stats).length > 0) {
        const statsList = document.createElement('ul');
        statsList.classList.add('item-stats');
        for (const stat in item.stats) {
            const statItem = document.createElement('li');
            statItem.textContent = `${formatStatName(stat)}: ${item.stats[stat]}`;
            statsList.appendChild(statItem);
        }
        details.appendChild(statsList);
    }

    // Description
    const description = document.createElement('p');
    description.classList.add('item-description');
    description.textContent = item.description;
    details.appendChild(description);

    // Effects
    if (item.effects && item.effects.length > 0) {
        const effectsList = document.createElement('ul');
        effectsList.classList.add('item-effects');
         const effectsTitle = document.createElement('strong');
         effectsTitle.textContent = 'Effects:';
         effectsList.appendChild(effectsTitle);
        item.effects.forEach(effect => {
            const effectItem = document.createElement('li');
            effectItem.textContent = effect;
            effectsList.appendChild(effectItem);
        });
        details.appendChild(effectsList);
    }

    // Drop Sources
    if (itemDropSources[item.id] && itemDropSources[item.id].length > 0) {
        const dropsContainer = document.createElement('div');
        dropsContainer.classList.add('item-drops'); // Add a class for potential styling

        const dropsTitle = document.createElement('strong');
        dropsTitle.textContent = 'Dropped By:';
        dropsContainer.appendChild(dropsTitle);

        const dropsList = document.createElement('ul');
        itemDropSources[item.id].forEach(source => {
            const dropItem = document.createElement('li');
            let percentageChance = (source.chance * 100);
            if (percentageChance > 100) percentageChance = 100; // Cap at 100%

            let displayChance;
            if (percentageChance % 1 === 0) {
                displayChance = percentageChance.toFixed(0); // Whole number
            } else if ((percentageChance * 10) % 1 === 0) {
                 displayChance = percentageChance.toFixed(1); // One decimal place
            } else {
                displayChance = percentageChance.toFixed(2); // Two decimal places
            }

            dropItem.textContent = `${source.monsterName} (${displayChance}%)`;
            dropsList.appendChild(dropItem);
        });
        dropsContainer.appendChild(dropsList);
        details.appendChild(dropsContainer); // Append to the main details container
    }

    itemEntry.appendChild(details);
    return itemEntry;
}

// --- Renders the *entire list* of items based on the current itemData array ---
function renderItems(itemsToRender) {
    if (!itemDatabaseContainer) {
        console.error("Item database container not found!");
        return;
    }
    // Clear placeholder / existing items
    itemDatabaseContainer.innerHTML = '';

    if (!itemsToRender || itemsToRender.length === 0) {
         itemDatabaseContainer.innerHTML = '<p>No items to display.</p>';
         return;
    }

    // Render each item
    itemsToRender.forEach(item => {
        const itemElement = renderItem(item); // Use the single-item render function
        itemDatabaseContainer.appendChild(itemElement);
    });
     console.log(`Rendered ${itemsToRender.length} items.`); // Optional: confirmation log
}

// --- Filtering and Rendering ---
function filterAndRenderItems() {
    // Apply the current sort order first (sortData modifies itemData in place)
    let filteredItems = [...itemData]; // Start with a copy of the currently sorted data

    if (currentSearchTerm) {
        filteredItems = filteredItems.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(currentSearchTerm);
            const categoryMatch = item.category.toLowerCase().includes(currentSearchTerm);
            const typeMatch = item.equipmentType.toLowerCase().includes(currentSearchTerm);
            const descriptionMatch = item.description.toLowerCase().includes(currentSearchTerm);
            // Add more fields to search if needed (e.g., effects, stats)
            return nameMatch || categoryMatch || typeMatch || descriptionMatch;
        });
    }

    renderItems(filteredItems); // Render only the filtered items
}

// --- Sorting Logic ---
function sortData(sortBy) {
    console.log(`Sorting by: ${sortBy}`); // Log which sort is triggered

    // Define rarity order for sorting (can be outside if preferred)
    const rarityOrder = { 'Common': 1, 'Uncommon': 2, 'Rare': 3, 'Epic': 4, 'Legendary': 5 };

    switch (sortBy) {
        case 'categoryTypeRarity':
            itemData.sort((a, b) => {
                // 1. Sort by Category (A-Z)
                const categoryCompare = a.category.localeCompare(b.category);
                if (categoryCompare !== 0) return categoryCompare;

                // 2. Sort by Equipment Type (A-Z)
                const typeCompare = a.equipmentType.localeCompare(b.equipmentType);
                if (typeCompare !== 0) return typeCompare;

                // 3. Sort by Rarity (Logical)
                const rarityA = rarityOrder[a.rarity] || 99; // Unknown rarity last
                const rarityB = rarityOrder[b.rarity] || 99;
                const rarityDiff = rarityA - rarityB;
                if (rarityDiff !== 0) return rarityDiff;

                // 4. Sort by Name (A-Z) as tie-breaker
                return a.name.localeCompare(b.name);
            });
            break;

        case 'nameAsc':
            itemData.sort((a, b) => a.name.localeCompare(b.name));
            break;

        case 'nameDesc':
            itemData.sort((a, b) => b.name.localeCompare(a.name));
            break;
 
        case 'category':
            itemData.sort((a, b) => {
                const categoryCompare = a.category.localeCompare(b.category);
                if (categoryCompare !== 0) return categoryCompare;
                // Tie-breaker: Default sort (category -> type -> rarity -> name)
                const typeCompare = a.equipmentType.localeCompare(b.equipmentType);
                if (typeCompare !== 0) return typeCompare;
                const rarityA = rarityOrder[a.rarity] || 99;
                const rarityB = rarityOrder[b.rarity] || 99;
                const rarityDiff = rarityA - rarityB;
                if (rarityDiff !== 0) return rarityDiff;
                return a.name.localeCompare(b.name);
            });
            break;
 
        case 'equipmentType':
            itemData.sort((a, b) => {
                const typeCompare = a.equipmentType.localeCompare(b.equipmentType);
                if (typeCompare !== 0) return typeCompare;
                // Tie-breaker: Default sort (category -> type -> rarity -> name)
                const categoryCompare = a.category.localeCompare(b.category);
                if (categoryCompare !== 0) return categoryCompare;
                const rarityA = rarityOrder[a.rarity] || 99;
                const rarityB = rarityOrder[b.rarity] || 99;
                const rarityDiff = rarityA - rarityB;
                if (rarityDiff !== 0) return rarityDiff;
                return a.name.localeCompare(b.name);
            });
            break;
 
        case 'rarity':
            itemData.sort((a, b) => {
                const rarityA = rarityOrder[a.rarity] || 99;
                const rarityB = rarityOrder[b.rarity] || 99;
                const rarityDiff = rarityA - rarityB;
                if (rarityDiff !== 0) return rarityDiff;
                // Tie-breaker: Default sort (category -> type -> rarity -> name)
                const categoryCompare = a.category.localeCompare(b.category);
                if (categoryCompare !== 0) return categoryCompare;
                const typeCompare = a.equipmentType.localeCompare(b.equipmentType);
                if (typeCompare !== 0) return typeCompare;
                return a.name.localeCompare(b.name);
            });
            break;
 
        default:
            console.log("Unknown sort criteria:", sortBy);
            return; // Don't re-render if criteria is unknown
    }

    // Filter and re-render the items with the new order and current search term
    filterAndRenderItems();
}