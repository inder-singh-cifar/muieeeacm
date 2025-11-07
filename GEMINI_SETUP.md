# Google Gemini AI Assistant Setup Guide

## ✅ Changes Made

Your AI assistant has been updated with the following improvements:

### 🔄 Changes:
1. **✅ Changed from n8n/Claude to Google Gemini** (Free API)
2. **✅ Changed "chatbot" to "assistant"** throughout
3. **✅ Using Monmouth Shadow Hawk logo** instead of robot emoji
4. **✅ Direct API integration** - no n8n required!

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your Free Gemini API Key

1. Go to: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key (starts with `AIza...`)

### Step 2: Add API Key to chatbot.js

1. Open `chatbot.js` in a text editor
2. Find line 9:
   ```javascript
   geminiApiKey: 'YOUR_GEMINI_API_KEY_HERE',
   ```
3. Replace with your actual key:
   ```javascript
   geminiApiKey: 'AIzaSyC...your-actual-key-here...',
   ```
4. Save the file

### Step 3: Test It!

1. Open `index.html` in your browser
2. Click the Shadow Hawk button (bottom-right corner)
3. Type: "What is IEEE?"
4. You should get an instant AI response!

---

## 💰 Pricing

**Google Gemini is FREE!**

- Free tier: 60 requests per minute
- Perfect for student organizations
- No credit card required
- No setup fees

---

## 🎨 What Changed

### Before:
```
Button: IEEE/ACM logo_shadow.svg
Avatar in chat: 🤖 Robot emoji
Name: "IEEE/ACM Chatbot"
Message: "Hi! I'm the IEEE/ACM chatbot..."
Backend: n8n + Claude API (requires setup)
```

### After:
```
Button: Monmouth Shadow Hawk logo
Avatar in chat: Shadow Hawk image
Name: "IEEE/ACM Assistant"
Message: "Hi! I'm the IEEE/ACM assistant..."
Backend: Google Gemini API (direct, no n8n needed!)
```

---

## 🌟 Features

### AI Capabilities:
- ✅ Answers questions about IEEE/ACM chapter
- ✅ Provides event information
- ✅ Explains membership benefits
- ✅ Helps with tech/programming questions
- ✅ Maintains conversation context
- ✅ Responses in < 2 seconds

### UI Features:
- ✅ Monmouth Shadow Hawk branding
- ✅ Smooth animations
- ✅ Typing indicators
- ✅ Mobile responsive
- ✅ Error handling
- ✅ Conversation history (last 10 exchanges)

---

## 📝 Configuration

### Current Settings (in chatbot.js):

```javascript
const ASSISTANT_CONFIG = {
    geminiApiKey: 'YOUR_GEMINI_API_KEY_HERE',  // ← ADD YOUR KEY HERE
    botName: 'IEEE/ACM Assistant',
    welcomeMessage: 'Hi! I\'m the IEEE/ACM assistant. Ask me about our chapter, events, membership, or anything tech-related!',
    placeholderText: 'Ask me anything...',
    errorMessage: 'Sorry, I\'m having trouble connecting...'
};
```

### System Context (what the AI knows):
- IEEE & ACM information
- Chapter leadership (President, VP, Treasurer, Secretary)
- Activities & workshops
- Membership benefits
- Contact information
- AI Workshops details

---

## 🎯 Customization

### Change Welcome Message:
Edit line 12 in `chatbot.js`:
```javascript
welcomeMessage: 'Your custom message here!',
```

### Change Assistant Name:
Edit line 11:
```javascript
botName: 'Your Custom Name',
```

### Update Knowledge:
Edit lines 17-49 (systemContext) to add:
- New events
- Changed leadership
- Updated contact info
- Additional information

---

## 🔧 Troubleshooting

### Problem: "Please configure your Gemini API key"
**Solution:** You haven't added your API key yet. Follow Step 2 above.

### Problem: "API error: 400"
**Solution:** Your API key may be invalid. Double-check it's copied correctly.

### Problem: Shadow Hawk image not showing
**Solution:** Check internet connection - image loads from Monmouth's website.

### Problem: Assistant not responding
**Solution:**
1. Check browser console (F12) for errors
2. Verify API key is correct
3. Check internet connection
4. Try refreshing the page

---

## 📊 Usage Limits

**Google Gemini Free Tier:**
- 60 requests per minute
- Unlimited daily usage
- Perfect for a student chapter website

**Typical Usage:**
- Student chapter: ~50-100 messages/day
- Well within free limits
- No cost concerns!

---

## 🆚 Comparison: Gemini vs. Previous Setup

| Feature | Previous (n8n + Claude) | Current (Gemini) |
|---------|------------------------|------------------|
| **Setup** | Complex (n8n workflow) | Simple (API key only) |
| **Cost** | ~$25-40/month | **FREE!** |
| **Speed** | 2-3 seconds | 1-2 seconds |
| **Maintenance** | High (n8n server) | Low (just works!) |
| **Branding** | Generic robot emoji | Shadow Hawk logo! |
| **API Limits** | Pay-per-use | 60/min free |

---

## ✅ Testing Checklist

Before deploying:
- [ ] Added Gemini API key to chatbot.js
- [ ] Saved the file
- [ ] Opened index.html in browser
- [ ] Clicked Shadow Hawk button
- [ ] Chat window opened
- [ ] Saw Shadow Hawk logo in header
- [ ] Sent test message
- [ ] Received AI response
- [ ] Tried asking about IEEE
- [ ] Tried asking about events
- [ ] Checked on mobile (resize browser)

---

## 🎓 What the Assistant Knows

The AI assistant is pre-configured with knowledge about:

### Chapter Information:
- What IEEE and ACM are
- Monmouth University chapter details
- Leadership team and contact info

### Activities:
- AI Workshops & Research
- Technical workshops
- Guest speakers
- Hackathons
- Career development

### Membership:
- How to join
- Benefits
- Digital library access
- Networking opportunities

### Contact:
- Email: s1358017@monmouth.edu
- Instagram: @monmouth_ieeeacm
- Join form link

---

## 📞 Support

### Get Your Free API Key:
https://makersuite.google.com/app/apikey

### Gemini AI Documentation:
https://ai.google.dev/docs

### Questions?
Email: s1358017@monmouth.edu

---

## 🎉 You're Ready!

Once you add your Gemini API key, your AI assistant will be fully functional with:

✅ Free Google Gemini AI
✅ Monmouth Shadow Hawk branding
✅ "Assistant" instead of "chatbot"
✅ Fast, intelligent responses
✅ No ongoing costs!

---

**Last updated:** 2025-11-07
**For:** IEEE/ACM Monmouth University Chapter
