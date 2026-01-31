# AI Vision Avatar Tutor - Backend

Complete FastAPI backend for the AI Vision Avatar Tutor platform.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys
- `HEYGEN_API_KEY` - Get from https://app.heygen.com/settings/api
- `DEFAULT_AVATAR_ID` - Your HeyGen avatar ID

### 3. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at `http://localhost:8000`

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/vision/analyze` | POST | Analyze uploaded image |
| `/api/chat/respond` | POST | Chat with AI tutor |
| `/api/heygen/avatar` | POST | Generate speaking avatar |
| `/api/screen/frame` | POST | Analyze screen capture frame |

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app + CORS
│   ├── api/routes/             # API route handlers
│   │   ├── vision.py
│   │   ├── chat.py
│   │   ├── heygen.py
│   │   └── screen_share.py
│   ├── core/
│   │   ├── config.py           # Pydantic settings
│   │   └── openai_client.py    # OpenAI client
│   ├── services/               # Business logic
│   │   ├── vision_service.py
│   │   ├── chat_service.py
│   │   ├── heygen_service.py
│   │   └── screen_service.py
│   └── models/                 # Request/Response schemas
│       ├── request_models.py
│       └── response_models.py
├── .env.example
├── requirements.txt
└── README.md
```

## 🔗 Frontend Connection

Set this environment variable in your frontend:

```
VITE_API_BASE_URL=http://your-server-ip:8000
```

## 🌍 Supported Languages

English, Tamil, Hindi, Telugu, Malayalam, Spanish, French, German, Japanese, Chinese, Arabic, Portuguese, Korean, Russian

## 📝 License

MIT
