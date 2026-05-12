# Macro Tracker POC

A comprehensive macro and calorie tracking application with personalized nutrition goals, body weight-based macro calculations, and multi-tier API fallback system.

## 📁 Project Structure

```
macro-tracker-poc/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx      # Main application component
│   │   ├── main.jsx     # React entry point
│   │   └── assets/
│   ├── public/
│   ├── package.json     # Frontend dependencies
│   ├── vite.config.js   # Vite configuration
│   ├── .env             # Frontend environment variables
│   └── .env.example
│
├── server/              # Backend (Express)
│   ├── server.js        # Express server for FatSecret OAuth proxy
│   ├── package.json     # Backend dependencies
│   ├── .env             # Backend environment variables
│   └── .env.example
│
├── package.json         # Root package.json for workspace management
└── .github/workflows/deploy.yml  # GitHub Actions for deployment
```

## ✨ Features

### 🎯 Core Functionality
- **Smart Food Parsing**: Supports multiple formats ("2 eggs", "100g chicken", "1 cup rice")
- **Multi-Tier API Fallback**: FatSecret API → USDA FoodData Central → Mock Database (70+ foods)
- **Unit Conversion**: Automatic handling of grams, kg, cups, servings, pieces, scoops
- **Indian Food Support**: Extensive database of Indian foods (paneer, roti, dal, dosa, etc.)

### 📊 Personalized Nutrition
- **BMR Calculator**: Mifflin-St Jeor equation with activity multipliers
- **Body Weight-Based Macros**: 
  - Weight Loss: 2.2g protein/kg, 0.8g fat/kg
  - Maintenance: 1.8g protein/kg, 1.0g fat/kg
  - Muscle Gain: 2.0g protein/kg, 0.8g fat/kg
- **Goal-Based Calorie Adjustment**: ±50 cal increments
- **Two-Page Flow**: Settings setup → Food logging

### 📱 User Experience
- **Dark Theme**: Optimized for mobile viewing
- **Daily Tracking**: Calorie goal, consumed, remaining
- **Macro Progress Bars**: Visual protein/fat/carbs tracking
- **Edit/Delete History**: Full CRUD operations on logged meals
- **Auto-Scroll**: Smooth navigation to results
- **Input Validation**: Age (1-120), Height (50-300cm), Weight (20-500kg)
- **localStorage Persistence**: Last 10 meals saved locally

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/Sagar-kumar-00/Macro-tracker.git
cd Macro-tracker
```

### 2. Install Dependencies

#### Option A: Install Everything at Once
```bash
npm install
npm run install:all
```

#### Option B: Install Separately
```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3. Configure Environment Variables

#### Client (.env in `client/` directory)
```env
VITE_USDA_API_KEY=your_usda_api_key_here
VITE_BACKEND_URL=http://localhost:3001
```

#### Server (.env in `server/` directory)
```env
FATSECRET_CLIENT_ID=your_fatsecret_client_id
FATSECRET_CLIENT_SECRET=your_fatsecret_client_secret
PORT=3001
```

**Get API Keys:**
- **USDA API**: https://fdc.nal.usda.gov/api-key-signup.html
- **FatSecret API**: https://platform.fatsecret.com/api/ (Free tier with IP whitelist)

### 4. Run Development Servers

#### Option A: Run Both Concurrently (Recommended)
```bash
npm run dev
```

#### Option B: Run Separately
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm run dev
```

Frontend will be available at: http://localhost:5173  
Backend will be running at: http://localhost:3001

## 📦 Deployment

### Frontend (GitHub Pages)
The frontend is automatically deployed to GitHub Pages on every push to `main`:

```bash
cd client
npm run build
npm run deploy
```

**Live Demo**: https://sagar-kumar-00.github.io/Macro-tracker/

### Backend Deployment Options

#### Option 1: Render (Recommended)
1. Create a new Web Service on [Render](https://render.com/)
2. Connect your GitHub repository
3. Set Root Directory: `server`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables (FATSECRET_CLIENT_ID, FATSECRET_CLIENT_SECRET)

#### Option 2: Railway
1. Create a new project on [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Set Root Directory: `server`
4. Railway will auto-detect and deploy

#### Option 3: Vercel Serverless
1. Create `server/vercel.json`:
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/server.js" }]
}
```
2. Deploy: `vercel --prod`

### Update Frontend with Deployed Backend URL
After deploying the backend, update `client/.env`:
```env
VITE_BACKEND_URL=https://your-backend-url.com
```

Then rebuild and redeploy the frontend.

## 🛠️ Tech Stack

### Frontend
- **React 19.2.5**: UI framework
- **Vite 5.4.21**: Build tool and dev server
- **Axios**: HTTP client for API calls
- **localStorage**: Client-side data persistence

### Backend
- **Express 4.21.2**: Web server framework
- **Axios**: HTTP client for external APIs
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### APIs
- **FatSecret Platform API**: Primary nutrition data (foods.search/v1, free tier)
- **USDA FoodData Central**: Fallback nutrition data (1000 req/hour)
- **Mock Database**: Final fallback with 70+ foods

## 📊 API Priority Chain

1. **FatSecret** (Primary): Via Express backend with OAuth2
   - Pros: Comprehensive database, accurate data
   - Cons: Requires backend proxy, IP whitelist for free tier
   
2. **USDA FoodData Central** (Fallback): Direct API calls
   - Pros: Free, reliable, no authentication required
   - Cons: US-focused, limited Indian foods
   
3. **Mock Database** (Final Fallback): Hardcoded 70+ foods
   - Pros: Always available, instant response
   - Cons: Limited coverage, requires manual updates

## 📝 Scripts Reference

### Root Level
- `npm run install:all` - Install all dependencies
- `npm run dev` - Run both servers concurrently
- `npm run dev:client` - Run frontend only
- `npm run dev:server` - Run backend only
- `npm run build:client` - Build frontend for production
- `npm run deploy:client` - Deploy frontend to GitHub Pages

### Client
- `npm run dev` - Start Vite dev server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages

### Server
- `npm start` - Start Express server (port 3001)
- `npm run dev` - Start Express server (same as start)

## 🐛 Troubleshooting

### Frontend Not Finding Backend
- Ensure `VITE_BACKEND_URL` in `client/.env` is correct
- Check if backend server is running
- Verify CORS is enabled in server

### FatSecret API Errors
- Verify IP is whitelisted in FatSecret dashboard
- Check `FATSECRET_CLIENT_ID` and `FATSECRET_CLIENT_SECRET` in `server/.env`
- Ensure you're using `basic` scope (not `premier` or `nlp`)

### USDA API Errors
- Verify `VITE_USDA_API_KEY` in `client/.env`
- Check API rate limits (1000 requests/hour)

### Build Errors
- Delete `node_modules` in both client and server
- Delete `package-lock.json` files
- Run `npm run install:all` again

## 📄 License

MIT License - feel free to use this project for your own purposes!

## 👤 Author

Sagar Kumar
- GitHub: [@Sagar-kumar-00](https://github.com/Sagar-kumar-00)
- Repository: [Macro-tracker](https://github.com/Sagar-kumar-00/Macro-tracker)
