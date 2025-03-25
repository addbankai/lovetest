# Shelly AI Support Chat

A neon-style, 3D AI assistant for Adventure game that helps players with game-related questions.

![Shelly AI Chat Support]

## Features

- **3D Animated Avatar**: Semi-transparent Three.js avatar with cyberpunk aesthetics
- **Game Knowledge**: Automatically extracts and learns about game mechanics, characters, locations, and items
- **Code Protection**: Configured to only answer questions about gameplay, never about code implementation
- **Responsive Design**: Works on all screen sizes and adapts to the game environment

## How It Works

1. A glowing chat bubble appears in the lower right corner of the game
2. When clicked, it opens a chat interface with Shelly's 3D avatar
3. Players can ask questions about the game
4. Shelly responds with helpful information based on the game data

## Integration

The chat support system has been seamlessly integrated with your Adventure game. It's designed to:

- Not affect the core game code
- Run in an isolated context to prevent conflicts
- Use minimal resources when not in use
- Maintain the game's cyberpunk aesthetic

## Technical Implementation

### Components

- **ThreeAvatar**: Manages the 3D avatar using Three.js
- **KnowledgeBase**: Extracts and stores game information
- **AiService**: Handles interaction with the Deepseek API
- **MessageHandler**: Processes user messages and AI responses
- **UiController**: Manages the chat interface

### APIs Used

- **Deepseek API**: Powers the AI chat responses
  - Base URL: https://api.deepseek.com
  - Model: deepseek-chat

### Data Storage

- **Supabase**: Used for storing extracted game knowledge
  - URL: https://mksrmkpqvgnkfmxxdijs.supabase.co

## Customization

### Appearance

You can customize the appearance of Shelly by modifying:

- `support-chat/css/support-chat.css`: Styling for the chat interface
- `support-chat/js/three-avatar.js`: 3D avatar appearance and animations

### Behavior

To adjust how Shelly responds:

- `support-chat/js/ai-service.js`: Modify the system prompt or response handling
- `support-chat/js/knowledge-base.js`: Change how game knowledge is extracted and stored

## Testing

A standalone test page is included to verify the chat functionality:

- `support-chat/test-chat.html`: Open this file in a browser to test the chat without the main game

## Future Improvements

Potential enhancements for the future:

- Add voice support for more immersive interactions
- Implement more advanced animations for the avatar
- Expand knowledge extraction to include more game elements
- Add support for multiple languages

## Credits

- **Deepseek**: AI model provider
- **Three.js**: 3D graphics library
- **Supabase**: Backend database service
