/**
 * AI Service Module
 * Handles interaction with Deepseek API for generating responses
 */

if (typeof window.AiService === 'undefined') {
  class AiService {
    constructor() {
      // Deepseek API configuration
      this.apiUrl = 'https://api.deepseek.com';
      this.apiKey = 'sk-3f92413f383f467299d032b4a338399d';
      this.model = 'deepseek-reasoner';
      
      // System prompt for the AI
      this.systemPrompt = `You are Shelley, an AI assistant for the Adventure game. 
  Your purpose is to help players with game-related questions.

  IMPORTANT RULES:
  1. You ONLY answer questions about the game, its mechanics, characters, locations, items, and abilities.
  2. You NEVER answer questions about the game's code, implementation, or how features were programmed.
  3. You NEVER share API keys, security information, or implementation details.
  4. You maintain a friendly, helpful, and cyberpunk-style personality.
  5. Keep responses concise and focused on the game.
  6. If you don't know something, admit it rather than making up information.

  If asked about code or implementation:
  - Politely redirect to game topics
  - Say "I'm not designed to discuss the game's code. I'd be happy to help with gameplay questions instead!"
  - Suggest alternative game-related topics

  Use the knowledge provided to you about the game to give accurate answers.`;

      // Initialize conversation history
      this.conversationHistory = [];
      
      // Code-related keywords to detect programming questions
      this.codeKeywords = [
        'code', 'javascript', 'js', 'html', 'css', 'script', 'function', 
        'class', 'variable', 'const', 'let', 'var', 'implement', 
        'syntax', 'api', 'backend', 'frontend', 'supabase', 'database',
        'deepseek', 'implementation', 'algorithm', 'programming',
        'function', 'object', 'array', 'json', 'ajax', 'fetch',
        'async', 'await', 'promise', 'callback', 'event', 'listener'
      ];
    }

    /**
     * Initialize the AI service
     */
    async initialize() {
      // Verify API connection - simplified for demo
      try {
        console.log('AI Service initialized');
        return true;
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
        return false;
      }
    }

    /**
     * Check if a question is about code
     * @param {string} question - User's question
     * @returns {boolean} - Whether the question is about code
     */
    isCodeQuestion(question) {
      const lowerQuestion = question.toLowerCase();
      
      // Check if the question contains code keywords
      for (const keyword of this.codeKeywords) {
        if (lowerQuestion.includes(keyword)) {
          return true;
        }
      }
      
      // Check for code patterns
      if (
        lowerQuestion.includes('how to program') ||
        lowerQuestion.includes('how to code') ||
        lowerQuestion.includes('how is it implemented') ||
        lowerQuestion.includes('how does the code') ||
        lowerQuestion.includes('how was it built') ||
        lowerQuestion.includes('source code') ||
        lowerQuestion.includes('backend') ||
        lowerQuestion.includes('how to develop') ||
        lowerQuestion.includes('github')
      ) {
        return true;
      }
      
      // Look for code snippets
      if (
        lowerQuestion.includes('{') && lowerQuestion.includes('}') ||
        lowerQuestion.includes('function(') ||
        lowerQuestion.includes('const ') || lowerQuestion.includes('let ') || lowerQuestion.includes('var ') ||
        lowerQuestion.includes('=>') ||
        lowerQuestion.includes('for(') || lowerQuestion.includes('for (') ||
        lowerQuestion.includes('if(') || lowerQuestion.includes('if (')
      ) {
        return true;
      }
      
      return false;
    }

    /**
     * Generate a response to a code-related question
     * @returns {string} - AI response for code questions
     */
    generateCodeQuestionResponse() {
      const responses = [
        "I'm not designed to discuss the game's code implementation. I'd be happy to help with gameplay questions instead!",
        "Sorry, I can only answer questions about the game itself, not its programming or code. Is there something about gameplay I can help with?",
        "As a game support AI, I'm focused on helping with the game experience, not its technical implementation. What would you like to know about playing Adventure?",
        "I'm here to help with the game Adventure, but I can't discuss code or implementation details. Would you like to know about characters, locations, or game mechanics instead?",
        "That seems to be a question about programming. I'm only able to help with game-related topics like characters, items, locations, and game mechanics."
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Prepare context for the AI based on the question
     * @param {string} question - User's question
     * @param {Object} knowledgeBase - Knowledge base instance
     * @returns {string} - Context for the AI
     */
    async prepareContext(question, knowledgeBase) {
      let context = "Information about Adventure game:\n";
      
      // Simple keyword extraction from the question
      const keywords = question.toLowerCase()
        .replace(/[.,?!;:'"()\[\]{}]/g, '')
        .split(' ')
        .filter(word => word.length > 3);
      
      // Get relevant knowledge based on keywords
      const relevantResults = await knowledgeBase.searchKnowledge(keywords.join(' OR '));
      
      if (relevantResults && relevantResults.length > 0) {
        // Add the relevant knowledge to the context
        relevantResults.forEach(item => {
          context += `\n${item.category.toUpperCase()} - ${item.key}: ${JSON.stringify(item.data)}\n`;
        });
      } else {
        // If no specific results, add some general knowledge
        const mechanics = await knowledgeBase.getKnowledge(knowledgeBase.categories.GAME_MECHANICS, 'core');
        if (mechanics) {
          context += `\nGAME MECHANICS: ${JSON.stringify(mechanics)}\n`;
        }
        
        // Add character info if question might be about characters
        if (question.toLowerCase().includes('character') || 
            question.toLowerCase().includes('who') ||
            question.toLowerCase().includes('player')) {
          const characters = await knowledgeBase.getKnowledge(knowledgeBase.categories.CHARACTERS);
          if (characters) {
            context += `\nCHARACTERS: ${JSON.stringify(characters)}\n`;
          }
        }
        
        // Add location info if question might be about locations
        if (question.toLowerCase().includes('place') || 
            question.toLowerCase().includes('location') ||
            question.toLowerCase().includes('where')) {
          const locations = await knowledgeBase.getKnowledge(knowledgeBase.categories.LOCATIONS);
          if (locations) {
            context += `\nLOCATIONS: ${JSON.stringify(locations)}\n`;
          }
        }
        
        // Add item info if question might be about items
        if (question.toLowerCase().includes('item') || 
            question.toLowerCase().includes('equipment') ||
            question.toLowerCase().includes('weapon') ||
            question.toLowerCase().includes('what')) {
          const items = await knowledgeBase.getKnowledge(knowledgeBase.categories.ITEMS);
          if (items) {
            context += `\nITEMS: ${JSON.stringify(items)}\n`;
          }
        }
      }
      
      return context;
    }

    /**
     * Generate a response to the user's question
     * @param {string} question - User's question
     * @param {Object} knowledgeBase - Knowledge base instance
     * @returns {Promise<string>} - AI response
     */
    async generateResponse(question, knowledgeBase) {
      try {
        // Check if the question is about code
        if (this.isCodeQuestion(question)) {
          return this.generateCodeQuestionResponse();
        }
        
        // Prepare the context for the AI
        const context = await this.prepareContext(question, knowledgeBase);
        
        // Update conversation history with the user's message
        this.conversationHistory.push({
          role: 'user',
          content: question
        });
        
        // Prepare messages for API call
        const messages = [
          {
            role: 'system',
            content: this.systemPrompt + '\n\n' + context
          },
          ...this.conversationHistory.slice(-5) // Include last 5 messages for context
        ];
        
        // Make API call to Deepseek
        try {
          const response = await this.callDeepseekAPI(messages);
          
          // Add response to conversation history
          this.conversationHistory.push({
            role: 'assistant',
            content: response
          });
          
          // Keep conversation history within reasonable limits (last 10 messages)
          if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(this.conversationHistory.length - 10);
          }
          
          return response;
        } catch (apiError) {
          console.error('Deepseek API error:', apiError);
          // Fallback to simulated response in case of API error
          return this.generateSimulatedResponse(question, context);
        }
      } catch (error) {
        console.error('Error generating response:', error);
        // If overall process fails, use a fallback response
        return this.generateFallbackResponse(question);
      }
    }
    
    /**
     * Call Deepseek API
     * @param {Array} messages - Conversation messages
     * @returns {Promise<string>} - AI response text
     */
    async callDeepseekAPI(messages) {
      try {
        const response = await fetch(`${this.apiUrl}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Deepseek API error: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('Error calling Deepseek API:', error);
        throw error;
      }
    }

    /**
     * Generate a simulated response for demo purposes
     */
    generateSimulatedResponse(question, context) {
      // Extract some context to use in the response
      let response = '';
      const lowerQuestion = question.toLowerCase();
      
      // Check question topic and generate appropriate response
      if (lowerQuestion.includes('character') || lowerQuestion.includes('who')) {
        response = "The game features several unique characters including Chad and Devin. Each character has their own abilities and stats. Characters can be obtained through the gacha system and added to your team.";
      } else if (lowerQuestion.includes('location') || lowerQuestion.includes('where')) {
        response = "The game world features several unique areas including the Neon District, Corporate Plaza, and Data Nexus. Each location has unique enemies and items to discover.";
      } else if (lowerQuestion.includes('item') || lowerQuestion.includes('equipment')) {
        response = "There are many items in the game, including weapons like Cyber Blade and Plasma Pistol, as well as armor items like Nano Armor and Synth Vest. Items can be found in dungeons or purchased from the marketplace.";
      } else if (lowerQuestion.includes('gacha') || lowerQuestion.includes('pull')) {
        response = "The gacha system allows you to acquire new characters. There are three types: Mortal DNA (basic units), Synthetic DNA (enhanced units), and Divine DNA (transcendent entities). Each has different rates for character rarities.";
      } else if (lowerQuestion.includes('help') || lowerQuestion.includes('how to play')) {
        response = "Adventure is a cyberpunk RPG where you collect characters, explore locations, and engage in combat. You can access inventory, characters, gacha pulls, and dungeons from the main menu buttons.";
      } else {
        response = "Adventure is a cyberpunk RPG game featuring character collection, dungeons, and a gacha system. You can explore various locations like the Neon District and Corporate Plaza while collecting items and characters. Is there anything specific about the game you'd like to know?";
      }
      
      // Update conversation history with the AI's response
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      });
      
      // Keep conversation history within reasonable limits (last 10 messages)
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(this.conversationHistory.length - 10);
      }
      
      return response;
    }

    /**
     * Generate a fallback response when the API fails
     * @param {string} question - User's question
     * @returns {string} - Fallback response
     */
    generateFallbackResponse(question) {
      // Extract potential topic from question
      const lowerQuestion = question.toLowerCase();
      
      // Check for question types and provide generic responses
      if (lowerQuestion.includes('how')) {
        return "That's a great question about how things work in the game! Unfortunately, I'm having trouble connecting to my knowledge base right now. Please try again later for a more detailed answer.";
      } else if (lowerQuestion.includes('where')) {
        return "You're asking about locations in the game world! While I'm having trouble accessing my full knowledge base, I can tell you that Adventure features several unique areas to explore, including the Neon District and Corporate Plaza.";
      } else if (lowerQuestion.includes('who')) {
        return "You're interested in characters! Adventure features several unique characters including Chad and Devin, each with their own abilities. I'm having trouble accessing more details at the moment, but please try again later.";
      } else if (lowerQuestion.includes('what')) {
        return "That's a good question! While I'm having trouble accessing my full knowledge base right now, I'd be happy to help once my connection is restored. Please try again in a moment.";
      } else {
        return "I apologize, but I'm currently having trouble connecting to my knowledge base. Please try asking your question again in a moment, or try a different topic about the Adventure game.";
      }
    }

    /**
     * Clear the conversation history
     */
    clearConversation() {
      this.conversationHistory = [];
    }
  }
  window.AiService = AiService;
}
