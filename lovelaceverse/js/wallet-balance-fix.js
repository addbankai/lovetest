/**
 * Wallet Balance API Fix
 * Fixes the balance.find is not a function error in profile-dashboard.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // Make sure ProfileDashboard is fully loaded
    if (typeof ProfileDashboard === 'undefined') {
        console.error('ProfileDashboard not found, cannot apply wallet API fix');
        return;
    }
    
    console.log('Applying wallet balance API fix...');

    // Save reference to original function
    const originalFetchTokenBalances = ProfileDashboard.fetchTokenBalances;
    
    // Replace with fixed function that handles different wallet API response formats
    ProfileDashboard.fetchTokenBalances = async function(walletAddress) {
        // Check if cache is still valid
        const now = Date.now();
        if (this.balanceCache.lastFetched && (now - this.balanceCache.lastFetched < this.balanceCache.cacheDuration)) {
            console.log('Using cached balances');
            this.updateBalanceDisplays(
                this.balanceCache.ada || '0',
                this.balanceCache.customToken || '0'
            );
            return;
        }
        
        try {
            // Set loading state
            const adaBalance = document.getElementById('ada-balance');
            const customBalance = document.getElementById('custom-token-balance');
            
            if (adaBalance) {
                adaBalance.textContent = 'Loading';
                adaBalance.classList.add('loading');
            }
            
            if (customBalance) {
                customBalance.textContent = 'Loading';
                customBalance.classList.add('loading');
            }
            
            // First try to get balance directly from wallet API (more accurate)
            let adaAmount = '0';
            let customTokenAmount = '0';
            let usedWalletAPI = false;
            
            try {
                console.log('Getting balance via wallet API...');
                
                // Check if we can access the wallet API correctly using CIP-30
                if (typeof window.cardano !== 'undefined') {
                    // Look for available wallets
                    const availableWallets = Object.keys(window.cardano).filter(
                        key => typeof window.cardano[key]?.enable === 'function'
                    );
                    console.log('Available wallet extensions:', availableWallets);
                    
                    // Try with Vespr wallet first
                    let api = null;
                    if (window.cardano.vespr) {
                        api = await window.cardano.vespr.enable().catch(e => {
                            console.warn('Failed to enable Vespr wallet:', e);
                            return null;
                        });
                    } 
                    // Then try any other available wallet
                    else if (availableWallets.length > 0) {
                        const firstWallet = window.cardano[availableWallets[0]];
                        api = await firstWallet.enable().catch(e => {
                            console.warn(`Failed to enable ${availableWallets[0]} wallet:`, e);
                            return null;
                        });
                    }
                    
                    if (api && typeof api.getBalance === 'function') {
                        console.log('Getting balance via wallet API...');
                        
                        // Get balance (returns all assets)
                        const balance = await api.getBalance().catch(e => {
                            console.warn('Failed to get wallet balance:', e);
                            return null;
                        });
                        
                        console.log('Wallet balance raw data:', balance);
                        
                        // FIX: Check if balance is an array before trying to use .find()
                        if (balance) {
                            // Handle different wallet response formats
                            if (Array.isArray(balance)) {
                                // Format 1: Array of units
                                // Look for lovelace (ADA) entry
                                const lovelaceEntry = balance.find(entry => entry.unit === 'lovelace');
                                
                                if (lovelaceEntry) {
                                    adaAmount = (parseInt(lovelaceEntry.quantity) / 1000000).toFixed(2);
                                    this.balanceCache.ada = adaAmount;
                                    console.log('ADA balance from wallet (array format):', adaAmount);
                                }
                                
                                // Look for the custom token with our policy ID
                                const customTokenEntry = balance.find(entry => 
                                    entry.unit && entry.unit.startsWith(this.customPolicyId));
                                
                                if (customTokenEntry) {
                                    customTokenAmount = (parseInt(customTokenEntry.quantity) / 1000000).toFixed(2);
                                    this.balanceCache.customToken = customTokenAmount;
                                    console.log('Custom token balance from wallet (array format):', customTokenAmount);
                                }
                                
                                usedWalletAPI = true;
                            } 
                            else if (typeof balance === 'object' && balance !== null) {
                                // Format 2: Object with asset unit keys
                                // Look for lovelace (ADA) entry
                                if (balance.lovelace) {
                                    adaAmount = (parseInt(balance.lovelace) / 1000000).toFixed(2);
                                    this.balanceCache.ada = adaAmount;
                                    console.log('ADA balance from wallet (object format):', adaAmount);
                                }
                                
                                // Find custom token by iterating through keys
                                Object.keys(balance).forEach(key => {
                                    if (key.startsWith(this.customPolicyId)) {
                                        customTokenAmount = (parseInt(balance[key]) / 1000000).toFixed(2);
                                        this.balanceCache.customToken = customTokenAmount;
                                        console.log('Custom token balance from wallet (object format):', customTokenAmount);
                                    }
                                });
                                
                                usedWalletAPI = true;
                            }
                            else if (typeof balance === 'string') {
                                // Format 3: String with just lovelace amount (simpler wallets)
                                adaAmount = (parseInt(balance) / 1000000).toFixed(2);
                                this.balanceCache.ada = adaAmount;
                                console.log('ADA balance from wallet (string format):', adaAmount);
                                usedWalletAPI = true;
                            }
                        }
                    }
                }
            } catch (walletError) {
                console.warn('Could not get balance from wallet API, falling back to Blockfrost:', walletError);
            }
            
            // If we couldn't get balance from wallet API, use Blockfrost
            if (!usedWalletAPI) {
                console.log('Using Blockfrost API to get balances...');
                
                // FIX: Added error handling and better response processing
                try {
                    // First fetch ADA balance
                    const adaResponse = await fetch(`${this.blockfrostApiUrl}/addresses/${walletAddress}`, {
                        method: 'GET',
                        headers: {
                            'project_id': this.blockfrostApiKey
                        }
                    });
                    
                    if (adaResponse.ok) {
                        const adaData = await adaResponse.json();
                        console.log('Blockfrost ADA data:', adaData);
                        
                        if (adaData && adaData.amount) {
                            // Find the lovelace entry (ADA)
                            const lovelaceEntry = adaData.amount.find(item => item.unit === 'lovelace');
                            
                            if (lovelaceEntry) {
                                // Convert lovelace (millionths of ADA) to ADA
                                adaAmount = (parseInt(lovelaceEntry.quantity) / 1000000).toFixed(2);
                                // Cache the result
                                this.balanceCache.ada = adaAmount;
                                console.log('ADA balance from Blockfrost:', adaAmount);
                            }
                        }
                    } else {
                        // Handle different status codes more gracefully
                        if (adaResponse.status === 404) {
                            console.log('Wallet address not found on Blockfrost, may be a new or unused address');
                            adaAmount = '0';
                        } else if (adaResponse.status === 402) {
                            console.error('Blockfrost subscription limit reached');
                        } else {
                            console.error('Error fetching ADA balance from Blockfrost:', 
                                adaResponse.status, adaResponse.statusText);
                        }
                    }
                    
                    // Then fetch token balances
                    const assetsResponse = await fetch(`${this.blockfrostApiUrl}/addresses/${walletAddress}/assets`, {
                        method: 'GET',
                        headers: {
                            'project_id': this.blockfrostApiKey
                        }
                    });
                    
                    // Process assets response
                    if (assetsResponse.ok) {
                        const assetsData = await assetsResponse.json();
                        console.log('Blockfrost assets data:', assetsData);
                        
                        // Make sure assetsData is an array before using find
                        if (Array.isArray(assetsData)) {
                            // Find the asset with our policy ID
                            const customAsset = assetsData.find(asset => 
                                asset && asset.unit && asset.unit.startsWith(this.customPolicyId));
                            
                            if (customAsset) {
                                // Format based on decimals (assuming 6 for simplicity, adjust as needed)
                                customTokenAmount = (parseInt(customAsset.quantity) / 1000000).toFixed(2);
                                // Cache the result
                                this.balanceCache.customToken = customTokenAmount;
                                console.log('Custom token balance from Blockfrost:', customTokenAmount);
                            }
                        }
                    } else {
                        // Handle different status codes more gracefully
                        if (assetsResponse.status === 404) {
                            console.log('No assets found for this wallet');
                            customTokenAmount = '0';
                        } else if (assetsResponse.status === 402) {
                            console.error('Blockfrost subscription limit reached');
                        } else {
                            console.error('Error fetching assets from Blockfrost:', 
                                assetsResponse.status, assetsResponse.statusText);
                        }
                    }
                } catch (blockfrostError) {
                    console.error('Error calling Blockfrost API:', blockfrostError);
                }
            }
            
            // Update cache timestamp
            this.balanceCache.lastFetched = now;
            
            // Update UI
            this.updateBalanceDisplays(adaAmount, customTokenAmount);
        } catch (error) {
            console.error('Error fetching token balances:', error);
            
            // Display fallback values instead of "Error"
            this.updateBalanceDisplays('0', '0');
            
            const adaBalance = document.getElementById('ada-balance');
            const customBalance = document.getElementById('custom-token-balance');
            
            if (adaBalance) {
                adaBalance.classList.remove('loading');
                adaBalance.classList.add('error');
                adaBalance.title = 'Error fetching balance';
            }
            
            if (customBalance) {
                customBalance.classList.remove('loading');
                customBalance.classList.add('error');
                customBalance.title = 'Error fetching balance';
            }
        }
    };
    
    console.log('Wallet balance API fix applied successfully');
});
