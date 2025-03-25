const config = {
    supabase: {
        url: 'https://mbdjkjtivtsbrzmypegn.supabase.co',  // Direct URL instead of placeholder
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZGpranRpdnRzYnJ6bXlwZWduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMTA0MzMsImV4cCI6MjA1NzY4NjQzM30.46I3qb7D0905n5HZg2J_5X-y3XC-f4ErfGOhYRNzuqk'   // Your anon key
    },
    blockfrost: {
        apiKey: 'ainnety7Re6jhIWAYFvZRa2tmXJLlObstUswUU',
        apiUrl: 'https://cardano-mainnet.blockfrost.io/api/v0'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}
