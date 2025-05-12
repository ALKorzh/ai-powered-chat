# AI-Powered Chat Application

A modern chat application powered by AI that enables users to interact with AI assistants through text and voice.

## Project Overview

This project consists of a full-stack application with a React frontend and FastAPI backend. It provides users with an intuitive chat interface to communicate with AI models and supports features like authentication, voice recording, and markdown rendering.

## Technologies Used

### Frontend
- **React 18**: Main UI library
- **Vite**: Build tool and development server
- **React Router Dom**: For client-side routing
- **Axios**: HTTP client for API requests
- **React Markdown & Remark-GFM**: Markdown rendering
- **RecordRTC**: Voice recording capabilities
- **Zod**: Schema validation

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation
- **OAuth/Authlib**: Authentication and authorization
- **PostgreSQL**: Database (via psycopg2)
- **OpenAI Whisper**: Speech-to-text processing
- **Google Generative AI**: Integration with Google's AI models
- **Uvicorn**: ASGI server

## Key Features and Solutions

1. **Authentication System**: Secure user authentication using OAuth and JWT tokens
2. **Real-time Chat**: Interactive chat interface with AI assistants
3. **Voice Input**: Record and send voice messages that are transcribed to text
4. **Markdown Support**: Rich text formatting in chat messages
5. **Session Management**: Secure session handling
6. **CORS Configuration**: Secure cross-origin resource sharing
7. **Database Integration**: Persistent storage using PostgreSQL

## Setup and Running the Application

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL database

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd Backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv .venv
   # Windows
   .\.venv\Scripts\activate
   # Linux/Mac
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the Backend directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost/dbname
   SECRET_KEY=your_secret_key
   # Add other necessary environment variables for your AI services
   ```

5. Run the application:
   ```
   uvicorn app.main:app --reload
   ```
   The API will be available at http://localhost:8000

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd Frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the Frontend directory with the following:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```
   npm run dev
   ```
   The application will be available at http://localhost:5173


