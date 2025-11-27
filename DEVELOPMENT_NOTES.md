# Development Notes

## Architecture Decisions

### Why React + Vite?
- Fast development with Hot Module Replacement (HMR)
- Modern build tool with excellent performance
- Small bundle size compared to Create React App
- Easy to configure for GitHub Pages

### Why TensorFlow.js?
- Runs entirely in the browser (no backend needed)
- Can use pre-trained models or train custom ones
- Good performance with WebGL acceleration
- Large community and documentation

### Component Structure
- **Separation of Concerns**: UI components separate from business logic
- **Utility Functions**: Scoring and validation in separate modules
- **Data Layer**: Scoring rules in dedicated data file for easy updates

## Key Implementation Details

### Scoring Engine (`src/utils/scoringEngine.js`)

The scoring engine follows Hong Kong mahjong rules with these principles:

1. **Pattern Priority**: Special hands (13 Fan) are checked first
2. **Pattern Conflicts**: Some patterns include others (e.g., All Honours includes All Triplets)
3. **Additive Scoring**: Most patterns stack (Self-Pick + All Sequences = 2 Fan)
4. **Game Context**: Win type and position affect final score

**Example Flow:**
```javascript
calculateScore(handData, gameContext)
  → checkSpecialHands() // 13 Fan hands first
  → checkWinActions()   // How they won
  → checkSingleSetType() // Hand composition
  → checkSpecialTileHands() // Dragons, winds, flushes
  → checkFlowersAndSeasons() // Bonus tiles
  → return totalFan + breakdown
```

### Hand Validator (`src/utils/handValidator.js`)

Uses recursive backtracking to find valid set combinations:

1. **Try Standard Pattern**: 4 sets + 1 pair
2. **Try Seven Pairs**: 7 pairs
3. **Try Thirteen Orphans**: Special pattern

**Algorithm:**
```javascript
tryStandardPattern(tiles)
  → for each possible pair:
    → remove pair from tiles
    → trySetsRecursive(remaining)
      → try sequence
      → try triplet
      → try quadruplet
      → recurse until all tiles used
```

### Game Context Form (`src/components/GameContextForm.jsx`)

Critical for accurate scoring because:
- Self-pick adds 1 Fan
- Kong replacement adds 1-9 Fan
- Seat/round wind affects wind triplet scoring
- Dealer status matters for special hands

**User Experience:**
- Radio buttons for mutually exclusive options
- Clear descriptions for each option
- Skip button with sensible defaults
- Visual feedback for selected options

## State Management

Using React's built-in `useState` for simplicity:

```javascript
// App-level state
const [mode, setMode] = useState('image')
const [detectedTiles, setDetectedTiles] = useState(null)
const [scoreResult, setScoreResult] = useState(null)
const [showContextForm, setShowContextForm] = useState(false)
const [pendingHandData, setPendingHandData] = useState(null)
```

**Flow:**
1. Capture/select tiles → `detectedTiles`
2. Parse hand → `pendingHandData`
3. Show context form → `showContextForm = true`
4. User submits → Calculate score → `scoreResult`

## Styling Approach

Using vanilla CSS with modern features:
- CSS Grid for layouts
- Flexbox for component alignment
- CSS Gradients for visual appeal
- CSS Transitions for smooth interactions
- Media queries for responsive design

**Color Scheme:**
- Primary: Purple gradient (#667eea → #764ba2)
- Secondary: Pink gradient (#f093fb → #f5576c)
- Neutral: Grays for text and backgrounds

## TensorFlow.js Integration

### Current Implementation (Mock)
```javascript
detectTilesFromImage(imageBlob, imageElement)
  → preprocessImage() // Resize, normalize
  → return generateMockTiles() // Placeholder
```

### Production Implementation (Future)
```javascript
detectTilesFromImage(imageBlob, imageElement)
  → preprocessImage()
  → model.predict(tensor)
  → postprocessPredictions()
  → return detectedTiles
```

### Model Requirements
- **Input**: 224x224 RGB image
- **Output**: 34 classes (9+9+9+4+3 tile types)
- **Architecture**: CNN (Convolutional Neural Network)
- **Training Data**: ~1000 images per tile type
- **Accuracy Target**: >95% for production use

## Performance Considerations

### Bundle Size
- TensorFlow.js is large (~1MB)
- Consider lazy loading: `const tf = await import('@tensorflow/tfjs')`
- Or use CDN version to reduce bundle

### Image Processing
- Resize images before processing
- Use canvas for efficient manipulation
- Compress uploaded images

### Rendering
- React components are lightweight
- CSS animations use GPU acceleration
- No unnecessary re-renders (proper state management)

## Testing Strategy

### Manual Testing Checklist
- [ ] Camera capture works on mobile/desktop
- [ ] File upload accepts images
- [ ] Manual tile selection adds/removes correctly
- [ ] Game context form validates input
- [ ] Score calculation matches expected results
- [ ] All example hands score correctly
- [ ] Responsive design works on various screen sizes
- [ ] Build completes without errors

### Scoring Test Cases
```javascript
// Test case examples:
testAllSequences() // Should return 1 Fan
testAllTriplets() // Should return 3 Fan
testBigThreeDragons() // Should return 8 Fan
testSelfPickBonus() // Should add 1 Fan
testInvalidHand() // Should return error
```

## Common Issues & Solutions

### Issue: Camera not accessible
**Solution**: Requires HTTPS. Use GitHub Pages or local HTTPS server.

### Issue: Large bundle size
**Solution**: Use dynamic imports or CDN for TensorFlow.js

### Issue: Scoring seems wrong
**Solution**: Check game context - win type affects score significantly

### Issue: Hand validation fails
**Solution**: Ensure 13-14 regular tiles (flowers/seasons don't count toward 14)

## Future Enhancements

### High Priority
1. Train actual TensorFlow.js model for tile detection
2. Add tile correction UI (edit detected tiles)
3. Implement hand history/statistics
4. Add PWA support for offline use

### Medium Priority
1. Support other mahjong variants (Japanese, American)
2. Multi-language support (English, Chinese, Japanese)
3. Tutorial mode for learning rules
4. Animated scoring explanations

### Low Priority
1. Multiplayer score tracking
2. Tournament mode
3. Social sharing features
4. Custom rule configurations

## Code Quality

### Linting
- ESLint configured with React rules
- No linting errors in current codebase
- Run `npm run lint` to check

### Code Style
- Consistent naming conventions
- Clear function documentation
- Modular component structure
- Reusable utility functions

### Git Workflow
```bash
# Feature branch
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR on GitHub
```

## Deployment Pipeline

1. **Development**: `npm run dev`
2. **Build**: `npm run build`
3. **Preview**: `npm run preview`
4. **Deploy**: `npm run deploy`

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml` for automatic deployment:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run build
      - run: npm run deploy
```

## Resources

### Documentation
- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [Hong Kong Mahjong Rules](https://en.wikipedia.org/wiki/Hong_Kong_Mahjong_scoring_rules)

### Tools
- [Mahjong Unicode Characters](https://en.wikipedia.org/wiki/Mahjong_Tiles_(Unicode_block))
- [Image Labeling Tools](https://github.com/heartexlabs/labelImg)
- [TensorFlow Playground](https://playground.tensorflow.org)

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with clear description

### Code Review Checklist
- [ ] Code follows existing style
- [ ] No console errors or warnings
- [ ] Responsive design maintained
- [ ] Scoring logic is accurate
- [ ] Documentation updated if needed

---

**Happy coding! 🀄**

