/**
 * Message Handler Module
 * Processes user messages and AI responses for the support chat
 */

if (typeof window.MessageHandler === 'undefined') {
  class MessageHandler {
    constructor(aiService, knowledgeBase) {
      this.aiService = aiService;
      this.knowledgeBase = knowledgeBase;
      this.messageHistory = [];
      this.typingDelay = { min: 10, max: 50 }; // ms per character for simulated typing
      this.processingDelay = { min: 300, max: 1200 }; // ms for simulated "thinking" time
      this.callbacks = {
        onTypingStart: null,
        onTypingUpdate: null,
        onResponseComplete: null
      };
    }

    /**
     * Initialize the message handler
     */
    async initialize() {
      // Initial welcome message
      this.messageHistory.push({
        role: 'assistant',
        content: "Hi, I'm Shelley! I'm here to help with any questions about the Adventure game. What would you like to know?",
        timestamp: new Date()
      });
      
      return true;
    }

    /**
     * Set callback functions
     * @param {Object} callbacks - Callback functions
     */
    setCallbacks(callbacks) {
      this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Process a user message
     * @param {string} message - User's message
     * @returns {Promise<void>}
     */
    async processMessage(message) {
      if (!message || message.trim() === '') return;
      
      // Add user message to history
      this.messageHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      
      // Notify that AI is typing (this will show the typing indicator)
      if (this.callbacks.onTypingStart) {
        this.callbacks.onTypingStart();
      }
      
      // Simulate processing delay
      const processingTime = Math.random() * 
        (this.processingDelay.max - this.processingDelay.min) + 
        this.processingDelay.min;
      
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      try {
        // Generate AI response
        const response = await this.aiService.generateResponse(message, this.knowledgeBase);
        
        // Simulate typing character by character
        await this.simulateTyping(response);
        
        // Add AI response to history
        this.messageHistory.push({
          role: 'assistant',
          content: response,
          timestamp: new Date()
        });
        
        // Notify that response is complete
        if (this.callbacks.onResponseComplete) {
          this.callbacks.onResponseComplete(response);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        
        // Handle error by displaying a fallback message
        const errorMessage = "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
        
        await this.simulateTyping(errorMessage);
        
        this.messageHistory.push({
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        });
        
        if (this.callbacks.onResponseComplete) {
          this.callbacks.onResponseComplete(errorMessage);
        }
      }
    }

    /**
     * Simulate typing animation for AI responses
     * @param {string} text - Text to type
     * @returns {Promise<void>}
     */
    async simulateTyping(text) {
      let typedText = '';
      
      for (let i = 0; i < text.length; i++) {
        typedText += text[i];
        
        // Notify about typing progress
        if (this.callbacks.onTypingUpdate) {
          this.callbacks.onTypingUpdate(typedText);
        }
        
        // Random delay between characters for natural typing effect
        const delay = Math.random() * 
          (this.typingDelay.max - this.typingDelay.min) + 
          this.typingDelay.min;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return typedText;
    }

    /**
     * Get the full message history
     * @returns {Array} - Message history
     */
    getMessageHistory() {
      return this.messageHistory;
    }

    /**
     * Clear the message history
     */
    clearMessageHistory() {
      this.messageHistory = [];
      
      // Add initial welcome message
      this.messageHistory.push({
        role: 'assistant',
        content: "Hi, I'm Shelley! I'm here to help with any questions about the Adventure game. What would you like to know?",
        timestamp: new Date()
      });
    }

    /**
     * Format messages for display
     * @param {Array} messages - Messages to format
     * @returns {Array} - Formatted messages
     */
    formatMessagesForDisplay(messages = null) {
      const messagesToFormat = messages || this.messageHistory;
      
      return messagesToFormat.map(message => {
        const formattedTimestamp = message.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        return {
          content: message.content,
          timestamp: formattedTimestamp,
          isUser: message.role === 'user',
          className: message.role === 'user' ? 'user-message' : 'ai-message'
        };
      });
    }
  }
  window.MessageHandler = MessageHandler;
}
