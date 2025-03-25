/**
 * UI Controller Module
 * Handles UI interactions for the support chat
 */

if (typeof window.UiController === 'undefined') {
  class UiController {
    constructor() {
      // DOM elements
      this.container = null;
      this.bubble = null;
      this.interface = null;
      this.header = null;
      this.closeButton = null;
      this.messagesContainer = null;
      this.inputContainer = null;
      this.input = null;
      this.sendButton = null;
      this.avatarContainer = null;
      
      // UI state
      this.isOpen = false;
      this.isTyping = false;
      
      // Callback functions
      this.callbacks = {
        onSendMessage: null,
        onChatToggle: null,
        onChatClosed: null,
        onChatOpened: null
      };
      
      // Typing indicator element
      this.typingIndicator = null;
    }

    /**
     * Initialize the UI controller
     * @param {Object} options - Configuration options
     */
    initialize(options = {}) {
      this.container = document.getElementById('support-chat-container');
      
      if (!this.container) {
        console.error('Support chat container not found');
        return false;
      }
      
      // Store DOM elements
      this.bubble = document.getElementById('support-chat-bubble');
      this.interface = document.getElementById('support-chat-interface');
      this.header = document.getElementById('support-chat-header');
      this.closeButton = document.getElementById('support-chat-close');
      this.messagesContainer = document.getElementById('support-chat-messages');
      this.inputContainer = document.getElementById('support-chat-input-container');
      this.input = document.getElementById('support-chat-input');
      this.sendButton = document.getElementById('support-chat-send');
      this.avatarContainer = document.getElementById('support-chat-avatar-container');
      
      // Set callbacks from options
      if (options.callbacks) {
        this.callbacks = { ...this.callbacks, ...options.callbacks };
      }
      
      // Create typing indicator
      this.createTypingIndicator();
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log('UI controller initialized');
      return true;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
      // Chat bubble click - toggle chat interface
      this.bubble.addEventListener('click', () => {
        this.toggleChat();
      });
      
      // Close button click - close chat interface
      this.closeButton.addEventListener('click', () => {
        this.closeChat();
      });
      
      // Send button click - send message
      this.sendButton.addEventListener('click', () => {
        this.sendMessage();
      });
      
      // Input keydown - send on Enter
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      // Auto-resize textarea
      this.input.addEventListener('input', () => {
        this.resizeTextarea();
      });
      
      // Prevent chat closing when clicking inside the interface
      this.interface.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      // Allow closing chat by clicking outside (on document)
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.container.contains(e.target)) {
          this.closeChat();
        }
      });
      
      // Accessibility - keyboard navigation
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeChat();
        }
      });
    }

    /**
     * Toggle the chat interface
     */
    toggleChat() {
      if (this.isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
      
      if (this.callbacks.onChatToggle) {
        this.callbacks.onChatToggle(this.isOpen);
      }
    }

    /**
     * Open the chat interface
     */
    openChat() {
      this.isOpen = true;
      this.interface.classList.add('active');
      
      // Focus on input after a short delay to allow animation to complete
      setTimeout(() => {
        this.input.focus();
      }, 300);
      
      if (this.callbacks.onChatOpened) {
        this.callbacks.onChatOpened();
      }
    }

    /**
     * Close the chat interface
     */
    closeChat() {
      this.isOpen = false;
      this.interface.classList.remove('active');
      
      if (this.callbacks.onChatClosed) {
        this.callbacks.onChatClosed();
      }
    }

    /**
     * Send message
     */
    sendMessage() {
      const message = this.input.value.trim();
      
      if (message === '') return;
      
      // Display the user message immediately
      this.displayMessage({
        content: message,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      });
      
      // Clear input
      this.input.value = '';
      this.resizeTextarea();
      
      // Send message via callback
      if (this.callbacks.onSendMessage) {
        this.callbacks.onSendMessage(message);
      }
      
      // Focus back on input
      this.input.focus();
    }

    /**
     * Create the typing indicator element
     */
    createTypingIndicator() {
      this.typingIndicator = document.createElement('div');
      this.typingIndicator.className = 'typing-indicator';
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        this.typingIndicator.appendChild(dot);
      }
    }

    /**
     * Show the typing indicator
     */
    showTypingIndicator() {
      if (!this.isTyping) {
        this.isTyping = true;
        this.messagesContainer.appendChild(this.typingIndicator);
        this.scrollToBottom();
      }
    }

    /**
     * Hide the typing indicator
     */
    hideTypingIndicator() {
      if (this.isTyping) {
        this.isTyping = false;
        if (this.typingIndicator.parentNode === this.messagesContainer) {
          this.messagesContainer.removeChild(this.typingIndicator);
        }
      }
    }

    /**
     * Display a message
     * @param {Object} message - Message object to display
     */
    displayMessage(message) {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${message.className || (message.isUser ? 'user-message' : 'ai-message')}`;
      
      const content = document.createElement('div');
      content.className = 'message-content';
      content.textContent = message.content;
      
      messageElement.appendChild(content);
      
      if (message.timestamp) {
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = message.timestamp;
        messageElement.appendChild(timestamp);
      }
      
      this.messagesContainer.appendChild(messageElement);
      this.scrollToBottom();
    }

    /**
     * Update the current typing message
     * @param {string} text - Current text being typed
     */
    updateTypingMessage(text) {
      // Hide the typing indicator while showing the actual message
      this.hideTypingIndicator();
      
      // Check if there's already a temporary message
      let tempMessage = this.messagesContainer.querySelector('.ai-message.temp-message');
      
      if (!tempMessage) {
        // Create a new temporary message
        tempMessage = document.createElement('div');
        tempMessage.className = 'message ai-message temp-message';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        tempMessage.appendChild(content);
        
        this.messagesContainer.appendChild(tempMessage);
      }
      
      // Update the content
      tempMessage.querySelector('.message-content').textContent = text;
      this.scrollToBottom();
    }

    /**
     * Finalize the typing message (remove temporary status)
     */
    finalizeTypingMessage() {
      const tempMessage = this.messagesContainer.querySelector('.ai-message.temp-message');
      if (tempMessage) {
        tempMessage.classList.remove('temp-message');
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        tempMessage.appendChild(timestamp);
      }
    }

    /**
     * Display multiple messages
     * @param {Array} messages - Array of message objects to display
     */
    displayMessages(messages) {
      // Clear existing messages
      this.clearMessages();
      
      // Add each message
      messages.forEach(message => {
        this.displayMessage(message);
      });
      
      this.scrollToBottom();
    }

    /**
     * Clear all messages
     */
    clearMessages() {
      while (this.messagesContainer.firstChild) {
        this.messagesContainer.removeChild(this.messagesContainer.firstChild);
      }
    }

    /**
     * Auto-resize the textarea
     */
    resizeTextarea() {
      this.input.style.height = 'auto';
      this.input.style.height = (this.input.scrollHeight) + 'px';
    }

    /**
     * Scroll the messages container to the bottom
     */
    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    /**
     * Get canvas elements for avatar
     * @returns {Object} - Canvas elements
     */
    getCanvasElements() {
      return {
        bubbleCanvas: document.getElementById('shelly-canvas'),
        avatarCanvas: document.getElementById('support-chat-avatar-canvas')
      };
    }
  }
  window.UiController = UiController;
}
