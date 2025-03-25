/**
 * Verification script for authentication/loading screen fixes
 * This script checks if the fixes are working properly
 */

const FixVerification = {
    // Check if we're showing double loading circles
    checkLoadingCircles: function() {
        // Look for loading spinners
        const loadingScreenSpinner = document.querySelector('#loading-screen .loading-spinner');
        const standbySpinner = document.querySelector('#standby-spinner');
        
        // Check if both are visible at the same time
        if (loadingScreenSpinner && standbySpinner && 
            window.getComputedStyle(loadingScreenSpinner).display !== 'none' &&
            window.getComputedStyle(standbySpinner).display !== 'none') {
            console.warn('VERIFICATION FAILED: Double loading circles detected');
            return false;
        }
        
        console.log('VERIFICATION PASSED: No double loading circles detected');
        return true;
    },
    
    // Check if authentication persists after refresh
    checkAuthPersistence: function() {
        // Store current auth state
        const isAuthenticated = AuthenticationSystem.isUserAuthenticated();
        const authMode = AuthenticationSystem.getAuthMode();
        
        console.log('VERIFICATION: Current auth state -', isAuthenticated ? 'Authenticated' : 'Not authenticated');
        console.log('VERIFICATION: Current auth mode -', authMode || 'None');
        
        if (isAuthenticated) {
            // Check if we have proper storage values
            const storedAuthMode = Utils.loadFromStorage(AuthenticationSystem.STORAGE_KEYS.AUTH_MODE);
            const hasGuestId = Utils.loadFromStorage(AuthenticationSystem.STORAGE_KEYS.GUEST_ID) !== null;
            const hasWalletAddress = Utils.loadFromStorage(AuthenticationSystem.STORAGE_KEYS.USER_WALLET) !== null;
            
            if (authMode === 'guest' && (!storedAuthMode || storedAuthMode !== 'guest' || !hasGuestId)) {
                console.warn('VERIFICATION FAILED: Guest session storage inconsistency');
                return false;
            }
            
            if (authMode === 'wallet' && (!storedAuthMode || storedAuthMode !== 'wallet' || !hasWalletAddress)) {
                console.warn('VERIFICATION FAILED: Wallet session storage inconsistency');
                return false;
            }
            
            console.log('VERIFICATION PASSED: Authentication storage is consistent');
            return true;
        }
        
        return 'Not authenticated';
    },
    
    // Execute all verification checks
    runAll: function() {
        console.log('=== Running Fix Verification Checks ===');
        
        // First check if authentication system is ready
        if (typeof AuthenticationSystem === 'undefined' || 
            typeof AuthenticationSystem.isUserAuthenticated !== 'function') {
            console.warn('VERIFICATION FAILED: Authentication system not fully initialized');
            return false;
        }
        
        const loadingResult = this.checkLoadingCircles();
        const authResult = this.checkAuthPersistence();
        
        console.log('=== Verification Results ===');
        console.log('Loading Circles Check:', loadingResult ? 'PASSED' : 'FAILED');
        console.log('Auth Persistence Check:', authResult === true ? 'PASSED' : 
                                              (authResult === 'Not authenticated' ? 'SKIPPED (not authenticated)' : 'FAILED'));
        
        return loadingResult && (authResult === true || authResult === 'Not authenticated');
    }
};

// Run verification when both authentication system and DOM are ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure all systems are initialized
    setTimeout(() => {
        try {
            FixVerification.runAll();
        } catch(e) {
            console.error('Error during verification:', e);
        }
    }, 2000);
});

// Export for use in console
if (typeof window !== 'undefined') {
    window.FixVerification = FixVerification;
}
