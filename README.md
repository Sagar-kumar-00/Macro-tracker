# 🥗 Macro Tracker

A personalized calorie and macro tracker with BMR calculator, multi-API nutrition data, and automatic serving size conversion.

## 🌟 Features

### 📊 Personalized Nutrition Goals
- **BMR Calculator** using Mifflin-St Jeor equation
- Age, height, weight, gender, and activity level inputs
- Goal-based macro targets:
  - 🔥 **Lose Weight**: 2.2g protein/kg, 0.8g fat/kg
  - ⚖️ **Maintain**: 1.8g protein/kg, 1.0g fat/kg
  - 💪 **Gain Muscle**: 2.0g protein/kg, 0.8g fat/kg
- Adjustable calorie goals (±50 increments)

### 🍽️ Smart Food Logging
- Natural language input: "5 eggs" or "100g chicken"
- Multi-API fallback chain:
  1. **FatSecret** (primary) - Auto-converts any serving size to 100g
  2. **USDA FoodData Central** (fallback)
  3. **Mock Database** (65+ foods including Indian items)
- Automatic quantity detection with dropdown defaults
- Edit/delete functionality in meal history

### 📈 Real-Time Tracking
- Daily calorie tracker (Goal / Consumed / Remaining)
- Macro progress bars (Protein / Fat / Carbs)
- Last 10 meals history with localStorage persistence
- Color-coded indicators for goal adherence

### 🌍 Indian Food Support
- Paneer, roti, chapati, paratha, idli, dosa, samosa
- Dal, chickpeas, and more common Indian foods

## 🚀 Live Demo

**Website**: [https://sagar-kumar-00.github.io/Macro-tracker/](https://sagar-kumar-00.github.io/Macro-tracker/)

## 🛠️ Tech Stack

- **Frontend**: React 19.2.5 + Vite 5.4.21
- **Backend**: Express.js (OAuth2 proxy for FatSecret)
- **APIs**: FatSecret Platform API, USDA FoodData Central
- **Styling**: Inline CSS (no external frameworks)
- **Storage**: localStorage for persistence
- **Deployment**: GitHub Pages with GitHub Actions

## 📦 Installation

### Prerequisites
- Node.js v20.18.1 or higher
- npm

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sagar-kumar-00/Macro-tracker.git
   cd Macro-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API keys**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_USDA_API_KEY=your_usda_api_key
   FATSECRET_CLIENT_ID=your_fatsecret_client_id
   FATSECRET_CLIENT_SECRET=your_fatsecret_client_secret
   VITE_BACKEND_URL=http://localhost:3001
   ```

   **Get API Keys:**
   - USDA: [https://fdc.nal.usda.gov/api-key-signup.html](https://fdc.nal.usda.gov/api-key-signup.html)
   - FatSecret: [https://platform.fatsecret.com/api/](https://platform.fatsecret.com/api/)

4. **Run the development servers**

   Terminal 1 (Frontend):
   ```bash
   npm run dev
   ```

   Terminal 2 (Backend):
   ```bash
   npm run server
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📝 Usage

### First Time Setup
1. Enter your age, height, weight, gender, and activity level
2. Select your goal (lose/maintain/gain)
3. Calculate maintenance calories
4. Adjust with +50/-50 if needed
5. Click "Save & Start Tracking"

### Logging Food
- **With quantity**: Type "5 eggs" or "100g chicken"
- **Without quantity**: Type "eggs" and use dropdown (100g default)
- **Supported units**: g, kg, servings, pieces, scoops

### Viewing Progress
- **Daily tracker** shows calories remaining
- **Macro bars** show protein/fat/carbs progress
- **History** shows last 10 meals with edit/delete options

## 🚀 Deployment

### Automatic Deployment
Push to `main` branch triggers GitHub Actions workflow:
```bash
git add .
git commit -m "Your message"
git push origin main
```

The site auto-deploys to: `https://sagar-kumar-00.github.io/Macro-tracker/`

### Manual Deployment
```bash
npm run deploy
```

## 📂 Project Structure

```
macro-tracker-poc/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions workflow
├── src/
│   ├── App.jsx              # Main application logic
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── server.js                # Express backend for FatSecret OAuth2
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies and scripts
└── .env                     # API keys (not committed)
```

## 🔧 Scripts

- `npm run dev` - Start frontend dev server
- `npm run server` - Start backend server
- `npm run build` - Build for production
- `npm run deploy` - Deploy to GitHub Pages
- `npm run preview` - Preview production build

## 🌐 API Priority Chain

1. **FatSecret** → Returns nutrition data, auto-normalizes serving sizes
2. **USDA** → Fallback for US foods, returns per-100g data
3. **Mock DB** → Final fallback with 65+ foods

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_USDA_API_KEY` | USDA FoodData Central API key |
| `FATSECRET_CLIENT_ID` | FatSecret OAuth2 Client ID |
| `FATSECRET_CLIENT_SECRET` | FatSecret OAuth2 Client Secret |
| `VITE_BACKEND_URL` | Backend server URL (default: http://localhost:3001) |

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Sagar Kumar**
- GitHub: [@Sagar-kumar-00](https://github.com/Sagar-kumar-00)

## 🙏 Acknowledgments

- FatSecret Platform API for nutrition data
- USDA FoodData Central for comprehensive food database
- React and Vite for amazing developer experience
