# Development Setup

## Run Both Frontend + Backend

### Terminal 1 - Backend (Port 3001)
```bash
npm run server
```

### Terminal 2 - Frontend (Port 5173)
```bash
npm run dev
```

## Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## How it works
- Backend proxies FatSecret Platform API calls (solves CORS + keeps OAuth2 credentials secure)
- Backend handles OAuth2 token management automatically
- Frontend calls backend instead of FatSecret directly
- Fallback chain: FatSecret (via backend) → USDA → Mock DB
