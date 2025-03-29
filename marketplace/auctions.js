document.addEventListener('DOMContentLoaded', async () => {
    // --- Configuration (Should match other scripts) ---
    const blockfrostApiKey = 'mainnety7Re6jhIWAYFvZRa2tmXJLlObstUswUU';
    const blockfrostApiUrl = 'https://cardano-mainnet.blockfrost.io/api/v0';
    const ipfsGateway = 'https://ipfs.io/ipfs/';
    const sampleCollections = { // Use a few collections for variety
        "Clay Nation": '40fa2aa67258b4ce7b5782f74831d46a84c59a0ff0c28262fab21728',
        "Boss Cat Rocket Club": 'c364930bd612f42e14d156e1c5410511e77f64cab8f2367a9df544d1',
        "DEADPXLZ": '1ec85dcee27f2d90ec1f9a1e4ce74a667dc9be8b184463223f9c9601'
    };

    // --- DOM Elements ---
    const auctionGrid = document.getElementById('auction-grid');
    const terminalPopup = document.getElementById('terminal-popup'); // Optional: for messages
    const terminalMessage = document.getElementById('terminal-message');
    const closeTerminalBtn = terminalPopup?.querySelector('.close-btn');

    // --- Helper Functions ---
     function showTerminalMessage(message) {
        if (terminalMessage && terminalPopup) {
            terminalMessage.textContent = `> ${message}`;
            terminalPopup.classList.remove('hidden');
        } else {
            console.log('[System Message]', message);
        }
    }

    if (closeTerminalBtn) {
        closeTerminalBtn.addEventListener('click', () => terminalPopup.classList.add('hidden'));
    }

    function getImageUrl(metadata) {
        if (metadata?.image) {
            const imageField = Array.isArray(metadata.image) ? metadata.image.join('') : metadata.image;
            if (imageField.startsWith('ipfs://')) {
                return ipfsGateway + imageField.substring(7);
            }
            return imageField;
        }
        return null;
    }

    // Format time remaining (simple example)
    function formatTime(seconds) {
        if (seconds <= 0) return "ENDED";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // --- Core Logic ---
    async function loadAuctions() {
        auctionGrid.innerHTML = '<p class="loading-text">[LOADING LIVE AUCTIONS...]</p>';

        try {
            let auctionItems = [];
            // Fetch 1-2 assets from each sample collection
            for (const policyId of Object.values(sampleCollections)) {
                 try {
                    const assetsResponse = await fetch(`${blockfrostApiUrl}/assets/policy/${policyId}?count=2`, {
                        headers: { project_id: blockfrostApiKey }
                    });
                    if (!assetsResponse.ok) continue; // Skip collection on error
                    const assets = await assetsResponse.json();

                    for (const assetInfo of assets) {
                         const assetId = assetInfo.asset;
                         const detailsResponse = await fetch(`${blockfrostApiUrl}/assets/${assetId}`, {
                             headers: { project_id: blockfrostApiKey }
                         });
                         if (!detailsResponse.ok) continue;
                         const assetDetails = await detailsResponse.json();

                         const metadata = assetDetails.onchain_metadata;
                         const name = metadata?.name || assetDetails.asset_name || 'Unknown Asset';
                         const imageUrl = getImageUrl(metadata);

                         // Simulate auction data
                         const currentBid = (Math.random() * 1000 + 50).toFixed(0);
                         const endTime = Date.now() + Math.floor(Math.random() * 3600 * 6 + 300) * 1000; // Ends in 5min to 6 hours

                         auctionItems.push({ assetId, name, imageUrl, currentBid, endTime });
                    }
                 } catch (fetchError) {
                     console.warn(`Error fetching assets for auction policy ${policyId}:`, fetchError);
                 }
            }

            if (auctionItems.length === 0) {
                auctionGrid.innerHTML = '<p class="error-text">[NO LIVE AUCTIONS FOUND]</p>';
                return;
            }

            auctionGrid.innerHTML = ''; // Clear loading

            // Display auction items and start timers
            auctionItems.forEach(item => {
                const card = document.createElement('div');
                card.classList.add('auction-card'); // Use auction-specific style
                const timeRemainingElementId = `time-${item.assetId}`;

                card.innerHTML = `
                    <div class="nft-image-placeholder" style="background-image: url('${item.imageUrl || ''}'); background-size: cover; background-position: center;">
                        ${!item.imageUrl ? 'NO_SIGNAL' : ''}
                    </div>
                    <div class="auction-info">
                        <p class="nft-name" title="${item.assetId}">${item.name}</p>
                        <p class="auction-bid">Current Bid: ${item.currentBid} ADA</p>
                        <p class="auction-time" id="${timeRemainingElementId}">Time Left: [CALCULATING...]</p>
                        <button class="bid-btn" data-asset-id="${item.assetId}">[PLACE_BID]</button>
                    </div>
                `;

                 card.querySelector('.bid-btn').addEventListener('click', (e) => {
                     const assetId = e.target.getAttribute('data-asset-id');
                     showTerminalMessage(`Accessing bid interface for ${item.name} (${assetId})... Feature pending.`);
                     // Real implementation would open a bidding modal/interface
                 });

                auctionGrid.appendChild(card);

                // Start countdown timer for this item
                const timerInterval = setInterval(() => {
                    const timeElement = document.getElementById(timeRemainingElementId);
                    if (!timeElement) { // Stop if element is removed
                        clearInterval(timerInterval);
                        return;
                    }
                    const now = Date.now();
                    const secondsLeft = Math.max(0, Math.floor((item.endTime - now) / 1000));
                    timeElement.textContent = `Time Left: ${formatTime(secondsLeft)}`;
                    if (secondsLeft === 0) {
                        clearInterval(timerInterval);
                        // Optionally update card style for ended auction
                        card.style.opacity = '0.6';
                        card.querySelector('.bid-btn').disabled = true;
                        card.querySelector('.bid-btn').textContent = '[ENDED]';
                    }
                }, 1000);
            });

        } catch (error) {
            console.error('Error loading auctions:', error);
            auctionGrid.innerHTML = `<p class="error-text">[ERROR LOADING AUCTIONS: ${error.message}]</p>`;
            showTerminalMessage(`Error loading auctions: ${error.message}`);
        }
    }

    // --- Initialization ---
    loadAuctions();
});
