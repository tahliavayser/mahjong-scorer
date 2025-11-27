# 🀄 Mahjong Hand Scorer

A web application that analyzes mahjong hands and calculates scores using the Hong Kong scoring system. Built with React, Vite, and TensorFlow.js.

## Features

- **Image Capture**: Take photos of mahjong hands using your device camera or upload existing photos
- **Manual Tile Selection**: Select tiles manually for precise scoring
- **Automatic Scoring**: Calculates Fan points based on Hong Kong mahjong rules
- **Detailed Breakdown**: Shows exactly which patterns were matched and how points were earned
- **Game Context**: Prompts for win conditions (self-pick, discard, etc.) to ensure accurate scoring
- **Responsive Design**: Works on desktop and mobile devices

## Hong Kong Scoring Rules Implemented

### Win Actions (1-9 Fan)
- Self-Pick (自摸)
- Win by Kong Replacement (槓上開花)
- Double Kong Replacement (槓上槓)
- Concealed Hand (門前清)
- Robbing the Kong (搶槓)
- Moon Under The Sea (海底撈月)

### Single Set Type Hands (1-13 Fan)
- All Sequences (平糊)
- All Triplets (對對糊)
- All Concealed Triplets (四暗刻)
- All Quadruplets (四槓子)

### Special Tile Hands (1-13 Fan)
- Dragon Triplets (三元牌)
- Small/Big Three Dragons (小三元/大三元)
- Wind Triplets (圈風/門風)
- Small/Big Four Winds (小四喜/大四喜)
- Mixed/Full Flush (混一色/清一色)
- Mixed/All Terminals (混么九/清么九)
- All Honours (字一色)

### Flowers and Seasons (1-8 Fan)
- No Flowers or Seasons (無花)
- Seat Flower or Season (正花)
- All Flowers or All Seasons (一樣花)
- Seven/Eight Flowers (花糊/大花糊)

### Special Hands (4-13 Fan)
- Blessing of Heaven/Earth/Man (天糊/地糊/人糊)
- Nine Gates (九連寶燈)
- Thirteen Orphans (十三么)
- Seven Pairs (七對子)

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mahjong-scorer

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage

### Image Detection Mode
1. Click "Use Camera" to take a photo or "Upload Photo" to select an existing image
2. The app will detect tiles from the image (currently using mock data)
3. Provide game context (how you won, seat position, etc.)
4. View your score breakdown with detailed Fan calculations

### Manual Selection Mode
1. Switch to "Manual Selection" mode
2. Click tiles to add them to your hand
3. Click "Calculate Score" when you have 13-14 tiles
4. Provide game context
5. View your score breakdown

## Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **TensorFlow.js**: Machine learning for tile detection (placeholder implementation)
- **CSS3**: Styling with gradients and animations

## TensorFlow.js Integration

The current implementation includes a placeholder for TensorFlow.js tile detection. To use actual image recognition:

1. **Collect Training Data**: Gather labeled images of mahjong tiles
2. **Train Model**: Use TensorFlow to train a CNN for tile classification
3. **Export Model**: Convert to TensorFlow.js format
4. **Replace Mock**: Update `src/utils/tileDetection.js` with real model loading

Example model architecture needed:
- Input: 224x224 RGB image
- Output: 34 classes (9 dots, 9 sticks, 9 man, 4 winds, 3 dragons)
- Additional detection for flowers/seasons

## Deployment

### GitHub Pages

1. Update `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/mahjong-scorer/'
})
```

2. Build and deploy:
```bash
npm run build
npm run deploy
```

3. Enable GitHub Pages in repository settings

## Minimum Fan Requirement

The app uses a 3 Fan minimum (configurable in `src/data/scoringRules.js`). Scores below 3 Fan are calculated but marked as not meeting the minimum.

## Payment Table

Based on classical mahjong payment:
- 0 Fan = 1 point
- 1 Fan = 2 points
- 2 Fan = 4 points
- 3 Fan = 8 points
- ...doubles each Fan...
- 13+ Fan = 8192 points

## Future Enhancements

- [ ] Train and integrate actual TensorFlow.js model for tile detection
- [ ] Support for other mahjong variants (Japanese, American, etc.)
- [ ] Multiplayer score tracking
- [ ] Game history and statistics
- [ ] PWA support for offline use
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Credits

Built with ❤️ using React and TensorFlow.js
Hong Kong Mahjong rules based on traditional scoring system
