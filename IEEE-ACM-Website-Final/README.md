# IEEE/ACM Monmouth University Chapter Website

## 📁 Complete Website Package - Ready to Deploy

This folder contains all the necessary files for the IEEE/ACM Student Chapter website, redesigned with Monmouth University official styling.

---

## 🗂️ Folder Structure

```
IEEE-ACM-Website-Final/
│
├── README.md                           ← You are here!
│
├── 🌐 HTML Pages
│   ├── index.html                      ← Main chapter page
│   └── ai-workshops.html               ← AI Workshops sub-page
│
├── 🎨 Stylesheets
│   ├── monmouth-ai-workshops-v2.css    ← Monmouth University styling
│   └── workshop-forms.css              ← Registration form styles
│
├── 💻 JavaScript
│   ├── monmouth-ai-workshops-v2.js     ← Interactive features
│   ├── workshop-forms.js               ← Form handling
│   └── chatbot.js                      ← AI Assistant
│
├── 🖼️ Images/Logos
│   ├── ieee-logo.jpg                   ← IEEE logo
│   ├── acm-logo.png                    ← ACM logo
│   └── logo_shadow.svg                 ← IEEE/ACM combined logo
│
└── 📚 docs/
    ├── REDESIGN_COMPLETE.md            ← Complete redesign details
    ├── FINAL_SUMMARY.md                ← Final summary of changes
    └── REDESIGN_PLAN.md                ← Original design plan
```

---

## ✅ What's Included

### Pages:
1. **index.html** - Main IEEE/ACM chapter page with:
   - Monmouth University academic styling
   - About section (IEEE & ACM info)
   - Activities showcase (AI Workshops featured)
   - Upcoming events
   - Leadership team
   - Join section
   - Professional navigation and footer

2. **ai-workshops.html** - AI Workshops & Research page with:
   - Clear IEEE/ACM branding
   - Workshop registration system
   - Research areas and projects
   - Team profiles
   - Resources section
   - Event registration modals

### Styling:
- **Monmouth Official Colors**: #002855, #004C97, #E57200
- **Monmouth Fonts**: Crimson Text (headings), Source Sans 3 (body)
- **Responsive Design**: Works on desktop, tablet, mobile

### Features:
- ✅ Workshop registration system with modal forms
- ✅ AI Assistant chatbot on all pages
- ✅ Sidebar navigation
- ✅ Breadcrumb navigation
- ✅ Smooth scrolling
- ✅ Mobile-responsive menu
- ✅ Professional footer

### Social Media:
- Instagram: @monmouth_ieeeacm
- Email: s1358017@monmouth.edu

---

## 🚀 How to Deploy

### Option 1: GitHub Pages

```bash
# Navigate to this folder
cd "/Users/Kiumbura/Desktop/Work/IEEE:ACM/IEEE-ACM-Website-Final"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - IEEE/ACM website with Monmouth styling"

# Add your GitHub repository
git remote add origin YOUR_GITHUB_REPO_URL

# Push to GitHub
git push -u origin main

# Enable GitHub Pages in repository settings
```

### Option 2: Other Hosting (Netlify, Vercel, etc.)

1. Upload all files in this folder to your hosting service
2. Set `index.html` as the main page
3. Ensure all files are in the same directory
4. Deploy!

---

## 🧪 Testing Locally

### Open in Browser:
```bash
# Mac
open index.html

# Or double-click index.html
```

### Test Checklist:
- [ ] Main page loads correctly
- [ ] All sections display properly
- [ ] Click "AI Workshops" link in navigation
- [ ] AI Workshops page loads
- [ ] Click "Register Now" on an event
- [ ] Registration modal opens
- [ ] Test form validation
- [ ] Click "Back to IEEE/ACM" link
- [ ] Test chatbot on both pages
- [ ] Test responsive design (resize browser)
- [ ] Verify all links work

---

## 🎨 Customization

### Update Events:
Edit `index.html` or `ai-workshops.html` - find the event card sections and update:
- Date, title, description
- Speaker, time, location
- Registration modal parameters

### Change Colors:
Edit `monmouth-ai-workshops-v2.css` - modify CSS variables:
```css
:root {
    --monmouth-blue: #002855;
    --ieee-blue: #004C97;
    --monmouth-orange: #E57200;
}
```

### Update Team Members:
Edit `index.html` - find the team section and add/modify team cards

### Update Contact Info:
Search for email addresses and update as needed

---

## 📋 Required Setup

### Before the website works fully, you need:

1. **AI Assistant (Chatbot)**
   - Update webhook URL in `chatbot.js` line 8
   - Set up n8n workflow (see CHATBOT_README.md in original folder)
   - Add Claude API key to n8n

2. **Workshop Registration**
   - Forms currently log to console
   - To enable full registration, set up backend API
   - Or connect to Google Forms/Microsoft Forms

3. **Update Content**
   - Add real workshop dates and information
   - Update team member photos (if desired)
   - Add actual event descriptions

---

## 🔧 Technical Details

### Dependencies:
- **Fonts**: Google Fonts (Crimson Text, Source Sans 3)
- **Icons**: Font Awesome 6.0 (CDN)
- **No framework required** - Pure HTML/CSS/JS

### Browser Support:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

### File Sizes:
- Total: ~150KB (excluding images)
- HTML: ~30KB
- CSS: ~40KB
- JS: ~50KB
- Fast loading on all connections

---

## 📞 Support & Contact

**Website Admin:**
- Kiumbura Githinji (President)
- Email: s1358017@monmouth.edu

**For technical issues:**
- Check browser console (F12) for errors
- Verify all files are in the same folder
- Ensure internet connection for CDN resources (fonts, icons)

---

## 📝 License & Credits

**Created for:**
- IEEE/ACM Monmouth University Student Chapter

**Design:**
- Based on Monmouth University official department styling
- Maintains IEEE/ACM branding and identity

**Technologies:**
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome icons
- Google Fonts

---

## 🎯 Key Features Summary

### Design:
- ✅ Monmouth University official colors and fonts
- ✅ Professional academic department appearance
- ✅ Responsive mobile-first design
- ✅ Accessible navigation (breadcrumbs, sidebar)

### Content:
- ✅ IEEE/ACM chapter information
- ✅ AI Workshops integrated as chapter activity
- ✅ Leadership team showcase
- ✅ Event listings with registration
- ✅ Membership benefits and join form

### Functionality:
- ✅ Workshop registration modal system
- ✅ AI chatbot assistant
- ✅ Smooth scrolling navigation
- ✅ Mobile hamburger menu
- ✅ Form validation

---

## 🚀 Quick Start

1. **Open** `index.html` in a web browser
2. **Navigate** through all sections
3. **Test** the AI Workshops page
4. **Customize** content as needed
5. **Deploy** to your hosting service

---

## 📊 Before Deployment Checklist

- [ ] Test all pages locally
- [ ] Update event information with real dates
- [ ] Verify all email addresses are correct
- [ ] Test registration forms
- [ ] Configure AI Assistant webhook (if using)
- [ ] Check all images load correctly
- [ ] Test on mobile device
- [ ] Verify Instagram link works
- [ ] Review all content for accuracy
- [ ] Test navigation between pages

---

## 🎉 Ready to Go!

This folder contains everything you need for a professional IEEE/ACM chapter website. All files are organized and ready to deploy.

**Questions?** Check the documentation in the `/docs` folder or contact s1358017@monmouth.edu

---

*Last updated: 2025-11-07*
*IEEE/ACM Monmouth University Chapter*
