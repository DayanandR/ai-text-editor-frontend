# Vettam Editor - Complete Setup Guide

A React-based rich-text editor with live pagination, page thumbnails, dynamic table of contents, search, bookmarks, and chat integration. Powered by [Tiptap](https://tiptap.dev/), Redux, and Google Gemini AI.

## 🚀 Features

### Frontend Features

- **Rich-text editing** with Tiptap's StarterKit, TextAlign, TextStyle, FontFamily, FontSize, and custom PageBreak extension
- **Live pagination**: Split document into pages by `<hr data-page-break>` markers
- **Thumbnail side-pane**: Sidebar thumbnails of each page, with bullet-point previews
- **Dynamic Table of Contents**: Auto-extracted headings per page, combined with user bookmarks
- **Document-wide search**: Client-side full-text search with context highlighting
- **Bookmarks**: Add/remove quick bookmarks for any page
- **Header \& Footer editor**: WYSIWYG modal to customize per-page header/footer templates
- **Print support**: A4 print layout with running headers/footers and page numbers
- **Responsive sidebar**: Fixed 280px width, independent scroll
- **Auto-save**: Debounced content change saves to Redux store


### Backend Features

- **RESTful API** for document CRUD operations
- **Google Gemini AI integration** for chat and term explanations
- **MongoDB** for persistent data storage
- **JWT authentication** for secure user sessions
- **File upload support** for document attachments
- **Real-time collaboration** via WebSocket connections


## 📋 Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** (local or cloud instance)
- **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com)
- **Git** for version control


## 🛠️ Installation \& Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/vettam-editor.git
cd vettam-editor
```


### 2. Backend Setup

#### Navigate to Backend Directory

```bash
cd backend
```


#### Install Backend Dependencies

```bash
npm install
```


#### Backend Dependencies Include:

```json
{
  "express": "^4.18.0",
  "mongoose": "^7.0.0",
  "@google/generative-ai": "^0.2.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "multer": "^1.4.5",
  "socket.io": "^4.7.0",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.7.0",
  "nodemon": "^3.0.0"
}
```


#### Create Backend Environment File

```bash
cp .env.example .env
```


#### Configure Backend `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/vettam-editor
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vettam-editor

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# File Upload
MAX_FILE_SIZE=10MB
UPLOAD_PATH=./uploads

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```


#### Backend Project Structure

```
backend/
├── controllers/
│   ├── authController.js       # User authentication
│   ├── documentController.js   # Document CRUD operations
│   ├── chatController.js       # Gemini AI chat integration
│   └── uploadController.js     # File upload handling
├── middleware/
│   ├── auth.js                 # JWT authentication middleware
│   ├── upload.js               # Multer file upload middleware
│   └── rateLimiter.js          # Rate limiting middleware
├── models/
│   ├── User.js                 # User schema
│   ├── Document.js             # Document schema
│   └── ChatMessage.js          # Chat message schema
├── routes/
│   ├── auth.js                 # Authentication routes
│   ├── documents.js            # Document routes
│   ├── chat.js                 # Chat routes
│   └── upload.js               # Upload routes
├── services/
│   ├── geminiService.js        # Gemini AI service
│   ├── documentService.js      # Document business logic
│   └── socketService.js        # WebSocket handling
├── utils/
│   ├── dbConnect.js            # MongoDB connection
│   ├── logger.js               # Logging utility
│   └── validators.js           # Input validation
├── .env                        # Environment variables
├── .env.example               # Environment template
├── server.js                  # Main server file
└── package.json
```


#### Start Backend Development Server

```bash
npm run dev
```

Backend will be available at `http://localhost:5000`

### 3. Frontend Setup

#### Navigate to Frontend Directory

```bash
cd ../frontend
# or if starting fresh: cd frontend
```


#### Install Frontend Dependencies

```bash
npm install
```


#### Frontend Dependencies Include:

```json
{
  "@tiptap/react": "^2.1.0",
  "@tiptap/starter-kit": "^2.1.0",
  "@tiptap/extension-text-align": "^2.1.0",
  "@tiptap/extension-font-family": "^2.1.0",
  "@tiptap/extension-text-style": "^2.1.0",
  "@reduxjs/toolkit": "^1.9.0",
  "react-redux": "^8.1.0",
  "axios": "^1.4.0",
  "socket.io-client": "^4.7.0",
  "@heroicons/react": "^2.0.0",
  "tailwindcss": "^3.3.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0"
}
```


#### Create Frontend Environment File

```bash
cp .env.example .env.local
```


#### Configure Frontend `.env.local`:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Google Gemini AI (for client-side features)
REACT_APP_GEMINI_API_KEY=your-gemini-api-key-here

# App Configuration
REACT_APP_APP_NAME=Vettam Editor
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_COLLABORATION=true
REACT_APP_ENABLE_AI_CHAT=true
REACT_APP_ENABLE_FILE_UPLOAD=true
```


#### Start Frontend Development Server

```bash
npm start
```

Frontend will be available at `http://localhost:3000`

## 🔑 Google Gemini API Setup

### 1. Get Your API Key

1. **Visit [Google AI Studio](https://aistudio.google.com)**
2. **Sign in** with your Google account
3. **Click "Get API Key"** in the top navigation
4. **Create a new API key** or use an existing one
5. **Copy the API key** and save it securely

### 2. Test Your API Key

```bash
curl \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Write a story about a magic backpack"}]}]}' \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"
```

Replace `YOUR_API_KEY` with your actual API key.

### 3. Gemini API Integration Examples

#### Backend Service (`backend/services/geminiService.js`):

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async explainTerm(term, context) {
    try {
      const prompt = `
        Explain the term "${term}" in the context of this document:
        
        Context: ${context.substring(0, 500)}...
        
        Provide a brief, clear explanation suitable for the document's audience.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to explain term');
    }
  }

  async chatWithDocument(message, documentContent) {
    try {
      const prompt = `
        You are an AI assistant helping with document editing and analysis.
        
        Document content: ${documentContent.substring(0, 1000)}...
        
        User question: ${message}
        
        Provide a helpful response related to the document.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini chat error:', error);
      throw new Error('Failed to process chat message');
    }
  }
}

export default new GeminiService();
```


#### Frontend Service (`src/services/gemini.js`):

```javascript
class GeminiService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async explainTerm(term, context) {
    try {
      const response = await fetch(
        `${this.baseUrl}/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Explain "${term}" in context: ${context.substring(0, 200)}...`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      return data.candidates[^0].content.parts[^0].text;
    } catch (error) {
      console.error('Term explanation error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
```


## 🗄️ Database Setup

### MongoDB Local Installation

#### Windows:

1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB service:
```bash
net start MongoDB
```


#### macOS:

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```


#### Linux (Ubuntu):

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```


### MongoDB Atlas (Cloud) Setup

1. **Create account** at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create a new cluster** (free tier available)
3. **Set up database user** with read/write permissions
4. **Configure network access** (add your IP or use 0.0.0.0/0 for development)
5. **Get connection string** and update `MONGODB_URI` in `.env`

## 🚀 Running the Full Application

### Method 1: Run Both Servers Separately

#### Terminal 1 - Backend:

```bash
cd backend
npm run dev
```


#### Terminal 2 - Frontend:

```bash
cd frontend
npm start
```


### Method 2: Using Concurrently (Recommended)

#### Install concurrently in root directory:

```bash
npm install -g concurrently
```


#### Create root `package.json`:

```json
{
  "name": "vettam-editor-fullstack",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\"",
    "install-all": "cd backend && npm install && cd ../frontend && npm install",
    "build": "cd frontend && npm run build",
    "start": "cd backend && npm start"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```


#### Install all dependencies:

```bash
npm run install-all
```


#### Start both servers:

```bash
npm run dev
```


## 🔧 Development Workflow

### 1. Start Development Environment

```bash
# Install all dependencies
npm run install-all

# Start both backend and frontend
npm run dev
```


### 2. Key Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs (if implemented)
- **MongoDB**: mongodb://localhost:27017 (local)


### 3. Environment Variables Summary

#### Backend `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vettam-editor
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
```


#### Frontend `.env.local`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GEMINI_API_KEY=your-gemini-api-key
REACT_APP_SOCKET_URL=http://localhost:5000
```


## 🛠️ Available Scripts

### Backend Scripts:

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run test       # Run tests
npm run lint       # Run ESLint
npm run build      # Build for production
```


### Frontend Scripts:

```bash
npm start          # Start development server
npm run build      # Build for production
npm run test       # Run tests
npm run eject      # Eject from Create React App
npm run lint       # Run ESLint
```


## 📁 Complete Project Structure

```
vettam-editor/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── slices/
│   │   ├── store/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── .env.local
│   └── package.json
├── package.json          # Root package.json for concurrently
├── README.md
└── .gitignore
```


## 🔍 Testing the Application

### 1. Test Backend API

```bash
# Test server health
curl http://localhost:5000/api/health

# Test Gemini integration
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, explain AI"}'
```


### 2. Test Frontend Features

1. **Create a new document**
2. **Add some text and formatting**
3. **Insert page breaks** using the toolbar
4. **Check thumbnail panel** for page previews
5. **Test search functionality**
6. **Add bookmarks**
7. **Try AI chat** with document content

## 🚨 Troubleshooting

### Common Issues:

#### 1. MongoDB Connection Failed

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB if stopped
sudo systemctl start mongod
```


#### 2. Gemini API Rate Limits

- Check your API quota in [Google AI Studio](https://aistudio.google.com)
- Implement proper rate limiting in your application


#### 3. CORS Issues

- Ensure `FRONTEND_URL` is correctly set in backend `.env`
- Check CORS configuration in backend


#### 4. Port Already in Use

```bash
# Find process using port 3000 or 5000
lsof -i :3000
lsof -i :5000

# Kill the process
kill -9 <PID>
```


## 🚀 Production Deployment

### 1. Build Frontend

```bash
cd frontend
npm run build
```


### 2. Environment Variables for Production

Update `.env` files with production values:

- Use production MongoDB URI
- Use HTTPS URLs
- Set `NODE_ENV=production`
- Use strong JWT secrets


### 3. Deploy to Cloud Platforms

- **Frontend**: Vercel, Netlify, or AWS S3
- **Backend**: Heroku, DigitalOcean, or AWS EC2
- **Database**: MongoDB Atlas


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit changes: `git commit -m "feat: add awesome feature"`
4. Push to fork: `git push origin feat/my-feature`
5. Open a Pull Request

## 📄 License

MIT © Vettam AI

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Create an issue on GitHub
- **Community**: Join our Discord server
- **Email**: support@vettam.ai

**Happy coding! 🎉**

<div style="text-align: center">⁂</div>

[^1]: https://in.bebee.com/job/51014b28484fd397d0dcba5ec156b76b

[^2]: https://in.bebee.com/job/5c4160175990f67c17a0dd58b19dcfb7

[^3]: https://ai.google.dev

[^4]: https://developers.google.com/learn/pathways/solution-ai-gemini-getting-started-web

[^5]: https://cloud.google.com/application-integration/docs/build-integrations-gemini

[^6]: https://in.linkedin.com/jobs/view/frontend-developer-at-vettam-ai-4276016755

[^7]: https://www.keycdn.com/blog/best-ide

[^8]: https://zapier.com/blog/gemini-api/

[^9]: https://nextleap.app/jobs/engineering/frontend-developer-vettam-ai/rmbvqxep

[^10]: https://www.linkedin.com/posts/jeet-kr-ss-gu-wa0918_get-started-with-web-development-using-visual-activity-7195064575535284224-RYUF

[^11]: https://firebase.google.com/docs/studio/build-gemini-api-app

[^12]: https://www.linkedin.com/posts/masna-sairevanth_get-started-with-web-development-using-visual-activity-7203342180940222464-Hj0F

[^13]: https://firebase.google.com/docs/ai-logic

[^14]: https://aistudio.google.com

[^15]: https://github.com/google-gemini/cookbook

[^16]: https://developers.google.com/learn/pathways/solution-ai-gemini-101

[^17]: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference

[^18]: https://vega.github.io/editor-backend/

[^19]: https://github.com/vega/editor-backend

[^20]: https://github.com/ariatemplates/editor-backend

[^21]: https://github.com/datalowe/text-editor-backend

[^22]: https://gist.github.com/GouthamGajam/28d5f58fd9c9adcc31596aa03703a27c

[^23]: https://github.com/samson-shukla/google-gemini-ai

[^24]: https://www.youtube.com/watch?v=0aq_yQ4_Aiw

[^25]: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/code-execution-api

[^26]: https://github.com/y-vectorfield/editor

[^27]: https://arindam1729.hashnode.dev/how-to-use-google-gemini-with-nodejs-app

[^28]: https://www.youtube.com/watch?v=-KlqFqvwggk

[^29]: https://dev.to/wescpy/a-better-google-gemini-api-hello-world-sample-4ddm

[^30]: https://github.com/vega/editor/tree/975114917c70dd44f754679379f8fedfb44155f5

[^31]: https://ai.google.dev/gemini-api/docs/quickstart

[^32]: https://ai.google.dev/api

[^33]: https://code.visualstudio.com/api/extension-guides/custom-editors

[^34]: https://www.youtube.com/watch?v=Z8F6FvMrN4o

[^35]: https://ckeditor.com

[^36]: https://www.youtube.com/watch?v=9BD9eK9VqXA

[^37]: https://www.youtube.com/watch?v=p5XnvaU6XpM

[^38]: https://www.youtube.com/watch?v=ioxgbkxIGwE

[^39]: https://www.youtube.com/watch?v=MIJt9H69QVc

[^40]: https://www.youtube.com/watch?v=C_vv1D5oDZ0

[^41]: https://dev.to/adewumi0550/how-setup-gemini-ai-for-rest-api-using-nodejs-5f46

[^42]: https://www.youtube.com/watch?v=AfwzyVXiNVw

[^43]: https://firebase.google.com/docs/ai-logic/get-started

[^44]: https://www.youtube.com/watch?v=qwfE7fSVaZM

[^45]: https://ai.google.dev/gemini-api/docs

[^46]: https://www.youtube.com/watch?v=f2EqECiTBL8

[^47]: https://www.youtube.com/watch?v=l6AGRZ-RK1s

[^48]: https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart

