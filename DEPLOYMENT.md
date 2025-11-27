# Deployment Guide

## GitHub Pages Deployment

### Initial Setup

1. **Create a GitHub repository**
   ```bash
   # Initialize git (if not already done)
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit: Mahjong Hand Scorer"
   
   # Add remote (replace with your repo URL)
   git remote add origin https://github.com/YOUR_USERNAME/mahjong-scorer.git
   
   # Push to GitHub
   git push -u origin main
   ```

2. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Source should be set to "gh-pages" branch
   - Your site will be published at: `https://YOUR_USERNAME.github.io/mahjong-scorer/`

### Updating the Deployment

Whenever you make changes:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push

# Deploy updated version
npm run deploy
```

## Alternative: Custom Domain

If you want to use a custom domain:

1. Add a `CNAME` file to the `public` folder with your domain name
2. Configure your domain's DNS settings to point to GitHub Pages
3. Enable custom domain in GitHub repository settings

## Environment Variables

If you need environment variables for production:

1. Create `.env.production` file
2. Add variables with `VITE_` prefix:
   ```
   VITE_API_KEY=your_key_here
   ```
3. Access in code: `import.meta.env.VITE_API_KEY`

## Build Optimization

The TensorFlow.js bundle is large (~1MB). To optimize:

1. **Code Splitting**: Consider lazy loading TensorFlow only when needed
2. **CDN**: Use TensorFlow.js from CDN instead of bundling
3. **Tree Shaking**: Import only needed TensorFlow modules

Example for CDN approach:
```html
<!-- In index.html -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
```

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for console errors: `npm run build`

### Deployment Fails
- Ensure gh-pages package is installed: `npm install --save-dev gh-pages`
- Check GitHub permissions
- Verify branch name in package.json scripts

### Camera Not Working
- Ensure HTTPS (required for camera access)
- Check browser permissions
- GitHub Pages automatically uses HTTPS

## Performance Tips

1. **Image Optimization**: Compress uploaded images before processing
2. **Lazy Loading**: Load components on demand
3. **Service Worker**: Add PWA support for offline functionality
4. **Caching**: Implement browser caching for static assets

## Security Notes

- Never commit API keys or secrets
- Use environment variables for sensitive data
- GitHub Pages sites are public - don't store private data
- Camera access requires user permission

## Monitoring

Consider adding:
- Google Analytics for usage tracking
- Error tracking (Sentry, LogRocket)
- Performance monitoring (Web Vitals)

