# 🔍 CodeCritic AI

**An intelligent code review platform powered by Google Gemini AI with real-time streaming capabilities and comprehensive analytics.**

[![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v5%2B-green.svg)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.1.0-blue.svg)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

## 🚀 Overview

CodeCritic AI is a sophisticated backend service that provides AI-powered code reviews with a humorous and constructive approach. Built with modern technologies, it offers both traditional API responses and real-time streaming capabilities, complete with comprehensive logging and analytics.

## ✨ Key Features

### 🤖 **AI-Powered Code Analysis**
- **Google Gemini 2.0 Flash** integration for advanced code review
- **Humorous & Professional Reviews** - Combines constructive feedback with witty commentary
- **Multi-language Support** - Automatic detection of JavaScript, Python, Java, C/C++, PHP, Rust, Go
- **Comprehensive Analysis** - Code quality, performance, security, maintainability, best practices

### 🌊 **Real-time Streaming**
- **Server-Sent Events (SSE)** for real-time response delivery
- **Chunk-based Streaming** with progress tracking
- **Live Demo Interface** at `/streaming-demo.html`
- **Graceful Error Handling** during streaming

### 💾 **MongoDB Integration**
- **Complete Interaction Storage** - User code, AI responses, metadata
- **User Analytics** - IP tracking, session management, response times
- **Performance Indexing** - Optimized queries for analytics
- **Automatic Language Detection** and categorization

### 📊 **Advanced Logging & Monitoring**
- **Comprehensive Request Tracking** with unique request IDs
- **Color-coded Console Logging** with multiple severity levels
- **File-based Log Storage** (app.log, error.log, warn.log)
- **Performance Monitoring** with response time tracking
- **Database Operation Logging** with success/failure tracking

### 📈 **Admin Dashboard APIs**
- **Usage Statistics** - Total interactions, unique users, daily metrics
- **Language Analytics** - Programming language usage patterns
- **IP-based Tracking** - User interaction history
- **Paginated Data Retrieval** with filtering options

## 🏗️ Architecture

```
src/
├── 📁 config/
│   └── database.js          # MongoDB connection & configuration
├── 📁 controllers/
│   ├── ai.controller.js     # Standard AI analysis endpoints
│   ├── ai.streaming.controller.js  # Real-time streaming endpoints
│   └── admin.controller.js  # Analytics & admin endpoints
├── 📁 middleware/
│   └── logging.js          # Request logging & error handling
├── 📁 models/
│   └── CodeInteraction.js  # MongoDB schema for interactions
├── 📁 routes/
│   ├── ai.routes.js        # Standard API routes
│   ├── ai.streaming.routes.js  # Streaming API routes
│   └── admin.routes.js     # Admin/analytics routes
├── 📁 services/
│   ├── ai.service.js       # Core AI integration service
│   └── ai.streaming.service.js  # Streaming AI service
├── 📁 utils/
│   └── logger.js           # Centralized logging utility
└── app.js                  # Express application setup
```

## 📡 API Endpoints

### **🔍 Code Analysis Endpoints**

#### Standard Analysis
```http
POST /ai/get-response
Content-Type: application/json

{
  "prompt": "function add(a, b) { return a + b; }",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "response": "🔥 Well, well, well... This function is so basic...",
  "sessionId": "session_abc123",
  "timestamp": "2025-09-14T10:30:00.000Z",
  "requestId": "req_xyz789"
}
```

#### Real-time Streaming Analysis
```http
POST /ai/stream
Content-Type: application/json

{
  "prompt": "function add(a, b) { return a + b; }",
  "sessionId": "optional-session-id"
}
```

**Server-Sent Events Response:**
```
data: {"type":"connected","sessionId":"session_abc123","timestamp":1726311000000}

data: {"type":"chunk","data":"🔥 Well, well, well...","timestamp":1726311001000}

data: {"type":"chunk","data":" This function is so basic...","timestamp":1726311002000}

data: {"type":"complete","data":{"sessionId":"session_abc123","responseTime":2000,"totalLength":850,"saved":true},"timestamp":1726311003000}

data: [DONE]
```

### **📊 Admin & Analytics Endpoints**

#### Usage Statistics
```http
GET /admin/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalInteractions": 1250,
    "uniqueUsers": 387,
    "todayInteractions": 45,
    "languageStats": [
      {"_id": "javascript", "count": 520},
      {"_id": "python", "count": 380},
      {"_id": "java", "count": 210}
    ],
    "averageResponseTime": 1340
  },
  "requestId": "req_stats_123",
  "timestamp": "2025-09-14T10:30:00.000Z"
}
```

#### Recent Interactions
```http
GET /admin/interactions?page=1&limit=10
```

#### IP-specific Interactions
```http
GET /admin/interactions/ip/192.168.1.100?page=1&limit=5
```

### **🎯 Static Resources**
- `GET /` - Welcome message & health check
- `GET /streaming-demo.html` - Interactive streaming demo

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js v16 or higher
- MongoDB (local or cloud)
- Google Gemini API key

### **1. Clone & Install**
```bash
git clone https://github.com/aditya-Kumar421/codeCriticAI.git
cd codeCriticAI
npm install
```

### **2. Environment Configuration**
Create a `.env` file:
```env
# Google Gemini API Configuration
GOOGLE_GEMINI_KEY=your_gemini_api_key_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/codecritic
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codecritic

# Server Configuration
PORT=8000
NODE_ENV=development
```

### **3. Start the Server**
```bash
# Production
npm start

# Development (with nodemon)
npm run dev
```

The server will start on `http://localhost:8000`

## 🗄️ Database Schema

### **CodeInteraction Collection**
```javascript
{
  _id: ObjectId,
  userCode: String,           // Original code submitted
  aiResponse: String,         // Complete AI analysis
  userIP: String,             // Client IP address
  userAgent: String,          // Browser/client information
  timestamp: Date,            // Interaction timestamp
  responseTime: Number,       // AI response time (ms)
  codeLanguage: String,       // Detected programming language
  sessionId: String,          // Session identifier
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

### **Database Indexes**
- `{ userIP: 1, timestamp: -1 }` - IP-based queries
- `{ timestamp: -1 }` - Time-based sorting

## 📝 Usage Examples

### **JavaScript/Node.js Client**
```javascript
// Standard API call
async function analyzeCode(code) {
  const response = await fetch('http://localhost:8000/ai/get-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: code })
  });
  return await response.json();
}

// Streaming API call
async function streamCodeAnalysis(code) {
  const response = await fetch('http://localhost:8000/ai/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: code })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        
        try {
          const parsed = JSON.parse(data);
          handleStreamChunk(parsed);
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }
}

function handleStreamChunk(chunk) {
  switch (chunk.type) {
    case 'connected':
      console.log('🔗 Connected to stream');
      break;
    case 'chunk':
      process.stdout.write(chunk.data);
      break;
    case 'complete':
      console.log('\n✅ Analysis complete');
      break;
    case 'error':
      console.error('❌ Error:', chunk.data.error);
      break;
  }
}
```

### **Python Client**
```python
import requests
import json

def analyze_code(code):
    response = requests.post(
        'http://localhost:8000/ai/get-response',
        json={'prompt': code}
    )
    return response.json()

# Usage
result = analyze_code('def hello(): print("Hello World")')
print(result['response'])
```

### **cURL Examples**
```bash
# Standard analysis
curl -X POST http://localhost:8000/ai/get-response \
  -H "Content-Type: application/json" \
  -d '{"prompt": "function test() { console.log(\"hello\"); }"}'

# Get statistics
curl http://localhost:8000/admin/stats

# Get recent interactions
curl "http://localhost:8000/admin/interactions?page=1&limit=5"
```

## 📊 Logging & Monitoring

### **Log Levels**
- **🔴 ERROR** - API failures, database errors, AI service issues
- **🟡 WARN** - Invalid requests, non-critical failures
- **🔵 INFO** - Request/response cycles, database operations
- **🟣 DEBUG** - Detailed operation steps, streaming chunks
- **🟢 SUCCESS** - Successful completions, connections

### **Log Files**
```
src/logs/
├── app.log     # All application logs
├── error.log   # Error-only logs
└── warn.log    # Warning-only logs
```

### **Log Entry Format**
```json
{
  "timestamp": "2025-09-14T10:30:00.000Z",
  "level": "INFO",
  "message": "Request completed for POST /ai/get-response",
  "meta": {
    "method": "POST",
    "endpoint": "POST /ai/get-response",
    "ip": "192.168.1.100",
    "statusCode": 200,
    "duration": "1250ms",
    "sessionId": "session_abc123",
    "requestId": "req_xyz789"
  },
  "pid": 12345
}
```

## 🔧 Configuration Options

### **Environment Variables**
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGODB_URI` | `mongodb://localhost:27017/codecritic` | Database connection |
| `GOOGLE_GEMINI_KEY` | *(required)* | Google Gemini API key |

### **AI Model Configuration**
- **Model**: `gemini-2.0-flash`
- **System Instruction**: Senior code reviewer with humor
- **Response Length**: 700-900 words
- **Review Structure**: Roast → Suggestions → Appreciation → Encouragement

## 🚦 Performance & Scalability

### **Response Times**
- **Standard API**: ~1-3 seconds
- **Streaming API**: First chunk in ~500ms
- **Database Operations**: <100ms (with indexes)
- **Analytics Queries**: ~200-500ms

### **Throughput**
- **Concurrent Requests**: 100+ (depending on AI API limits)
- **Database Connections**: Pooled connections via Mongoose
- **Memory Usage**: ~50-100MB base, +10MB per concurrent request

### **Production Considerations**
- **Rate Limiting**: Implement based on Google Gemini API quotas
- **Load Balancing**: Stateless design supports horizontal scaling
- **Database Sharding**: Consider for high-volume deployments
- **Caching**: Implement Redis for frequent queries

## 🔒 Security Features

### **Data Protection**
- **IP Anonymization** options available
- **Request Validation** with input sanitization
- **Error Message Sanitization** in production
- **API Key Security** - never logged or exposed

### **Authentication & Authorization**
- **Admin Endpoints** - Ready for authentication middleware
- **CORS Configuration** - Configurable origins
- **Rate Limiting** - Ready for implementation
- **Request Logging** - Full audit trail

## 🚀 Deployment

### **Vercel Deployment**
The application includes `vercel.json` for easy Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

### **Traditional Server**
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "codecritic-ai"
pm2 startup
pm2 save
```

## 🧪 Testing

### **Manual Testing**
Visit the live demo at: `http://localhost:8000/streaming-demo.html`

### **API Testing with curl**
```bash
# Health check
curl http://localhost:8000/

# Test AI endpoint
curl -X POST http://localhost:8000/ai/get-response \
  -H "Content-Type: application/json" \
  -d '{"prompt": "console.log(\"test\");"}'

# Test streaming endpoint
curl -X POST http://localhost:8000/ai/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "console.log(\"test\");"}'
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow the existing code structure
- Add comprehensive logging for new features
- Update documentation for API changes
- Test both streaming and standard endpoints

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/aditya-Kumar421/codeCriticAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aditya-Kumar421/codeCriticAI/discussions)
- **Email**: aditya.kumar421@example.com

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language model capabilities
- **MongoDB** for flexible document storage
- **Express.js** community for robust web framework
- **Open Source Community** for inspiration and tools

---

**Made with ❤️ by [Aditya Kumar](https://github.com/aditya-Kumar421)**

*Transform your code reviews from mundane to memorable with CodeCritic AI!* 🚀
