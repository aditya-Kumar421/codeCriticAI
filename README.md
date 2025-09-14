# CodeCritic AI - MongoDB Integration & Streaming

This backend application now includes MongoDB storage and streaming responses for AI code reviews.

## Features Added

### 1. MongoDB Integration
- Stores all user code submissions and AI responses
- Captures user IP addresses, timestamps, and metadata
- Tracks response times and code language detection
- Automatic session ID generation

### 2. Streaming Responses
- Real-time streaming of AI responses
- Server-Sent Events (SSE) implementation
- Complete interaction still saved to database after streaming
- Separate streaming endpoint to maintain existing API

## API Endpoints

### Original (Non-Streaming)
- `POST /ai` - Original endpoint, returns complete response at once

### New Streaming Endpoint
- `POST /ai/stream` - Streams AI response in real-time chunks

### Admin Endpoints
- `GET /admin/stats` - Get interaction statistics
- `GET /admin/interactions` - Get recent interactions (with pagination)
- `GET /admin/interactions/ip/:ip` - Get interactions by specific IP

## Environment Variables

Create a `.env` file with:

```env
# Google Gemini API Key
GOOGLE_GEMINI_KEY=your_gemini_api_key_here

# MongoDB Connection URI
# For local development:
MONGODB_URI=mongodb://localhost:27017/codecritic

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codecritic?retryWrites=true&w=majority

# Application Port (optional, defaults to 3000)
PORT=3000
```

## Database Schema

### Collection: `code_interactions`

```javascript
{
  userCode: String,        // The code submitted by user
  aiResponse: String,      // AI's complete response
  userIP: String,          // User's IP address
  userAgent: String,       // User's browser/client info
  timestamp: Date,         // When the interaction occurred
  responseTime: Number,    // Time taken to generate response (ms)
  codeLanguage: String,    // Detected programming language
  sessionId: String,       // Unique session identifier
  createdAt: Date,         // Auto-generated timestamp
  updatedAt: Date          // Auto-generated timestamp
}
```

## Usage Examples

### 1. Regular API Call
```javascript
fetch('/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'your code here'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### 2. Streaming API Call
```javascript
fetch('/ai/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'your code here',
    sessionId: 'optional-session-id'
  })
})
.then(response => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  function readStream() {
    return reader.read().then(({ done, value }) => {
      if (done) return;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            handleStreamData(parsed);
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
      
      return readStream();
    });
  }
  
  return readStream();
});

function handleStreamData(data) {
  switch (data.type) {
    case 'connected':
      console.log('Connected to stream');
      break;
    case 'chunk':
      // Append chunk data to display
      console.log('Chunk:', data.data);
      break;
    case 'complete':
      console.log('Stream complete:', data.data);
      break;
    case 'error':
      console.error('Stream error:', data.data);
      break;
  }
}
```

### 3. Get Statistics
```javascript
fetch('/admin/stats')
.then(response => response.json())
.then(stats => {
  console.log('Total interactions:', stats.stats.totalInteractions);
  console.log('Unique users:', stats.stats.uniqueUsers);
  console.log('Today interactions:', stats.stats.todayInteractions);
});
```

## Demo

Visit `/streaming-demo.html` when the server is running to see a live demo of the streaming functionality.

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Make sure MongoDB is running (locally or cloud)

4. Start the server:
```bash
npm start
```

## Key Differences: Original vs Streaming

| Feature | Original (`/ai`) | Streaming (`/ai/stream`) |
|---------|------------------|--------------------------|
| Response Type | JSON object | Server-Sent Events |
| Data Delivery | Complete response at once | Real-time chunks |
| Database Storage | After response generation | After complete stream |
| Client Handling | Simple JSON parsing | Stream processing required |
| Use Case | Quick responses | Long responses, better UX |

## MongoDB Indexes

The application automatically creates performance indexes on:
- `{ userIP: 1, timestamp: -1 }` - For IP-based queries
- `{ timestamp: -1 }` - For time-based sorting

## Error Handling

- Database connection failures don't break API responses
- Streaming errors are sent as events to client
- Original endpoints remain unaffected by streaming implementation
- Graceful fallbacks for all error scenarios
