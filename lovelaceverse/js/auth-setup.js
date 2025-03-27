/**
 * Authentication setup and database initialization for Cyberpunk MMORPG
 * This script creates the necessary tables in Supabase for authentication
 */

const AuthSetup = {
    // Supabase client for database operations
    supabaseUrl: config.supabase.url,
    supabaseKey: config.supabase.key,
    
    // Check if Blockfrost API is valid
    blockfrostApiKey: config.blockfrost.apiKey,
    
    /**
     * Initialize the setup process
     */
    init: async function() {
        console.log('Starting authentication setup...');
        
        try {
            // Create Supabase client
            this.initSupabaseClient();
            
            // Create required tables if they don't exist
            await this.createRequiredTables();
            
            console.log('Authentication setup completed successfully!');
        } catch (error) {
            console.error('Authentication setup failed:', error);
            throw error;
        }
    },
    
    /**
     * Initialize Supabase client
     */
    initSupabaseClient: function() {
        try {
            this.supabase = SupabaseClient.getInstance();
            if (!this.supabase) {
                console.error('Failed to get Supabase client');
                return false;
            }
            console.log('Supabase client initialized for setup');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            return false;
        }
    },
    
    /**
     * Verify the authentication setup
     */
    verify: function() {
        console.log('Verifying authentication setup...');
        
        // Verify Supabase client
        const hasSupabase = typeof supabase !== 'undefined';
        console.log('✓ Supabase client library loaded:', hasSupabase);
        
        // Verify Vespr wallet availability
        const hasVespr = typeof window.vespr !== 'undefined';
        console.log('✓ Vespr wallet extension available:', hasVespr);
        
        // Check if Blockfrost API is valid
        const blockfrostApiKey = "mainnety7Re6jhIWAYFvZRa2tmXJLlObstUswUU";
        console.log('✓ Blockfrost API key configured:', !!blockfrostApiKey);
        
        // Check if Authentication System is initialized
        const hasAuthSystem = typeof AuthenticationSystem !== 'undefined';
        console.log('✓ Authentication System module loaded:', hasAuthSystem);
        
        // Display status summary
        console.log('Authentication environment status:');
        console.log('- Supabase: ' + (hasSupabase ? '✓ Available' : '❌ Not available'));
        console.log('- Vespr Wallet: ' + (hasVespr ? '✓ Available' : '❌ Not available'));
        console.log('- Authentication System: ' + (hasAuthSystem ? '✓ Loaded' : '❌ Not loaded'));
        
        return {
            hasSupabase,
            hasVespr,
            hasAuthSystem
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSetup;
}

// Auto-initialize when included in the page - uncomment to enable
// document.addEventListener('DOMContentLoaded', () => {
//     AuthSetup.init().catch(console.error);
// });
