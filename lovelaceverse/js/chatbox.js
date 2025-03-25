const ChatSystem = {
    chatbox: null,
    messagesContainer: null,
    inputField: null,
    isMinimized: false,
    messageHistory: [],
    maxMessages: 50,

    init: function() {
        this.createChatbox();
        this.bindEvents();
        this.addSystemMessage("Welcome to LovelaceVerse! Type /help for commands.");
    },

    createChatbox: function() {
        // Create main container
        this.chatbox = document.createElement('div');
        this.chatbox.className = 'game-chatbox';

        // Create header
        const header = document.createElement('div');
        header.className = 'chatbox-header';
        
        const title = document.createElement('h3');
        title.className = 'chatbox-title';
        title.textContent = 'Chat';
        
        const controls = document.createElement('div');
        controls.className = 'chatbox-controls';
        
        const minimizeBtn = document.createElement('button');
        minimizeBtn.id = 'minimize-chat';
        minimizeBtn.textContent = '─';
        minimizeBtn.title = 'Minimize';
        
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clear-chat';
        clearBtn.textContent = '✕';
        clearBtn.title = 'Clear chat';

        controls.appendChild(minimizeBtn);
        controls.appendChild(clearBtn);
        header.appendChild(title);
        header.appendChild(controls);

        // Create messages container
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'chatbox-messages';

        // Create input area
        const inputArea = document.createElement('div');
        inputArea.className = 'chatbox-input';
        
        this.inputField = document.createElement('input');
        this.inputField.type = 'text';
        this.inputField.placeholder = 'Type your message...';
        
        const sendButton = document.createElement('button');
        sendButton.textContent = 'Send';
        sendButton.id = 'chatbox-send';

        inputArea.appendChild(this.inputField);
        inputArea.appendChild(sendButton);

        // Assemble chatbox
        this.chatbox.appendChild(header);
        this.chatbox.appendChild(this.messagesContainer);
        this.chatbox.appendChild(inputArea);

        // Add to document
        document.body.appendChild(this.chatbox);
    },

    bindEvents: function() {
        // Send button
        document.getElementById('chatbox-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Clear button
        document.getElementById('clear-chat').addEventListener('click', () => {
            this.clearChat();
        });

        // Minimize button
        document.getElementById('minimize-chat').addEventListener('click', () => {
            this.toggleMinimize();
        });
    },

    sendMessage: function() {
        const message = this.inputField.value.trim();
        if (message === '') return;

        if (message.startsWith('/')) {
            this.handleCommand(message);
        } else {
            this.addPlayerMessage('You', message);
        }

        this.inputField.value = '';
    },

    handleCommand: function(command) {
        const parts = command.slice(1).split(' ');
        const cmd = parts[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.addSystemMessage('Available commands: /help, /clear, /roll, /me [action]');
                break;
            case 'clear':
                this.clearChat();
                break;
            case 'roll':
                const max = parseInt(parts[1]) || 100;
                const roll = Math.floor(Math.random() * max) + 1;
                this.addSystemMessage(`Roll (1-${max}): ${roll}`);
                break;
            case 'me':
                const action = parts.slice(1).join(' ');
                if (action) {
                    this.addSystemMessage(`* You ${action}`);
                }
                break;
            default:
                this.addSystemMessage(`Unknown command: ${cmd}`);
        }
    },

    addSystemMessage: function(text) {
        const message = document.createElement('div');
        message.className = 'chat-message system-message';
        message.textContent = text;
        this.addMessageElement(message);
    },

    addPlayerMessage: function(sender, text) {
        const message = document.createElement('div');
        message.className = 'chat-message player-message';
        
        const senderSpan = document.createElement('span');
        senderSpan.className = 'sender';
        senderSpan.textContent = sender + ': ';
        
        const contentSpan = document.createElement('span');
        contentSpan.className = 'content';
        contentSpan.textContent = text;

        message.appendChild(senderSpan);
        message.appendChild(contentSpan);
        this.addMessageElement(message);
    },

    addMessageElement: function(element) {
        this.messagesContainer.appendChild(element);
        this.messageHistory.push(element.cloneNode(true));
        
        if (this.messageHistory.length > this.maxMessages) {
            this.messageHistory.shift();
        }
        
        this.scrollToBottom();
    },

    scrollToBottom: function() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    },

    clearChat: function() {
        this.messagesContainer.innerHTML = '';
        this.addSystemMessage('Chat cleared');
    },

    toggleMinimize: function() {
        this.isMinimized = !this.isMinimized;
        const btn = document.getElementById('minimize-chat');
        
        if (this.isMinimized) {
            this.chatbox.classList.add('chat-minimize');
            btn.textContent = '□';
            btn.title = 'Maximize';
        } else {
            this.chatbox.classList.remove('chat-minimize');
            btn.textContent = '─';
            btn.title = 'Minimize';
            this.scrollToBottom();
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ChatSystem.init();
});