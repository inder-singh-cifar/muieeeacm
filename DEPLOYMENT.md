# Deployment Guide

## 📁 Repository Setup

Your website files are ready for upload to GitHub! Here's what you need to do:

### 1. GitHub Repository Upload

1. **Navigate to your repository**: https://github.com/Kiumbura/ieee-acm-monmouthuniversity
2. **Upload all files** from the project directory:
   - `index.html`
   - `executive-board.html`
   - `styles.css`
   - `board-styles.css`
   - `ieee-logo.jpg`
   - `acm-logo.png`
   - `README.md`
   - `.gitignore`

### 2. Render Deployment

1. **Sign up/Login** to [Render](https://render.com)
2. **Create New Static Site**
3. **Connect your GitHub repository**: `ieee-acm-monmouthuniversity`
4. **Configure deployment settings**:
   - **Build Command**: (leave empty for static site)
   - **Publish Directory**: `.` (root directory)
   - **Branch**: `main`

### 3. Custom Domain (Optional)

If you want a custom domain like `ieee-acm.monmouth.edu`:
1. Contact Monmouth University IT
2. Add custom domain in Render settings
3. Update DNS records as instructed

## 🔄 Auto-Deployment

Once connected to Render:
- Any push to the `main` branch will automatically trigger a new deployment
- Changes will be live within 1-2 minutes
- You'll get email notifications for deployment status

## 📝 Making Updates

To update the website:
1. Edit files locally
2. Push changes to GitHub
3. Render will automatically deploy the updates

## 🌐 Expected URL

Your live website will be available at:
`https://ieee-acm-monmouthuniversity.onrender.com`

## ✅ File Checklist

Make sure all these files are uploaded:
- [ ] `index.html` - Main homepage
- [ ] `executive-board.html` - Board member details
- [ ] `styles.css` - Main stylesheet
- [ ] `board-styles.css` - Board page styles
- [ ] `ieee-logo.jpg` - IEEE logo
- [ ] `acm-logo.png` - ACM logo
- [ ] `README.md` - Documentation
- [ ] `.gitignore` - Git ignore file

## 🚀 Quick Commands

If using Git CLI:
```bash
git add .
git commit -m "Initial website deployment"
git push origin main
```

## 📞 Support

If you need help with deployment:
- **GitHub Issues**: Create an issue in your repository
- **Render Support**: Check Render documentation
- **Website Issues**: Contact Kiumbura Githinji (s1358017@monmouth.edu)