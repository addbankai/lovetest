// saveGame.js

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://gopmukllrferjfiqvzun.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcG11a2xscmZlcmpmaXF2enVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NjMyMzAsImV4cCI6MjA1OTMzOTIzMH0.3VA2JlUqFDYZ-ajwRmnCqzWMXv0LHVxdboOSFw7IZHA';

// --- MODIFIED: Use a globally accessible variable for the client instance ---
window.supabaseClient = null; // Global variable for the client instance
// let supabase = null; // Removed local variable for clarity
// const LOCAL_STORAGE_KEY = 'mobfiGameState'; // No longer using a single fixed key

// --- Initialization ---
function initializeSupabase() {
    try {
        // Access createClient from the global scope (window.supabase)
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            // --- MODIFIED: Assign to window.supabaseClient ---
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client initialized and assigned to window.supabaseClient.');
            // Optional: Add listener for auth changes if using Supabase Auth
            // window.supabaseClient.auth.onAuthStateChange((event, session) => {
        } else {
            console.error('Supabase library (window.supabase) not found or createClient is not a function.');
            // Handle the case where the library didn't load correctly
            window.supabaseClient = null; // Ensure global client is null if initialization fails
        }
        //     console.log('Auth state changed:', event, session);
        //     // Handle user login/logout, potentially trigger load/sync
        // });
    } catch (error) {
        console.error("Error initializing Supabase client:", error);
        // Handle initialization error (e.g., show message to user)
    }
}

// --- Local Storage (Uses Player ID as Key) ---
function saveGameLocally(playerId, gameState) {
    if (!playerId) {
        console.error("Cannot save locally: Player ID is missing.");
        return;
    }
    try {
        const key = `mobfiGameState_${playerId}`; // Use player ID in the key
        localStorage.setItem(key, JSON.stringify(gameState));
        console.log(`Game state saved locally for player ${playerId}.`);
    } catch (error) {
        console.error(`Error saving game state locally for player ${playerId}:`, error);
        // Consider fallback or user notification
    }
}

function loadGameLocally(playerId) {
    if (!playerId) {
        console.error("Cannot load locally: Player ID is missing.");
        return null;
    }
    try {
        const key = `mobfiGameState_${playerId}`; // Use player ID in the key
        const savedState = localStorage.getItem(key);
        if (savedState) {
            console.log(`Game state loaded locally for player ${playerId}.`);
            return JSON.parse(savedState);
        }
        console.log(`No local save data found for player ${playerId}.`);
        return null; // Or return a default initial state
    } catch (error) {
        console.error(`Error loading game state locally for player ${playerId}:`, error);
        const key = `mobfiGameState_${playerId}`;
        localStorage.removeItem(key); // Clear corrupted data for this player
        return null; // Or return a default initial state
    }
}

// --- Supabase Sync ---

// Function to save/update user data
// Expects userData object containing id (wallet_address), username, alias, cash, hp
async function syncUserData(userData) {
    // --- MODIFIED: Use window.supabaseClient ---
    if (!window.supabaseClient) {
        console.error('Supabase client (window.supabaseClient) not initialized for syncUserData.');
        return { error: 'Supabase not ready' };
    }

    // Extract the user ID (wallet address) from the passed object
    const userId = userData.id; // Assuming 'id' property holds the wallet address
    if (!userId) {
        console.error('User ID (wallet_address) not found in userData for sync.');
        return { error: 'User ID missing in sync data' };
    }

    // --- ADDED: Detailed log before upsert ---
    // Prepare user data object matching the 'users' table structure from schema
    const dataToUpsert = {
        wallet_address: userId, // Use correct primary key column name (extracted above)
        username: userData.username || null,
        alias: userData.alias || null,
        cash: userData.cash !== undefined ? userData.cash : 0, // Default if undefined
        hp: userData.hp !== undefined ? userData.hp : 100, // Default if undefined
        level: userData.level !== undefined ? userData.level : 1, // Add level, default if undefined
        power: userData.power !== undefined ? userData.power : 10, // Add power, default if undefined
        // --- ADDED: Organization Fields ---
        organization_name: userData.organization?.name || null, // Get name from nested object or null
        organization_abbreviation: userData.organization?.abbreviation || null, // Get abbr from nested object or null
        org_base_lat: userData.orgBaseLocation?.lat || null, // Get lat from nested object or null
        org_base_lon: userData.orgBaseLocation?.lon || null // Get lon from nested object or null
        // --- END ADDED ---
        // updated_at is handled by the database default
    };
    console.log(`[syncUserData] Attempting upsert for user ${userId} with data:`, JSON.stringify(dataToUpsert, null, 2)); // Pretty print JSON
    // --- END ADDED ---

    // --- MODIFIED: Use window.supabaseClient ---
    const { data, error } = await window.supabaseClient
        .from('users')
        .upsert(dataToUpsert, { // Use the prepared object
            onConflict: 'wallet_address' // Specify the correct conflict column
        })
        .select(); // Select the upserted data

    if (error) {
        console.error(`[syncUserData] Error syncing user data for ${userId}:`, error); // Add user ID to error log
    } else {
        console.log(`[syncUserData] User data synced successfully for ${userId}:`, data); // Add user ID to success log
    }
    return { data, error }; // Return the result
}


// --- ADDED: Function to sync user inventory ---
// Deletes existing items for the user and inserts the current inventory
async function syncInventory(userId, inventory) {
    // --- MODIFIED: Use window.supabaseClient ---
    if (!window.supabaseClient || !userId || !Array.isArray(inventory)) {
        console.error('[syncInventory] Invalid input or Supabase client (window.supabaseClient) not ready.', { userId, inventory });
        return { error: 'Invalid input or Supabase not ready' };
    }

    console.log(`[syncInventory] Starting sync for user ${userId}. Current inventory count: ${inventory.length}`);

    // --- MODIFIED: Use upsert directly, removing delete step ---
    try {
        // 1. Prepare data for upsertion (aggregate first)
        if (inventory.length > 0) {
            const aggregatedInventory = inventory.reduce((acc, item) => {
                if (!item || !item.id) {
                    console.warn("[syncInventory] Skipping invalid item in inventory:", item);
                    return acc;
                }
                const currentQuantity = acc[item.id] || 0;
                acc[item.id] = currentQuantity + (item.quantity || 1);
                return acc;
            }, {});
            console.log(`[syncInventory] Aggregated inventory for insertion:`, aggregatedInventory);
            // --- END AGGREGATION ---

            // Prepare data for insertion from the aggregated map, filtering invalid entries
            const itemsToUpsert = Object.entries(aggregatedInventory)
                .map(([itemId, quantity]) => {
                    // Validate data before mapping
                    if (typeof itemId === 'string' && itemId.length > 0 && Number.isInteger(quantity) && quantity > 0) {
                        return {
                            user_id: userId,
                            item_id: itemId,
                            quantity: quantity
                        };
                    } else {
                        console.warn(`[syncInventory] Filtering out invalid aggregated item data: itemId=${itemId} (type: ${typeof itemId}), quantity=${quantity} (type: ${typeof quantity})`);
                        return null; // Mark as invalid
                    }
                })
                .filter(item => item !== null); // Remove null entries

            // Check if there are actually items to upsert after aggregation and validation
            if (itemsToUpsert.length === 0) {
                 console.log(`[syncInventory] No valid items to upsert after aggregation for user ${userId}.`);
                 // --- ADDED: Need to handle deletion of items no longer in inventory ---
                 // Fetch all items currently in DB for the user
                 // --- MODIFIED: Use window.supabaseClient ---
                 const { data: currentDbItems, error: fetchError } = await window.supabaseClient
                     .from('user_items')
                     .select('item_id')
                     .eq('user_id', userId);

                 if (fetchError) {
                     console.error(`[syncInventory] Error fetching current DB items for deletion check:`, fetchError);
                     // Proceed without deletion check if fetch fails? Or throw error? For now, log and continue.
                 } else if (currentDbItems && currentDbItems.length > 0) {
                     // If DB has items but itemsToUpsert is empty, delete all DB items
                     console.log(`[syncInventory] Inventory is now empty. Deleting all ${currentDbItems.length} items from DB for user ${userId}...`);
                     // --- MODIFIED: Use window.supabaseClient ---
                     const { error: deleteAllError } = await window.supabaseClient
                         .from('user_items')
                         .delete()
                         .eq('user_id', userId);
                     if (deleteAllError) {
                         console.error(`[syncInventory] Error deleting all items for empty inventory:`, deleteAllError);
                         // Potentially throw error here
                     }
                 }
                 // --- END ADDED ---
                 return { data: [], error: null };
            }

            // --- ADDED: Log data just before upsert ---
            console.log(`[syncInventory] Data prepared for upsert for user ${userId}:`, JSON.stringify(itemsToUpsert, null, 2));
            // --- END ADDED ---

            console.log(`[syncInventory] Upserting ${itemsToUpsert.length} aggregated item records for user ${userId}...`);
            // --- MODIFIED: Use window.supabaseClient ---
            const { data: upsertData, error: upsertError } = await window.supabaseClient
                .from('user_items')
                .upsert(itemsToUpsert, { onConflict: 'user_id, item_id' }) // Specify conflict columns
                .select();

            if (upsertError) {
                console.error(`[syncInventory] Error upserting items for user ${userId}:`, upsertError);
                throw upsertError; // Throw to indicate failure
            }
            console.log(`[syncInventory] Items upserted successfully for user ${userId}:`, upsertData);

            // --- ADDED: Delete items from DB that are NOT in the upsert list ---
            const itemsInCurrentInventory = new Set(itemsToUpsert.map(item => item.item_id));
            // --- MODIFIED: Use window.supabaseClient ---
            const { data: currentDbItemsForDelete, error: fetchForDeleteError } = await window.supabaseClient
                .from('user_items')
                .select('item_id')
                .eq('user_id', userId);

            if (fetchForDeleteError) {
                console.error(`[syncInventory] Error fetching DB items for deletion check after upsert:`, fetchForDeleteError);
            } else if (currentDbItemsForDelete) {
                const itemsToDelete = currentDbItemsForDelete
                    .filter(dbItem => !itemsInCurrentInventory.has(dbItem.item_id))
                    .map(dbItem => dbItem.item_id);

                if (itemsToDelete.length > 0) {
                    console.log(`[syncInventory] Deleting ${itemsToDelete.length} items no longer in inventory:`, itemsToDelete);
                    // --- MODIFIED: Use window.supabaseClient ---
                    const { error: deleteStaleError } = await window.supabaseClient
                        .from('user_items')
                        .delete()
                        .eq('user_id', userId)
                        .in('item_id', itemsToDelete);
                    if (deleteStaleError) {
                        console.error(`[syncInventory] Error deleting stale items:`, deleteStaleError);
                        // Don't throw here, upsert was successful, but log the issue
                    }
                } else {
                     console.log(`[syncInventory] No stale items found in DB to delete.`);
                }
            }
            // --- END ADDED ---

            return { data: upsertData, error: null };
        } else {
             console.log(`[syncInventory] Inventory is empty for user ${userId}. Checking if deletion needed...`);
             // --- ADDED: Handle deletion when inventory becomes empty ---
             // --- MODIFIED: Use window.supabaseClient ---
             const { data: currentDbItems, error: fetchError } = await window.supabaseClient
                 .from('user_items')
                 .select('item_id')
                 .eq('user_id', userId);

             if (fetchError) {
                 console.error(`[syncInventory] Error fetching current DB items for empty inventory check:`, fetchError);
             } else if (currentDbItems && currentDbItems.length > 0) {
                 console.log(`[syncInventory] Inventory is empty. Deleting all ${currentDbItems.length} items from DB for user ${userId}...`);
                 // --- MODIFIED: Use window.supabaseClient ---
                 const { error: deleteAllError } = await window.supabaseClient
                     .from('user_items')
                     .delete()
                     .eq('user_id', userId);
                 if (deleteAllError) {
                     console.error(`[syncInventory] Error deleting all items for empty inventory:`, deleteAllError);
                     throw deleteAllError; // Throw error if deletion fails
                 }
             }
             // --- END ADDED ---
             return { data: [], error: null }; // No error, just nothing upserted/deleted if DB was already empty
        }
    } catch (error) {
        // Error already logged in the try block
        console.error(`[syncInventory] Sync failed for user ${userId}. Inventory sync aborted.`);
        return { error }; // Return the error that caused the failure
    }
}

// --- ADDED: Function to sync user equipment ---
// --- MODIFIED: Use upsert directly, removing delete step ---
async function syncEquipment(userId, equipment) {
    // --- MODIFIED: Use window.supabaseClient ---
    if (!window.supabaseClient || !userId || typeof equipment !== 'object' || equipment === null) {
        console.error('[syncEquipment] Invalid input or Supabase client (window.supabaseClient) not ready.', { userId, equipment });
        return { error: 'Invalid input or Supabase not ready' };
    }

    console.log(`[syncEquipment] --- Start --- User: ${userId}. Equipment to save:`, JSON.stringify(equipment));

    try {
        // 1. Prepare data for upsertion
        const equipmentToUpsert = Object.entries(equipment)
            .filter(([slot, itemId]) => itemId !== null && typeof itemId === 'string' && itemId.length > 0) // Filter for slots with valid item IDs
             // --- MODIFIED: Map using the itemId string directly AND lowercase the slot ---
            .map(([slot, itemId]) => ({
                user_id: userId,
                slot: slot.toLowerCase(), // Convert JS key ('Head') to lowercase ('head') for DB
                item_id: itemId
            }));
        console.log(`[syncEquipment] Prepared ${equipmentToUpsert.length} equipment records for upsertion:`, JSON.stringify(equipmentToUpsert));

        // 2. Upsert the prepared data
        if (equipmentToUpsert.length > 0) {
            console.log(`[syncEquipment] Attempting UPSERT into user_equipment...`);
            // --- MODIFIED: Use window.supabaseClient ---
            const { data: upsertData, error: upsertError } = await window.supabaseClient
                .from('user_equipment')
                .upsert(equipmentToUpsert, { onConflict: 'user_id, slot' }) // Specify conflict columns
                .select();

            if (upsertError) {
                console.error(`[syncEquipment] FAIL: Error upserting equipment for user ${userId}:`, upsertError);
                throw upsertError;
            }
            console.log(`[syncEquipment] OK: Upsert successful. Upserted data:`, JSON.stringify(upsertData));

            // --- ADDED: Delete equipment from DB slots that are now empty ---
            const equippedSlots = new Set(equipmentToUpsert.map(eq => eq.slot)); // Slots that should have items
            // --- MODIFIED: Use window.supabaseClient ---
            const { data: currentDbEquipment, error: fetchForDeleteError } = await window.supabaseClient
                .from('user_equipment')
                .select('slot')
                .eq('user_id', userId);

            if (fetchForDeleteError) {
                 console.error(`[syncEquipment] Error fetching DB equipment for deletion check after upsert:`, fetchForDeleteError);
            } else if (currentDbEquipment) {
                const slotsToDelete = currentDbEquipment
                    .filter(dbEq => !equippedSlots.has(dbEq.slot)) // Find DB slots not in our current equipped set
                    .map(dbEq => dbEq.slot);

                if (slotsToDelete.length > 0) {
                    console.log(`[syncEquipment] Deleting equipment from ${slotsToDelete.length} now empty slots:`, slotsToDelete);
                    // --- MODIFIED: Use window.supabaseClient ---
                    const { error: deleteStaleError } = await window.supabaseClient
                        .from('user_equipment')
                        .delete()
                        .eq('user_id', userId)
                        .in('slot', slotsToDelete);
                    if (deleteStaleError) {
                        console.error(`[syncEquipment] Error deleting equipment from stale slots:`, deleteStaleError);
                        // Don't throw, upsert was successful
                    }
                } else {
                    console.log(`[syncEquipment] No stale equipment slots found in DB to delete.`);
                }
            }
             // --- END ADDED ---

            console.log(`[syncEquipment] --- End (Success) ---`);
            return { data: upsertData, error: null };
        } else {
            console.log(`[syncEquipment] No equipment items with valid IDs found to upsert.`);
             // --- ADDED: Handle deletion when all equipment is removed ---
             // --- MODIFIED: Use window.supabaseClient ---
             const { data: currentDbEquipment, error: fetchError } = await window.supabaseClient
                 .from('user_equipment')
                 .select('slot')
                 .eq('user_id', userId);

             if (fetchError) {
                 console.error(`[syncEquipment] Error fetching current DB equipment for empty equipment check:`, fetchError);
             } else if (currentDbEquipment && currentDbEquipment.length > 0) {
                 console.log(`[syncEquipment] Equipment is now empty. Deleting all ${currentDbEquipment.length} equipment entries from DB for user ${userId}...`);
                 // --- MODIFIED: Use window.supabaseClient ---
                 const { error: deleteAllError } = await window.supabaseClient
                     .from('user_equipment')
                     .delete()
                     .eq('user_id', userId);
                 if (deleteAllError) {
                     console.error(`[syncEquipment] Error deleting all equipment for empty state:`, deleteAllError);
                     throw deleteAllError; // Throw error if deletion fails
                 }
             }
             // --- END ADDED ---
            console.log(`[syncEquipment] --- End (Nothing to Upsert/Delete) ---`);
            return { data: [], error: null };
        }
    } catch (error) {
        // Error should have been logged above
        console.error(`[syncEquipment] Sync failed for user ${userId}. Equipment sync aborted.`);
        console.log(`[syncEquipment] --- End (Sync Failed) ---`);
        return { error };
    }
}


// Function to sync business protection data
// Needs businessId and the protectorUserId (from Auth)
async function syncBusinessProtection(businessId, protectorUserId, isProtecting) {
     // --- MODIFIED: Use window.supabaseClient ---
     if (!window.supabaseClient) {
        console.error('Supabase client (window.supabaseClient) not initialized for syncBusinessProtection.');
        return { error: 'Supabase not ready' };
    }
     if (!protectorUserId) {
        console.error('Protector User ID not available for sync.');
        return { error: 'User not authenticated or ID missing' };
    }

    let data = null, error = null;

    if (isProtecting) {
        // Add or update protection record
        // --- MODIFIED: Use window.supabaseClient ---
        ({ data, error } = await window.supabaseClient
            .from('business_protection')
            .upsert({
                business_id: businessId, // Unique constraint handles conflict
                protector_user_id: protectorUserId,
                protection_start_time: new Date().toISOString()
            }, {
                onConflict: 'business_id' // If business already protected, update protector/time
            })
            .select());
    } else {
        // Remove protection record
        // --- MODIFIED: Use window.supabaseClient ---
        ({ data, error } = await window.supabaseClient
            .from('business_protection')
            .delete()
            .match({ business_id: businessId, protector_user_id: protectorUserId })); // Ensure user only deletes their own
    }

    if (error) {
        console.error('Error syncing business protection:', error);
    } else {
        console.log('Business protection synced successfully:', data);
    }
    return { data, error };
}

// --- ADDED: Function to sync business state ---
// Upserts relevant business data (protection, collection time)
async function syncBusinessState(userId, businessesToSave) {
    // --- MODIFIED: Use window.supabaseClient ---
    if (!window.supabaseClient || !userId || typeof businessesToSave !== 'object' || businessesToSave === null) {
        console.error('[syncBusinessState] Invalid input or Supabase client (window.supabaseClient) not ready.', { userId, businessesToSave });
        return { error: 'Invalid input or Supabase not ready' };
    }

    const businessIds = Object.keys(businessesToSave);
    if (businessIds.length === 0) {
        console.log('[syncBusinessState] No business state data provided to sync.');
        return { data: [], error: null }; // Nothing to sync
    }

    console.log(`[syncBusinessState] Starting sync for ${businessIds.length} businesses for user ${userId}.`);

    try {
        // Prepare data for upsertion
        const businessesDataToUpsert = businessIds.map(businessId => {
            const bizData = businessesToSave[businessId];
            return {
                business_id: bizData.id, // Primary key
                last_collected_time: bizData.lastCollected ? new Date(bizData.lastCollected).toISOString() : null,
                protecting_org_name: bizData.protectingOrganization?.name || null,
                protecting_org_abbr: bizData.protectingOrganization?.abbreviation || null,
                protection_power: bizData.protectionPower || 0,
                // Ensure protectors array includes alias
                protectors: (bizData.protectingUsers || []).map(p => ({ userId: p.userId, userAlias: p.userAlias || 'Unknown', userPower: p.userPower || 0 })) // Map to include alias
                // last_updated is handled by DB default
            };
        });

        console.log(`[syncBusinessState] Data prepared for upsert:`, JSON.stringify(businessesDataToUpsert, null, 2));

        // Upsert the data
        // --- MODIFIED: Use window.supabaseClient ---
        const { data: upsertData, error: upsertError } = await window.supabaseClient
            .from('business_state') // Ensure this table name is correct
            .upsert(businessesDataToUpsert, { onConflict: 'business_id' }) // Specify conflict column
            .select();

        if (upsertError) {
            console.error(`[syncBusinessState] Error upserting business state for user ${userId}:`, upsertError);
            throw upsertError;
        }

        console.log(`[syncBusinessState] Business state upserted successfully for ${upsertData.length} businesses.`);
        return { data: upsertData, error: null };

    } catch (error) {
        console.error(`[syncBusinessState] Sync failed for user ${userId}. Business state sync aborted. Error:`, error);
        return { error };
    }
}


// --- Leaderboard ---
async function fetchLeaderboard(type = 'money', limit = 10) {
    // --- MODIFIED: Use window.supabaseClient ---
    if (!window.supabaseClient) {
        console.error('Supabase client (window.supabaseClient) not initialized for fetchLeaderboard.');
        return { error: 'Supabase not ready', data: [] };
    }

    // Determine the column to order by based on the type requested.
    let orderByColumn;
    switch (type) {
        case 'power':
            orderByColumn = 'power';
            break;
        case 'level': // Assuming you might want a level leaderboard later
            orderByColumn = 'level';
            break;
        case 'money':
        default:
            orderByColumn = 'cash'; // Use 'cash' column for 'money' type
            break;
    }

    // Select relevant columns, including the one we order by
    const selectColumns = 'username, alias, cash, hp, level, power'; // Select all relevant columns

    console.log(`Fetching ${type} leaderboard, ordering by ${orderByColumn}, selecting ${selectColumns}`); // Debug log

    // --- MODIFIED: Use window.supabaseClient ---
    const { data, error } = await window.supabaseClient
        .from('users')
        .select(selectColumns) // Select the correct columns
        .order(orderByColumn, { ascending: false }) // Order by the determined column
        .limit(limit);

    if (error) {
        console.error(`Error fetching ${type} leaderboard:`, error);
        return { error, data: [] };
    }

    console.log(`${type} leaderboard fetched successfully:`, data);
    return { data, error: null };
}


// --- Combined Save Function ---
// This function should be called whenever the game state changes significantly
async function saveGame(gameState) { // Ensure function is async
    const userId = window.currentPlayerId; // Get current player ID (wallet address)
    // const isGuest = localStorage.getItem('isGuestSession') === 'true'; // REMOVED guest check

    if (!userId) {
        console.error("[saveGame] Cannot save: No currentPlayerId found.");
        return;
    }

    // 1. Save locally immediately using the player ID as the key
    saveGameLocally(userId, gameState);

    // 2. Attempt to sync relevant parts to Supabase (always attempt if userId exists)
    // if (!isGuest) { // REMOVED guest check wrapper
    if (gameState.player) {
        console.log(`[saveGame] Attempting to sync user data to Supabase for User ID: ${userId}`); // Log sync attempt
        // Prepare user data object matching the 'users' table structure, including the ID
            const userDataToSync = {
                id: userId, // Include the wallet address as 'id' for syncUserData
                username: gameState.player.username || null,
                alias: gameState.player.alias,
                cash: gameState.player.cash,
                hp: gameState.player.hp,
                level: gameState.player.level, // Include level
                power: gameState.player.power,  // Include power
                // --- ADDED: Include organization details in the object passed to syncUserData ---
                organization: gameState.player.organization,
                orgBaseLocation: gameState.player.orgBaseLocation
                // --- END ADDED ---
            };
        // --- FIXED: Call syncUserData once with the complete object ---
        const syncResult = await syncUserData(userDataToSync); // Pass the single object
        if (syncResult.error) {
            console.warn(`[saveGame] Supabase sync failed for user ${userId}. Data saved locally, but not to cloud. Error:`, syncResult.error); // Log the actual error object
            // Optionally: Implement retry logic or notify user
        } else {
            console.log(`[saveGame] Supabase user data sync successful for user ${userId}.`);

            // --- ADDED: Sync Inventory and Equipment ---
            if (gameState.player.inventory) {
                console.log(`[saveGame] Attempting to sync inventory for user ${userId}...`);
                const inventorySyncResult = await syncInventory(userId, gameState.player.inventory);
                if (inventorySyncResult.error) {
                    console.warn(`[saveGame] Supabase inventory sync failed for user ${userId}. Error:`, inventorySyncResult.error);
                } else {
                    console.log(`[saveGame] Supabase inventory sync successful for user ${userId}.`);
                }
            } else {
                 console.warn("[saveGame] Cannot sync inventory: gameState.player.inventory is missing.");
            }

            if (gameState.player.equipment) {
                 console.log(`[saveGame] Attempting to sync equipment for user ${userId}...`);
                const equipmentSyncResult = await syncEquipment(userId, gameState.player.equipment);
                 if (equipmentSyncResult.error) {
                    console.warn(`[saveGame] Supabase equipment sync failed for user ${userId}. Error:`, equipmentSyncResult.error);
                } else {
                    console.log(`[saveGame] Supabase equipment sync successful for user ${userId}.`);
                }
            } else {
                 console.warn("[saveGame] Cannot sync equipment: gameState.player.equipment is missing.");
            }

            // --- ADDED: Sync Business State ---
            if (gameState.businesses && Object.keys(gameState.businesses).length > 0) {
                console.log(`[saveGame] Attempting to sync business state for user ${userId}...`);
                const businessSyncResult = await syncBusinessState(userId, gameState.businesses);
                if (businessSyncResult.error) {
                    console.warn(`[saveGame] Supabase business state sync failed for user ${userId}. Error:`, businessSyncResult.error);
                } else {
                    console.log(`[saveGame] Supabase business state sync successful for user ${userId}.`);
                }
            } else {
                 console.log("[saveGame] No business state data found in gameState to sync.");
            }
            // --- END ADDED ---

        }
        // --- END MODIFIED ---
        } else {
            console.warn("[saveGame] Cannot sync user data: gameState.player is missing.");
        }
    // } else { // REMOVED guest check else block
    //     console.log("[saveGame] Guest session detected. Skipping Supabase sync.");
    // }


    // Sync business protection status (example - needs actual game state structure)
    // This needs to iterate through businesses the player is protecting
    // Example:
    // if (userId && gameState.businesses) {
    //     for (const business of gameState.businesses) {
    //         if (business.isProtectedByPlayer) { // Check if current player protects this
    //             await syncBusinessProtection(business.id, userId, true);
    //         } else {
    //             // Optional: If player *stopped* protecting, send false
    //             // await syncBusinessProtection(business.id, userId, false);
    //             // Need careful logic here to only remove *this user's* protection
    //         }
    //     }
    // }

    // Add sync logic for other relevant data (e.g., business ownership if applicable)
}

// --- Combined Load Function ---
// This function should be called on game initialization
async function loadGame() { // Ensure function is async
    const userId = window.currentPlayerId; // Get current player ID (wallet address) set in initialization.js
    // const isGuest = localStorage.getItem('isGuestSession') === 'true'; // REMOVED guest check
    let gameState = null;
    let fetchedFromSupabase = false;

    if (!userId) {
        console.error("[loadGame] Cannot load: No currentPlayerId found. This shouldn't happen if auth check passed.");
        // Fallback to default, but this indicates an issue in the auth flow.
        gameState = getDefaultGameState();
        saveGameLocally(`guest_fallback_${Date.now()}`, gameState); // Save default under a fallback key
        return gameState;
    }

    // 1. Try loading from local storage using the player ID
    gameState = loadGameLocally(userId);

    // 2. If we have a Supabase client, attempt to load/sync from Supabase
    // if (!isGuest && supabase) { // REMOVED guest check
    // --- MODIFIED: Use window.supabaseClient ---
    if (window.supabaseClient) {
        console.log(`[loadGame] Wallet user detected (${userId}). Checking Supabase (window.supabaseClient) for game state.`); // Added prefix and client var name
        try {
            console.log(`[loadGame] Fetching user data for wallet_address: ${userId}`); // Log before fetch
            // --- MODIFIED: Use window.supabaseClient ---
            const { data: supabaseUserData, error: fetchError } = await window.supabaseClient
                .from('users') // Ensure this table name is correct
                .select('*') // Select all columns
                .eq('wallet_address', userId); // Use correct column name for filtering
                // REMOVED .single() modifier

            // Handle potential errors
            if (fetchError) {
                 console.error(`[loadGame] Error fetching user data from Supabase:`, fetchError); // Added prefix
            // Check if data is an array and has at least one element
            } else if (Array.isArray(supabaseUserData) && supabaseUserData.length > 0) {
                const userRecord = supabaseUserData[0]; // Get the first (and should be only) record
                console.log("[loadGame] User data fetched successfully from Supabase:", JSON.stringify(userRecord)); // Log fetched data
                const mappedState = mapSupabaseToGameState(userRecord); // Use the user record
                if (mappedState) {
                    console.log("[loadGame] Successfully mapped Supabase data to game state."); // Log mapping success
                    // --- FIX: Update global currentPlayerId --- - This seems redundant if loadGame is called after initialization sets it. Keeping for safety.
                    // Ensure gameWorld.js's global variable is updated
                    if (typeof window.currentPlayerId !== 'undefined') { // Access global scope
                         window.currentPlayerId = userId;
                         console.log(`Global currentPlayerId updated to: ${userId}`);
                    } else {
                         console.warn("Global variable 'currentPlayerId' not found in window scope during load.");
                    }
                    // --- End FIX ---

                    // Compare timestamps? If Supabase is newer or local doesn't exist, use Supabase data.
                    const localTimestamp = gameState?.lastSaved || 0; // Assuming gameState has a timestamp
                    // Use the 'last_updated' column from the schema
                    const supabaseTimestamp = new Date(userRecord.last_updated || 0).getTime();

                    // --- MODIFIED: Always fetch items/equipment if Supabase user data exists ---
                    // We don't rely on timestamps for items/equipment, just fetch the latest from DB
                    console.log("[loadGame] Supabase user data found. Fetching inventory and equipment...");
                    gameState = mappedState; // Start with the mapped basic user data

                    // Fetch Inventory
                    try {
                        console.log(`[loadGame] Fetching inventory for user ${userId}...`);
                        // --- MODIFIED: Use window.supabaseClient ---
                        const { data: itemsData, error: itemsError } = await window.supabaseClient
                            .from('user_items')
                            .select('item_id, quantity')
                            .eq('user_id', userId);

                        if (itemsError) {
                            console.error(`[loadGame] Error fetching inventory for user ${userId}:`, itemsError);
                            // Keep default inventory in gameState
                        } else {
                            console.log(`[loadGame] Inventory fetched successfully for user ${userId}:`, itemsData);
                            // Map fetched items to the expected gameState.player.inventory format
                            // Assuming format is [{ id: '...', quantity: ... }]
                            gameState.player.inventory = itemsData.map(item => ({
                                id: item.item_id,
                                quantity: item.quantity
                            }));
                            console.log("[loadGame] Mapped inventory:", gameState.player.inventory);
                        }
                    } catch (invError) {
                        console.error(`[loadGame] Exception fetching inventory for user ${userId}:`, invError);
                    }

                    // Fetch Equipment
                    try {
                        console.log(`[loadGame] Attempting SELECT slot, item_id from user_equipment where user_id = ${userId}...`); // Enhanced Log
                        // --- MODIFIED: Use window.supabaseClient ---
                        const { data: equipData, error: equipError } = await window.supabaseClient
                            .from('user_equipment')
                            .select('slot, item_id')
                            .eq('user_id', userId);

                        if (equipError) {
                            console.error(`[loadGame] FAIL: Error fetching equipment for user ${userId}:`, equipError); // Enhanced Log
                            // Keep default equipment in gameState
                        } else {
                            console.log(`[loadGame] OK: Equipment fetched successfully for user ${userId}. Raw data:`, JSON.stringify(equipData)); // Enhanced Log
                            // Map fetched equipment to the expected gameState.player.equipment format
                            // Ensure the equipment object has all default slots first
                            // The default structure is already set by mapSupabaseToGameState -> getDefaultGameState
                            // We just need to overwrite the slots found in the DB.
                            console.log("[loadGame] Applying fetched equipment to default structure. Structure before apply:", JSON.stringify(gameState.player.equipment)); // Enhanced Log
                            equipData.forEach(eq => {
                                const itemId = eq.item_id;
                                const dbSlotRaw = eq.slot; // Get raw value

                                // --- Trim whitespace from dbSlot before mapping ---
                                const dbSlot = dbSlotRaw ? dbSlotRaw.trim() : null; // Declare and trim here
                                if (!dbSlot) {
                                    console.warn(`[loadGame] Encountered null or empty dbSlot value. Ignoring row.`);
                                    return; // Use return instead of continue in forEach callback
                                }
                                // --- End Trim ---

                                // --- Explicit mapping from DB slot (lowercase) to JS key (PascalCase) ---
                                const slotMapping = {
                                    head: 'Head', mask: 'Mask', body: 'Body', gloves: 'Gloves', pants: 'Pants',
                                    boots: 'Boots', accessory: 'Accessory', charm: 'Charm', weapon: 'Weapon',
                                    base: 'Base', walldecoration: 'WallDecoration', weaponstash: 'WeaponStash',
                                    luxuryfurniture: 'LuxuryFurniture', securitysystem: 'SecuritySystem'
                                };

                                // --- DEBUG: Log the exact dbSlot value ---
                                console.log(`[loadGame] Raw dbSlot value from Supabase: |${dbSlotRaw}|, Trimmed: |${dbSlot}|, Type: ${typeof dbSlot}`); // Log type as well
                                // --- END DEBUG ---

                                // Ensure dbSlot is lowercase string for lookup
                                const lookupKey = String(dbSlot).toLowerCase();
                                const jsSlotKey = slotMapping[lookupKey];

                                // Check if the mapping exists
                                if (jsSlotKey) {
                                    // Directly assign the value. If the key exists, it's updated. If not (which shouldn't happen), it's added.
                                    console.log(`[loadGame] Mapping: Storing item ID '${itemId}' into JS slot '${jsSlotKey}' (from DB slot '${dbSlot}').`); // Enhanced Log
                                    gameState.player.equipment[jsSlotKey] = itemId;
                                } else {
                                    // This means the DB slot name wasn't found in our explicit slotMapping
                                    console.warn(`[loadGame] Mapping: Fetched equipment for unknown/unmapped DB slot '${dbSlot}'. Ignoring item ID '${itemId}'.`); // Enhanced Log
                                }
                            });
                            console.log("[loadGame] Mapping: Final loaded equipment state after applying fetched data:", JSON.stringify(gameState.player.equipment)); // Enhanced Log
                        }
                    } catch (equipError) {
                        console.error(`[loadGame] EXCEPTION fetching equipment for user ${userId}:`, equipError); // Enhanced Log
                    }

                    // --- ADDED: Fetch Business State (but don't apply yet) ---
                    let loadedBusinessStateFromDB = null; // Variable to hold fetched data
                    try {
                        console.log(`[loadGame] Fetching business state data...`);
                        // --- MODIFIED: Use window.supabaseClient ---
                        const { data: businessStateData, error: businessStateError } = await window.supabaseClient
                            .from('business_state')
                            .select('*'); // Fetch all columns

                        if (businessStateError) {
                            console.error(`[loadGame] Error fetching business state:`, businessStateError);
                        } else {
                            console.log(`[loadGame] Business state fetched successfully. ${businessStateData.length} records found.`);
                            loadedBusinessStateFromDB = businessStateData; // Store fetched data
                            // Attach fetched data to the gameState object being built
                            gameState.loadedBusinessState = loadedBusinessStateFromDB;
                        }
                    } catch (bizStateError) {
                        console.error(`[loadGame] Exception fetching business state:`, bizStateError);
                    }
                    // --- END MODIFIED ---


                    // Save the combined state (user data + items + equip) locally
                    // Business state is now attached to gameState, will be saved locally too
                    saveGameLocally(userId, gameState);
                    fetchedFromSupabase = true;
                    // --- END MODIFIED ---
                } else {
                    console.error("[loadGame] Failed to map Supabase data to game state."); // Added prefix
                    // Keep existing local gameState if mapping fails
                    // Keep existing local gameState if mapping fails, or fall through to default
                }
            } else { // Handle case where data is null, empty array, or not an array
                console.log(`[loadGame] User ${userId} not found in Supabase 'users' table or no data returned. Raw response data: ${JSON.stringify(supabaseUserData)}`); // Added prefix and raw data log
                // If local data exists, keep it. Otherwise, will fall through to default.
                if (gameState) {
                    console.log("[loadGame] Keeping locally loaded game state as Supabase returned no data."); // Added prefix
                }
            }
        } catch (error) {
            console.error("Exception during Supabase fetch in loadGame:", error);
            // Keep local gameState if fetch fails
        }
    // } else if (isGuest) { // REMOVED guest check else if
    //     console.log(`Guest session (${userId}). Using only local save data.`);
    // --- MODIFIED: Check window.supabaseClient ---
    } else if (!window.supabaseClient) {
        console.warn("[loadGame] Supabase client (window.supabaseClient) not initialized. Cannot fetch cloud save.");
    }

    // 3. If still no game state (neither local nor fetched/kept), create a default one
    if (!gameState) {
        console.log(`No existing game state found for ${userId}. Creating default game state.`);
        gameState = getDefaultGameState();
        saveGameLocally(userId, gameState); // Save the default state under the player's ID
    }

    // Ensure the loaded/default state has the correct player ID structure if needed elsewhere
    if (gameState && gameState.player && !gameState.player.id) {
        gameState.player.id = userId; // Add the ID to the player object if missing
    }


    return gameState;
}

// --- Helper: Default Game State ---
function getDefaultGameState() {
    // Define the initial state for a new player
    return {
        player: {
            username: null,
            alias: 'Newbie',
            level: 1,
            cash: 100,
            power: 10,
            hp: 100,
            maxHp: 100,
            // ... other player stats (influence, strength, etc.)
            inventory: [],
            // --- MODIFIED: Initialize with full default equipment structure ---
            equipment: {
                Head: null, Mask: null, Body: null, Gloves: null, Pants: null,
                Boots: null, Accessory: null, Charm: null, Weapon: null,
                Base: null, WallDecoration: null, WeaponStash: null, LuxuryFurniture: null, SecuritySystem: null
            },
            // --- END MODIFICATION ---
            organization: null,
            experience: 0,
            expNeeded: 100, // Example
            stats: { // Mirroring stats modal structure
                influence: 0,
                strength: 0,
                agility: 0,
                vitality: 0,
                hitRate: 50, // Example
                defence: 0,
                evasionRate: 5, // Example
                criticalRate: 5, // Example
                damage: 10 // Example base damage
            }
        },
        businesses: [], // Array of business objects the player interacts with/protects
        mapMarkers: {}, // State related to map markers if needed
        settings: {
            soundOn: true
        }
        // ... other global game state
    };
}

// --- ADDED: Helper to apply loaded business state from DB to runtime cache ---
// This function assumes businessesCache is globally available (from gameWorld.js)
function applyLoadedBusinessStateFromDB(loadedBusinessStateArray) {
    if (!Array.isArray(loadedBusinessStateArray) || loadedBusinessStateArray.length === 0) {
        console.log("[applyLoadedBusinessStateFromDB] No loaded business state array provided or empty.");
        return;
    }
    // Ensure businessesCache exists in the global scope
    if (typeof businessesCache === 'undefined') {
        console.error("[applyLoadedBusinessStateFromDB] Global 'businessesCache' not found! Cannot apply state.");
        return;
    }

    console.log(`[applyLoadedBusinessStateFromDB] Applying state for ${loadedBusinessStateArray.length} businesses from DB...`);
    let mergeCount = 0;
    let updatedIds = new Set();

    loadedBusinessStateArray.forEach(savedBizData => {
        const businessId = savedBizData.business_id;
        const runtimeBiz = businessesCache[businessId];

        if (runtimeBiz) {
            // Merge saved state into the existing cache entry
            // Convert DB timestamp string back to number for consistency
            runtimeBiz.lastCollected = savedBizData.last_collected_time ? new Date(savedBizData.last_collected_time).getTime() : 0;
            // Reconstruct organization object
            if (savedBizData.protecting_org_name && savedBizData.protecting_org_abbr) {
                runtimeBiz.protectingOrganization = {
                    name: savedBizData.protecting_org_name,
                    abbreviation: savedBizData.protecting_org_abbr
                };
            } else {
                runtimeBiz.protectingOrganization = null;
            }
            runtimeBiz.protectionPower = savedBizData.protection_power || 0;
            // Ensure protectors is an array and map includes alias (handle potential null from DB)
            runtimeBiz.protectingUsers = Array.isArray(savedBizData.protectors)
                ? savedBizData.protectors.map(p => ({ userId: p.userId, userAlias: p.userAlias || 'Unknown', userPower: p.userPower || 0 }))
                : [];

            updatedIds.add(businessId); // Mark as updated
            mergeCount++;
        } else {
            // Optional: Log if a saved business isn't in the current runtime cache
            // console.warn(`[applyLoadedBusinessStateFromDB] Saved business ${businessId} not found in current runtime cache. State not merged.`);
        }
    });
    console.log(`[applyLoadedBusinessStateFromDB] Applied saved state for ${mergeCount} businesses.`);

    // Update markers for only the businesses whose state was merged
    // Ensure updateSingleBusinessMarker and displayedBusinessIds are available
    if (typeof updateSingleBusinessMarker === 'function' && typeof displayedBusinessIds !== 'undefined') {
        console.log(`[applyLoadedBusinessStateFromDB] Updating markers for ${updatedIds.size} businesses with loaded state...`);
        updatedIds.forEach(id => {
            if (displayedBusinessIds.has(id)) { // Only update if marker is potentially visible
                 updateSingleBusinessMarker(id);
            }
        });
        // Update the protection book UI if any relevant business state changed
        if (updatedIds.size > 0 && typeof updateProtectionBookUI === 'function') {
             updateProtectionBookUI();
        }
    } else {
        console.warn("[applyLoadedBusinessStateFromDB] Cannot update markers/UI: updateSingleBusinessMarker or displayedBusinessIds not found.");
    }
}
// --- END ADDED ---


// --- Helper: Map Supabase data to Game State ---
function mapSupabaseToGameState(supabaseUserData) {
    if (!supabaseUserData) return null;

    try {
        const defaultState = getDefaultGameState(); // Start with default structure for safety

        // Map basic player fields, falling back to default if null/undefined in DB
        const playerState = defaultState.player;
        playerState.id = supabaseUserData.wallet_address; // Store the wallet address as the ID
        playerState.username = supabaseUserData.username || playerState.username;
        playerState.alias = supabaseUserData.alias || playerState.alias;
        playerState.cash = supabaseUserData.cash !== null ? supabaseUserData.cash : playerState.cash;
        playerState.hp = supabaseUserData.hp !== null ? supabaseUserData.hp : playerState.hp;
        playerState.level = supabaseUserData.level !== null ? supabaseUserData.level : playerState.level; // Map level
        playerState.power = supabaseUserData.power !== null ? supabaseUserData.power : playerState.power; // Map power
        // playerState.maxHp = calculateMaxHp(playerState.level, playerState.stats.vitality); // Recalculate if needed, or load if stored

        // --- MODIFIED: Preserve default equipment structure ---
        // Equipment items are loaded separately later in loadGame.
        // Ensure the equipment object retains its default structure with all slots.
        playerState.equipment = { ...defaultState.player.equipment }; // Keep the default structure
        playerState.inventory = defaultState.player.inventory; // Keep default inventory structure
        // --- END MODIFIED ---

        // --- ADDED: Map Organization Fields ---
        if (supabaseUserData.organization_name && supabaseUserData.organization_abbreviation) {
            playerState.organization = {
                name: supabaseUserData.organization_name,
                abbreviation: supabaseUserData.organization_abbreviation
            };
        } else {
            playerState.organization = null; // Ensure it's null if DB fields are null/missing
        }
        if (supabaseUserData.org_base_lat !== null && supabaseUserData.org_base_lon !== null) {
             playerState.orgBaseLocation = {
                 lat: supabaseUserData.org_base_lat,
                 lon: supabaseUserData.org_base_lon
             };
        } else {
             playerState.orgBaseLocation = null; // Ensure it's null if DB fields are null/missing
        }
        // --- END ADDED ---

        // Map other fields if they exist in the 'users' table
        // playerState.experience = supabaseUserData.experience !== null ? supabaseUserData.experience : playerState.experience;
        // playerState.expNeeded = calculateExpNeeded(playerState.level); // Recalculate

        // Map stats if stored directly in users table (less likely)
        // if (typeof supabaseUserData.stats === 'object' && supabaseUserData.stats !== null) {
        //     playerState.stats = { ...playerState.stats, ...supabaseUserData.stats };
        // }
        // playerState.expNeeded = calculateExpNeeded(playerState.level); // Recalculate
        // if (typeof supabaseUserData.stats === 'object' && supabaseUserData.stats !== null) {
        //     playerState.stats = { ...playerState.stats, ...supabaseUserData.stats };
        // }

        console.log("Mapped game state from Supabase data:", defaultState);
        return defaultState;
    } catch (error) {
        console.error("Error mapping Supabase data to game state:", error, "Data:", supabaseUserData);
        return null; // Return null if mapping fails
    }
}


// Export functions needed by other modules
// Using a global object pattern for simplicity in browser environment without modules
window.SaveManager = {
    initializeSupabase,
    saveGame,
    loadGame,
    fetchLeaderboard,
    // Expose sync functions directly if needed elsewhere, but prefer using saveGame
    // syncUserData,
    // syncBusinessProtection,
    // syncBusinessState, // Expose if needed directly
    applyLoadedBusinessStateFromDB // Expose helper for initialization.js
};
