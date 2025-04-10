// titleSystem.js - Handles NFT-based titles and bonuses

// Import Lucid and Blockfrost if not globally available (adjust path if needed)
import { Lucid, Blockfrost } from "https://unpkg.com/lucid-cardano@0.10.7/web/mod.js";

const NFT_POLICY_ID = '519e2c6df2bbf03797e5a6e3dda08a26e476446e679529d65bbac050';
const NFT_TITLE = "LOVELACE DIAMOND"; // Changed title

// --- Configuration (Replace with your Blockfrost Project ID) ---
// IMPORTANT: This MUST match the network your NFT is on (likely Mainnet)
const BLOCKFROST_PROJECT_ID_TITLE = 'mainnetx7tuiQLrIVt9zC2Z2KT14AWjKqg3mBGu'; // <<< Replaced Placeholder
const NETWORK_TITLE = 'Mainnet'; // Or 'Preprod'

/**
 * Checks if the user's connected wallet holds the specific NFT using Lucid.
 * NOTE: Assumes the user's wallet extension is enabled and accessible via window.cardano.
 *
 * @param {string} userStakeAddress - The user's stake address (used for fetching UTXOs).
 * @returns {Promise<boolean>} - True if the user holds the NFT, false otherwise.
 */
async function checkUserNFTOwnership(userStakeAddress) {
    console.log(`Checking NFT ownership for stake address: ${userStakeAddress} and policy ID: ${NFT_POLICY_ID}`);

    if (!userStakeAddress) {
        console.error("NFT Check: No stake address provided.");
        return false;
    }

    if (!BLOCKFROST_PROJECT_ID_TITLE || BLOCKFROST_PROJECT_ID_TITLE === 'YOUR_BLOCKFROST_PROJECT_ID_HERE') {
        console.error("NFT Check: Blockfrost Project ID is not configured in titleSystem.js.");
        // Optionally alert the user or default to false
        // showCustomAlert("NFT check unavailable: Configuration missing.");
        return false;
    }

    try {
        // Initialize Lucid - this requires Blockfrost ID and Network
        const lucid = await Lucid.new(
            new Blockfrost(`https://cardano-${NETWORK_TITLE.toLowerCase()}.blockfrost.io/api/v0`, BLOCKFROST_PROJECT_ID_TITLE),
            NETWORK_TITLE
        );
        console.log("NFT Check: Lucid initialized for", NETWORK_TITLE);

        // Get UTXOs associated with the stake address.
        // Lucid automatically uses the reward address derived from the stake address
        // if you provide the stake address directly to getUtxosByOutRef or similar,
        // but getting all UTXOs for the address is more straightforward here.
        // We need the payment address to fetch UTXOs. Since we only have the stake address
        // from login, we might need to reconnect the wallet briefly or fetch the payment address
        // via Blockfrost if possible.
        // Simpler approach: Assume the wallet is still enabled from login and re-select it.
        const availableWallets = window.cardano ? Object.keys(window.cardano).filter(key => key !== 'ccvault') : [];
        if (availableWallets.length === 0) {
            console.error("NFT Check: No Cardano wallet extension found.");
            return false;
        }
        // Attempt to re-enable the first available wallet (or the one used for login if stored)
        // This might trigger a prompt if the connection timed out.
        const walletName = localStorage.getItem('connectedWalletName') || (availableWallets.includes('nami') ? 'nami' : availableWallets[0]); // Try to get stored name or default
        console.log(`NFT Check: Attempting to enable wallet: ${walletName}`);
        const walletApi = await window.cardano[walletName].enable();
        lucid.selectWallet(walletApi);
        console.log("NFT Check: Wallet API selected.");

        // Now get UTXOs for the connected wallet
        const utxos = await lucid.wallet.getUtxos();
        console.log(`NFT Check: Found ${utxos.length} UTXOs.`);

        // Check assets in each UTXO
        for (const utxo of utxos) {
            const assets = utxo.assets;
            for (const assetName in assets) {
                // The assetName in Lucid is typically policyId + assetNameHex
                if (assetName.startsWith(NFT_POLICY_ID)) {
                    console.log(`NFT Check: Found asset with matching policy ID: ${assetName}`);
                    // Optional: Further check asset name if needed
                    // const assetNameHex = assetName.substring(NFT_POLICY_ID.length);
                    // const expectedAssetNameHex = ...; // Convert your expected asset name to hex
                    // if (assetNameHex === expectedAssetNameHex) {
                    //    return true;
                    // }
                    return true; // Found an asset with the correct policy ID
                }
            }
        }

        console.log("NFT Check: No asset found with the specified policy ID.");
        return false; // NFT not found

    } catch (error) {
        console.error("Error checking NFT ownership:", error);
        // Handle specific errors if needed (e.g., wallet connection refused)
        if (error.info) { // Lucid often provides user-friendly info
             console.error("Lucid Error Info:", error.info);
        }
        return false; // Assume no NFT on error
    }
}

/**
 * Applies a visual effect to the player character if they have the NFT title.
 * NOTE: This function needs to interact with the game's rendering engine
 * or UI manager (e.g., in gameWorld.js or uiManager.js).
 *
 * @param {object} player - The player game object.
 * @param {boolean} hasTitle - Whether the player has the NFT title.
 */
function applyCharacterGlow(player, hasTitle) {
    console.log(`Calling applyPlayerMarkerGlow with hasGlow: ${hasTitle}`);
    // Call the function defined in uiManager.js
    if (typeof applyPlayerMarkerGlow === 'function') {
        applyPlayerMarkerGlow(hasTitle);
    } else {
        console.error("applyPlayerMarkerGlow function not found in uiManager.js!");
    }
}

/**
 * Updates the player's dashboard UI to display the NFT title.
 * NOTE: This function needs to interact with the game's UI manager (e.g., in uiManager.js).
 *
 * @param {string} title - The title to display (or empty string to remove).
 */
function displayTitleOnDashboard(title) {
    console.log(`Calling updatePlayerTitleUI with title: ${title}`);
    // Call the function defined in uiManager.js
    if (typeof updatePlayerTitleUI === 'function') {
        updatePlayerTitleUI(title);
    } else {
        console.error("updatePlayerTitleUI function not found in uiManager.js!");
    }
}

/**
 * Checks the player's NFT status and updates their title and effects.
 * This should be called after the wallet is connected and address is available.
 *
 * @param {object} player - The player game object.
 * @param {string} walletAddress - The player's connected wallet address.
 */
async function updateUserTitleStatus(player, walletAddress) {
    if (!walletAddress) {
        console.log("No wallet address provided for title check.");
        player.hasNFTTitle = false; // Ensure flag is false if no address
        applyCharacterGlow(player, false);
        displayTitleOnDashboard("");
        return;
    }

    const hasNFT = await checkUserNFTOwnership(walletAddress);
    player.hasNFTTitle = hasNFT; // Store the status on the player object

    if (hasNFT) {
        console.log(`User ${walletAddress} has the NFT. Assigning title: ${NFT_TITLE}`);
        applyCharacterGlow(player, true);
        displayTitleOnDashboard(NFT_TITLE);
    } else {
        console.log(`User ${walletAddress} does not have the NFT.`);
        applyCharacterGlow(player, false);
        displayTitleOnDashboard("");
    }
    // Potentially update game state or UI elsewhere if needed
}

/**
 * Calculates the protection money multiplier based on the player's title status.
 *
 * @param {object} player - The player game object.
 * @returns {number} - The multiplier (e.g., 2 for title holders, 1 otherwise).
 */
function getProtectionMoneyMultiplier(player) {
    // Check the flag set by updateUserTitleStatus
    if (player && player.hasNFTTitle) {
        console.log("Player has NFT title, applying 2x multiplier to protection money.");
        return 2;
    }
    return 1;
}

// --- Event Listener for Initialization ---
// Listen for the custom event dispatched by initialization.js when player state is ready
document.addEventListener('playerStateReady', (event) => {
    console.log("titleSystem.js received playerStateReady event.");
    if (event.detail && event.detail.player && event.detail.stakeAddress) {
        const player = event.detail.player;
        const stakeAddress = event.detail.stakeAddress;
        console.log("Calling updateUserTitleStatus from event listener with stake address:", stakeAddress);
        // Call the check function now that the module is loaded and player data is ready
        updateUserTitleStatus(player, stakeAddress);
    } else {
        console.error("playerStateReady event received, but missing player or stakeAddress in details.", event.detail);
    }
});

console.log("titleSystem.js module loaded and event listener added."); // Log module load
