// uiManager.js with Shop Modal Logic & Housing Modal Logic

// --- UI Element References (Keep non-modal elements here) ---
const cashAmountElement = document.getElementById('cash-amount');
const userOrganizationElement = document.getElementById('user-organization');
const leaveOrganizationButton = document.getElementById('leave-organization-button');
const protectionBookElement = document.getElementById('protection-book');
const controlledBusinessesListElement = document.getElementById('controlled-businesses-list');
const usernameInput = document.getElementById('username-input');
const aliasInput = document.getElementById('alias-input');
const saveUserInfoBtn = document.getElementById('save-user-info-btn');
const customAlertDiv = document.getElementById('custom-alert');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertCloseBtn = document.getElementById('custom-alert-close');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const centerMapBtn = document.getElementById('center-map-btn');
const playerAliasBar = document.getElementById('player-alias-bar'); // New bottom bar element
const playerLevelBar = document.getElementById('player-level-bar'); // New bottom bar element
// Shop Modal Elements - Moved inside DOMContentLoaded


// --- Icon Definitions ---
// Define a base icon using custom image
const baseIcon = L.icon({
    iconUrl: 'img/org.png', // Path to the custom organization image
    iconSize: [40, 40], // Adjust size as needed
    iconAnchor: [20, 40], // Point at the bottom center (adjust if needed)
    popupAnchor: [0, -40] // Popup above the anchor
    // className: 'map-icon-darktheme' // Optional: Keep if filter is desired
});

// Define custom business icon using local image
const customBusinessIcon = L.icon({
    iconUrl: 'img/business.png', // Path to the custom image
    iconSize: [35, 35], // Adjust size as needed
    iconAnchor: [17, 35], // Point bottom center
    popupAnchor: [0, -35] // Popup above the anchor
    // className: 'map-icon-darktheme' // Optional: Keep if filter is desired
});

// Define custom shop icon
const shopIcon = L.icon({
    iconUrl: 'img/shop.png', // Path to the shop image
    iconSize: [35, 35], // Adjust size as needed
    iconAnchor: [17, 35], // Point bottom center
    popupAnchor: [0, -35] // Popup above the anchor
});

// Define a cash drop icon (e.g., money bag)
const cashIcon = L.icon({
    iconUrl: 'img/marker.png', // Use marker.png for cash drops
    iconSize: [40, 40], // Adjusted size
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: 'map-icon-darktheme' // Class for CSS filter
});

// Define abandoned building icon
const abandonedBuildingIcon = L.icon({
    iconUrl: 'img/build.png', // Path to the building image
    iconSize: [35, 35], // Adjust size as needed
    iconAnchor: [17, 35], // Point bottom center
    popupAnchor: [0, -35] // Popup above the anchor
});

// Define ads icon
const adsIcon = L.icon({
    iconUrl: 'img/ads.png', // Path to the ads image
    iconSize: [35, 35], // Adjust size as needed
    iconAnchor: [17, 35], // Point bottom center
    popupAnchor: [0, -35] // Popup above the anchor
});

// Define a rival icon (e.g., silhouette or fedora)
const rivalIcon = L.icon({
    iconUrl: 'https://img.icons8.com/ios-filled/50/000000/user-secret.png', // Example secret user icon
    iconSize: [35, 35],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
    className: 'map-icon-darktheme' // Class for CSS filter
});


// --- UI Update Functions ---

// Function to update the UI based on organization status
function updateOrganizationUI() {
    if (!userOrganizationElement || !leaveOrganizationButton || !protectionBookElement || !controlledBusinessesListElement) {
        console.error("One or more dashboard/protection UI elements not found!");
        return;
    }
    if (currentUserOrganization) { // Variable from gameWorld.js
        userOrganizationElement.textContent = `${currentUserOrganization.name} (${currentUserOrganization.abbreviation})`;
        leaveOrganizationButton.style.display = 'block';
        updateProtectionBookUI(); // Update and potentially show the book
    } else {
        userOrganizationElement.textContent = 'None';
        leaveOrganizationButton.style.display = 'none';
        protectionBookElement.style.display = 'none'; // Hide protection book
        controlledBusinessesListElement.innerHTML = ''; // Clear book content
    }
}

// Function to update the HP display (bar and text)
function updateHpUI() {
    const hpBarElement = document.getElementById('player-hp-bar');
    const currentHpElement = document.getElementById('player-current-hp');
    const maxHpElement = document.getElementById('player-max-hp');

    if (!hpBarElement || !currentHpElement || !maxHpElement) {
        console.error("HP UI elements not found!");
        return;
    }

    // Ensure maxHp is not zero to avoid division by zero
    const maxHp = playerMaxHp > 0 ? playerMaxHp : 1; // Use global var from gameWorld.js
    const currentHp = playerCurrentHp; // Use global var from gameWorld.js

    const hpPercentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

    hpBarElement.style.width = `${hpPercentage}%`;
    currentHpElement.textContent = Math.round(currentHp); // Display rounded HP
    maxHpElement.textContent = Math.round(maxHp); // Display rounded Max HP

    // Optional: Change bar color based on HP percentage
    if (hpPercentage < 25) {
        hpBarElement.style.background = 'linear-gradient(to right, #c62828, #ef5350)'; // Red gradient
    } else if (hpPercentage < 50) {
        hpBarElement.style.background = 'linear-gradient(to right, #ff9800, #ffb74d)'; // Orange gradient
    } else {
        hpBarElement.style.background = 'linear-gradient(to right, #4caf50, #81c784)'; // Green gradient (default)
    }
}

// Function to update the Experience display (in Stats Modal)
function updateExperienceUI() {
    const levelSpan = document.getElementById('stats-level');
    const experienceSpan = document.getElementById('stats-experience');
    const expNeededSpan = document.getElementById('stats-exp-needed');

    if (levelSpan) levelSpan.textContent = playerLevel;
    if (experienceSpan) experienceSpan.textContent = playerExperience;
    if (expNeededSpan) expNeededSpan.textContent = calculateExpNeeded(playerLevel);

    // Update bottom bar level display
    if (playerLevelBar) playerLevelBar.textContent = `Level: ${playerLevel}`;
}


// Function to update the cash display
function updateCashUI(amount) {
    if (cashAmountElement) {
        cashAmountElement.textContent = amount;
    } else {
        console.error("Cash amount element not found!");
    }
}

// --- State for Inventory Tab & Pagination ---
let currentInventoryCategory = 'all'; // Default to showing all items
let currentInventoryPage = 1; // Default to page 1
const itemsPerPage = 24; // Number of slots per page

// Function to update the inventory UI (targets grid inside the modal)
function updateInventoryUI(category = currentInventoryCategory, page = currentInventoryPage) {
    // --- Added Debug Logging ---
    console.log(`--- updateInventoryUI Start ---`);
    console.log(`Category requested: ${category}`);
    console.log(`Current playerInventory state:`, JSON.stringify(playerInventory));
    console.log(`itemsDatabase size: ${typeof itemsDatabase !== 'undefined' ? itemsDatabase.size : 'undefined'}`);
    console.log(`equipmentDatabase size: ${typeof equipmentDatabase !== 'undefined' ? equipmentDatabase.size : 'undefined'}`);
    console.log(`--- End Debug Logging ---`);
    // --- End Added Debug Logging ---

    currentInventoryCategory = category; // Update the current category state
    currentInventoryPage = page; // Update the current page state

    const gridElement = document.getElementById('inventory-grid');
    const paginationElement = document.getElementById('inventory-pagination');
    const pageInfoElement = document.getElementById('inventory-page-info');
    const prevBtn = document.getElementById('inventory-prev-btn');
    const nextBtn = document.getElementById('inventory-next-btn');

    if (!gridElement || !paginationElement || !pageInfoElement || !prevBtn || !nextBtn) {
        console.error("Inventory grid or pagination elements not found!");
        return;
    }

    gridElement.innerHTML = ''; // Clear current grid content
    let filledSlotsCount = 0;

    // Ensure databases are available
    if (typeof itemsDatabase === 'undefined' || typeof equipmentDatabase === 'undefined') {
        console.error("itemsDatabase or equipmentDatabase not found!");
        gridElement.innerHTML = '<div class="inventory-slot empty">Error loading item data!</div>'; // Show error in a slot
        return;
    }
     // Ensure Rarity is available (defined in equipment.js)
    if (typeof Rarity === 'undefined') {
        console.error("Rarity object not found! Make sure equipment.js is loaded before uiManager.js");
        // Continue without rarity styling if needed
    }

    // Group items by ID for display (e.g., Medkit x2)
    const groupedInventory = playerInventory.reduce((acc, itemEntry) => {
        acc[itemEntry.id] = (acc[itemEntry.id] || 0) + (itemEntry.quantity || 1);
        return acc;
    }, {});

    // --- Filter items based on category FIRST ---
    const filteredItemEntries = [];
    for (const itemId in groupedInventory) {
        const itemDefinition = itemsDatabase.get(itemId) || equipmentDatabase.get(itemId); // Use the Maps
        let shouldDisplay = false;
        const suitTypes = [EquipmentType.HEAD, EquipmentType.MASK, EquipmentType.BODY, EquipmentType.GLOVES, EquipmentType.PANTS, EquipmentType.BOOTS, EquipmentType.ACCESSORY, EquipmentType.CHARM]; // Define suit types

        if (category === 'all') {
            shouldDisplay = true;
        } else if (itemDefinition) {
            const itemEquipmentType = itemDefinition.equipmentType; // e.g., EquipmentType.WEAPON
            const itemPrimaryCategory = itemDefinition.category ? itemDefinition.category.toLowerCase() : null; // e.g., 'housing-plots'

            switch (category) {
                case 'weapon':
                    // Display if the item's equipmentType is Weapon
                    shouldDisplay = itemEquipmentType === EquipmentType.WEAPON;
                    break;
                case 'suit':
                    // Display if the item's equipmentType is one of the suit types
                    shouldDisplay = suitTypes.includes(itemEquipmentType);
                    break;
                case 'housing-plots': // Example for existing combined tab
                    shouldDisplay = itemPrimaryCategory === 'housing' || itemPrimaryCategory === 'plots' || itemPrimaryCategory === 'housing-plots';
                    break;
                // Add cases for other specific categories like 'pets', 'painting' if needed
                case 'pets':
                    shouldDisplay = itemPrimaryCategory === 'pets';
                     break;
                case 'painting':
                    shouldDisplay = itemPrimaryCategory === 'painting';
                     break;
                // Default case for any other category defined in items.js/equipment.js
                default:
                    // Fallback to checking the item's primary category if defined
                    if (itemPrimaryCategory) {
                        shouldDisplay = itemPrimaryCategory === category;
                    }
                    // Optional: Add fallback for older itemType if needed, but equipmentType/category is preferred
                    // else if (itemDefinition.itemType?.toLowerCase() === category) {
                    //     shouldDisplay = true;
                    // }
                    break;
            }
        }

        // Apply the filter
        if (shouldDisplay) {
            filteredItemEntries.push({ id: itemId, quantity: groupedInventory[itemId], definition: itemDefinition });
        }
        // --- End Filtering Logic ---
    }

    // --- Pagination Calculation ---
    const totalFilteredItems = filteredItemEntries.length;
    let totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
    totalPages = Math.max(1, Math.min(totalPages, 5)); // Ensure at least 1 page, max 5 pages

    // Adjust current page if it's out of bounds (e.g., after filtering reduces pages)
    currentInventoryPage = Math.max(1, Math.min(currentInventoryPage, totalPages));
    page = currentInventoryPage; // Update local page variable

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsForCurrentPage = filteredItemEntries.slice(startIndex, endIndex);

    // --- Populate Grid with items for the CURRENT page ---
    itemsForCurrentPage.forEach(itemEntry => {
        const { id: itemId, quantity, definition: itemDefinition } = itemEntry;

        if (itemDefinition) {
            const slotDiv = document.createElement('div');
            slotDiv.classList.add('inventory-slot');
            slotDiv.dataset.itemId = itemId; // Store item ID for potential click actions
            // slotDiv.title = generateItemTooltip(itemDefinition); // REMOVED - Replaced by custom tooltip
            // Add quantity to the tooltip if more than 1
            // if (quantity > 1) {
            //     slotDiv.title += `\nQuantity: ${quantity}`; // REMOVED
            // }


            // Add item image if available in definition (Corrected: check .image)
            if (itemDefinition.image) { // <-- Check for .image instead of .icon
                const img = document.createElement('img');
                img.src = itemDefinition.image; // <-- Use .image instead of .icon
                img.alt = itemDefinition.name;
                slotDiv.appendChild(img);
            } else {
                // Fallback text if no icon
                slotDiv.textContent = itemDefinition.name.substring(0, 3); // Show first 3 letters?
                slotDiv.style.fontSize = '0.7em'; // Make text small
                slotDiv.style.textAlign = 'center';
                slotDiv.style.lineHeight = '1';
            }

            // Add quantity indicator if more than 1
            if (quantity > 1) {
                const countSpan = document.createElement('span');
                countSpan.classList.add('item-count');
                countSpan.textContent = quantity;
                slotDiv.appendChild(countSpan);
            }

             // Apply rarity styling (border color and glow effect class)
             slotDiv.classList.remove('rarity-glow-common', 'rarity-glow-uncommon', 'rarity-glow-rare', 'rarity-glow-epic', 'rarity-glow-legendary', 'rarity-glow-mythic', 'rarity-glow-god-tier'); // Clear existing glows
             if (itemDefinition.rarity && typeof Rarity !== 'undefined') {
                 // Handle rarity being an object (from equipment.js) or string (potentially from items.js)
                 const rarityKey = (typeof itemDefinition.rarity === 'object' ? itemDefinition.rarity.name : itemDefinition.rarity).toUpperCase().replace('-', '_');
                 const rarityInfo = Rarity[rarityKey];
                 if (rarityInfo) {
                     slotDiv.style.borderColor = rarityInfo.color || '#5a4a3a'; // Fallback border
                     const glowClass = `rarity-glow-${rarityInfo.name.toLowerCase().replace(' ', '-')}`;
                     slotDiv.classList.add(glowClass);
                     // slotDiv.title += ` (${rarityInfo.name})`; // Rarity is already added by generateItemTooltip
                 } else {
                     slotDiv.style.borderColor = '#5a4a3a'; // Default border if rarity unknown
                 }
             } else {
                 slotDiv.style.borderColor = '#5a4a3a'; // Default border if no rarity defined
             }

            gridElement.appendChild(slotDiv);
            filledSlotsCount++;
        } else {
            // This case should be less likely now as we filter first, but keep the warning
            console.warn(`Definition not found for item ID: ${itemId} during grid population.`);
        }
    });

    // Fill remaining slots on the CURRENT page with empty placeholders
    const totalSlotsOnPage = itemsPerPage; // Use itemsPerPage for consistency
    for (let i = filledSlotsCount; i < totalSlotsOnPage; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.classList.add('inventory-slot', 'empty');
        gridElement.appendChild(emptySlot);
    }

    // --- Update Pagination UI ---
    if (totalPages > 1) {
        paginationElement.style.display = 'flex'; // Show pagination controls
        pageInfoElement.textContent = `Page ${currentInventoryPage} / ${totalPages}`;
        prevBtn.disabled = currentInventoryPage === 1;
        nextBtn.disabled = currentInventoryPage === totalPages;
    } else {
        paginationElement.style.display = 'none'; // Hide pagination if only one page
    }

    console.log(`updateInventoryUI finished. Category: ${category}, Page: ${page}, TotalPages: ${totalPages}. Filled ${filledSlotsCount} slots on page.`);
}

// Function to update the Protection Book UI - Now shows businesses *protected by the player*
function updateProtectionBookUI() {
    if (!protectionBookElement || !controlledBusinessesListElement) {
        console.error("Protection book elements not found!");
        return;
    }

    // The book is now relevant even without an organization, as it shows player's protections
    // if (!currentUserOrganization) {
    //     protectionBookElement.style.display = 'none';
    //     controlledBusinessesListElement.innerHTML = '';
    //     return;
    // }

    controlledBusinessesListElement.innerHTML = ''; // Clear existing list
    let playerProtectedCount = 0;

    // Iterate through *all* cached businesses to find ones protected by the player
    for (const id in businessesCache) { // businessesCache from gameWorld.js
        const businessInfo = businessesCache[id];
        // Check if the business exists and the current player is in its protectingUsers array
        const isPlayerProtecting = businessInfo.protectingUsers && businessInfo.protectingUsers.some(user => user.userId === currentPlayerId); // currentPlayerId from gameWorld.js

        if (isPlayerProtecting) {
            playerProtectedCount++;
            const listItem = document.createElement('li');
            listItem.classList.add('controlled-business-item'); // Keep class for styling consistency

            // Find the player's contribution to this business's power
            const playerProtectorInfo = businessInfo.protectingUsers.find(user => user.userId === currentPlayerId);
            const playerContribution = playerProtectorInfo ? playerProtectorInfo.userPower : 0;

            // Add data attribute for identification
            listItem.dataset.businessId = businessInfo.id;

            // Display business name and player's contribution
            listItem.innerHTML = `
                <div> <!-- Wrapper for text content -->
                    <span class="business-name">${businessInfo.name}</span>
                    <span class="business-protection">(Your Power: ${playerContribution})</span>
                </div>
                <button class="remove-protection-btn btn btn-red" data-business-id="${businessInfo.id}" style="display: none; margin-left: 10px;">Remove</button>
            `;
            // Optional: Add total power of the business if desired
            // listItem.innerHTML += `<span class="business-total-power"> (Total: ${businessInfo.protectionPower})</span>`;

            controlledBusinessesListElement.appendChild(listItem);
        }
    }

    // Add a summary line showing player's protection count vs limit
    const summaryItem = document.createElement('li');
    summaryItem.classList.add('protection-summary'); // Keep class for potential styling
    summaryItem.innerHTML = `<b>Protecting: ${playerProtectedCount} / ${MAX_PLAYER_PROTECTED_BUSINESSES} Businesses</b>`; // MAX_PLAYER_PROTECTED_BUSINESSES from gameWorld.js
    controlledBusinessesListElement.appendChild(summaryItem); // Add to the end

    // Show the book if it's not minimized (it's always relevant now)
    if (!protectionBookElement.classList.contains('minimized')) {
        protectionBookElement.style.display = 'block';
    }

    // Add a message if the player isn't protecting any businesses yet
    if (playerProtectedCount === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'You are not currently protecting any businesses.';
        emptyMessage.style.fontStyle = 'italic';
        emptyMessage.style.color = '#888';
        // Insert before the summary item
        controlledBusinessesListElement.insertBefore(emptyMessage, summaryItem);
    }
}

// Function to update the Stats Info modal UI
function updateStatsModalUI() {
    // Stats should be calculated *before* calling this function
    // calculatePlayerPower(); // REMOVED - Called when needed elsewhere
    // calculateCharacterStats(); // REMOVED - Called when needed elsewhere (e.g., equip/unequip, level up)

    // Get all the span elements
    const usernameSpan = document.getElementById('stats-username');
    const aliasSpan = document.getElementById('stats-alias');
    const levelSpan = document.getElementById('stats-level');
    const experienceSpan = document.getElementById('stats-experience');
    const expNeededSpan = document.getElementById('stats-exp-needed'); // TODO: Implement EXP needed calculation
    const powerSpan = document.getElementById('stats-power');
    const influenceSpan = document.getElementById('stats-influence');
    const strengthSpan = document.getElementById('stats-strength');
    const agilitySpan = document.getElementById('stats-agility');
    const vitalitySpan = document.getElementById('stats-vitality');
    const hitRateSpan = document.getElementById('stats-hitRate');
    const defenceSpan = document.getElementById('stats-defence');
    const evasionRateSpan = document.getElementById('stats-evasionRate');
    const criticalRateSpan = document.getElementById('stats-criticalRate');
    const damageSpan = document.getElementById('stats-damage'); // Get the new damage span

    // Update the content if elements exist
    // Uses global player variables from gameWorld.js
    if (usernameSpan) usernameSpan.textContent = playerUsername || 'N/A';
    if (aliasSpan) aliasSpan.textContent = playerAlias || 'N/A';
    if (levelSpan) levelSpan.textContent = playerLevel;
    if (experienceSpan) experienceSpan.textContent = playerExperience;
    if (expNeededSpan) expNeededSpan.textContent = '100'; // Placeholder for EXP needed
    if (powerSpan) powerSpan.textContent = playerPower;
    if (influenceSpan) influenceSpan.textContent = playerStats.influence;
    if (strengthSpan) strengthSpan.textContent = playerStats.strength;
    if (agilitySpan) agilitySpan.textContent = playerStats.agility;
    if (vitalitySpan) vitalitySpan.textContent = playerStats.vitality;
    if (hitRateSpan) hitRateSpan.textContent = playerStats.hitRate;
    if (defenceSpan) defenceSpan.textContent = playerCharacterStats.defence;
    if (evasionRateSpan) evasionRateSpan.textContent = playerCharacterStats.evasionRate.toFixed(1); // Show one decimal place
    if (criticalRateSpan) criticalRateSpan.textContent = playerCharacterStats.criticalRate.toFixed(1); // Show one decimal place
    if (damageSpan) damageSpan.textContent = playerCharacterStats.damage; // Update damage display

    console.log("Stats modal UI updated.");
}

// Function to update the Equipment modal UI
function updateEquipmentUI() {
    const equipmentSlotsContainer = document.querySelector('#equipment-modal .equipment-slots');
    if (!equipmentSlotsContainer) {
        console.error("Equipment slots container not found!");
        return;
    }

    // Iterate through all defined equipment slots in the HTML
    equipmentSlotsContainer.querySelectorAll('.equipment-slot').forEach(slotDiv => {
        const slotType = slotDiv.dataset.slotType; // Get 'Head', 'Body', etc. from data attribute
        const itemDiv = slotDiv.querySelector('.slot-item');
        if (!itemDiv) return; // Skip if structure is wrong

        const equippedItemId = playerEquipment[slotType]; // Get ID from gameWorld.js

        if (equippedItemId) {
            const item = getEquipmentById(equippedItemId); // Get full item details
            if (item) {
                // --- Display Item Image ---
                itemDiv.innerHTML = ''; // Clear previous content (like text name)
                if (item.image) {
                    const img = document.createElement('img');
                    img.src = item.image;
                    img.alt = item.name;
                    // Add some basic styling to fit the image in the slot
                    img.style.maxWidth = '90%'; // Adjust as needed
                    img.style.maxHeight = '90%'; // Adjust as needed
                    img.style.verticalAlign = 'middle'; // Align nicely if there's text later
                    itemDiv.appendChild(img);
                } else {
                    // Fallback if no image
                    itemDiv.textContent = item.name; // Display item name if no image
                }
                // --- End Display Item Image ---

                // itemDiv.title = `${item.name}\n${item.description || ''}\nClick to unequip`; // REMOVED - Replaced by custom tooltip
                // Apply rarity styling (border color and glow effect class)
                itemDiv.classList.remove('rarity-glow-common', 'rarity-glow-uncommon', 'rarity-glow-rare', 'rarity-glow-epic', 'rarity-glow-legendary', 'rarity-glow-mythic', 'rarity-glow-god-tier'); // Clear existing glows
                itemDiv.style.color = item.rarity.color || '#e0e0e0'; // Keep text color
                itemDiv.style.borderColor = item.rarity.color || '#555'; // Keep border color
                itemDiv.style.borderStyle = 'solid';
                const glowClass = `rarity-glow-${item.rarity.name.toLowerCase().replace(' ', '-')}`;
                itemDiv.classList.add(glowClass); // Add glow class

                // Special text shadow for God-Tier remains
                if (item.rarity.name === Rarity.GOD_TIER.name) {
                    itemDiv.style.color = '#FFFFFF'; // Ensure text is white for god-tier glow
                    itemDiv.style.textShadow = '0 0 3px #000, 0 0 3px #000, 0 0 3px #000';
                } else {
                    itemDiv.style.textShadow = 'none';
                }
            } else {
                // Item ID exists but definition not found (error state)
                itemDiv.textContent = `ERR! (${equippedItemId})`;
                // itemDiv.title = 'Error: Item definition not found'; // REMOVED
                itemDiv.classList.remove('rarity-glow-common', 'rarity-glow-uncommon', 'rarity-glow-rare', 'rarity-glow-epic', 'rarity-glow-legendary', 'rarity-glow-mythic', 'rarity-glow-god-tier'); // Clear existing glows
                itemDiv.style.color = 'red';
                itemDiv.style.borderColor = '#444';
                itemDiv.style.borderStyle = 'dashed';
                itemDiv.style.textShadow = 'none';
            }
        } else {
            // Slot is empty
            itemDiv.classList.remove('rarity-glow-common', 'rarity-glow-uncommon', 'rarity-glow-rare', 'rarity-glow-epic', 'rarity-glow-legendary', 'rarity-glow-mythic', 'rarity-glow-god-tier'); // Clear existing glows
            itemDiv.textContent = ''; // Clear text
            // itemDiv.title = `${slotType} Slot (Empty)`; // REMOVED
            itemDiv.style.color = '#666'; // Reset styling
            itemDiv.style.borderColor = '#444';
            itemDiv.style.borderStyle = 'dashed';
            itemDiv.style.textShadow = 'none';
        }
    });

    // Update the Power display
    const powerValueElement = document.getElementById('equipment-power-value');
    if (powerValueElement) {
        // playerPower is a global variable defined in gameWorld.js
        powerValueElement.textContent = playerPower;
    } else {
        console.error("Equipment power value element not found!");
    }

    console.log("Equipment UI updated.");
}


// --- Custom Alert Functionality ---
function showCustomAlert(message) {
    if (customAlertDiv && customAlertMessage) {
        customAlertMessage.textContent = message;
        customAlertDiv.classList.remove('custom-alert-hidden');
    } else {
        console.error("Custom alert elements not found!");
        // Fallback to standard alert if custom elements are missing
        alert(message);
    }
}

if (customAlertCloseBtn && customAlertDiv) {
    customAlertCloseBtn.addEventListener('click', () => {
        customAlertDiv.classList.add('custom-alert-hidden');
    });
} else {
    console.error("Custom alert close button or container not found!");
}

// --- User Info Management ---

function saveUserInfo() {
    if (!usernameInput || !aliasInput) {
        console.error("Username or Alias input not found!");
        return;
    }
    // Update global vars in gameWorld.js
    playerUsername = usernameInput.value.trim();
    playerAlias = aliasInput.value.trim();
    localStorage.setItem('playerUsername', playerUsername);
    localStorage.setItem('playerAlias', playerAlias);
    showCustomAlert('User info saved!');

    // Lock the username input if a username was entered
    if (playerUsername && usernameInput) {
        usernameInput.readOnly = true;
        console.log("Username input locked.");
    }

    // Re-render protection book in case alias changed
    updateProtectionBookUI();
    // Update bottom bar alias display
    if (playerAliasBar) playerAliasBar.textContent = playerAlias || 'Alias';
}

function loadUserInfo() {
    const savedUsername = localStorage.getItem('playerUsername');
    const savedAlias = localStorage.getItem('playerAlias');
    if (savedUsername && usernameInput) { // Check if input exists too
        playerUsername = savedUsername; // Update global var
        usernameInput.value = playerUsername;
        usernameInput.readOnly = true; // Lock the input if loaded from storage
        console.log("Username loaded from storage and input locked.");
    }
    if (savedAlias && aliasInput) {
        playerAlias = savedAlias;
        aliasInput.value = playerAlias;
    }
    // Update bottom bar alias display on load
    if (playerAliasBar) playerAliasBar.textContent = playerAlias || 'Alias';
    console.log(`Loaded User Info - Username: ${playerUsername}, Alias: ${playerAlias}`);
}

// --- Marker Display Functions ---

// Function to display base markers on the map
function displayBases(bases) {
    bases.forEach(baseInfo => {
        // Avoid adding duplicate markers if already displayed
        if (displayedBaseIds.has(baseInfo.id)) { // displayedBaseIds from gameWorld.js
            return;
        }

        const marker = L.marker([baseInfo.lat, baseInfo.lon], { icon: baseIcon })
            .addTo(baseLayer) // baseLayer from gameWorld.js
             // Updated popup content and button attributes
            .bindPopup(`<b>${baseInfo.organizationName}</b><br>(${baseInfo.name})<br><button class="join-button btn btn-green" data-org-name="${baseInfo.organizationName}" data-org-abbr="${baseInfo.organizationAbbreviation}" data-base-lat="${baseInfo.lat}" data-base-lon="${baseInfo.lon}">Join Organization</button>`); // Added button classes

        // Add a custom property to the marker for easier identification if needed later
        marker.baseId = baseInfo.id;

        displayedBaseIds.add(baseInfo.id); // Mark as displayed
    });

    // Popup listener is attached once via handlePopupOpenForActions
}

// Function to display business markers, checking territory AND filtering by allowed types
function displayBusinesses(businesses) {
     businesses.forEach(businessInfo => {
        // This function now primarily adds *new* markers. Updates are handled by updateBusinessMarkers.
        if (displayedBusinessIds.has(businessInfo.id)) { // displayedBusinessIds from gameWorld.js
             return;
         }

         // --- FINAL FILTER: Ensure only allowed business types are displayed ---
         // allowedBusinessTags is defined globally in gameWorld.js
         if (typeof allowedBusinessTags === 'undefined' || !allowedBusinessTags.has(businessInfo.type)) {
            // console.log(`Skipping display of business ${businessInfo.id} (${businessInfo.name}) - Type '${businessInfo.type}' not allowed.`);
            // Remove from cache if it somehow got there (belt-and-suspenders)
            if (businessesCache[businessInfo.id]) {
                delete businessesCache[businessInfo.id];
            }
            return; // Do not create a marker for this business
         }
         // --- End Final Filter ---

         // Use the correct icon from the start based on the isShop flag
         let icon = businessInfo.isShop ? shopIcon : customBusinessIcon;
         // Format the type string for display (replace underscores, capitalize) - Moved from updateSingleBusinessMarker
         const displayType = businessInfo.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
         let popupContent = `<b>${businessInfo.name}</b><br>(${displayType})`;
         let isControlled = false; // Assume not controlled initially

        // Initial control check (will be re-checked by updateBusinessMarkers in gameWorld.js)
        if (currentUserOrganization && currentOrganizationBaseLocation) { // Variables from gameWorld.js
            const distanceToBase = calculateDistance( // Function from gameWorld.js
                businessInfo.lat, businessInfo.lon,
                currentOrganizationBaseLocation.lat, currentOrganizationBaseLocation.lon
            );
            if (distanceToBase <= TERRITORY_RADIUS) { // Constant from gameWorld.js
                isControlled = true;
            }
        }

        const marker = L.marker([businessInfo.lat, businessInfo.lon], { icon: icon })
            .addTo(businessLayer) // businessLayer from gameWorld.js
            .bindPopup(popupContent);

        // Store marker reference and initial control status in cache (businessesCache from gameWorld.js)
        businessesCache[businessInfo.id].marker = marker;
        businessesCache[businessInfo.id].isControlled = isControlled;

        displayedBusinessIds.add(businessInfo.id); // Mark as displayed
     });

     // Add ONE listener for collect/join buttons using delegation (if not already added)
     // This listener is attached below in the Event Listeners section
}

// --- Helper function for generating detailed item tooltips ---
function generateItemTooltip(item) {
    if (!item) return 'Unknown Item';

    let tooltip = `${item.name}`;

    // Add Rarity
    let rarityName = '';
    if (item.rarity && typeof Rarity !== 'undefined') {
        // Handle both object (equipment) and string (items) rarity formats
        const rarityKey = (typeof item.rarity === 'object' ? item.rarity.name : item.rarity).toUpperCase().replace('-', '_');
        const rarityInfo = Rarity[rarityKey];
        if (rarityInfo) {
            rarityName = rarityInfo.name;
            tooltip += ` (${rarityName})`;
        }
    } else if (typeof item.rarity === 'string') {
         // Fallback for string rarity if Rarity object isn't loaded or key doesn't match
         rarityName = item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1);
         tooltip += ` (${rarityName})`;
    } else {
        tooltip += ` (Common)`; // Assume common if no rarity defined
    }


    // Add Description
    if (item.description) {
        tooltip += `\n${item.description}`;
    }

    // Add Type/Category
    let itemType = '';
    if (item.equipmentType) { // From equipment.js (e.g., EquipmentType.HEAD)
        itemType = item.equipmentType;
        tooltip += `\nType: ${itemType}`;
    } else if (item.category) { // From items.js (newer structure, e.g., 'housing', 'consumable')
        itemType = item.category.charAt(0).toUpperCase() + item.category.slice(1);
        tooltip += `\nCategory: ${itemType}`;
    } else if (item.itemType) { // Fallback (older structure, e.g., 'Equipment', 'Consumable')
         itemType = item.itemType;
         tooltip += `\nType: ${itemType}`;
    }


    // Add Equipment Stats (check if properties exist and are non-zero/relevant)
    const stats = [];
    if (item.damage) stats.push(`Damage: ${item.damage}`);
    if (item.defense) stats.push(`Defense: ${item.defense}`);
    if (item.strength) stats.push(`Strength: ${item.strength}`);
    if (item.agility) stats.push(`Agility: ${item.agility}`);
    if (item.vitality) stats.push(`Vitality: ${item.vitality}`);
    if (item.hitRate) stats.push(`Hit Rate: ${item.hitRate}`);
    if (item.evasionRate) stats.push(`Evasion: ${item.evasionRate}%`);
    if (item.criticalRate) stats.push(`Crit Rate: ${item.criticalRate}%`);
    if (item.influence) stats.push(`Influence: ${item.influence}`); // Housing/Other stat
    if (item.power) stats.push(`Power: ${item.power}`); // Housing/Other stat


    if (stats.length > 0) {
        tooltip += `\nStats: ${stats.join(', ')}`;
    }

    // Add Consumable Effects
    if (item.effect) {
        let effects = [];
        if (item.effect.heal) effects.push(`Heals ${item.effect.heal} HP`);
        // Add other potential effects here (e.g., buffs, status changes)
        // if (item.effect.buff) effects.push(`Buff: ${item.effect.buff.stat} +${item.effect.buff.value} for ${item.effect.buff.duration}s`);
        if (effects.length > 0) {
            tooltip += `\nEffect: ${effects.join(', ')}`;
        }
    }

    // Add Price (already visible, but maybe useful in tooltip too?)
    // if (item.price) {
    //     tooltip += `\nPrice: $${item.price}`;
    // }

    return tooltip;
}


// --- Shop Modal Functions ---

function openShopModal(businessId) {
    // Get modal elements *inside* the function to ensure they exist
    const shopModalElement = document.getElementById('shop-modal');
    const shopNameElement = document.getElementById('shop-name');
    const shopPlayerMoneyElement = document.getElementById('shop-player-money'); // Get the money display element

    if (!shopModalElement || !gameShop) { // gameShop from initialization.js
        console.error("Shop modal or gameShop instance not found!");
        showCustomAlert("Cannot open shop interface.");
        return;
    }
    // Removed redundant check for shopPlayerMoneyElement, handled below

    // Optional: Get specific shop details if shops vary, for now use global gameShop
    const businessInfo = businessesCache[businessId]; // from gameWorld.js
    if (!businessInfo || !businessInfo.isShop) {
        console.error(`Business ${businessId} is not a shop or not found.`);
        showCustomAlert("This is not a shop.");
        return;
    }

    console.log(`Opening shop for: ${businessInfo.name}`);
    if (shopNameElement) shopNameElement.textContent = businessInfo.name; // Update shop name display

    // Update player money display in the shop modal
    if (shopPlayerMoneyElement) {
        shopPlayerMoneyElement.textContent = `Your Money: $${currentCash}`; // Display current cash (use global currentCash from gameWorld.js)
    } else {
         console.warn("Shop player money display element ('shop-player-money') not found!");
    }


    populateShopUI(); // Populate buy/sell lists

    shopModalElement.classList.remove('modal-hidden');
    hideShopMessage(); // Clear any previous messages
}

function closeShopModal() {
    const shopModalElement = document.getElementById('shop-modal');
    if (shopModalElement) {
        shopModalElement.classList.add('modal-hidden');
        console.log("Shop modal closed.");
    }
}

function showShopMessage(message, isError = false) {
    const shopMessageElement = document.getElementById('shop-message');
    if (shopMessageElement) {
        shopMessageElement.textContent = message;
        shopMessageElement.className = 'shop-message'; // Reset classes
        shopMessageElement.classList.add(isError ? 'error' : 'success');
        shopMessageElement.style.display = 'block';

        // Optional: Hide message after a few seconds
        setTimeout(hideShopMessage, 3000);
    }
}

function hideShopMessage() {
     const shopMessageElement = document.getElementById('shop-message');
     if (shopMessageElement) {
        shopMessageElement.style.display = 'none';
        shopMessageElement.textContent = '';
        shopMessageElement.className = 'shop-message'; // Reset classes
    }
}

// Function to populate the shop UI (Buy and Sell lists)
function populateShopUI() {
    // Get list elements *inside* the function
    const shopBuyListElement = document.getElementById('shop-buy-list');
    const shopSellListElement = document.getElementById('shop-sell-list');

    if (!shopBuyListElement || !shopSellListElement || !gameShop) {
        console.error("Shop list elements or gameShop not found for population.");
        return;
    }

    // --- Populate Buy List ---
    shopBuyListElement.innerHTML = ''; // Clear existing items
    const buyableItems = gameShop.getBuyableItems(); // Method from Shop class

    if (buyableItems.length === 0) {
        shopBuyListElement.innerHTML = '<li>(No items for sale)</li>';
    } else {
        buyableItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.dataset.itemId = item.id;

            // Determine display name and rarity color
            let displayName = item.name;
            let rarityName = '';
            listItem.classList.remove('rarity-glow-common', 'rarity-glow-uncommon', 'rarity-glow-rare', 'rarity-glow-epic', 'rarity-glow-legendary', 'rarity-glow-mythic', 'rarity-glow-god-tier'); // Clear existing glows
            listItem.style.color = ''; // Reset color
            listItem.style.textShadow = 'none'; // Reset shadow

            if (item.rarity && typeof Rarity !== 'undefined') {
                const rarityKey = (typeof item.rarity === 'object' ? item.rarity.name : item.rarity).toUpperCase().replace('-', '_');
                const rarityInfo = Rarity[rarityKey];
                if (rarityInfo) {
                    rarityName = ` (${rarityInfo.name})`;
                    const glowClass = `rarity-glow-${rarityInfo.name.toLowerCase().replace(' ', '-')}`;
                    listItem.classList.add(glowClass); // Add glow class to the list item itself
                    if (rarityInfo.name === Rarity.GOD_TIER.name) {
                        listItem.style.color = '#FFFFFF'; // Keep text white for god-tier
                        listItem.style.textShadow = '0 0 3px #000, 0 0 3px #000, 0 0 3px #000';
                    } else {
                         listItem.style.color = rarityInfo.color || ''; // Set text color based on rarity
                    }
                }
            }

            // Generate detailed tooltip using the helper function
            const tooltipText = generateItemTooltip(item);

            // --- ADDED: Add item image ---
            let imageHtml = '';
            if (item.image) {
                // Added basic styling for size and vertical alignment
                imageHtml = `<img src="${item.image}" alt="${displayName}" class="shop-item-icon" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;">`;
            }
            // --- END ADDED ---

            listItem.innerHTML = `
                ${imageHtml} <!-- Added image -->
                <span class="shop-item-name" title="${tooltipText}">${displayName}</span>
                <span class="shop-item-price">$${item.price || 'N/A'}</span>
                <button class="shop-buy-button btn btn-green" data-item-id="${item.id}">Buy</button>
            `;
            // Ensure price has '$'
            const priceSpan = listItem.querySelector('.shop-item-price');
            if (priceSpan && !priceSpan.textContent.startsWith('$')) {
                priceSpan.textContent = `$${priceSpan.textContent}`;
            }
            shopBuyListElement.appendChild(listItem);
        });
    }

    // --- Populate Sell List ---
    shopSellListElement.innerHTML = ''; // Clear existing items
    if (playerInventory.length === 0) { // playerInventory from gameWorld.js
        shopSellListElement.innerHTML = '<li>(Inventory empty)</li>';
    } else {
        // Group player inventory for display
        const groupedPlayerInventory = playerInventory.reduce((acc, itemEntry) => {
            if (!acc[itemEntry.id]) {
                // Fetch definition to get full item details (name, rarity, etc.)
                 const itemDef = itemsDatabase.get(itemEntry.id) || equipmentDatabase.get(itemEntry.id); // From items/equipment.js
                 if (itemDef) {
                    // Ensure rarity is stored as a string name for consistency
                    let itemRarityName = 'Common'; // Default
                    if (itemDef.rarity) {
                         itemRarityName = (typeof itemDef.rarity === 'object' && itemDef.rarity !== null) ? itemDef.rarity.name : itemDef.rarity;
                    }
                    acc[itemEntry.id] = { ...itemDef, quantity: 0, rarity: itemRarityName }; // Store rarity name string
                 } else {
                     acc[itemEntry.id] = { id: itemEntry.id, name: `Unknown (${itemEntry.id})`, quantity: 0, rarity: 'Common' }; // Fallback
                 }
            }
            acc[itemEntry.id].quantity += (itemEntry.quantity || 1);
            return acc;
        }, {});


        Object.values(groupedPlayerInventory).forEach(item => {
            const listItem = document.createElement('li');
            listItem.dataset.itemId = item.id;

            // Calculate sell price using the NEW formula (1 * multiplier)
            const rarityKey = (item.rarity || 'Common').toLowerCase().replace('-', '_');
            const multiplier = rarityMultipliers[rarityKey] || 1; // rarityMultipliers from shop.js
            const sellPrice = 1 * multiplier; // Use the updated base price

            // Determine display name and rarity color
            let displayName = item.name;
            let rarityName = '';
            listItem.classList.remove('rarity-glow-common', 'rarity-glow-uncommon', 'rarity-glow-rare', 'rarity-glow-epic', 'rarity-glow-legendary', 'rarity-glow-mythic', 'rarity-glow-god-tier'); // Clear existing glows
            listItem.style.color = ''; // Reset color
            listItem.style.textShadow = 'none'; // Reset shadow

            if (item.rarity && typeof Rarity !== 'undefined') {
                const rarityKey = (typeof item.rarity === 'object' ? item.rarity.name : item.rarity).toUpperCase().replace('-', '_');
                const rarityInfo = Rarity[rarityKey];
                if (rarityInfo) {
                    rarityName = ` (${rarityInfo.name})`;
                    const glowClass = `rarity-glow-${rarityInfo.name.toLowerCase().replace(' ', '-')}`;
                    listItem.classList.add(glowClass); // Add glow class to the list item itself
                    if (rarityInfo.name === Rarity.GOD_TIER.name) {
                        listItem.style.color = '#FFFFFF'; // Keep text white for god-tier
                        listItem.style.textShadow = '0 0 3px #000, 0 0 3px #000, 0 0 3px #000';
                    } else {
                        listItem.style.color = rarityInfo.color || ''; // Set text color based on rarity
                    }
                }
            }

            // Generate detailed tooltip using the helper function
            const tooltipText = generateItemTooltip(item); // item here is the grouped item with definition properties

            // --- ADDED: Add item image ---
            let imageHtml = '';
            if (item.image) {
                 // Added basic styling for size and vertical alignment
                imageHtml = `<img src="${item.image}" alt="${displayName}" class="shop-item-icon" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;">`;
            }
            // --- END ADDED ---

            listItem.innerHTML = `
                ${imageHtml} <!-- Added image -->
                <span class="shop-item-name" title="${tooltipText}">${displayName} (x${item.quantity})</span>
                <span class="shop-item-value">$${sellPrice}</span>
                <button class="shop-sell-button btn btn-orange" data-item-id="${item.id}">Sell</button>
            `;
             // Ensure sell value has '$'
            const valueSpan = listItem.querySelector('.shop-item-value');
             if (valueSpan && !valueSpan.textContent.startsWith('$')) {
                valueSpan.textContent = `$${valueSpan.textContent}`;
            }
            shopSellListElement.appendChild(listItem);
        });
    }
}

// --- Shop Action Handlers (Event Delegation) ---

function handleShopBuyClick(event) {
    if (event.target.classList.contains('shop-buy-button')) {
        const button = event.target;
        const itemId = button.dataset.itemId;
        if (!itemId || !gameShop) return;

        console.log(`Attempting to buy item: ${itemId}`);
        // Define player object structure expected by shop.js buyItem
        // Ensure playerInventory is correctly passed and modified
        const playerForShop = {
            name: playerAlias || playerUsername || "Player", // from gameWorld.js
            money: currentCash, // from gameWorld.js
            inventory: playerInventory, // from gameWorld.js (pass reference)
            // Pass references to the actual inventory modification functions
            addItemToInventory: addItemToInventory, // from gameWorld.js
            removeItemFromInventory: null // Not needed for buying
        };

        const result = gameShop.buyItem(itemId, playerForShop);

        // Update game state based on result
        if (result.success) {
            currentCash = playerForShop.money; // Update global cash from the modified object
            updateCashUI(currentCash); // Update main dashboard cash UI
            // Update money display inside the shop modal
            const shopPlayerMoneyElement = document.getElementById('shop-player-money');
            if (shopPlayerMoneyElement) shopPlayerMoneyElement.textContent = `Your Money: $${currentCash}`;

            // Inventory was modified directly by addItemToInventory

            // Log inventory state *just before* updating the UI from the handler
            console.log('Inventory state before updateInventoryUI call in handleShopBuyClick:', JSON.stringify(playerInventory));

            updateInventoryUI(); // Explicitly update the main inventory modal UI
            populateShopUI(); // Re-populate shop's sell list
            showShopMessage(result.message);
        } else {
            showShopMessage(result.message, true); // Show error message
        }
    }
}

function handleShopSellClick(event) {
    if (event.target.classList.contains('shop-sell-button')) {
        const button = event.target;
        const itemId = button.dataset.itemId;
         if (!itemId || !gameShop) return;

        console.log(`Attempting to sell item: ${itemId}`);

        // Find the correct index in the actual playerInventory array
        // This is crucial because sellItem needs the index to remove the item correctly.
        const itemIndex = playerInventory.findIndex(invItem => invItem.id === itemId);
        if (itemIndex === -1) {
            console.error(`Item ${itemId} not found in playerInventory for selling.`);
            showShopMessage("Error: Item not found in your inventory.", true);
            return;
        }

        // Define player object structure expected by shop.js sellItem
        const playerForShop = {
            name: playerAlias || playerUsername || "Player",
            money: currentCash,
            inventory: playerInventory, // Pass the actual inventory reference
            addItemToInventory: null, // Not needed for selling
            // Provide a function that removes item by INDEX from the *actual* playerInventory
            removeItemFromInventory: (indexToRemove) => {
                 const item = playerInventory[indexToRemove];
                 if (!item) return; // Safety check

                 if (item.quantity > 1) {
                    item.quantity -= 1; // Decrement quantity
                 } else {
                    playerInventory.splice(indexToRemove, 1); // Remove item completely
                 }
                 updateInventoryUI(); // Update main inventory modal UI
            }
        };

        // Call sellItem with the ITEM ID. The shop's sellItem method will
        // find the item again and then call our provided removeItemFromInventory
        // with the correct index from *its* perspective (which matches ours here).
        const result = gameShop.sellItem(itemId, playerForShop);

        // Update game state based on result
        if (result.success) {
            // *** IMPORTANT FIX: Update the *global* currentCash directly ***
            currentCash = playerForShop.money;
            updateCashUI(currentCash); // Update main dashboard cash UI with the correct global value
             // Update money display inside the shop modal
            const shopPlayerMoneyElement = document.getElementById('shop-player-money');
            if (shopPlayerMoneyElement) shopPlayerMoneyElement.textContent = `Your Money: $${currentCash}`;

            // Inventory was modified directly by removeItemFromInventory via callback

            populateShopUI(); // Re-populate sell list to reflect changes
            showShopMessage(result.message);
        } else {
            showShopMessage(result.message, true); // Show error message
        }
    }
}


// --- How to Play Modal Functions ---

function openHowToPlayModal() {
    const modal = document.getElementById('how-to-play-modal');
    if (modal) {
        modal.classList.remove('modal-hidden');
        console.log("How to Play modal opened.");
    } else {
        console.error("How to Play modal element not found!");
    }
}

function closeHowToPlayModal() {
    const modal = document.getElementById('how-to-play-modal');
    if (modal) {
        modal.classList.add('modal-hidden');
        console.log("How to Play modal closed.");
    }
}

// --- Event Listeners ---

// Combined handler for popup open to attach button listeners
function handlePopupOpenForActions(e) {
    const popupNode = e.popup._contentNode; // Get the container element of the popup

    // Handle Collect Button
    const collectButton = popupNode.querySelector('.collect-button');
    if (collectButton) {
        const collectHandler = function() {
            const businessId = this.getAttribute('data-business-id');
            collectProfit(businessId); // Function from gameWorld.js
            map.closePopup(); // Close popup after action
        };
        collectButton.onclick = collectHandler; // Assign the handler
    }

    // Handle Join Button
    const joinButton = popupNode.querySelector('.join-button');
    if (joinButton) {
        const joinHandler = function() {
            const orgName = this.getAttribute('data-org-name');
            const orgAbbr = this.getAttribute('data-org-abbr');
            const baseLat = parseFloat(this.getAttribute('data-base-lat'));
            const baseLon = parseFloat(this.getAttribute('data-base-lon'));
            joinOrganizationManually(orgName, orgAbbr, baseLat, baseLon); // Function from gameWorld.js
            map.closePopup();
        };
        joinButton.onclick = joinHandler;
    }

    // Handle Activate Protection Button
    const activateButton = popupNode.querySelector('.activate-protection-button');
    if (activateButton) {
        const activateHandler = function() {
            const businessId = this.getAttribute('data-business-id');
            activateProtection(businessId); // Function from gameWorld.js
            // Don't close popup immediately, let activateProtection handle alerts/updates
        };
        activateButton.onclick = activateHandler;
    }

    // Handle Visit Shop Button
    const visitShopButton = popupNode.querySelector('.visit-shop-button');
    if (visitShopButton) {
        const visitHandler = function() {
            const businessId = this.getAttribute('data-business-id');
            openShopModal(businessId); // Function defined in uiManager.js
            map.closePopup(); // Close map popup when opening modal
        };
        visitShopButton.onclick = visitHandler;
    }


    // Handle Interact Enemy Button
    const interactEnemyButton = popupNode.querySelector('.interact-enemy-button');
    if (interactEnemyButton) {
        const interactHandler = function() {
            const enemyId = this.getAttribute('data-enemy-id');
            if (typeof findEnemyById !== 'function') {
                console.error("findEnemyById function not found! Make sure enemy.js is loaded.");
                map.closePopup();
                return;
            }
            const enemy = findEnemyById(enemyId);

            if (enemy) {
                calculateCharacterStats(); // Recalculate derived stats (Function from gameWorld.js)
                const currentPlayerBattleStats = {
                    name: playerAlias || playerUsername || "Player", // Use global vars from gameWorld.js
                    health: playerCurrentHp, // Use updated global var from gameWorld.js
                    attack: playerStats.strength, // Use global var from gameWorld.js
                    defense: playerCharacterStats.defence // Use global var from gameWorld.js
                };

                console.log("Player Stats for Battle:", currentPlayerBattleStats);
                console.log("Enemy Stats for Battle:", { name: enemy.name, health: enemy.health, attack: enemy.attack, defense: enemy.defense });

                if (typeof initiateBattle === 'function') {
                    // Pass null for the first argument as initiateBattle now uses global player stats
                    initiateBattle(null, enemy); // Function from battle.js
                } else {
                    console.error("initiateBattle function not found! Make sure battle.js is loaded.");
                    showCustomAlert("Battle system error. Cannot start fight.");
                }

            } else {
                console.error(`Enemy with ID ${enemyId} not found for interaction.`);
                showCustomAlert("Error: Could not find enemy data.");
            }
            map.closePopup(); // Close popup after initiating interaction/battle
        };
        interactEnemyButton.onclick = interactHandler;
    }
}
// map.on('popupopen', handlePopupOpenForActions); // MOVED to initialization.js


// --- UI Minimize/Show Logic ---
function setupMinimizeToggle(containerId, showButtonId) {
    const containerDiv = document.getElementById(containerId);
    const minimizeBtn = containerDiv ? containerDiv.querySelector('.minimize-btn') : null;
    const showBtn = document.getElementById(showButtonId);

    if (containerDiv && minimizeBtn && showBtn) {
        // Minimize Action
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            containerDiv.classList.add('minimized'); // Add class to remember state
            showBtn.style.display = 'block';
            containerDiv.style.display = 'none';
        });

        // Show Action
        showBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Check specific conditions before showing
            if (containerId === 'protection-book' && !currentUserOrganization) { // currentUserOrganization from gameWorld.js
                 console.log("Cannot show Protection Book: Not in an organization.");
                 // showCustomAlert("Join an organization to view the Protection Book.");
                 return; // Don't show the book if not in an org
            }

            containerDiv.classList.remove('minimized'); // Remove class
            containerDiv.style.display = 'block';
            showBtn.style.display = 'none';
        });

         // Initially hide the show button and ensure container is visible unless explicitly minimized
         showBtn.style.display = 'none';
         if (!containerDiv.classList.contains('minimized')) {
             containerDiv.style.display = 'block';
         } else {
             containerDiv.style.display = 'none'; // Hide if saved state is minimized
             showBtn.style.display = 'block';
         }

    } else {
        console.error(`Could not find all elements for minimize/show functionality: ${containerId}, ${showButtonId}`);
        if (!containerDiv) console.error(`Container not found: #${containerId}`);
        if (containerDiv && !minimizeBtn) console.error(`Minimize button not found inside #${containerId}`);
        if (!showBtn) console.error(`Show button not found: #${showButtonId}`);
    }
}

// Setup for Dashboard and Protection Book
setupMinimizeToggle('dashboard', 'show-dashboard-btn');
setupMinimizeToggle('protection-book', 'show-book-btn');


// --- Map Control Button Listeners ---
if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => map.zoomIn());
}
if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => map.zoomOut());
}
if (centerMapBtn) {
    centerMapBtn.addEventListener('click', () => {
        if (currentUserLocation) { // Variable from gameWorld.js
            map.setView([currentUserLocation.lat, currentUserLocation.lon], map.getZoom()); // Keep current zoom level
        } else {
            showCustomAlert("Current location not available yet.");
        }
    });
}

// --- Other Event Listeners ---
// Attach listener to leave button
if (leaveOrganizationButton) {
    leaveOrganizationButton.addEventListener('click', leaveOrganization); // Function from gameWorld.js
} else {
    console.error("Leave Organization button not found!");
}

// Attach listener to save user info button
if (saveUserInfoBtn) {
    saveUserInfoBtn.addEventListener('click', saveUserInfo); // Function defined above
} else {
    console.error("Save User Info button not found!");
}

// --- Modal Logic & Other Listeners (Wrapped in DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    // Attach listener to leave button *after* DOM is ready and gameWorld.js is likely parsed
    if (leaveOrganizationButton) {
        leaveOrganizationButton.addEventListener('click', leaveOrganization); // Function from gameWorld.js
    } else {
        console.error("Leave Organization button not found inside DOMContentLoaded!");
    }

    // Get references to elements needed immediately or frequently
    const inventoryListElement = document.querySelector('#inventory-modal #inventory-list'); // Needed for item usage listener
    const battleModal = document.getElementById('battle-modal'); // Needed for close button listener
    const battleCloseBtn = document.getElementById('battle-close-btn'); // Needed for close button listener
    const equipmentSlotsContainer = document.querySelector('#equipment-modal .equipment-slots'); // For unequip listener

    // Get references to new bottom bar action buttons
    const actionUserInfoBtn = document.getElementById('action-userinfo-btn');
    const actionStatsBtn = document.getElementById('action-stats-btn');
    const actionEquipmentBtn = document.getElementById('action-equipment-btn');
    const actionInventoryBtn = document.getElementById('action-inventory-btn');
    const dashboardElement = document.getElementById('dashboard'); // Need dashboard element ref

    // Get Shop Modal elements here
    // const shopModalElement = document.getElementById('shop-modal'); // Redeclared - REMOVE
    // const closeShopBtnElement = document.getElementById('close-shop-btn'); // Redeclared - REMOVE
    const shopModalElement = document.getElementById('shop-modal'); // Keep one declaration
    const closeShopBtnElement = document.getElementById('close-shop-btn'); // Keep one declaration
    const shopBuyListElement = document.getElementById('shop-buy-list');
    const shopSellListElement = document.getElementById('shop-sell-list');
    // --- Shop Tab Elements ---
    const shopTabsContainer = shopModalElement ? shopModalElement.querySelector('.shop-tabs') : null;
    const shopBuyContent = document.getElementById('shop-buy-content');
    const shopSellContent = document.getElementById('shop-sell-content');
    // --- Tooltip Element (Moved outside shop-specific section) ---
    const itemTooltipElement = document.getElementById('item-tooltip'); // Get reference to the main tooltip element


    // --- Leaderboard Modal Elements ---
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const actionLeaderboardBtn = document.getElementById('action-leaderboard-btn');
    const moneyTabBtn = document.getElementById('leaderboard-money-tab');
    const powerTabBtn = document.getElementById('leaderboard-power-tab');
    const moneyContent = document.getElementById('leaderboard-money-content');
    const powerContent = document.getElementById('leaderboard-power-content');
    const moneyList = document.getElementById('leaderboard-money-list');
    const powerList = document.getElementById('leaderboard-power-list');
    // const linkWalletBtn = document.getElementById('link-wallet-btn'); // REMOVED Link Wallet Button Ref

    // --- Housing Modal Elements ---
    const housingModal = document.getElementById('housing-modal');
    const closeHousingBtn = document.getElementById('close-housing-btn');
    const actionHousingBtn = document.getElementById('action-housing-btn');
    const housingPreviewArea = document.getElementById('housing-preview');
    const housingSlotsContainer = document.querySelector('#housing-modal .housing-slots');
    const housingItemSelector = document.getElementById('housing-item-selector');
    const housingSelectorGrid = document.getElementById('housing-selector-grid');
    const closeHousingSelectorBtn = document.getElementById('close-housing-selector-btn');
    let currentHousingSlotType = null; // To track which slot's selector is open


    // --- Stats Info Modal Listeners (Get elements inside listener) ---
    const openStatsBtn = document.getElementById('open-stats-btn'); // Old button ID, might be null now
    const closeStatsBtn = document.getElementById('close-stats-btn');
    const statsModal = document.getElementById('stats-modal'); // Get modal ref for background click

    // Listener for the *old* dashboard button (if it still exists)
    if (openStatsBtn) {
        openStatsBtn.addEventListener('click', () => {
            const statsModal = document.getElementById('stats-modal'); // Get modal fresh
            if (statsModal) {
                updateStatsModalUI();
                statsModal.classList.remove('modal-hidden');
                console.log("Stats modal opened (old button).");
            } else { console.error("Stats modal not found on open click (old button)."); }
        });
    }
    // Listener for the close button
    if (closeStatsBtn) {
        closeStatsBtn.addEventListener('click', () => {
            const statsModal = document.getElementById('stats-modal'); // Get modal fresh
            if (statsModal) statsModal.classList.add('modal-hidden');
            console.log("Stats modal closed (button).");
        });
    }
    // Listener for background click
    if (statsModal) {
        statsModal.addEventListener('click', (event) => {
            if (event.target === statsModal) {
                statsModal.classList.add('modal-hidden');
                console.log("Stats modal closed (background).");
            }
        });
    }

    // --- Equipment Modal Listeners (Get elements inside listener) ---
    const openEquipmentBtn = document.getElementById('open-equipment-btn'); // Old button ID
    const closeEquipmentBtn = document.getElementById('close-equipment-btn');
    const equipmentModal = document.getElementById('equipment-modal'); // Get modal ref for background click

    // Listener for the *old* dashboard button
    if (openEquipmentBtn) {
        openEquipmentBtn.addEventListener('click', () => {
            const equipmentModal = document.getElementById('equipment-modal'); // Get modal fresh
            if (equipmentModal) {
                updateEquipmentUI(); // Update UI when opening
                equipmentModal.classList.remove('modal-hidden');
                console.log("Equipment modal opened (old button).");
            } else { console.error("Equipment modal not found on open click (old button)."); }
        });
    }
    // Listener for the close button
    if (closeEquipmentBtn) {
        closeEquipmentBtn.addEventListener('click', () => {
            const equipmentModal = document.getElementById('equipment-modal'); // Get modal fresh
            if (equipmentModal) equipmentModal.classList.add('modal-hidden');
            console.log("Equipment modal closed (button).");
        });
    }
    // Listener for background click
    if (equipmentModal) {
        equipmentModal.addEventListener('click', (event) => {
            // Close only if clicking the background, not the content/slots
            if (event.target === equipmentModal) {
                equipmentModal.classList.add('modal-hidden');
                console.log("Equipment modal closed (background).");
            }
        });
    }
    // Listener for clicking on equipment slots (for unequipping)
    if (equipmentSlotsContainer) {
        equipmentSlotsContainer.addEventListener('click', (event) => {
            const slotItemDiv = event.target.closest('.slot-item');
            if (slotItemDiv) { // Check if a slot item was clicked
                const slotDiv = slotItemDiv.closest('.equipment-slot');
                if (slotDiv && slotDiv.dataset.slotType) {
                    const slotType = slotDiv.dataset.slotType;
                    console.log(`Clicked on equipment slot: ${slotType}`);
                    unequipItem(slotType); // Call unequip function from gameWorld.js
                }
            }
        });
    } else {
        console.error("Equipment slots container not found for unequip listener.");
    }


    // --- Inventory Modal Listeners (Get elements inside listener) ---
    const openInventoryBtn = document.getElementById('open-inventory-btn'); // Old button ID
    const closeInventoryBtn = document.getElementById('close-inventory-btn');
    const inventoryModal = document.getElementById('inventory-modal'); // Get modal ref for background click

    // Listener for the *old* dashboard button
    if (openInventoryBtn) {
        openInventoryBtn.addEventListener('click', () => {
            const inventoryModal = document.getElementById('inventory-modal'); // Get modal fresh
            if (inventoryModal) {
                updateInventoryUI();
                inventoryModal.classList.remove('modal-hidden');
                console.log("Inventory modal opened (old button).");
            } else { console.error("Inventory modal not found on open click (old button)."); }
        });
    }
    // Listener for the close button
    if (closeInventoryBtn) {
        closeInventoryBtn.addEventListener('click', () => {
            const inventoryModal = document.getElementById('inventory-modal'); // Get modal fresh
            if (inventoryModal) inventoryModal.classList.add('modal-hidden');
            console.log("Inventory modal closed (button).");
        });
    }
    // Listener for background click
    if (inventoryModal) {
        inventoryModal.addEventListener('click', (event) => {
            if (event.target === inventoryModal) {
                inventoryModal.classList.add('modal-hidden');
                console.log("Inventory modal closed (background).");
            }
        });
    }

    // Item usage/equip listener (targets the grid now)
    const inventoryGridElement = document.getElementById('inventory-grid');
    if (inventoryGridElement) {
        inventoryGridElement.addEventListener('click', (event) => {
            const clickedSlot = event.target.closest('.inventory-slot'); // Find the slot element
            // Ensure a slot was clicked and it's not an empty slot (check for itemId dataset)
            if (clickedSlot && clickedSlot.dataset.itemId) {
                const itemId = clickedSlot.dataset.itemId;
                console.log(`Clicked on inventory item slot: ${itemId}`);
                // Call useItem, which handles equipping/using consumables
                useItem(itemId); // Function from gameWorld.js
            } else if (clickedSlot) {
                console.log("Clicked on an empty inventory slot.");
            }
        });
    } else {
        console.error("Inventory grid element not found for item usage listener.");
    }

    // --- Battle Modal Close Button ---
    if (battleModal && battleCloseBtn) {
         battleCloseBtn.addEventListener('click', () => {
            battleModal.classList.add('modal-hidden');
            console.log("Battle modal closed.");
            // Maybe reset battle state here if needed
        });
    } else {
        console.error("Battle modal or close button not found!");
    }

    // --- Shop Modal Listeners ---
    if (shopModalElement && closeShopBtnElement) { // Use the variables defined inside DOMContentLoaded
        closeShopBtnElement.addEventListener('click', closeShopModal);
        shopModalElement.addEventListener('click', (event) => {
            if (event.target === shopModalElement) {
                closeShopModal();
            }
        });
    } else {
        // This error should no longer trigger if IDs are correct in HTML
        console.error("Could not find shop modal elements for close listeners.");
    }

    // Add listeners for buy/sell buttons within the shop lists (using event delegation)
    if (shopBuyListElement) { // Use the variable defined inside DOMContentLoaded
        shopBuyListElement.addEventListener('click', handleShopBuyClick);
    }
    if (shopSellListElement) { // Use the variable defined inside DOMContentLoaded
        shopSellListElement.addEventListener('click', handleShopSellClick);
    }

    // --- Shop Tab Switching Logic ---
    if (shopTabsContainer && shopBuyContent && shopSellContent) {
        shopTabsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('tab-btn')) {
                const targetTab = event.target.dataset.tab; // 'buy' or 'sell'

                // Update button active states
                shopTabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.toggle('active-tab', btn.dataset.tab === targetTab);
                });

                // Update content active states
                shopBuyContent.classList.toggle('active-content', targetTab === 'buy');
                shopSellContent.classList.toggle('active-content', targetTab === 'sell');

                console.log(`Switched shop tab to: ${targetTab}`);
            }
        });
         // Ensure initial state matches HTML (Buy tab active)
        shopTabsContainer.querySelector('.tab-btn[data-tab="buy"]').classList.add('active-tab');
        shopBuyContent.classList.add('active-content');
        shopSellContent.classList.remove('active-content');

    } else {
        console.error("Could not find all shop tab elements for switching logic.");
    }

    // --- Shop Item Tooltip Logic ---
    function showItemTooltip(event) {
        const listItem = event.target.closest('li[data-item-id]');
        if (!listItem || !itemTooltipElement) return;

        const itemId = listItem.dataset.itemId;
        const itemDef = itemsDatabase.get(itemId) || equipmentDatabase.get(itemId);

        if (itemDef) {
            itemTooltipElement.innerHTML = generateItemTooltip(itemDef).replace(/\n/g, '<br>'); // Use existing generator, replace newline with <br>
            itemTooltipElement.style.display = 'block';
            moveItemTooltip(event); // Position it initially
        } else {
            itemTooltipElement.style.display = 'none';
        }
    }

    function hideItemTooltip() {
        if (itemTooltipElement) {
            itemTooltipElement.style.display = 'none';
        }
    }

    function moveItemTooltip(event) {
        const itemTooltipElement = document.getElementById('item-tooltip'); // Re-fetch element
        // Ensure tooltip exists and is visible
        if (!itemTooltipElement || itemTooltipElement.style.display === 'none') return;

        // Position tooltip slightly offset from the viewport mouse coordinates
        // Try positioning slightly above and to the right
        const x = event.clientX + 10; // Offset right
        const y = event.clientY - 15; // Offset *up* (subtracting from Y)

        // Apply position using fixed coordinates
        itemTooltipElement.style.left = `${x}px`;
        itemTooltipElement.style.top = `${y}px`;
    }

    // Add tooltip listeners using event delegation
    if (shopBuyListElement) {
        shopBuyListElement.addEventListener('mouseover', showItemTooltip);
        shopBuyListElement.addEventListener('mouseout', hideItemTooltip);
        shopBuyListElement.addEventListener('mousemove', moveItemTooltip);
    }
    if (shopSellListElement) {
        shopSellListElement.addEventListener('mouseover', showItemTooltip);
        shopSellListElement.addEventListener('mouseout', hideItemTooltip);
        shopSellListElement.addEventListener('mousemove', moveItemTooltip);
    }

    // --- Custom Tooltip Logic for Inventory & Equipment ---

    // Get references to the containers
    const inventoryGridContainer = document.getElementById('inventory-grid');
    const equipmentSlotsContainerForTooltip = document.querySelector('#equipment-modal .equipment-slots'); // Use specific selector

    // Function to show the custom tooltip
    function showCustomItemTooltip(event) {
        if (!itemTooltipElement) return;

        const targetElement = event.target;
        // console.log("Tooltip Hover - Target:", targetElement); // Log 1: What was hovered?
        let itemId = null;
        let itemDef = null;
        let targetSlotForQuantity = null; // To get quantity for inventory

        // --- Check Inventory Slot ---
        // Need to check if the target itself or its parent is the slot
        let inventorySlot = null;
        if (targetElement.classList.contains('inventory-slot') && targetElement.dataset.itemId) {
            inventorySlot = targetElement;
        } else if (targetElement.parentElement && targetElement.parentElement.classList.contains('inventory-slot') && targetElement.parentElement.dataset.itemId) {
            inventorySlot = targetElement.parentElement;
        }
        // console.log("Tooltip Hover - Found inventorySlot:", inventorySlot); // Log 2: Did we find an inventory slot?
        if (inventorySlot) { // Check if inventorySlot was found before accessing itemId
            itemId = inventorySlot.dataset.itemId;
            // console.log(`Tooltip Hover - Inventory Slot itemId: ${itemId}`); // Log 3: What's the itemId?
            itemDef = itemsDatabase.get(itemId) || equipmentDatabase.get(itemId);
            targetSlotForQuantity = inventorySlot;
            // console.log(`Tooltip Hover - Inventory itemDef found: ${!!itemDef}`); // Log 4: Did we find the definition?
        }
        // --- Check Equipment Slot ---
        else { // Only check if not an inventory slot
            // Need to check if the target itself or its parent is the slot
             let equipmentSlot = null;
             if (targetElement.classList.contains('equipment-slot') && targetElement.dataset.slotType) {
                 equipmentSlot = targetElement;
             } else if (targetElement.parentElement && targetElement.parentElement.classList.contains('equipment-slot') && targetElement.parentElement.dataset.slotType) {
                 equipmentSlot = targetElement.parentElement;
             }
             // Check the item div within the equipment slot as well
             else if (targetElement.classList.contains('slot-item') && targetElement.closest('.equipment-slot')) {
                 equipmentSlot = targetElement.closest('.equipment-slot');
             }

            // console.log("Tooltip Hover - Found equipmentSlot:", equipmentSlot); // Log 5: Did we find an equipment slot?
            if (equipmentSlot) { // Check if equipmentSlot was found
                const slotType = equipmentSlot.dataset.slotType;
                // console.log(`Tooltip Hover - Equipment Slot type: ${slotType}`); // Log 6: What's the slotType?
                if (slotType && playerEquipment[slotType]) {
                    itemId = playerEquipment[slotType];
                    // console.log(`Tooltip Hover - Equipment Slot itemId: ${itemId}`); // Log 7: What's the itemId?
                    itemDef = getEquipmentById(itemId);
                    // console.log(`Tooltip Hover - Equipment itemDef found: ${!!itemDef}`); // Log 8: Did we find the definition?
                } else {
                     // console.log(`Tooltip Hover - Equipment slot ${slotType} has no item in playerEquipment.`); // Log 9: No item equipped
                }
            }
            // --- Check Housing Preview ---
            else { // Only check if not inventory or equipment slot
                const housingPreview = targetElement.closest('#housing-preview');
                 // console.log("Tooltip Hover - Found housingPreview:", housingPreview); // Log 10: Did we find housing preview?
                if (housingPreview && targetElement.tagName === 'IMG' && targetElement.classList.contains('housing-layer')) {
                    const layerId = targetElement.id;
                    const housingSlotMapping = {
                        'housing-layer-base': EquipmentType.BASE,
                        'housing-layer-wall': EquipmentType.WALL_DECORATION,
                        'housing-layer-weapon': EquipmentType.WEAPON_STASH,
                        'housing-layer-furniture': EquipmentType.LUXURY_FURNITURE,
                        'housing-layer-security': EquipmentType.SECURITY_SYSTEM
                     };
                    const slotType = housingSlotMapping[layerId];
                    if (slotType && playerEquipment[slotType]) {
                        itemId = playerEquipment[slotType];
                        itemDef = getEquipmentById(itemId);
                        // console.log(`Tooltip: Hovered housing layer ${layerId}, slotType: ${slotType}, itemId: ${itemId}, itemDef found: ${!!itemDef}`);
                    }
                }
            }
        }

        // --- Display Logic (Remains the same) ---
        if (itemDef) {
            // console.log("Tooltip Display - Showing tooltip for:", itemDef.name); // Log 11: Showing tooltip
            let tooltipContent = generateItemTooltip(itemDef).replace(/\n/g, '<br>');
            if (targetSlotForQuantity) {
                const quantitySpan = targetSlotForQuantity.querySelector('.item-count');
                if (quantitySpan) {
                    tooltipContent += `<br>Quantity: ${quantitySpan.textContent}`;
                }
            }
            itemTooltipElement.innerHTML = tooltipContent;
            itemTooltipElement.style.display = 'block';
            moveCustomItemTooltip(event);
        } else {
            itemTooltipElement.style.display = 'none';
            // console.log("Tooltip Display - Hiding tooltip (itemDef is null or not found)."); // Log 12: Hiding tooltip
        }
    }

    // Function to hide the custom tooltip
    function hideCustomItemTooltip() {
        if (itemTooltipElement) {
            itemTooltipElement.style.display = 'none';
        }
    }

    // Function to move the custom tooltip
    function moveCustomItemTooltip(event) {
        if (!itemTooltipElement || itemTooltipElement.style.display === 'none') return;

        // Position tooltip slightly offset from the mouse cursor
        const x = event.clientX + 15; // Offset right
        const y = event.clientY + 10; // Offset down

        // Basic boundary check (prevent going off-screen right/bottom)
        const tooltipRect = itemTooltipElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let finalX = x;
        let finalY = y;

        if (x + tooltipRect.width > viewportWidth) {
            finalX = event.clientX - tooltipRect.width - 15; // Flip to left
        }
        if (y + tooltipRect.height > viewportHeight) {
            finalY = event.clientY - tooltipRect.height - 10; // Flip to top
        }

        itemTooltipElement.style.left = `${finalX}px`;
        itemTooltipElement.style.top = `${finalY}px`;
    }

    // Add event listeners using delegation
    if (inventoryGridContainer) {
        inventoryGridContainer.addEventListener('mouseover', showCustomItemTooltip);
        inventoryGridContainer.addEventListener('mouseout', hideCustomItemTooltip);
        inventoryGridContainer.addEventListener('mousemove', moveCustomItemTooltip);
        console.log("Tooltip listeners added to inventory grid.");
    } else {
        console.error("Inventory grid container not found for tooltip listeners.");
    }

    if (equipmentSlotsContainerForTooltip) {
        equipmentSlotsContainerForTooltip.addEventListener('mouseover', showCustomItemTooltip);
        equipmentSlotsContainerForTooltip.addEventListener('mouseout', hideCustomItemTooltip);
        equipmentSlotsContainerForTooltip.addEventListener('mousemove', moveCustomItemTooltip);
        console.log("Tooltip listeners added to equipment slots.");
    } else {
        console.error("Equipment slots container not found for tooltip listeners.");
    }

    // Add tooltip listeners for Housing Preview Area
    // const housingPreviewArea = document.getElementById('housing-preview'); // REMOVED - Already declared above in DOMContentLoaded
    if (housingPreviewArea) { // Use the existing housingPreviewArea variable
        housingPreviewArea.addEventListener('mouseover', showCustomItemTooltip);
        housingPreviewArea.addEventListener('mouseout', hideCustomItemTooltip);
        housingPreviewArea.addEventListener('mousemove', moveCustomItemTooltip);
        console.log("Tooltip listeners added to housing preview area.");
    } else {
        console.error("Housing preview area not found for tooltip listeners.");
    }
    // --- End Custom Tooltip Logic ---


    // --- New Bottom Bar Action Button Listeners ---
    if (actionUserInfoBtn && dashboardElement) {
        actionUserInfoBtn.addEventListener('click', () => {
            // Toggle dashboard visibility
            const isMinimized = dashboardElement.classList.contains('minimized');
            const showBtn = document.getElementById('show-dashboard-btn'); // Get the corresponding show button
            if (isMinimized) {
                dashboardElement.classList.remove('minimized');
                dashboardElement.style.display = 'block';
                if (showBtn) showBtn.style.display = 'none';
                console.log("Dashboard shown via bottom bar button.");
            } else {
                dashboardElement.classList.add('minimized');
                dashboardElement.style.display = 'none';
                if (showBtn) showBtn.style.display = 'block';
                console.log("Dashboard hidden via bottom bar button.");
            }
        });
    } else {
        console.error("Could not find User Info action button or dashboard element:", { btn: !!actionUserInfoBtn, dashboard: !!dashboardElement });
    }

    // Listener for the NEW Stats button
    if (actionStatsBtn) {
        actionStatsBtn.addEventListener('click', () => {
            const statsModal = document.getElementById('stats-modal'); // Get modal fresh
            if (statsModal) {
                // Calculate latest stats *before* updating the UI
                calculatePlayerPower(); // From gameWorld.js
                calculateCharacterStats(); // From gameWorld.js
                updateStatsModalUI(); // Now update the UI with fresh stats
                statsModal.classList.remove('modal-hidden');
                console.log("Stats modal opened via bottom bar button.");
            } else { console.error("Stats modal not found on open click (bottom bar)."); }
        });
    } else {
        console.error("Could not find Stats action button.");
    }

    // Listener for the NEW Equipment button
    if (actionEquipmentBtn) {
        actionEquipmentBtn.addEventListener('click', () => {
            const equipmentModal = document.getElementById('equipment-modal'); // Get modal fresh
            if (equipmentModal) {
                updateEquipmentUI(); // Update UI when opening
                equipmentModal.classList.remove('modal-hidden');
                console.log("Equipment modal opened via bottom bar button.");
            } else { console.error("Equipment modal not found on open click (bottom bar)."); }
        });
    } else {
        console.error("Could not find Equipment action button.");
    }

    // Listener for the NEW Inventory button
    if (actionInventoryBtn) {
        actionInventoryBtn.addEventListener('click', () => {
            const inventoryModal = document.getElementById('inventory-modal'); // Get modal fresh
            if (inventoryModal) {
                currentInventoryCategory = 'all'; // Explicitly set state variable first

                // --- Set 'all' tab button as visually active *before* updating UI ---
                const inventoryTabsContainer = inventoryModal.querySelector('.inventory-tabs');
                if (inventoryTabsContainer) {
                    // Remove active class from all tabs
                    inventoryTabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
                    // Add active class to the 'all' tab
                    const allTabButton = inventoryTabsContainer.querySelector('.tab-btn[data-category="all"]');
                    if (allTabButton) {
                        allTabButton.classList.add('active-tab');
                        console.log("Set 'all' tab button to active.");
                    } else {
                        console.warn("Could not find the 'all' inventory tab button to set as active.");
                    }
                } else {
                    console.warn("Could not find inventory tabs container to set active tab.");
                }
                // --- End set 'all' tab ---

                console.log("Inventory button clicked. Current playerInventory before update:", JSON.stringify(playerInventory)); // Log inventory before update
                updateInventoryUI(); // Update grid content using the 'currentInventoryCategory' state ('all')
                inventoryModal.classList.remove('modal-hidden'); // Make modal visible last
                console.log("Inventory modal opened via bottom bar button, ensuring 'all' tab is active and content updated.");

            } else { console.error("Inventory modal not found on open click (bottom bar)."); }
        });
    } else {
        console.error("Could not find Inventory action button.");
    }

    // --- Housing Modal Listeners ---
    if (actionHousingBtn && housingModal) {
        actionHousingBtn.addEventListener('click', () => {
            updateHousingPreview(); // Update preview when opening
            housingModal.classList.remove('modal-hidden');
            console.log("Housing modal opened.");
        });
    } else {
        console.error("Housing action button or modal element not found.");
    }

    if (closeHousingBtn && housingModal) {
        closeHousingBtn.addEventListener('click', () => {
            housingModal.classList.add('modal-hidden');
            housingItemSelector.classList.add('modal-hidden'); // Also hide selector if open
            console.log("Housing modal closed.");
        });
    }

    // Close modal on Escape key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (housingModal && !housingModal.classList.contains('modal-hidden')) {
                housingModal.classList.add('modal-hidden');
                housingItemSelector.classList.add('modal-hidden'); // Also hide selector
                console.log("Housing modal closed via Escape key.");
            }
            // Add similar checks for other modals if needed
            // if (equipmentModal && !equipmentModal.classList.contains('modal-hidden')) { ... }
        }
    });

    // Listener for housing slot buttons
    if (housingSlotsContainer) {
        housingSlotsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('housing-slot-btn')) {
                const slotType = event.target.dataset.slotType;
                if (slotType) {
                    console.log(`Housing slot button clicked: ${slotType}`);
                    currentHousingSlotType = slotType; // Store the slot type
                    populateHousingSelector(slotType);
                    housingItemSelector.classList.remove('modal-hidden');
                }
            }
        });
    } else {
        console.error("Housing slots container not found.");
    }

    // Listener for closing the item selector
    if (closeHousingSelectorBtn && housingItemSelector) {
        closeHousingSelectorBtn.addEventListener('click', () => {
            housingItemSelector.classList.add('modal-hidden');
            currentHousingSlotType = null;
        });
    }

    // Listener for selecting an item from the selector grid
    if (housingSelectorGrid && housingItemSelector) {
        housingSelectorGrid.addEventListener('click', (event) => {
            const selectedItemDiv = event.target.closest('.selector-item');
            if (selectedItemDiv && selectedItemDiv.dataset.itemId) {
                const itemId = selectedItemDiv.dataset.itemId;
                console.log(`Selected housing item ${itemId} for slot ${currentHousingSlotType}`);
                if (currentHousingSlotType) {
                    // Call equipHousingItem from gameWorld.js
                    if (typeof equipHousingItem === 'function') {
                        equipHousingItem(itemId); // equipHousingItem handles slot type internally
                    } else {
                        console.error("equipHousingItem function not found in gameWorld.js");
                    }
                    // updateHousingPreview(); // equipHousingItem should trigger this via calculateCharacterStats -> updateHousingPreview
                    housingItemSelector.classList.add('modal-hidden'); // Close selector
                    currentHousingSlotType = null;
                } else {
                    console.error("No housing slot type selected when item was clicked.");
                }
            }
        });
    } else {
        console.error("Housing item selector grid or container not found.");
    }


    // --- Game Time Update ---
    const gameTimeElement = document.getElementById('game-time');

    function updateGameTime() {
        if (!gameTimeElement) return; // Exit if element not found

        const now = new Date();
        const hours = now.getUTCHours().toString().padStart(2, '0');
        const minutes = now.getUTCMinutes().toString().padStart(2, '0');
        const seconds = now.getUTCSeconds().toString().padStart(2, '0');

        gameTimeElement.textContent = `${hours}:${minutes}:${seconds} UTC`;
    }

    // Update time immediately and then every second
    updateGameTime();
    setInterval(updateGameTime, 1000);

    // --- Initial UI Setup ---
    loadUserInfo(); // Load username/alias first (this now also updates bottom bar alias)
    updateOrganizationUI(); // Update based on initial state (likely 'None')
    updateCashUI(currentCash); // Show initial cash (0)
    calculateCharacterStats(); // Calculate initial stats including Max HP (from gameWorld.js)
    updateHpUI(); // Show initial HP
    updateExperienceUI(); // Show initial EXP/Level

    // --- Display Wallet Address ---
    const walletAddressElement = document.getElementById('user-wallet-address');
    const storedStakeAddress = localStorage.getItem('playerCardanoStakeAddress');
    if (walletAddressElement && storedStakeAddress) {
        const truncatedAddress = `${storedStakeAddress.substring(0, 10)}...${storedStakeAddress.substring(storedStakeAddress.length - 6)}`;
        walletAddressElement.textContent = truncatedAddress;
        walletAddressElement.title = storedStakeAddress; // Show full address on hover
    } else if (walletAddressElement) {
        walletAddressElement.textContent = 'Error loading address';
    }
    // --- REMOVED Show/Hide Link Wallet Button based on Guest Status ---


    // --- Protection Book Interactivity ---
    if (controlledBusinessesListElement) {
        controlledBusinessesListElement.addEventListener('click', (event) => {
            console.log("Click detected inside protection book list."); // Log: Listener fired
            const target = event.target;
            const listItem = target.closest('.controlled-business-item');
            console.log("Clicked target:", target); // Log: Click target

            if (!listItem) {
                console.log("Click was outside a list item."); // Log: Click outside item
                // Hide all buttons if clicking outside any item
                controlledBusinessesListElement.querySelectorAll('.remove-protection-btn').forEach(btn => {
                    btn.style.display = 'none';
                });
                return;
            }

            console.log("Clicked list item:", listItem); // Log: Found list item
            const businessId = listItem.dataset.businessId;
            const removeButton = listItem.querySelector('.remove-protection-btn');
            console.log("Found remove button:", removeButton); // Log: Found button element

            if (target.classList.contains('remove-protection-btn')) {
                // Clicked the "Remove" button itself
                console.log(`Remove button clicked for business ID: ${businessId}`); // Log: Button click
                if (typeof removePlayerProtection === 'function') {
                    removePlayerProtection(businessId); // Call function in gameWorld.js
                } else {
                    console.error("removePlayerProtection function not found in gameWorld.js");
                    showCustomAlert("Error: Cannot remove protection.");
                }
            } else if (removeButton) {
                // Clicked the list item (or its children), but NOT the remove button
                console.log(`List item clicked (not button) for business ID: ${businessId}`); // Log: Item click

                // Determine if the button for *this* item was already visible
                const wasThisButtonVisible = removeButton.style.display !== 'none';

                // First, hide ALL remove buttons unconditionally
                controlledBusinessesListElement.querySelectorAll('.remove-protection-btn').forEach(btn => {
                    btn.style.display = 'none';
                });

                // If this item's button was NOT visible before, show it now.
                if (!wasThisButtonVisible) {
                    removeButton.style.display = 'inline-block'; // Use inline-block for button
                    console.log(`Showing remove button for ${businessId}`); // Log: Showing button
                } else {
                    console.log(`Hiding remove button for ${businessId} (was already visible)`); // Log: Hiding button (because it was clicked again or background was clicked)
                }
            } else {
                 console.log("Clicked list item, but no remove button found within it."); // Log: Button missing?
            }
        });
    } else {
        console.error("Controlled businesses list element not found for interaction listener.");
    }

    // --- How to Play Modal Listeners ---
    const howToPlayModal = document.getElementById('how-to-play-modal');
    const closeHowToPlayBtn = document.getElementById('close-how-to-play-btn');

    if (closeHowToPlayBtn) {
        closeHowToPlayBtn.addEventListener('click', closeHowToPlayModal);
    } else {
        console.error("Close button for How to Play modal not found!");
    }

    if (howToPlayModal) {
        howToPlayModal.addEventListener('click', (event) => {
            // Close only if clicking the background, not the content
            if (event.target === howToPlayModal) {
                closeHowToPlayModal();
            }
        });
    } else {
        console.error("How to Play modal element not found for background click listener.");
    }

    // --- Leaderboard Modal Functions ---
    async function openLeaderboardModal() { // Make async
        if (leaderboardModal) {
            // Fetch data when opening
            updateLeaderboardUI([], 'money'); // Show loading initially
            updateLeaderboardUI([], 'power'); // Show loading initially
            leaderboardModal.classList.remove('modal-hidden');
            console.log("Leaderboard modal opened. Fetching data...");

            // Fetch both leaderboards
            if (typeof SaveManager !== 'undefined' && SaveManager.fetchLeaderboard) {
                const moneyResult = await SaveManager.fetchLeaderboard('money');
                if (moneyResult.error) {
                    console.error("Error fetching money leaderboard:", moneyResult.error);
                    updateLeaderboardUI(null, 'money', 'Error loading data.'); // Show error
                } else {
                    updateLeaderboardUI(moneyResult.data, 'money');
                }

                const powerResult = await SaveManager.fetchLeaderboard('power');
                 if (powerResult.error) {
                    console.error("Error fetching power leaderboard:", powerResult.error);
                    updateLeaderboardUI(null, 'power', 'Error loading data.'); // Show error
                } else {
                    updateLeaderboardUI(powerResult.data, 'power');
                }
            } else {
                console.error("SaveManager.fetchLeaderboard not available!");
                updateLeaderboardUI(null, 'money', 'Error: Fetch function missing.');
                updateLeaderboardUI(null, 'power', 'Error: Fetch function missing.');
            }

            switchLeaderboardTab('money'); // Default to money tab after fetching

        } else {
            console.error("Leaderboard modal element not found!");
            showCustomAlert("Error: Leaderboard unavailable.");
        }
    }

    function closeLeaderboardModal() {
        if (leaderboardModal) {
            leaderboardModal.classList.add('modal-hidden');
            console.log("Leaderboard modal closed.");
        }
    }

    async function switchLeaderboardTab(tabType) { // Make async
        if (!moneyTabBtn || !powerTabBtn || !moneyContent || !powerContent) return;

        // Update tab/content visibility immediately
        if (tabType === 'money') {
            moneyTabBtn.classList.add('active-tab');
            powerTabBtn.classList.remove('active-tab');
            moneyContent.classList.add('active-content');
            powerContent.classList.remove('active-content');
        } else if (tabType === 'power') {
            powerTabBtn.classList.add('active-tab');
            moneyTabBtn.classList.remove('active-tab');
            powerContent.classList.add('active-content');
            moneyContent.classList.remove('active-content');
        }

        // Fetch data for the selected tab if needed (or rely on initial fetch in openLeaderboardModal)
        // Optional: Re-fetch on tab switch if data might be stale
        // console.log(`Switched to ${tabType} tab. Optionally re-fetching...`);
        // if (typeof SaveManager !== 'undefined' && SaveManager.fetchLeaderboard) {
        //     updateLeaderboardUI(null, tabType, 'Loading...'); // Show loading
        //     const result = await SaveManager.fetchLeaderboard(tabType);
        //     if (result.error) {
        //         console.error(`Error fetching ${tabType} leaderboard on switch:`, result.error);
        //         updateLeaderboardUI(null, tabType, 'Error loading data.');
        //     } else {
        //         updateLeaderboardUI(result.data, tabType);
        //     }
        // }
    }

    // Updated function to handle data structure and loading/error states
    function updateLeaderboardUI(data, type, message = null) {
        const listElement = type === 'money' ? moneyList : powerList;
        if (!listElement) return;

        listElement.innerHTML = ''; // Clear previous entries

        if (message) {
            listElement.innerHTML = `<li>${message}</li>`; // Show loading/error message
            return;
        }

        if (!data || data.length === 0) {
            listElement.innerHTML = '<li>No data available.</li>';
            return;
        }

        // Data structure from fetchLeaderboard: { username, level, money, power }
        // Data structure from fetchLeaderboard: { username, alias, level, money, power }
        data.forEach((entry, index) => {
            const listItem = document.createElement('li');
            const score = type === 'money' ? entry.money : entry.power;
            // Use username, fallback to alias, then fallback to generic User #
            const playerName = entry.username || entry.alias || `User #${index + 1}`;

            listItem.innerHTML = `
                <span>${index + 1}. <span class="player-name">${playerName}</span> (Lvl ${entry.level || '?'})</span>
                <span class="player-score">${type === 'money' ? '$' : ''}${score !== null && score !== undefined ? score.toLocaleString() : 'N/A'}</span>
            `;
            listElement.appendChild(listItem);
        });
    }

    // --- Leaderboard Modal Listeners ---
    if (actionLeaderboardBtn) {
        actionLeaderboardBtn.addEventListener('click', openLeaderboardModal);
    } else {
        console.error("Leaderboard action button not found.");
    }

    if (closeLeaderboardBtn) {
        closeLeaderboardBtn.addEventListener('click', closeLeaderboardModal);
    } else {
        console.error("Leaderboard close button not found.");
    }

    if (leaderboardModal) {
        leaderboardModal.addEventListener('click', (event) => {
            if (event.target === leaderboardModal) {
                closeLeaderboardModal();
            }
        });
    } else {
        console.error("Leaderboard modal element not found for background click listener.");
    }

    if (moneyTabBtn) {
        moneyTabBtn.addEventListener('click', () => switchLeaderboardTab('money'));
    } else {
        console.error("Leaderboard money tab button not found.");
    }

    if (powerTabBtn) {
        powerTabBtn.addEventListener('click', () => switchLeaderboardTab('power'));
    } else {
    console.error("Leaderboard power tab button not found.");
    }

    // --- REMOVED Link Wallet Button Listener ---


    // --- SUI Wallet Integration Listeners ---
    document.addEventListener('suiWalletConnected', (event) => {
        console.log('uiManager received suiWalletConnected:', event.detail);
        if (event.detail && event.detail.address) {
            updatePlayerIdentityUI(event.detail);
        }
    });

    document.addEventListener('suiWalletDisconnected', () => {
        console.log('uiManager received suiWalletDisconnected');
        clearPlayerIdentityUI();
    });

    // Initial check in case wallet connected before this script ran (e.g., autoConnect)
    if (window.suiWallet && window.suiWallet.connected && window.suiWallet.address) {
         console.log('uiManager performing initial identity update for already connected wallet.');
         updatePlayerIdentityUI(window.suiWallet);
    }

    // --- Inventory Tab & Pagination Listeners ---
    const inventoryTabsContainer = document.querySelector('#inventory-modal .inventory-tabs');
    const inventoryPaginationContainer = document.getElementById('inventory-pagination');

    if (inventoryTabsContainer) {
        inventoryTabsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('tab-btn')) {
                const selectedCategory = event.target.dataset.category;
                if (selectedCategory && selectedCategory !== currentInventoryCategory) {
                    // Remove active class from all tabs
                    inventoryTabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
                    // Add active class to the clicked tab
                    event.target.classList.add('active-tab');
                    // Reset to page 1 when changing category and update UI
                    updateInventoryUI(selectedCategory, 1);
                }
            }
        });
    } else {
        console.error("Inventory tabs container not found!");
    }

    if (inventoryPaginationContainer) {
        inventoryPaginationContainer.addEventListener('click', (event) => {
            const prevBtn = document.getElementById('inventory-prev-btn');
            const nextBtn = document.getElementById('inventory-next-btn');
            let newPage = currentInventoryPage;

            if (event.target.id === 'inventory-prev-btn' && !prevBtn.disabled) {
                newPage = Math.max(1, currentInventoryPage - 1);
            } else if (event.target.id === 'inventory-next-btn' && !nextBtn.disabled) {
                // Need to recalculate totalPages based on current filter to ensure 'Next' doesn't go too far
                // This is a simplified approach; ideally, totalPages is stored or recalculated cleanly
                const totalFilteredItems = playerInventory.filter(invEntry => {
                     const itemDef = itemsDatabase.get(invEntry.id) || equipmentDatabase.get(invEntry.id);
                     if (!itemDef) return false;
                     if (currentInventoryCategory === 'all') return true;

                     const itemEquipmentType = itemDef.equipmentType;
                     const itemPrimaryCategory = itemDef.category ? itemDef.category.toLowerCase() : null;
                     const suitTypes = [EquipmentType.HEAD, EquipmentType.MASK, EquipmentType.BODY, EquipmentType.GLOVES, EquipmentType.PANTS, EquipmentType.BOOTS, EquipmentType.ACCESSORY, EquipmentType.CHARM];

                     switch (currentInventoryCategory) {
                         case 'weapon': return itemEquipmentType === EquipmentType.WEAPON;
                         case 'suit': return suitTypes.includes(itemEquipmentType);
                         case 'housing-plots': return itemPrimaryCategory === 'housing' || itemPrimaryCategory === 'plots' || itemPrimaryCategory === 'housing-plots';
                         case 'pets': return itemPrimaryCategory === 'pets';
                         case 'painting': return itemPrimaryCategory === 'painting';
                         default: return itemPrimaryCategory === currentInventoryCategory;
                     }
                 }).length;
                 let totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
                 totalPages = Math.max(1, Math.min(totalPages, 5)); // Apply max 5 pages limit

                newPage = Math.min(totalPages, currentInventoryPage + 1);
            }

            if (newPage !== currentInventoryPage) {
                updateInventoryUI(currentInventoryCategory, newPage);
            }
        });
    } else {
        console.error("Inventory pagination container not found!");
    }

    // --- Logout Button Listener ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log("Logout button clicked.");
            const isGuest = localStorage.getItem('isGuestSession') === 'true';

            if (!isGuest) {
                // Only remove the stake address if it's a real wallet user logging out
                console.log("Wallet user logging out. Clearing auth token.");
                localStorage.removeItem('playerCardanoStakeAddress');
            } else {
                console.log("Guest user logging out. Keeping guest ID temporarily for potential wallet linking.");
                // Optionally remove the guest flag now, although auth.js also handles this
                // localStorage.removeItem('isGuestSession');
            }

            // Optional: Clear other relevant session data if needed (do this for both guest/wallet)
            // localStorage.removeItem('playerUsername'); // Example
            // localStorage.removeItem('playerAlias'); // Example
            // localStorage.clear(); // Use with caution - clears everything

            // Redirect to login page
            window.location.href = 'login.html';
        });
    } else {
        console.error("Logout button not found!");
    }


}); // Close DOMContentLoaded listener


// --- SUI Wallet UI Update Functions ---

function updatePlayerIdentityUI(walletInfo) {
    if (!walletInfo || !walletInfo.address) return;

    const truncatedAddress = `${walletInfo.address.substring(0, 6)}...${walletInfo.address.substring(walletInfo.address.length - 4)}`;

    // Update bottom bar alias
    if (playerAliasBar) {
        playerAliasBar.textContent = `Wallet: ${truncatedAddress}`;
        playerAliasBar.title = `Connected SUI Wallet: ${walletInfo.address}`; // Tooltip with full address
    }

    // Disable manual inputs
    if (usernameInput) {
        usernameInput.disabled = true;
        usernameInput.placeholder = 'Wallet Connected';
        // Optionally clear the input value if desired
        // usernameInput.value = '';
    }
    if (aliasInput) {
        aliasInput.disabled = true;
        aliasInput.placeholder = 'Wallet Connected';
         // Optionally clear the input value if desired
        // aliasInput.value = '';
    }
    if (saveUserInfoBtn) {
        saveUserInfoBtn.disabled = true;
        saveUserInfoBtn.title = 'User info managed by connected wallet';
    }

    // Potentially update other UI elements or trigger game logic updates
    console.log(`Player identity updated to SUI Wallet: ${walletInfo.address}`);

    // TODO: Consider updating currentPlayerId in gameWorld.js or fetching player data based on wallet address
}

function clearPlayerIdentityUI() {
    // Restore bottom bar alias (use stored alias or default)
    if (playerAliasBar) {
        playerAliasBar.textContent = playerAlias || 'Alias'; // Use global playerAlias from gameWorld.js
        playerAliasBar.title = ''; // Clear wallet tooltip
    }

    // Re-enable manual inputs, respecting the username lock state
    if (usernameInput) {
        // Only re-enable if it wasn't previously locked by saving a username
        const wasLockedBySave = usernameInput.readOnly;
        usernameInput.disabled = wasLockedBySave; // Keep disabled if it was readOnly
        usernameInput.placeholder = 'Enter username';
        // Restore value if needed, or rely on loadUserInfo
        // usernameInput.value = playerUsername || '';
    }
    if (aliasInput) {
        aliasInput.disabled = false;
        aliasInput.placeholder = 'Enter alias';
         // Restore value if needed, or rely on loadUserInfo
        // aliasInput.value = playerAlias || '';
    }
    if (saveUserInfoBtn) {
        saveUserInfoBtn.disabled = false;
        saveUserInfoBtn.title = '';
    }

    console.log("Player identity UI cleared (wallet disconnected).");

    // TODO: Consider resetting currentPlayerId or loading default player data
}

// --- NFT Title UI Functions ---

/**
 * Updates the player title display on the dashboard.
 * @param {string} title - The title to display (or empty string to remove).
 */
function updatePlayerTitleUI(title) {
    const titleSection = document.getElementById('player-title-section');
    const titleDisplay = document.getElementById('player-title-display');

    if (titleSection && titleDisplay) {
        if (title) {
            titleDisplay.textContent = title;
            titleSection.style.display = 'flex'; // Show the section (using flex like others)
        } else {
            titleDisplay.textContent = '';
            titleSection.style.display = 'none'; // Hide the section
        }
        console.log(`Dashboard title display updated: ${title || '(None)'}`);
    } else {
        console.error("Player title UI elements not found in dashboard!");
    }
}

/**
 * Applies or removes the glow effect CSS class from the player marker.
 * @param {boolean} hasGlow - Whether to apply the glow effect.
 */
function applyPlayerMarkerGlow(hasGlow) {
    // userMarker is a global variable from gameWorld.js
    if (userMarker) {
        const markerElement = userMarker.getElement(); // Get the marker's HTML element
        if (markerElement) {
            if (hasGlow) {
                markerElement.classList.add('nft-glow-effect');
                console.log("Applied NFT glow effect to player marker.");
            } else {
                markerElement.classList.remove('nft-glow-effect');
                console.log("Removed NFT glow effect from player marker.");
            }
        } else {
            console.warn("Could not get player marker element to apply/remove glow.");
        }
    } else {
        console.warn("Player marker (userMarker) not found, cannot apply/remove glow.");
    }
}

// --- Housing Modal UI Functions ---

// Function to update the housing preview layers
function updateHousingPreview() {
    const previewArea = document.getElementById('housing-preview');
    if (!previewArea) return;

    const housingSlots = [
        { slot: EquipmentType.BASE, elementId: 'housing-layer-base' },
        { slot: EquipmentType.WALL_DECORATION, elementId: 'housing-layer-wall' },
        { slot: EquipmentType.WEAPON_STASH, elementId: 'housing-layer-weapon' },
        { slot: EquipmentType.LUXURY_FURNITURE, elementId: 'housing-layer-furniture' },
        { slot: EquipmentType.SECURITY_SYSTEM, elementId: 'housing-layer-security' }
    ];

    housingSlots.forEach(({ slot, elementId }) => {
        const imgElement = document.getElementById(elementId);
        if (!imgElement) {
            console.error(`Housing preview image element not found: #${elementId}`);
            return;
        }

        const equippedItemId = playerEquipment[slot]; // Get ID from gameWorld.js playerEquipment
        if (equippedItemId) {
            const item = getEquipmentById(equippedItemId); // From equipment.js
            if (item && item.image) {
                imgElement.src = item.image;
                imgElement.alt = item.name;
                imgElement.style.display = 'block'; // Show the layer
            } else {
                // Item equipped but no image or definition found
                imgElement.src = '';
                imgElement.alt = `${slot} (Error)`;
                imgElement.style.display = 'none'; // Hide layer if error
                console.warn(`Housing item ${equippedItemId} in slot ${slot} has no image or definition.`);
            }
        } else {
            // No item equipped in this slot
            imgElement.src = '';
            imgElement.alt = `${slot} Layer (Empty)`;
            imgElement.style.display = 'none'; // Hide the layer
        }
    });
    console.log("Housing preview updated.");
}

// Function to populate the housing item selector for a given slot type
function populateHousingSelector(slotType) {
    const selectorGrid = document.getElementById('housing-selector-grid');
    const selectorTitle = document.querySelector('#housing-item-selector h3');
    if (!selectorGrid || !selectorTitle) {
        console.error("Housing item selector grid or title element not found.");
        return;
    }

    selectorTitle.textContent = `Select Item for ${slotType}`;
    selectorGrid.innerHTML = ''; // Clear previous items

    // Filter player inventory for items matching the slotType
    const availableItems = playerInventory.filter(invEntry => {
        const itemDef = getEquipmentById(invEntry.id);
        return itemDef && itemDef.equipmentType === slotType;
    });

    if (availableItems.length === 0) {
        selectorGrid.innerHTML = '<p style="color: #888; text-align: center; grid-column: 1 / -1;">No suitable items in inventory.</p>';
        return;
    }

    // Populate the grid
    availableItems.forEach(invEntry => {
        const itemDef = getEquipmentById(invEntry.id);
        if (!itemDef) return; // Should not happen due to filter, but safety check

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('selector-item'); // Use the CSS class defined
        itemDiv.dataset.itemId = itemDef.id;
        itemDiv.title = `${itemDef.name}\n${itemDef.description || ''}`;

        if (itemDef.image) { // Prefer item image if available
            const img = document.createElement('img');
            img.src = itemDef.image; // Use housing image
            img.alt = itemDef.name;
            itemDiv.appendChild(img);
        } else if (itemDef.icon) { // Fallback to icon
             const img = document.createElement('img');
             img.src = itemDef.icon;
             img.alt = itemDef.name;
             itemDiv.appendChild(img);
        } else {
            // Fallback text
            const nameSpan = document.createElement('span');
            nameSpan.textContent = itemDef.name.substring(0, 3);
            itemDiv.appendChild(nameSpan);
        }

        // Optional: Add quantity if housing items become stackable in inventory (unlikely)
        // if (invEntry.quantity > 1) { ... }

        // Apply rarity glow to selector item
        itemDiv.classList.remove('rarity-glow-common', 'rarity-glow-uncommon', 'rarity-glow-rare', 'rarity-glow-epic', 'rarity-glow-legendary', 'rarity-glow-mythic', 'rarity-glow-god-tier'); // Clear existing glows
        if (itemDef.rarity && typeof Rarity !== 'undefined') {
            const rarityKey = (typeof itemDef.rarity === 'object' ? itemDef.rarity.name : itemDef.rarity).toUpperCase().replace('-', '_');
            const rarityInfo = Rarity[rarityKey];
            if (rarityInfo) {
                const glowClass = `rarity-glow-${rarityInfo.name.toLowerCase().replace(' ', '-')}`;
                itemDiv.classList.add(glowClass);
                itemDiv.style.borderColor = rarityInfo.color || '#5a4a3a'; // Also set border color
            } else {
                 itemDiv.style.borderColor = '#5a4a3a'; // Default border
            }
        } else {
             itemDiv.style.borderColor = '#5a4a3a'; // Default border
        }


        selectorGrid.appendChild(itemDiv);
    });
}

// Make updateHousingPreview globally accessible if needed (e.g., called from gameWorld.js)
window.updateHousingPreview = updateHousingPreview;
