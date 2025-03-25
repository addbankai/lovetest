// Enhanced game config that extends the original config
const gameConfig = {
    supabase: {
        url: 'https://mbdjkjtivtsbrzmypegn.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZGpranRpdnRzYnJ6bXlwZWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMTA0MzMsImV4cCI6MjA1NzY4NjQzM30.46I3qb7D0905n5HZg2J_5X-y3XC-f4ErfGOhYRNzuqk'
    },
    blockfrost: {
        apiKey: 'ainnety7Re6jhIWAYFvZRa2tmXJLlObstUswUU',
        apiUrl: 'https://cardano-mainnet.blockfrost.io/api/v0'
    },
    
    // Game configuration
    game: {
        title: "Lovelace Verse",
        version: "1.0.0",
        maxActiveCharacters: 6,
        defaultSyncInterval: 30000, // 30 seconds
        autoSaveInterval: 60000 // 60 seconds
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = gameConfig;
}

// Add EnhancedSupabaseClient singleton for consistent client usage
const EnhancedSupabaseClient = {
    instance: null,
    
    getInstance: function() {
        if (!this.instance) {
            // Use the original config values for connection
            if (!config.supabase.url || !config.supabase.key) {
                console.error('Supabase configuration missing');
                return null;
            }
            
            this.instance = supabase.createClient(
                config.supabase.url,
                config.supabase.key
            );
            console.log('Enhanced Supabase client initialized');
        }
        return this.instance;
    }
};
