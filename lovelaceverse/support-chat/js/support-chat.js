/**
 * Support Chat Main Module
 * Entry point for the AI support chat system
 */

// Global objects for use by other scripts
if (typeof window.threeAvatar === 'undefined') window.threeAvatar = null;
if (typeof window.knowledgeBase === 'undefined') window.knowledgeBase = null;
if (typeof window.aiService === 'undefined') window.aiService = null;
if (typeof window.messageHandler === 'undefined') window.messageHandler = null;
if (typeof window.uiController === 'undefined') window.uiController = null;
if (typeof window.supportChat === 'undefined') window.supportChat = null;

if (typeof window.SupportChat === 'undefined') {
  class SupportChat {
    constructor() {
      // Check for existing instances
      if (window.supportChat) {
        console.warn('Support chat instance already exists');
        return window.supportChat;
      }

      // Module instances will be created after their scripts load
      this.threeAvatar = window.threeAvatar || null;
      this.knowledgeBase = window.knowledgeBase || null;
      this.aiService = window.aiService || null;
      this.messageHandler = window.messageHandler || null;
      this.uiController = window.uiController || null;
      
      // Store instance globally
      window.supportChat = this;
      
      // Initialization state
      this.isInitialized = false;
      
      // Font loading for cyberpunk style
      this.fontUrl = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap';
    }

    /**
     * Initialize the support chat system
     * @returns {Promise<boolean>} - Whether initialization was successful
     */
    async initialize() {
      // Prevent double initialization
      if (this.isInitialized) {
          console.log("Support chat already initialized.");
          return true;
      }
        
      try {
        console.log('Initializing Shelly AI Support Chat...');
        
        // Load font
        await this.loadFont();

        // Inject HTML and CSS *during* initialization
        this.injectHtml(); // This will now ensure the container starts hidden
        this.injectCss();

        // Wait for DOM to be ready
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            window.addEventListener('load', resolve);
          });
        }
        
        // Create instances
        this.threeAvatar = new ThreeAvatar();
        this.knowledgeBase = new KnowledgeBase();
        this.aiService = new AiService();
        this.messageHandler = new MessageHandler(this.aiService, this.knowledgeBase);
        this.uiController = new UiController();
        
        // Initialize components in sequence
        const uiInitialized = this.uiController.initialize({
          callbacks: {
            onSendMessage: (message) => this.handleUserMessage(message),
            onChatOpened: () => this.handleChatOpened(),
            onChatClosed: () => this.handleChatClosed(),
            onChatToggle: (isOpen) => this.handleChatToggle(isOpen)
          }
        });
        
        if (!uiInitialized) {
          throw new Error('Failed to initialize UI');
        }
        
        // Get canvas elements from UI
        const canvasElements = this.uiController.getCanvasElements();
        
        // Initialize Three.js avatar
        await this.threeAvatar.initialize(
          canvasElements.bubbleCanvas,
          canvasElements.avatarCanvas
        );
        
        // Initialize knowledge base
        const knowledgeBaseInitialized = await this.knowledgeBase.initialize();
        if (!knowledgeBaseInitialized) {
          console.warn('Knowledge base initialization issues - will use fallback responses');
        }
        
        // Initialize AI service
        const aiServiceInitialized = await this.aiService.initialize();
        if (!aiServiceInitialized) {
          console.warn('AI service initialization issues - will use fallback responses');
        }
        
        // Initialize message handler and set callbacks
        await this.messageHandler.initialize();
        this.messageHandler.setCallbacks({
          onTypingStart: () => this.handleTypingStart(),
          onTypingUpdate: (text) => this.handleTypingUpdate(text),
          onResponseComplete: (response) => this.handleResponseComplete(response)
        });
        
        // Display initial messages (they won't be visible until chat is opened)
        const initialMessages = this.messageHandler.formatMessagesForDisplay();
        this.uiController.displayMessages(initialMessages);

        // Scrape game information
        this.scrapeGameInfo();

        console.log('Shelly AI Support Chat initialized successfully');
        this.isInitialized = true;

        // --- Make the chat container (bubble) visible now that init is done ---
        const chatContainer = document.getElementById('support-chat-container');
        if (chatContainer) {
            chatContainer.style.display = 'block'; // Or 'flex', depending on your CSS for the container
        }
        // --- End making chat visible ---

        // --- Automatically open the chat window after successful initialization ---
        if (this.uiController) {
            // Add a slight delay to ensure the container is visible before opening
            setTimeout(() => {
                 this.uiController.openChat();
                 console.log("Automatically opened chat window post-initialization.");
            }, 100); // 100ms delay
        }
        // --- End auto-open ---

        return true;
      } catch (error) {
        console.error('Failed to initialize support chat:', error);
        this.isInitialized = false; // Ensure flag is false on error
        return false;
      }
    }

    /**
     * Load Orbitron font for cyberpunk style
     */
    async loadFont() {
      return new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = this.fontUrl;
        link.onload = () => resolve();
        document.head.appendChild(link);
      });
    }

    /**
     * Inject HTML for the support chat
     */
    injectHtml() {
      // Check if chat container already exists
      if (document.getElementById('support-chat-container')) {
        console.log('Support chat interface already exists');
        // Ensure interface is hidden if it somehow exists before init
        const existingInterface = document.getElementById('support-chat-interface');
        if (existingInterface) existingInterface.classList.remove('active');
        // Ensure container is hidden initially
        const existingContainer = document.getElementById('support-chat-container');
        if (existingContainer) existingContainer.style.display = 'none';
        return;
      }

      // Direct HTML injection - Start container hidden, ensure interface does NOT have 'active' class initially
      document.body.insertAdjacentHTML('beforeend', `
        <div id="support-chat-container" style="display: none;"> <!-- Start hidden -->
          <div id="support-chat-bubble" class="neon-border">
            <canvas id="shelly-canvas"></canvas>
          </div>
          <div id="support-chat-interface"> <!-- No 'active' class here -->
            <div id="support-chat-header">
              <div id="support-chat-title">SHELLY AI SUPPORT</div>
              <button id="support-chat-close">×</button>
            </div>
            <div id="support-chat-avatar-container">
              <canvas id="support-chat-avatar-canvas"></canvas>
            </div>
            <div id="support-chat-messages"></div>
            <div id="support-chat-input-container">
              <textarea id="support-chat-input" placeholder="Ask about the game..." rows="1" maxlength="200"></textarea>
              <button id="support-chat-send">Send</button>
            </div>
          </div>
        </div>
      `);
    }

    /**
     * Inject CSS for the support chat
     */
    injectCss() {
      // Prevent duplicate CSS injection
      if (document.querySelector('link[href="support-chat/css/support-chat.css"]')) {
          return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'support-chat/css/support-chat.css';
      document.head.appendChild(link);
    }

    /**
     * Scrape game information in the background
     */
    async scrapeGameInfo() {
      try {
        console.log('Scraping game information...');
        await this.knowledgeBase.scrapeGameInfo();
        console.log('Game information scraped successfully');
      } catch (error) {
        console.error('Failed to scrape game information:', error);
      }
    }

    /**
     * Handle user message
     * @param {string} message - User's message
     */
    async handleUserMessage(message) {
      // User message is already displayed by the UI controller
      // No need to display it again here to avoid duplication
      
      // Set avatar to thinking state
      if (this.threeAvatar) this.threeAvatar.setState('thinking');
      
      // Process the message
      if (this.messageHandler) await this.messageHandler.processMessage(message);
    }

    /**
     * Handle typing start
     */
    handleTypingStart() {
      if (this.uiController) this.uiController.showTypingIndicator();
      if (this.threeAvatar) this.threeAvatar.setState('thinking');
    }

    /**
     * Handle typing update
     * @param {string} text - Current text being typed
     */
    handleTypingUpdate(text) {
      if (this.uiController) this.uiController.updateTypingMessage(text);
      if (this.threeAvatar) this.threeAvatar.setState('talking');
    }

    /**
     * Handle response complete
     * @param {string} response - Final response
     */
    handleResponseComplete(response) {
      if (this.uiController) this.uiController.finalizeTypingMessage();
      if (this.threeAvatar) this.threeAvatar.setState('idle');
    }

    /**
     * Handle chat opened event
     */
    handleChatOpened() {
      // Show welcome message if new session
      if (this.threeAvatar) this.threeAvatar.setState('talking');
      
      // Short delay to return to idle
      setTimeout(() => {
        if (this.threeAvatar) this.threeAvatar.setState('idle');
      }, 1000);
    }

    /**
     * Handle chat closed event
     */
    handleChatClosed() {
      if (this.threeAvatar) this.threeAvatar.setState('idle');
    }

    /**
     * Handle chat toggle event
     * @param {boolean} isOpen - Whether the chat is open
     */
    handleChatToggle(isOpen) {
      // Set avatar state based on chat state
      if (this.threeAvatar) this.threeAvatar.setState(isOpen ? 'talking' : 'idle');
      
      // If opening, show a short animation
      if (isOpen) {
        setTimeout(() => {
          if (this.threeAvatar) this.threeAvatar.setState('idle');
        }, 1000);
      }
    }

    /**
     * Triggered externally (e.g., by Gacha system) after the first character is obtained.
     */
    triggerFirstCharacterReward() {
        if (!this.isInitialized) {
            console.warn("SupportChat not initialized, cannot trigger reward.");
            // Optionally, try to initialize now if needed
            // this.initialize().then(() => this.triggerFirstCharacterReward());
            return;
        }
        console.log("Triggering first character reward in SupportChat...");
        // Ensure chat is open
        if (this.uiController) this.uiController.openChat();
        // Tell message handler to process the reward and congratulatory message
        if (this.messageHandler) {
            this.messageHandler.handleFirstCharacterReward();
        }
    }
  }
window.SupportChat = SupportChat;
}

// Create the instance early so it's available
if (!window.supportChat) {
    window.supportChat = new SupportChat();
}

// Initialize after successful login and progress loading
document.addEventListener('progressLoaded', () => {
    console.log('Progress loaded, initializing Support Chat...');
    if (window.supportChat && !window.supportChat.isInitialized) {
        // Use a small delay to ensure other UI updates related to login are complete
        setTimeout(() => {
            window.supportChat.initialize().then(initialized => {
                if (!initialized) {
                    console.error("Support chat failed to initialize after progress load.");
                }
            });
        }, 500); 
    } else if (window.supportChat && window.supportChat.isInitialized) {
         console.log("Support chat already initialized.");
         // If already initialized, maybe just open the chat?
         if (window.supportChat.uiController && !window.supportChat.uiController.isOpen) {
              // Add a delay here too
              setTimeout(() => {
                   console.log("Chat already initialized, opening window.");
                   window.supportChat.uiController.openChat();
              }, 100);
         }
    } else {
         console.error("SupportChat instance not found during progressLoaded event.");
    }
});

// Fallback: Initialize on window load if progressLoaded doesn't fire (e.g., offline mode)
window.addEventListener('load', () => {
    // Add a longer delay for the fallback
    setTimeout(() => {
        if (window.supportChat && !window.supportChat.isInitialized) {
            // Check if user is authenticated before fallback init
            if (typeof AuthenticationSystem !== 'undefined' && AuthenticationSystem.isAuthenticated) {
                 console.warn("Fallback: Initializing Support Chat on window load (progressLoaded event might not have fired).");
                 window.supportChat.initialize().catch(err => {
                      console.error("Fallback support chat initialization failed:", err);
                 });
            } else {
                 console.log("User not authenticated, skipping fallback chat initialization.");
            }
        }
    }, 2000); // 2-second delay for fallback
});
