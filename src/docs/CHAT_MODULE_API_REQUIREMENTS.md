# Chat Module - API Requirements

## Overview
A comprehensive chat module has been implemented that allows users to chat with each other. The frontend is fully functional and ready to connect to backend API endpoints.

## Frontend Implementation

### Components Updated
1. **ChatContext** (`src/context/ChatContext.jsx`)
   - Manages chat state (conversations, messages, selected conversation)
   - Handles API calls for chat operations
   - Implements real-time polling for new messages and conversation updates

2. **ChatContent** (`src/components/chats/ChatContent.jsx`)
   - Displays messages in a conversation
   - Shows empty state when no conversation is selected

3. **ChatsUsers** (`src/components/chats/ChatsUsers.jsx`)
   - Lists all conversations
   - Shows search functionality
   - Allows selecting users to start new conversations

4. **MessageEditor** (`src/components/chats/MessageEditor.jsx`)
   - Sends messages with text content
   - Supports file attachments
   - Emoji picker integration

5. **ChatHeader** (`src/components/chats/ChatHeader.jsx`)
   - Shows selected conversation participant information
   - Action buttons for calls and other features

6. **ChatMessage** (`src/components/chats/ChatMessage.jsx`)
   - Displays individual messages
   - Supports file attachments

### Context Provider
The `ChatProvider` has been added to `App.jsx` to wrap the application and provide chat functionality globally.

## Backend API Endpoints Required

All endpoints should be prefixed with the base URL: `https://bkdemo1.clinicpro.cc`
All requests require Bearer token authentication in the Authorization header.

### 1. Get All Conversations
**GET** `/chat/conversations`

Returns all conversations for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "participants": [
      {
        "id": 1,
        "name": "John Doe",
        "username": "johndoe",
        "avatar": "/path/to/avatar.png",
        "profile_image": "/path/to/profile.png"
      }
    ],
    "last_message": {
      "id": 100,
      "content": "Hello there!",
      "sender_id": 1,
      "created_at": "2024-01-01T12:00:00Z"
    },
    "unread_count": 2,
    "updated_at": "2024-01-01T12:00:00Z",
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### 2. Create or Get Conversation
**POST** `/chat/conversations`

Creates a new conversation with a user, or returns existing conversation if one already exists.

**Request Body:**
```json
{
  "participant_id": 2
}
```

**Response:**
```json
{
  "id": 1,
  "participants": [
    {
      "id": 1,
      "name": "Current User",
      "username": "currentuser"
    },
    {
      "id": 2,
      "name": "Other User",
      "username": "otheruser",
      "avatar": "/path/to/avatar.png"
    }
  ],
  "last_message": null,
  "unread_count": 0,
  "updated_at": "2024-01-01T12:00:00Z",
  "created_at": "2024-01-01T12:00:00Z"
}
```

### 3. Get Messages for a Conversation
**GET** `/chat/conversations/{conversation_id}/messages`

Returns all messages for a specific conversation.

**Response:**
```json
[
  {
    "id": 1,
    "content": "Hello!",
    "sender_id": 1,
    "conversation_id": 1,
    "attachments": [
      {
        "id": 1,
        "filename": "document.pdf",
        "url": "/uploads/chat/document.pdf",
        "size": "2.5 MB"
      }
    ],
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
]
```

### 4. Send Message
**POST** `/chat/conversations/{conversation_id}/messages`

Sends a message in a conversation. Supports text content and file attachments.

**Request (multipart/form-data):**
```
content: "Hello, this is my message"
attachments: [file1, file2, ...]
```

**Response:**
```json
{
  "id": 2,
  "content": "Hello, this is my message",
  "sender_id": 1,
  "conversation_id": 1,
  "attachments": [
    {
      "id": 2,
      "filename": "image.jpg",
      "url": "/uploads/chat/image.jpg",
      "size": "500 KB"
    }
  ],
  "created_at": "2024-01-01T12:05:00Z",
  "updated_at": "2024-01-01T12:05:00Z"
}
```

### 5. Mark Conversation as Read
**POST** `/chat/conversations/{conversation_id}/read`

Marks all messages in a conversation as read for the authenticated user.

**Response:**
```json
{
  "success": true,
  "unread_count": 0
}
```

### 6. Get User List (Already Exists)
**GET** `/users/user-list`

This endpoint already exists and returns the list of users. The chat module uses this to show available users to chat with.

## Features Implemented

1. **Real-time Updates**
   - Polls for new messages every 3 seconds
   - Polls for conversation updates every 5 seconds
   - Automatically updates UI when new messages arrive

2. **Conversation Management**
   - List all conversations
   - Create new conversations by selecting a user
   - Search conversations and users
   - Sort conversations (newest, oldest, etc.)

3. **Message Features**
   - Send text messages
   - Send file attachments
   - Emoji support
   - Display message timestamps
   - Show read/unread status

4. **User Experience**
   - Loading states
   - Error handling
   - Empty states
   - Unread message counts
   - Message timestamps

## Error Handling

The frontend gracefully handles:
- 404 errors (when API endpoints don't exist yet)
- Network errors
- Authentication errors (handled by axios interceptor)
- Empty states

## Testing the Module

1. Navigate to the chat page (route: `/apps/chat`)
2. The module will attempt to fetch conversations and users
3. If API endpoints are not implemented, the UI will show empty states gracefully
4. Once backend is ready, the chat will automatically work

## Notes

- The chat module uses the existing authentication system (Bearer tokens)
- User data is retrieved from localStorage for the current user
- All API calls go through the centralized `api.js` utility which handles authentication
- The module is designed to work even if some endpoints return 404 (for gradual backend implementation)


