document.addEventListener('DOMContentLoaded', async () => {
    // --- Configuration (Should match script.js) ---
    const blockfrostApiKey = 'mainnety7Re6jhIWAYFvZRa2tmXJLlObstUswUU';
    const blockfrostApiUrl = 'https://cardano-mainnet.blockfrost.io/api/v0';
    const ipfsGateway = 'https://ipfs.io/ipfs/';
    const assetsPerPage = 12; // Number of assets to display per page

    // --- DOM Elements ---
    const collectionTitle = document.getElementById('collection-title');
    const collectionPolicyIdDisplay = document.getElementById('collection-policy-id');
    const assetGrid = document.getElementById('asset-grid');
    const paginationControls = document.getElementById('pagination-controls');
    const searchInput = document.getElementById('collection-search-input'); // Added
    const searchButton = document.getElementById('collection-search-btn'); // Added
    const terminalPopup = document.getElementById('terminal-popup'); // Optional: for messages
    const terminalMessage = document.getElementById('terminal-message');
    const closeTerminalBtn = terminalPopup?.querySelector('.close-btn');

    // --- State ---
    let currentPage = 1;
    let currentPolicyId = null;
    let currentCollectionName = 'Unknown Collection'; // Default

    // --- Helper Functions ---
    function showTerminalMessage(message) {
        if (terminalMessage && terminalPopup) {
            terminalMessage.textContent = `> ${message}`;
            terminalPopup.classList.remove('hidden');
        } else {
            console.log('[System Message]', message); // Fallback if terminal elements aren't on page
        }
    }

    if (closeTerminalBtn) {
        closeTerminalBtn.addEventListener('click', () => terminalPopup.classList.add('hidden'));
    }

    // Function to safely get IPFS URL
    function getImageUrl(metadata) {
        if (metadata?.image) {
            const imageField = Array.isArray(metadata.image) ? metadata.image.join('') : metadata.image;
            if (imageField.startsWith('ipfs://')) {
                return ipfsGateway + imageField.substring(7);
            }
            return imageField; // Assume direct URL
        }
        return null;
    }

    // Function to filter currently displayed assets (Live Search)
    function filterDisplayedAssets(searchTerm) {
        const searchTermLower = searchTerm.toLowerCase().trim();
        const assetCards = assetGrid.querySelectorAll('.nft-card');
        let foundMatch = false;

        assetCards.forEach(card => {
            const nameElement = card.querySelector('.nft-name');
            const name = nameElement ? nameElement.textContent.toLowerCase() : '';
            const assetId = nameElement ? nameElement.getAttribute('title').toLowerCase() : ''; // Get asset ID from title

            // Check if search term is empty OR matches name OR matches asset ID
            if (searchTermLower === '' || name.includes(searchTermLower) || assetId.includes(searchTermLower)) {
                card.style.display = ''; // Show card if search is empty or name matches
                foundMatch = true;
            } else {
                card.style.display = 'none'; // Hide card if it doesn't match
            }
        });

        // Optional: Show a message if no assets match the search on the current page
        const noMatchMessage = assetGrid.querySelector('.no-match-message');
        if (!foundMatch && searchTermLower !== '') {
            if (!noMatchMessage) {
                const messageElement = document.createElement('p');
                messageElement.classList.add('error-text', 'no-match-message'); // Re-use error style
                messageElement.textContent = '[NO MATCHING ASSETS FOUND ON THIS PAGE]';
                assetGrid.appendChild(messageElement);
            }
        } else if (noMatchMessage) {
            noMatchMessage.remove(); // Remove message if matches are found or search is cleared
        }
    }

    // --- Core Logic ---

    // Function to fetch assets for a specific page
    async function fetchAssetsForPage(policyId, page) {
        assetGrid.innerHTML = `<p class="loading-text">[LOADING PAGE ${page}...]</p>`;
        paginationControls.innerHTML = ''; // Clear old controls

        try {
            // 1. Fetch assets for the current page
            const assetsResponse = await fetch(
                `${blockfrostApiUrl}/assets/policy/${policyId}?page=${page}&count=${assetsPerPage}&order=asc`, {
                    headers: { project_id: blockfrostApiKey }
                }
            );
            if (!assetsResponse.ok) throw new Error(`Blockfrost Error (Policy Assets Page ${page}): ${assetsResponse.statusText}`);
            const assetsPage = await assetsResponse.json();

            if (!assetsPage || assetsPage.length === 0) {
                assetGrid.innerHTML = `<p class="error-text">[NO ASSETS FOUND ON PAGE ${page}]</p>`;
                 // Add basic pagination even if empty
                 renderPagination(page, false); // Indicate no next page
                return;
            }

            assetGrid.innerHTML = ''; // Clear loading state

            // 2. Fetch details and addresses for each asset on the page
            const assetPromises = assetsPage.map(async (assetInfo) => {
                try {
                    const assetId = assetInfo.asset;
                    // Fetch details (name, image)
                    const detailsPromise = fetch(`${blockfrostApiUrl}/assets/${assetId}`, {
                        headers: { project_id: blockfrostApiKey }
                    }).then(res => res.ok ? res.json() : null);

                    // Fetch addresses (holder)
                    const addressesPromise = fetch(`${blockfrostApiUrl}/assets/${assetId}/addresses?count=1`, { // Only need the first/current holder
                        headers: { project_id: blockfrostApiKey }
                    }).then(res => res.ok ? res.json() : null);

                    const [details, addresses] = await Promise.all([detailsPromise, addressesPromise]);

                    const name = details?.onchain_metadata?.name || details?.asset_name || 'Unknown Asset';
                    const imageUrl = getImageUrl(details?.onchain_metadata);
                    const holderAddress = addresses && addresses.length > 0 ? addresses[0].address : 'Address Unavailable';

                    return { assetId, name, imageUrl, holderAddress };

                } catch (assetError) {
                    console.warn(`Failed to fetch full details for asset ${assetInfo.asset}:`, assetError);
                    return { assetId: assetInfo.asset, name: 'Error Loading', imageUrl: null, holderAddress: 'Error Loading' }; // Indicate error for this asset
                }
            });

            const assetsData = await Promise.all(assetPromises);

            // 3. Display assets
            assetsData.forEach(asset => {
                const card = document.createElement('div');
                card.classList.add('nft-card'); // Re-use NFT card styling
                card.innerHTML = `
                    <div class="nft-image-placeholder" style="background-image: url('${asset.imageUrl || ''}'); background-size: cover; background-position: center;">
                        ${!asset.imageUrl ? 'NO_SIGNAL' : ''}
                    </div>
                    <div class="nft-info">
                        <p class="nft-name" title="${asset.assetId}">${asset.name}</p>
                        <p class="asset-holder" title="${asset.holderAddress}">Holder: ${asset.holderAddress.substring(0, 10)}...${asset.holderAddress.substring(asset.holderAddress.length - 5)}</p>
                        <!-- Add View/Buy button if needed -->
                    </div>
                `;
                assetGrid.appendChild(card);
            });

            // 4. Render Pagination (Check if there might be a next page)
            renderPagination(page, assetsPage.length === assetsPerPage);

        } catch (error) {
            console.error(`Error fetching assets for page ${page}:`, error);
            assetGrid.innerHTML = `<p class="error-text">[ERROR LOADING ASSETS: ${error.message}]</p>`;
            showTerminalMessage(`Error loading assets: ${error.message}`);
             // Add basic pagination even on error
            renderPagination(page, false);
        }
    }

    // Function to render pagination controls
    function renderPagination(currentPage, hasNextPage) {
        paginationControls.innerHTML = ''; // Clear previous

        const prevButton = document.createElement('button');
        prevButton.textContent = '[PREV]';
        prevButton.disabled = currentPage <= 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                fetchAssetsForPage(currentPolicyId, currentPage - 1);
            }
        });

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPage}`;

        const nextButton = document.createElement('button');
        nextButton.textContent = '[NEXT]';
        nextButton.disabled = !hasNextPage; // Disable if Blockfrost returned less than max items
         nextButton.addEventListener('click', () => {
            if (hasNextPage) { // Only fetch next if we know there might be more
                 fetchAssetsForPage(currentPolicyId, currentPage + 1);
            }
        });


        paginationControls.appendChild(prevButton);
        paginationControls.appendChild(pageInfo);
        paginationControls.appendChild(nextButton);
    }

     // --- Initialization ---
    async function initializePage() {
        // Get policyId and name from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        currentPolicyId = urlParams.get('policyId');
        currentCollectionName = urlParams.get('name') || 'Unknown Collection'; // Get name if passed

        if (!currentPolicyId) {
            assetGrid.innerHTML = '<p class="error-text">[NO COLLECTION POLICY ID PROVIDED IN URL]</p>';
            collectionTitle.textContent = '// ERROR //';
            return;
        }

        // Update titles
        collectionTitle.textContent = `// COLLECTION: ${currentCollectionName} //`;
        collectionPolicyIdDisplay.textContent = `[POLICY_ID: ${currentPolicyId}]`;

        // Fetch the first page
        await fetchAssetsForPage(currentPolicyId, 1);

        // Add Live Search Event Listener after initial load
        if (searchInput) { // Only need the input field now
            searchInput.addEventListener('input', () => {
                // Trigger filter on every input change
                filterDisplayedAssets(searchInput.value);
            });
            // Remove button click and Enter key listeners as they are redundant for live search
        }
    }

    initializePage();
});
