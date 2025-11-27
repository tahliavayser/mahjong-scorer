# GitHub Setup Guide for Tahlia

## ✅ Git Configuration Complete

Your git is now configured with:
- **Email**: tahliavayser@gmail.com
- **Name**: Tahlia
- **Initial commit**: ✅ Done (32 files committed)

## 🚀 Next Steps to Push to GitHub

### 1. Create a New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `mahjong-scorer` (or your preferred name)
3. Description: "Mahjong Hand Scorer using Hong Kong scoring system"
4. Keep it **Public** (required for free GitHub Pages)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2. Push Your Code

After creating the repository, run these commands:

```bash
cd "/Users/tahlia.vayser.-nd/Desktop/Cursor Vibes/mahjong-scorer"

# Add the remote repository (replace with your actual repo URL)
git remote add origin https://github.com/tahliavayser/mahjong-scorer.git

# Push to GitHub
git push -u origin main
```

If you get an authentication error, you may need to use a Personal Access Token instead of password:
1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token with `repo` scope
3. Use the token as your password when prompted

### 3. Deploy to GitHub Pages

Once pushed to GitHub:

```bash
npm run deploy
```

This will:
- Build your app for production
- Create a `gh-pages` branch
- Deploy to GitHub Pages

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll to "Pages" section (left sidebar)
4. Under "Source", select branch: `gh-pages`
5. Click "Save"

Your site will be live at:
```
https://tahliavayser.github.io/mahjong-scorer/
```

## 🔄 Making Updates

After making changes to your code:

```bash
# Stage changes
git add .

# Commit with a descriptive message
git commit -m "Description of your changes"

# Push to GitHub
git push

# Deploy updated version
npm run deploy
```

## 📝 Quick Commands Reference

```bash
# Check git status
git status

# View commit history
git log --oneline

# See what changed
git diff

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Pull latest changes
git pull
```

## 🎯 Your Repository URLs

Once created, your repository will be at:
- **Repository**: https://github.com/tahliavayser/mahjong-scorer
- **Live Site**: https://tahliavayser.github.io/mahjong-scorer/
- **Clone URL**: https://github.com/tahliavayser/mahjong-scorer.git

## 🛠️ Troubleshooting

### Authentication Issues
If you can't push, try using SSH instead:
```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "tahliavayser@gmail.com"

# Add to GitHub: Settings > SSH and GPG keys > New SSH key
# Then change remote to SSH:
git remote set-url origin git@github.com:tahliavayser/mahjong-scorer.git
```

### Deploy Fails
- Ensure you've pushed to main first: `git push`
- Check that gh-pages package is installed: `npm install`
- Verify build works: `npm run build`

### Pages Not Working
- Check repository settings > Pages
- Ensure branch is set to `gh-pages`
- Wait a few minutes for deployment
- Check Actions tab for deployment status

## 📧 Need Help?

- GitHub Docs: https://docs.github.com
- GitHub Pages: https://pages.github.com
- Git Guide: https://git-scm.com/doc

---

**Ready to go! Create your GitHub repository and push your code! 🚀**

