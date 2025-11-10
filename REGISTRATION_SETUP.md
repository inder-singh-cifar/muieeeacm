# Workshop Registration System Setup Guide

## Overview

This system provides:
- ✅ Workshop registration with form validation
- ✅ Automatic email confirmation to registrants
- ✅ Admin dashboard to view all registrations
- ✅ Export registrations to CSV
- ✅ Real-time statistics and filtering

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Install Dependencies

```bash
cd "/Users/Kiumbura/Desktop/Work/IEEE:ACM/IEEE-ACM-Website-Final"
npm install
```

This installs:
- Express (web server)
- Nodemailer (email service)
- CORS (cross-origin requests)

---

### Step 2: Set Up Gmail App Password

To send confirmation emails, you need a Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Generate a new app password:
   - Select **Mail** and **Other (Custom name)**
   - Name it "IEEE/ACM Registration"
   - Copy the 16-character password

---

### Step 3: Configure Email Credentials

**Option A: Using Environment Variables (Recommended)**

Create a `.env` file:

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
PORT=3000
```

Then update `server.js` line 11-12 to use environment variables properly.

**Option B: Direct Edit (Quick)**

Edit `server.js` lines 18-21:

```javascript
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 's1358017@monmouth.edu',  // Your email
        pass: 'xxxx xxxx xxxx xxxx'      // Your 16-char app password
    }
});
```

---

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
✅ Server running on http://localhost:3000
📧 Email service configured
📊 Admin interface: http://localhost:3000/admin.html
```

---

### Step 5: Test the System

1. **Open your website**: http://localhost:3000/ai-workshops.html
2. **Click "Register Now"** on any workshop
3. **Fill out the form** and submit
4. **Check your email** for confirmation
5. **View the registration**: http://localhost:3000/admin.html

---

## 📊 Admin Dashboard

**URL**: `http://localhost:3000/admin.html`

### Features:

**Statistics**
- Total registrations
- Monmouth students count
- Faculty/staff count
- External participants count

**Filters**
- Search by name or email
- Filter by event
- Filter by affiliation

**Export**
- Download all registrations as CSV
- Includes all registration details

**Auto-refresh**
- Dashboard updates every 30 seconds automatically

---

## 📧 Email Confirmation

When someone registers, they receive an email with:

- ✅ Confirmation message
- ✅ Workshop details (title, date, location)
- ✅ Their registration info
- ✅ What to bring
- ✅ Contact information
- ✅ Instagram link

**Email Template**: See `server.js` lines 60-150

---

## 🗄️ Data Storage

Registrations are stored in: `registrations.json`

**Format**:
```json
[
  {
    "id": "1699999999999",
    "eventId": "workshop-1",
    "eventTitle": "Introduction to Machine Learning",
    "eventDate": "November 15, 2025",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@monmouth.edu",
    "phone": "732-555-0123",
    "affiliation": "undergraduate",
    "studentId": "1234567",
    "department": "Computer Science",
    "interests": ["machine-learning", "ai"],
    "registeredAt": "2025-11-10T15:30:00.000Z"
  }
]
```

---

## 🔧 Customization

### Change Email Template

Edit `server.js` lines 60-150 to modify:
- Email subject
- Email styling
- Email content

### Change Server Port

Edit `server.js` line 9:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your preferred port
```

### Add More Event Details

The email automatically includes:
- Event title
- Event date
- Registration details

To add workshop-specific details (time, speaker, etc.), modify the email template.

---

## 🚨 Troubleshooting

### "Authentication failed" Error

**Problem**: Email credentials are incorrect

**Solution**:
1. Double-check your Gmail app password (16 characters)
2. Make sure you're using an app password, not your regular Gmail password
3. Ensure 2-Step Verification is enabled on your Google account

### "ECONNREFUSED" Error

**Problem**: Server is not running

**Solution**:
```bash
npm start
```

### "Port 3000 already in use"

**Problem**: Another application is using port 3000

**Solution**: Change the port in `server.js`:
```javascript
const PORT = 3001; // or any other available port
```

### Emails Not Sending

**Checklist**:
- [ ] Gmail app password is correct
- [ ] 2-Step Verification is enabled
- [ ] Email address is correct
- [ ] Check server console for error messages
- [ ] Try sending a test email from Gmail

### Admin Dashboard Not Loading

**Problem**: Server not running or wrong URL

**Solution**:
1. Make sure server is running: `npm start`
2. Go to: http://localhost:3000/admin.html
3. Check browser console (F12) for errors

---

## 🔒 Security Notes

### For Production Deployment:

1. **Add Authentication to Admin Dashboard**
   - The admin.html currently has no authentication
   - Add password protection before deploying publicly

2. **Use HTTPS**
   - Never send passwords over HTTP in production
   - Use SSL/TLS certificates

3. **Use Environment Variables**
   - Never commit `.env` file to Git
   - Use secure environment variable management

4. **Rate Limiting**
   - Add rate limiting to prevent spam registrations
   - Use packages like `express-rate-limit`

5. **Database**
   - For production, use a proper database (MongoDB, PostgreSQL)
   - Current JSON file storage is fine for development only

---

## 📁 File Structure

```
IEEE-ACM-Website-Final/
├── server.js                    # Backend server
├── package.json                 # Node.js dependencies
├── registrations.json           # Registration data (auto-generated)
├── admin.html                   # Admin dashboard
├── ai-workshops.html            # Workshop page with registration
├── workshop-forms.js            # Registration form logic
└── REGISTRATION_SETUP.md        # This file
```

---

## 🎯 Next Steps

1. ✅ **Test Registration**: Submit a test registration
2. ✅ **Check Email**: Verify confirmation email arrives
3. ✅ **View Dashboard**: Check admin.html to see registration
4. ✅ **Export Data**: Test CSV export functionality
5. ✅ **Customize**: Update email template with your branding

---

## 📞 Support

**Questions or Issues?**
- Check server console for error messages
- Review this guide carefully
- Contact: s1358017@monmouth.edu

---

## 🎉 You're Ready!

Once the server is running and email is configured:

1. Users can register for workshops
2. They receive instant confirmation emails
3. You can view/export all registrations from admin dashboard
4. Everything works automatically!

**Start the server**: `npm start`
**Admin dashboard**: http://localhost:3000/admin.html

---

*Last updated: November 2025*
*IEEE/ACM Monmouth University Chapter*
