/**
 * Singleton Supabase client
 */
const SupabaseClient = {
    instance: null,
    isReady: false,

    /**
     * Get or create Supabase client instance
     * @returns {Object} Supabase client
     */
    getInstance: function() {
        if (!this.instance) {
            if (typeof supabase === 'undefined') {
                console.error('Supabase client library not loaded');
                return null;
            }

            try {
                this.instance = supabase.createClient(config.supabase.url, config.supabase.key, {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false
                    }
                });
                this.isReady = true;
            } catch (error) {
                console.error('Failed to create Supabase client:', error);
                return null;
            }
        }
        return this.instance;
    }
};

// Make it globally available
window.SupabaseClient = SupabaseClient;

// Initialize immediately - REMOVED (Instance will be created on first call to getInstance)
// SupabaseClient.getInstance();
