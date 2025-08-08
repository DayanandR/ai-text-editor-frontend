# Vettam Editor

A React SPA/PWA rich-text editor with live pagination, AI integration, and backend storage.

## 🚀 Quick Start

```bash
npm install
npm run dev
```


## 🔧 Environment

```env
# .env.local
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your-gemini-api-key
```


## 📦 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Editor**: Tiptap with custom extensions
- **State**: Redux Toolkit + Saga
- **PWA**: Workbox service worker
- **AI**: Google Gemini API
- **Export**: PDF + DOCX support


## ⚡ Key Features

- Rich text editing with live pagination
- Page thumbnails and table of contents
- AI-powered chat assistance
- Offline editing with auto-save
- Export to PDF/DOCX formats


## 🔧 Architecture Trade-offs

**PWA + Backend Storage**

- ✅ Offline editing, data persistence
- ❌ Complex sync, network dependency

**Redux Saga**

- ✅ Handles offline/online sync
- ❌ More complex than simple API calls

**Client-side Export**

- ✅ Instant PDF/DOCX generation
- ❌ Larger bundle size


## 🚀 Production Needs

1. **Security**: Move Gemini API to backend proxy
2. **Performance**: Optimize large document handling
3. **Reliability**: Better error handling and retry logic
4. **Sync**: Improve offline/online conflict resolution

## 📁 Structure

```
src/
├── components/     # Editor, Sidebar, Chat
├── store/         # Redux state
├── services/      # API client
└── utils/         # Export functions
```


***

**Built with modern React stack + PWA capabilities**

