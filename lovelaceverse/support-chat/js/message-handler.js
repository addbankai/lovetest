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

      // Quest Management
      this.quests = []; // Holds all available quests
      this.currentQuest = null; // ID of the active quest
      this.questProgress = {}; // Tracks progress for the current quest { stepIndex: 0 }

      // Reward definitions
      this.firstCharacterRewardItems = ['cyber_blade', 'quantum_dagger', 'pulse_bow', 'data_staff'];
      this.epicWeaponChoices = ['razor_dagger', 'razor_dual_dagger', 'razor_bow', 'razor_katana', 'razor_grimoire'];
    }

    /**
     * Initialize the message handler
     */
    async initialize() {
      this.loadQuests(); // Load quest definitions

      // Initial welcome message - potentially offer a quest here
      const initialMessage = this.getInitialMessage();
      this.messageHistory.push({
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date()
      });

      // Automatically start the first quest if available
      if (this.quests.length > 0) {
          this.startQuest(this.quests[0].id);
      }

      return true;
    }

    /**
     * Load quest definitions.
     * TODO: Potentially load from an external file/API in the future.
     */
    loadQuests() {
        this.quests = [
            {
                id: 'gacha_tutorial', // Renamed quest ID
                name: 'First Character Gacha',
                description: 'Guides the user to get their first character.',
                steps: [
                    {
                        // This step might be triggered automatically or by a specific user action after login.
                        // For now, let's assume it's triggered by the user saying something like "start" or "help" initially.
                        trigger: /start|help|guide|hello|hi|hey/i,
                        response: "Welcome to Lovelaceverse! Have you acquired your first character yet?",
                        completed: false
                    },
                    {
                        // User might respond "no", "not yet", "how?"
                        trigger: /no|not yet|how|where/i,
                        response: "No worries! You have some free pulls to get started. Click on the 'DNA Gacha' button in the menu to summon your first character!",
                        completed: false
                    },
                    {
                        // User might confirm they did it or ask another question after pulling.
                        // This step might need adjustment based on how the game confirms a gacha pull.
                        // For simplicity, let's end the quest after guiding them.
                        trigger: /ok|thanks|done|got it|i did/i, // Trigger after they acknowledge the gacha instruction
                        response: "Awesome! Your new character should make your adventures even more exciting.",
                        completed: false // This step completes the quest
                    }
                ],
                // Updated reward message - This quest doesn't grant items directly anymore, it leads to the next quest.
                reward: { type: 'message', value: 'Quest Complete: First Character Summoned!' } // Shortened message
            },
            // --- NEW QUEST (Simplified) ---
            {
                id: 'expand_team_quest', // Renamed quest ID
                name: 'Expand Your Team',
                description: 'Collect more characters to earn an Epic Weapon.',
                steps: [
                    {
                        // Triggered if user accepts the offer after the first quest or asks about next steps
                        trigger: /yes|ok|sure|next|team|characters/i,
                        response: "Your next goal is to expand your team! Collect 4 more characters (for a total of 5) through the DNA Gacha. Once you have 5 characters, let me know, and you'll receive an Epic Weapon reward!",
                        completed: false
                    },
                    {
                        // User indicates they have 5 characters
                        trigger: /have 5|got 5|collected|done|reward/i,
                        // NOTE: Ideally, the game state (character count) should be verified here.
                        response: "Impressive! You've assembled a team of 5 characters. As promised, you can choose one Epic Weapon as your reward. Reply with the number of the weapon you want:",
                        completed: false // This step sets up the choice
                    },
                    {
                        // This step presents the choices and waits for a number
                        trigger: /dummy_trigger_never_matches/, // This step is handled by the previous step's response, trigger is just a placeholder
                        response: `1. ${Items.getItem(this.epicWeaponChoices[0])?.name || this.epicWeaponChoices[0]}\n2. ${Items.getItem(this.epicWeaponChoices[1])?.name || this.epicWeaponChoices[1]}\n3. ${Items.getItem(this.epicWeaponChoices[2])?.name || this.epicWeaponChoices[2]}\n4. ${Items.getItem(this.epicWeaponChoices[3])?.name || this.epicWeaponChoices[3]}\n5. ${Items.getItem(this.epicWeaponChoices[4])?.name || this.epicWeaponChoices[4]}`,
                        completed: false
                    },
                    {
                        // Trigger based on the user typing a number from 1 to 5
                        trigger: /^[1-5]$/,
                        response: "Excellent choice! I've added {chosenWeaponName} to your inventory. Use it well!", // Placeholder, will be replaced
                        completed: false // This step completes the quest
                    }
                ],
                // Reward is handled dynamically in the last step
                reward: { type: 'items', items: [] } // Placeholder, items added in the final step logic
            }
            // Add more quests here
        ];
    }

    /**
     * Get the initial welcome message, potentially offering a quest.
     * @returns {string} Initial message content.
     */
    getInitialMessage() {
        let message = "Hi, I'm Shelley! I'm here to help with any questions about the Adventure game.";
        // Updated to reflect the new gacha quest start
        if (this.quests.length > 0 && this.quests[0].id === 'gacha_tutorial') {
            // The first step of the quest now handles the initial interaction
             message += " Ask me for 'help' or say 'hello' if you're new!";
        } else {
            message += " What would you like to know?";
        }
        return message;
    }

    /**
     * Start a specific quest.
     * @param {string} questId - The ID of the quest to start.
     */
    startQuest(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest) {
            this.currentQuest = questId;
            this.questProgress = { stepIndex: 0 };
            console.log(`Started quest: ${quest.name}`);
            // Optionally, send a message indicating the quest has started
            // this.sendSystemMessage(`Quest started: ${quest.name} - ${quest.description}`);
        } else {
            console.warn(`Quest with ID ${questId} not found.`);
        }
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
        let response = '';
        let questCompleted = false;

        // --- Quest Logic ---
        if (this.currentQuest) {
            const quest = this.quests.find(q => q.id === this.currentQuest);
            const currentStepIndex = this.questProgress.stepIndex;

            if (quest && currentStepIndex < quest.steps.length) {
                const step = quest.steps[currentStepIndex];
                const match = message.match(step.trigger); // Use match to capture the chosen weapon

                if (match) {
                    // Matched the quest trigger
                    step.completed = true; // Mark step as completed
                    response = step.response; // Get the base response

                    // --- Special handling for presenting choices ---
                    if (quest.id === 'expand_team_quest' && currentStepIndex === 1) {
                        // The response for step 1 already asks the question.
                        // Step 2's response contains the numbered list.
                        // We combine them here.
                        const choiceList = `1. ${Items.getItem(this.epicWeaponChoices[0])?.name || this.epicWeaponChoices[0]}\n2. ${Items.getItem(this.epicWeaponChoices[1])?.name || this.epicWeaponChoices[1]}\n3. ${Items.getItem(this.epicWeaponChoices[2])?.name || this.epicWeaponChoices[2]}\n4. ${Items.getItem(this.epicWeaponChoices[3])?.name || this.epicWeaponChoices[3]}\n5. ${Items.getItem(this.epicWeaponChoices[4])?.name || this.epicWeaponChoices[4]}`;
                        response = `${step.response}\n${choiceList}`;
                        // We advance the step index by 2 because step 2 is just displaying the list.
                        // The user's *next* input should trigger step 3 (the number choice).
                        this.questProgress.stepIndex++; // Advance past the choice display step
                    }
                    // --- Special handling for number choice step ---
                    else if (quest.id === 'expand_team_quest' && currentStepIndex === 3 && match[0]) {
                        const chosenNumber = parseInt(match[0], 10);
                        if (chosenNumber >= 1 && chosenNumber <= this.epicWeaponChoices.length) {
                            const chosenWeaponId = this.epicWeaponChoices[chosenNumber - 1];
                            const chosenWeapon = Items.getItem(chosenWeaponId);
                            if (chosenWeapon) {
                                // Replace placeholder in response and set reward
                                response = response.replace('{chosenWeaponName}', chosenWeapon.name);
                                quest.reward.items = [chosenWeapon.id]; // Set the specific item to be granted
                            } else {
                                // Should not happen if epicWeaponChoices are valid IDs
                                response = "An error occurred retrieving that weapon. Please try again.";
                                this.questProgress.stepIndex--; // Stay on this step
                            }
                        } else {
                            // Handle invalid number
                            response = "Invalid choice. Please enter a number between 1 and 5.";
                            this.questProgress.stepIndex--; // Stay on this step
                        }
                    }
                    // --- End special handling ---

                    this.questProgress.stepIndex++;

                    // Check if quest is now complete
                    if (this.questProgress.stepIndex >= quest.steps.length) {
                        questCompleted = true;
                        // Grant reward (items are set in the step logic above for the choice)
                        const rewardMsg = this.completeQuest(this.currentQuest);
                        // Only append reward message if it's not the item grant message itself
                        if (quest.reward.type !== 'items') {
                             response += ` ${rewardMsg}`;
                        }
                        this.currentQuest = null; // Reset current quest
                        this.questProgress = {};
                        // Offer next quest? (Future enhancement)
                    }
                }
            }
        }
        // --- End Quest Logic ---

        // If no quest step was triggered, get a normal AI response
        if (!response) {
             response = await this.aiService.generateResponse(message, this.knowledgeBase);
        }

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
     * Completes a quest and returns the reward message.
     * @param {string} questId - The ID of the completed quest.
     * @returns {string} - The reward message.
     */
    completeQuest(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (!quest) return '';

        console.log(`Quest completed: ${quest.name}`);
        // TODO: Implement actual reward granting (e.g., call game API)
        this.grantReward(quest.reward);

        return quest.reward.value || ''; // Return the message part of the reward
    }

    /**
     * Grants the reward for completing a quest.
     * Placeholder function.
     * @param {object} reward - The reward object defined in the quest.
     */
    grantReward(reward) {
        console.log('Granting reward:', reward);
        if (reward.type === 'message') {
            // Message is already handled by completeQuest returning it.
        }
        // Example for future integration:
        // if (reward.type === 'currency') {
        //     window.gameAPI.addCurrency(reward.amount);
        // } else if (reward.type === 'item') {
        //     window.gameAPI.addItemToInventory(reward.itemId);
        // }

        // Handle specific item rewards
        if (reward.type === 'items' && Array.isArray(reward.items)) {
            console.log(`Granting items: ${reward.items.join(', ')}`);
            if (typeof Inventory !== 'undefined' && typeof Inventory.addItem === 'function') {
                reward.items.forEach(itemId => {
                    const success = Inventory.addItem(itemId, 1);
                    if (!success) {
                        console.error(`Failed to add item ${itemId} to inventory.`);
                        // Optionally notify the user or try again later
                    } else {
                         console.log(`Item ${itemId} added successfully.`);
                    }
                });
                 // Save inventory after adding items
                 Inventory.saveToLocal();
            } else {
                console.error("Inventory system not available to grant items.");
            }
        }
    }

    /**
     * Handles the specific reward sequence after the user gets their first character.
     * Offers the next quest.
     */
    async handleFirstCharacterReward() {
        console.log("Handling first character reward in MessageHandler...");
        let rewardMessage = "Congratulations on acquiring your first character! To help you on your journey, I've added some starting equipment to your inventory: Cyber Blade, Quantum Dagger, Pulse Bow, and Data Staff. Check your inventory!";
        const reward = {
            type: 'items',
            items: this.firstCharacterRewardItems
        };

        // Grant the items
        this.grantReward(reward);

        // Check if the next quest exists and offer it
        const nextQuest = this.quests.find(q => q.id === 'expand_team_quest'); // Use the new quest ID
        if (nextQuest) {
            rewardMessage += " Ready for your next objective? Collect 4 more characters (for a total of 5) to earn an Epic Weapon! Say 'ok' or ask about your 'team' when you're ready.";
            // Set the next quest as the current one, but don't advance step yet
            this.startQuest(nextQuest.id);
            this.questProgress.stepIndex = 0; // Ensure it starts at the first step
        }

        // Send the congratulatory message (and quest offer)
        if (this.callbacks.onTypingStart) {
            this.callbacks.onTypingStart();
        }
        await this.simulateTyping(rewardMessage);
        this.messageHistory.push({ role: 'assistant', content: rewardMessage, timestamp: new Date() });
        if (this.callbacks.onResponseComplete) {
            this.callbacks.onResponseComplete(rewardMessage);
        }
    }

    /**
     * Sends a system message (like quest updates) - not currently used but potentially useful.
     * @param {string} messageContent - The content of the system message.
     */
    async sendSystemMessage(messageContent) {
        if (this.callbacks.onTypingStart) {
            this.callbacks.onTypingStart(); // Show indicator briefly
        }
        await this.simulateTyping(messageContent);
        this.messageHistory.push({ role: 'assistant', content: messageContent, timestamp: new Date() });
        if (this.callbacks.onResponseComplete) {
            this.callbacks.onResponseComplete(messageContent);
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
      // Reset quest state if history is cleared
      this.currentQuest = null;
      this.questProgress = {};
      // Automatically start the first quest again if available
       if (this.quests.length > 0) {
           // Ensure we start the correct quest if multiple are defined
           this.startQuest(this.quests[0].id);
       }
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
