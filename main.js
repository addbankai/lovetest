document.addEventListener('DOMContentLoaded', () => {
    const clickableElements = document.querySelectorAll('.clickable, button');
    const clickSound = document.getElementById('click-sound');

    const terminalOutput = document.getElementById('terminal-output');
    const connectWalletButton = document.getElementById('connect-wallet');
    const walletStatus = document.getElementById('wallet-status');
    const dateTimeElement = document.getElementById('current-datetime');


    const MAX_FEED_LINES = 50; // Max lines to keep in the live feed
    let feedInterval;

    // --- Sound Effects ---
    clickableElements.forEach(elem => {
        elem.addEventListener('click', () => {
            if (clickSound) {
                clickSound.currentTime = 0; // Allow rapid clicking
                clickSound.play().catch(e => console.error("Audio play failed:", e));
            }
        });
    });

    // --- Live Terminal Feed ---
const feedMessages = [
    "[INFO] Cardano's ADA included in U.S. Crypto Strategic Reserve.",
    "[ALERT] OpenSea announces upcoming support for Ronin network NFTs.",
    "[DATA] Solana futures ETFs to be launched by Volatility Shares on March 20.",
    "[TREND] Cardano's ADA token surges following U.S. strategic reserve announcement.",
    "[BATTLE] Whale.io plans to migrate NFT collection from TON to Solana.",
    "[UPDATE] Ronin blockchain expands into DeFi with $13M growth initiative.",
    "[SYSTEM] Cardano's smart contracts grow to 127,578 Plutus scripts.",
    "[ECONOMY] CME Group to introduce Solana futures on March 17.",
    "[PVP] Cardano partners with Draper University to support blockchain startups.",
    "[WARN] Ronin's RON token price predictions indicate potential growth.",
    "[STATS] Cardano's on-chain transactions reach 107.21 million.",
    "[NETWORK] Solana's TVL falls below $9B, raising confidence concerns.",
    "[INFO] MetaMask to introduce native Bitcoin and Solana support in 2025.",
    "[ALERT] Ronin partners with Virtuals to launch AI agent $JAIHOZ.",
    "[DATA] Cardano's ADA price prediction suggests potential surge to $0.85.",
    "[TREND] Ethereum faces 'midlife crisis' as Solana and Cardano gain traction.",
    "[BATTLE] Cardano's roadmap reveals plans for decentralized governance.",
    "[UPDATE] Solana shows recovery signs as bearish pressure eases.",
    "[SYSTEM] CME Group plans to launch Solana futures on March 17.",
    "[ECONOMY] Cardano's market cap on track for $100 billion with key developments.",
    "[PVP] OpenSea teases listing Ronin ecosystem NFTs.",
    "[WARN] Cardano's price pulls back after 80% surge, but experts predict further growth.",
    "[STATS] Ronin's RON token price prediction for 2025-2030 shows bullish outlook.",
    "[NETWORK] Solana's price shows recovery signs as bearish pressure eases.",
];




    function addFeedLine(message) { // Accept message as parameter
        if (!terminalOutput) return;
        if (!message) { // If no message passed, use random default
             message = feedMessages[Math.floor(Math.random() * feedMessages.length)];
        }

        // Add new line with timestamp
        terminalOutput.textContent += `\n${getCurrentTimestamp()} ${message}`;

        // Trim old lines
        const lines = terminalOutput.textContent.split('\n');
        if (lines.length > MAX_FEED_LINES) {
            terminalOutput.textContent = lines.slice(lines.length - MAX_FEED_LINES).join('\n');
        }

        // Scroll to bottom
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function getCurrentTimestamp() {
        const now = new Date();
        // Use local time for feed timestamps for user context
        return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    }

    // Start the live feed with random messages
    if (terminalOutput) {
        // Add first random line slightly delayed for effect
        setTimeout(() => addFeedLine(), 500);
        feedInterval = setInterval(() => addFeedLine(), 2500); // Add a line every 2.5 seconds
    }


    // --- Web3 Wallet Alert ---
    if (connectWalletButton && walletStatus) {
        connectWalletButton.addEventListener('click', () => {
            // Play click sound manually here if desired, since default might be prevented by alert
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.error("Audio play failed:", e));
            }

            // Show the alert message
            alert("Wallet connection feature is not available at this moment.");

            // Optionally, add a log to the feed
            addFeedLine("[WALLET] Connection attempt - Feature currently unavailable.");

            // --- Keep existing simulation code commented out or remove it ---
            /*
            addFeedLine("[WALLET] Initiating connection sequence...");
            walletStatus.textContent = ":: CONNECTING... ::";
            walletStatus.className = 'status-connecting';

            setTimeout(() => {
                 if (Math.random() > 0.3) {
                    const mockAccount = `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`;
                    walletStatus.textContent = `:: CONNECTED: ${mockAccount} ::`;
                    walletStatus.className = 'status-up';
                    connectWalletButton.disabled = true;
                    addFeedLine(`[WALLET] Connection successful (simulated): ${mockAccount}`);
                 } else {
                    walletStatus.textContent = ":: CONNECTION FAILED ::";
                    walletStatus.className = 'status-down';
                    addFeedLine(`[WALLET] ERR: Connection failed (simulated)`);
                 }
            }, 1500);
            */
        });
    }

    // --- Server Date & Time (UTC) ---
    function updateDateTime() {
         if (!dateTimeElement) return;
         const now = new Date();
         // Get UTC time string (e.g., "Wed, 26 Mar 2025 20:29:36 GMT")
         const utcString = now.toUTCString();
         dateTimeElement.textContent = `Server Time: ${utcString}`;
    }
     // Update time immediately and then every second
    updateDateTime();
    setInterval(updateDateTime, 1000);


}); // End DOMContentLoaded