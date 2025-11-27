# 🚀 Quick Start Guide

## Get Started in 3 Steps

### 1️⃣ Run the App Locally

```bash
cd mahjong-scorer
npm install
npm run dev
```

Open http://localhost:5173 in your browser

### 2️⃣ Try It Out

**Option A: Use Example Hands**
- Click one of the "Example Hands" buttons
- See the scoring in action immediately

**Option B: Manual Selection**
- Switch to "Manual Selection" mode
- Click tiles to build your hand (need 13-14 tiles)
- Click "Calculate Score"
- Fill out the game context form
- View your detailed score breakdown

**Option C: Image Mode** (currently mock data)
- Click "Use Camera" or "Upload Photo"
- Tiles will be detected (mock data for now)
- Fill out game context
- See results

### 3️⃣ Deploy to GitHub

```bash
# Configure git (first time only)
git config user.email "your.email@example.com"
git config user.name "Your Name"

# Commit your code
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/mahjong-scorer.git
git push -u origin main

# Deploy to GitHub Pages
npm run deploy
```

Your app will be live at: `https://YOUR_USERNAME.github.io/mahjong-scorer/`

## 🎯 Key Features to Test

1. **Manual Tile Selection** - Most reliable way to score hands
2. **Game Context Form** - Ensures accurate scoring based on how you won
3. **Score Breakdown** - See exactly which patterns were matched
4. **Example Hands** - Learn different scoring patterns

## 📱 Mobile Usage

The app works great on mobile devices:
- Responsive design adapts to screen size
- Camera access for taking photos
- Touch-friendly tile selection
- Works on iOS and Android

## 🔧 Troubleshooting

**Port already in use?**
```bash
npm run dev -- --port 3000
```

**Build fails?**
```bash
rm -rf node_modules
npm install
npm run build
```

**Camera not working?**
- Ensure you're using HTTPS (required for camera)
- Check browser permissions
- Try file upload instead

## 📚 Learn More

- `README.md` - Full documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `PROJECT_SUMMARY.md` - Complete project overview

## 🎮 Example Scoring Scenarios

**All Sequences (1 Fan)**
- 4 sequences + 1 pair
- Simplest winning hand

**All Triplets (3 Fan)**
- 4 triplets + 1 pair
- No sequences allowed

**Big Three Dragons (8 Fan)**
- Triplets of all 3 dragons
- Plus 1 more set and a pair

**Self-Pick Bonus (+1 Fan)**
- Select "Self-Pick" in game context
- Adds 1 Fan to your score

## 💡 Pro Tips

1. Start with manual selection until you train an ML model
2. Always fill out the game context for accurate scoring
3. The app shows scores even below 3 Fan minimum
4. Try the example hands to understand scoring patterns
5. Check the pattern descriptions to learn the rules

---

**Ready to score some mahjong hands? Let's go! 🀄**

