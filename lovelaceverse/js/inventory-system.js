// Inventory management system integrated with Supabase
const InventorySystem = {
    /**
     * Add item to user's inventory
     * @param {string} userId - User's UUID
     * @param {Object} item - Item data including name, type, quantity, and stats
     * @returns {Promise<Object>} Inserted item record
     */
    async addItem(userId, item) {
        const { data, error } = await supabase
            .from('items')
            .insert([{
                user_id: userId,
                item_name: item.name,
                item_type: item.type,
                quantity: item.quantity || 1,
                item_data: item.stats || {},
                acquired_at: new Date().toISOString()
            }])
            .select();

        if (error) throw new Error(`Inventory add failed: ${error.message}`);
        return data[0];
    },

    /**
     * Get user's complete inventory
     * @param {string} userId - User's UUID
     * @returns {Promise<Array>} Array of inventory items
     */
    async getInventory(userId) {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', userId)
            .order('acquired_at', { ascending: false });

        if (error) throw new Error(`Inventory fetch failed: ${error.message}`);
        return data;
    },

    /**
     * Update item quantity or stats
     * @param {number} itemId - Item's database ID
     * @param {Object} updates - Fields to update (quantity and/or item_data)
     * @returns {Promise<Object>} Updated item record
     */
    async updateItem(itemId, updates) {
        const { data, error } = await supabase
            .from('items')
            .update(updates)
            .eq('item_id', itemId)
            .select();

        if (error) throw new Error(`Item update failed: ${error.message}`);
        return data[0];
    }
};

// Initialize with Supabase client
export function initInventory(supabaseClient) {
    supabase = supabaseClient;
    return InventorySystem;
}
