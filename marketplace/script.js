document.addEventListener('DOMContentLoaded', () => {
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const walletStatus = document.getElementById('wallet-status');
    const terminalPopup = document.getElementById('terminal-popup');
    const terminalMessage = document.getElementById('terminal-message');
    const closeTerminalBtn = terminalPopup.querySelector('.close-btn');
    const holographicDisplay = document.querySelector('.holographic-display');
    const collectionGrid = document.querySelector('.collection-grid'); // Get the new grid element
    const liveFeedOutput = document.querySelector('.terminal-output');

    // --- API Configuration ---
    const blockfrostApiKey = 'mainnety7Re6jhIWAYFvZRa2tmXJLlObstUswUU'; // Your provided key
    const blockfrostApiUrl = 'https://cardano-mainnet.blockfrost.io/api/v0';
    const sampleCollections = { // Renamed and structured for clarity
        "Budz": 'd5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc',
        "The Ape Society": '78015c70e9ef4f76c0f01465fe16f084c4e22b6c6c34bb1ce57668c3',
        "Clay Nation": '40fa2aa67258b4ce7b5782f74831d46a84c59a0ff0c28262fab21728',
        "Pavia": '4bf184e01e0f163296ab253edd60774e2d34367d0e7b6cbc689b567d',
        "Boss Cat Rocket Club": 'c364930bd612f42e14d156e1c5410511e77f64cab8f2367a9df544d1',
        "Chilled Kongs": 'c56d4cceb8a8550534968e1bf165137ca41e908d2d780cc1402079bd',
        "Cornucopias Land": '07b39a8ead0ef1e3054e816a3b6910060beaf2210fded63fb90ce137',
        "DEADPXLZ": '1ec85dcee27f2d90ec1f9a1e4ce74a667dc9be8b184463223f9c9601'
    };
    const ipfsGateway = 'https://ipfs.io/ipfs/'; // Standard IPFS gateway

    // --- Wallet Connection (Placeholder) ---
    let isWalletConnected = false; // Keep track visually, but don't simulate connection

    connectWalletBtn.addEventListener('click', () => {
        // Show the specific message requested
        showTerminalMessage("This Feature will soon available when LOVELACE NFT's Are online");
        // Do not change button text or status indicator for now
        // isWalletConnected = !isWalletConnected;
        // updateWalletStatus();
    });

    // Keep updateWalletStatus function for initial setup, but it won't be called on click anymore
    function updateWalletStatus() {
        if (isWalletConnected) {
            walletStatus.textContent = '[ONLINE]';
            walletStatus.classList.remove('disconnected');
            walletStatus.classList.add('connected');
            connectWalletBtn.textContent = '[DISCONNECT]';
        } else {
            walletStatus.textContent = '[OFFLINE]';
            walletStatus.classList.remove('connected');
            walletStatus.classList.add('disconnected');
            connectWalletBtn.textContent = '[CONNECT_WALLET]';
        }
    }

    // --- Terminal Pop-up ---
    function showTerminalMessage(message) {
        terminalMessage.textContent = `> ${message}`;
        terminalPopup.classList.remove('hidden');
        // Auto-close after a few seconds? Or require manual close? Manual for now.
    }

    closeTerminalBtn.addEventListener('click', () => {
        terminalPopup.classList.add('hidden');
    });

    // --- Content Loading ---

    // Fetch and display featured NFTs from Blockfrost
    async function loadFeaturedNFTs() {
        holographicDisplay.innerHTML = '<p class="loading-text">[FETCHING FEATURED ASSETS...]</p>'; // Show loading state

        const featuredCollectionPolicyId = sampleCollections["The Ape Society"]; // Feature The Ape Society
        const count = 3; // Number of assets to fetch

        try {
            // 1. Fetch assets under the policy
            const assetsResponse = await fetch(`${blockfrostApiUrl}/assets/policy/${featuredCollectionPolicyId}?count=${count}`, {
                headers: { project_id: blockfrostApiKey }
            });
            if (!assetsResponse.ok) throw new Error(`Blockfrost Error (Featured Assets): ${assetsResponse.statusText}`);
            const assets = await assetsResponse.json();

            if (!assets || assets.length === 0) {
                 holographicDisplay.innerHTML = '<p class="error-text">[NO ASSETS FOUND FOR POLICY]</p>';
                 return;
            }

            holographicDisplay.innerHTML = ''; // Clear loading state

            // 2. Fetch details for each asset
            for (const assetInfo of assets) {
                const assetId = assetInfo.asset;
                const assetDetailsResponse = await fetch(`${blockfrostApiUrl}/assets/${assetId}`, {
                    headers: { project_id: blockfrostApiKey }
                });
                if (!assetDetailsResponse.ok) {
                    console.warn(`Could not fetch details for asset ${assetId}: ${assetDetailsResponse.statusText}`);
                    continue; // Skip this asset if details fail
                }
                const assetDetails = await assetDetailsResponse.json();

                // Extract relevant metadata (handle potential variations)
                const metadata = assetDetails.onchain_metadata;
                const name = metadata?.name || assetDetails.asset_name || 'Unknown Asset';
                let imageUrl = null;

                if (metadata?.image) {
                    // Handle different image formats (string or array)
                    const imageField = Array.isArray(metadata.image) ? metadata.image.join('') : metadata.image;
                    if (imageField.startsWith('ipfs://')) {
                        imageUrl = ipfsGateway + imageField.substring(7);
                    } else {
                        // Handle other potential URL formats if necessary
                        imageUrl = imageField; // Assume it's a direct URL (less common)
                    }
                }

                // Create and append NFT card
                const card = document.createElement('div');
                card.classList.add('nft-card');
                 if (Math.random() > 0.7) card.classList.add('glitch'); // Optional glitch

                card.innerHTML = `
                    <div class="nft-image-placeholder" style="background-image: url('${imageUrl || ''}'); background-size: cover; background-position: center;">
                        ${!imageUrl ? 'NO_SIGNAL' : ''}
                    </div>
                    <div class="nft-info">
                        <p class="nft-name">${name}</p>
                        <p class="nft-price">[PRICE_UNAVAILABLE]</p> <!-- Price requires marketplace data -->
                        <button class="view-btn" data-asset-id="${assetId}">[VIEW_ASSET]</button>
                    </div>
                `;

                card.querySelector('.view-btn').addEventListener('click', (e) => {
                     const clickedAssetId = e.target.getAttribute('data-asset-id');
                     showTerminalMessage(`Querying blockchain for asset ${clickedAssetId}...`);
                     // Later: Implement detailed view fetch
                });

                holographicDisplay.appendChild(card);
            }

        } catch (error) {
            console.error('Error fetching featured NFTs:', error);
            holographicDisplay.innerHTML = `<p class="error-text">[ERROR: FAILED TO LOAD ASSETS - ${error.message}]</p>`;
            showTerminalMessage(`Error loading featured assets: ${error.message}`);
        }
    }

    // Fetch and display the list of collections
    async function loadCollectionList() {
        collectionGrid.innerHTML = '<p class="loading-text">[SCANNING COLLECTION REGISTRIES...]</p>'; // Loading state

        try {
            const collectionPromises = Object.entries(sampleCollections).map(async ([name, policyId]) => {
                try {
                    // Fetch just one asset to get metadata (like image)
                    const assetResponse = await fetch(`${blockfrostApiUrl}/assets/policy/${policyId}?count=1`, {
                        headers: { project_id: blockfrostApiKey }
                    });
                    if (!assetResponse.ok) throw new Error(`Policy ${policyId}: ${assetResponse.statusText}`);
                    const assets = await assetResponse.json();
                    if (!assets || assets.length === 0) return null; // Skip if no assets found

                    const assetId = assets[0].asset;
                    const detailsResponse = await fetch(`${blockfrostApiUrl}/assets/${assetId}`, {
                        headers: { project_id: blockfrostApiKey }
                    });
                    if (!detailsResponse.ok) throw new Error(`Asset ${assetId}: ${detailsResponse.statusText}`);
                    const assetDetails = await detailsResponse.json();

                    const metadata = assetDetails.onchain_metadata;
                    let imageUrl = null;
                    if (metadata?.image) {
                        const imageField = Array.isArray(metadata.image) ? metadata.image.join('') : metadata.image;
                        if (imageField.startsWith('ipfs://')) {
                            imageUrl = ipfsGateway + imageField.substring(7);
                        } else {
                            imageUrl = imageField;
                        }
                    }
                    return { name, imageUrl, policyId }; // Return data needed for the card
                } catch (error) {
                    console.warn(`Failed to load sample asset for collection ${name} (${policyId}):`, error);
                    // Return minimal data even on failure to show the collection name
                    return { name, imageUrl: null, policyId };
                }
            });

            const collectionsData = (await Promise.all(collectionPromises)).filter(Boolean); // Wait for all fetches and remove nulls

            if (collectionsData.length === 0) {
                 collectionGrid.innerHTML = '<p class="error-text">[NO COLLECTION DATA RETRIEVED]</p>';
                 return;
            }

            collectionGrid.innerHTML = ''; // Clear loading state

            collectionsData.forEach(collection => {
                const card = document.createElement('div');
                card.classList.add('collection-card');
                card.innerHTML = `
                    <div class="collection-image-placeholder" style="background-image: url('${collection.imageUrl || ''}');">
                        ${!collection.imageUrl ? 'NO_SIGNAL' : ''}
                    </div>
                    <p class="collection-name">${collection.name}</p>
                    <button class="view-collection-btn" data-policy-id="${collection.policyId}" data-collection-name="${collection.name}">[VIEW]</button>
                `;
                 // Link the button to the collection page
                const viewButton = card.querySelector('.view-collection-btn');
                viewButton.addEventListener('click', (e) => {
                    const policyId = e.target.getAttribute('data-policy-id');
                    const collectionName = e.target.getAttribute('data-collection-name');
                    // Navigate to collection.html with parameters
                    window.location.href = `collection.html?policyId=${encodeURIComponent(policyId)}&name=${encodeURIComponent(collectionName)}`;
                });
                collectionGrid.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching collection list:', error);
            collectionGrid.innerHTML = `<p class="error-text">[ERROR: FAILED TO LOAD COLLECTIONS - ${error.message}]</p>`;
            showTerminalMessage(`Error loading collection list: ${error.message}`);
        }
    }


    // Simulate live feed updates (remains the same for now)
    function updateLiveFeed() {
        const feedTypes = ['LIST', 'SALE', 'BID'];
        const assets = ['GlitchPunk', 'Samurai', 'DataStream', 'CodeBreaker', 'SynthWave'];
        const randomType = feedTypes[Math.floor(Math.random() * feedTypes.length)];
        const randomAsset = assets[Math.floor(Math.random() * assets.length)] + ' #' + Math.floor(Math.random() * 1000);
        const randomPrice = (Math.random() * 500 + 50).toFixed(0) + ' ADA';
        const randomSeller = 'user_' + Math.random().toString(16).substring(2, 8);
        const timestamp = new Date().toLocaleTimeString();

        const newItem = document.createElement('p');
        newItem.classList.add('feed-item');
        newItem.textContent = `[${timestamp}] [${randomType}] [${randomAsset}] [${randomPrice}] [${randomSeller}]`;

        // Add to top and limit feed length
        liveFeedOutput.insertBefore(newItem, liveFeedOutput.children[3]); // Insert after the initial messages
        if (liveFeedOutput.children.length > 20) { // Keep feed size manageable
            liveFeedOutput.removeChild(liveFeedOutput.lastElementChild);
        }
    }

    // Initial setup
    updateWalletStatus(); // Set initial wallet state
    loadFeaturedNFTs(); // Load featured NFTs from Blockfrost
    loadCollectionList(); // Load collection list from Blockfrost
    setInterval(updateLiveFeed, 3000); // Keep simulated feed running

    console.log('Cyberpunk Marketplace Interface Initialized. Connecting to Blockfrost...');
    // Removed initial welcome message: showTerminalMessage('Welcome, Operator. System online. Awaiting commands.');
});
