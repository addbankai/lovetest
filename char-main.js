document.addEventListener('DOMContentLoaded', () => {
    const clickableElements = document.querySelectorAll('.clickable, button, a');
    const clickSound = document.getElementById('click-sound');
    const dateTimeElement = document.getElementById('current-datetime');

    // --- Sound Effects ---
    clickableElements.forEach(elem => {
        elem.addEventListener('click', (event) => {
            if (clickSound && !event.defaultPrevented) {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.error("Audio play failed:", e));
            }
        });
    });

    // --- Server Date & Time (UTC) ---
    function updateDateTime() {
         if (!dateTimeElement) return;
         const now = new Date();
         const utcString = now.toUTCString();
         dateTimeElement.textContent = `Server Time: ${utcString}`;
    }
    if (dateTimeElement) {
        updateDateTime();
        setInterval(updateDateTime, 1000);
    }

    // --- NEW: Rarity Sorting Logic ---
    const raritySortButton = document.getElementById('sort-by-rarity');
    const characterGrid = document.getElementById('character-grid');

    if (raritySortButton && characterGrid) {
        // Define the numerical order for rarities
        const rarityOrder = {
            'common': 1,
            'uncommon': 2,
            'rare': 3,
            'epic': 4,
            'legendary': 5
        };

        raritySortButton.addEventListener('click', () => {
            // 1. Get all character elements currently in the grid
            const characterEntries = Array.from(characterGrid.querySelectorAll('.character-entry'));

            // 2. Determine current sort order and toggle it
            const currentOrder = raritySortButton.getAttribute('data-sort-order');
            const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
            raritySortButton.setAttribute('data-sort-order', newOrder);

            // 3. Update button indicator
            const indicator = raritySortButton.querySelector('.sort-indicator');
            if (indicator) {
                indicator.textContent = newOrder === 'asc' ? '▲' : '▼';
            }
            raritySortButton.classList.add('active'); // Keep it marked active

            // 4. Sort the array
            characterEntries.sort((a, b) => {
                const rarityA = a.getAttribute('data-rarity');
                const rarityB = b.getAttribute('data-rarity');
                const orderA = rarityOrder[rarityA] || 0; // Default to 0 if rarity is unknown
                const orderB = rarityOrder[rarityB] || 0;

                if (newOrder === 'asc') {
                    return orderA - orderB; // Ascending (Common to Legendary)
                } else {
                    return orderB - orderA; // Descending (Legendary to Common)
                }
            });

            // 5. Re-append sorted elements
            // No need to clear, append moves existing elements
            characterEntries.forEach(entry => {
                characterGrid.appendChild(entry);
            });
        });
    }

}); // End DOMContentLoaded