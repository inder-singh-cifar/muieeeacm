# Testing the AI Site Lab Registration System

## ✅ System Status

Your registration system is **fully configured** and ready to use! Here's what's already set up:

### Components in Place:
1. ✅ **Registration Button** - "Register Now" on ai-workshops.html (line 514)
2. ✅ **Event Details** - AI Site Lab workshop with all correct information
3. ✅ **Registration Form** - With informed consent and survey questions
4. ✅ **Backend Server** - server.js ready to receive registrations
5. ✅ **Admin Dashboard** - admin.html to view registrations
6. ✅ **Email System** - Configured to send confirmations

---

## 🚀 How to Start the System

### Step 1: Start the Server

Open Terminal and run:

```bash
cd "/Users/Kiumbura/Desktop/Work/IEEE:ACM/IEEE-ACM-Website-Final"
npm start
```

You should see:
```
✅ Server running on http://localhost:3000
📧 Email service configured
📊 Admin interface: http://localhost:3000/admin.html
```

---

## 🧪 Testing the Registration Flow

### Step 2: Test Registration

1. **Open the workshop page:**
   - Go to: `http://localhost:3000/ai-workshops.html`
   - Scroll to "Upcoming Event" section
   - You'll see: **AI Site Lab: Your Portfolio Your Way**

2. **Click "Register Now"**
   - This triggers: `openRegistrationModal('event-ai-site-lab', 'AI Site Lab: Your Portfolio Your Way', 'November 13, 2025, 1:15 PM - 2:30 PM')`

3. **Informed Consent Modal appears:**
   - Full IRB consent form displays
   - Read the research study information
   - Click either:
     - **"I ACCEPT"** - Consent to research participation
     - **"I DO NOT AGREE"** - Register without research participation

4. **Registration Form opens:**
   - Fill in personal information:
     - First Name, Last Name
     - Email (IMPORTANT: Use a real email to test confirmation)
     - Phone Number
     - Affiliation (Student/Faculty/etc.)

   - **Pre-Workshop Survey** (Required):
     - Q1: AI tool familiarity (5 options)
     - Q2: Website building knowledge (4 options)

   - **Post-Workshop Survey** (Required):
     - Q3: AI understanding (Likert 1-5)
     - Q4: Website confidence (Likert 1-5)
     - Q5: Follow-up email (optional)

5. **Submit Registration:**
   - Click "Complete Registration"
   - System will:
     - Save to `registrations.json`
     - Send confirmation email
     - Show success message

---

## 📊 Viewing Registrations

### Step 3: Check Admin Dashboard

1. **Open admin panel:**
   ```
   http://localhost:3000/admin.html
   ```

2. **You'll see:**
   - **Statistics:**
     - Total Registrations
     - Research Participants (who clicked "I ACCEPT")
     - Student/Faculty/External counts

   - **Registration Table:**
     - Name, Email, Event
     - Affiliation, Student ID
     - **Research Consent** (✓ Accepted / ✗ Declined)
     - **AI Familiarity** (from pre-survey)
     - **Web Knowledge** (from pre-survey)
     - Registration timestamp

3. **Export Data:**
   - Click "Export to CSV"
   - Downloads: `workshop-registrations-YYYY-MM-DD.csv`
   - Includes all survey responses

---

## 📧 Email Confirmation

When someone registers, they receive an email with:

### Email Contents:
- **Subject:** Registration Confirmed: AI Site Lab: Your Portfolio Your Way
- **Body includes:**
  - Workshop details (date, time, location)
  - Speaker: Kiumbura Githinji
  - Research participation status (green or orange box)
  - What to bring
  - Contact information

### Email Configuration:
⚠️ **Before emails work, you need to configure Gmail:**

Edit `server.js` lines 19-20:
```javascript
user: 'your-email@gmail.com',  // Your Gmail
pass: 'your-app-password'      // 16-char app password
```

See `REGISTRATION_SETUP.md` for detailed email setup instructions.

---

## 🔍 Registration Data Structure

Each registration saves this information:

```json
{
  "id": "1731267890123",
  "eventId": "event-ai-site-lab",
  "eventTitle": "AI Site Lab: Your Portfolio Your Way",
  "eventDate": "November 13, 2025, 1:15 PM - 2:30 PM",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@monmouth.edu",
  "phone": "732-555-0123",
  "affiliation": "undergraduate",
  "studentId": "1234567",
  "department": "Computer Science",

  "researchConsent": "accepted",

  "preSurvey": {
    "aiFamiliarity": "somewhat",
    "websiteFamiliarity": "basic"
  },

  "postSurvey": {
    "aiUnderstanding": 4,
    "websiteConfidence": 5
  },

  "followUpEmail": "john.doe@example.com",
  "registeredAt": "2025-11-10T20:30:00.000Z"
}
```

---

## ✅ Verification Checklist

Test these items to ensure everything works:

- [ ] Server starts without errors (`npm start`)
- [ ] Workshop page loads (http://localhost:3000/ai-workshops.html)
- [ ] "Register Now" button opens consent modal
- [ ] Can accept or decline consent
- [ ] Registration form appears after consent decision
- [ ] Survey questions are visible and required
- [ ] Likert scale buttons work (click changes color)
- [ ] Form submits successfully
- [ ] Success message appears
- [ ] Registration appears in admin dashboard
- [ ] Consent status shows correctly in dashboard
- [ ] Survey responses display in table
- [ ] CSV export works
- [ ] Email confirmation sent (if configured)

---

## 🎯 Quick Test Script

Here's a quick test you can run:

1. **Terminal 1 - Start Server:**
   ```bash
   cd "/Users/Kiumbura/Desktop/Work/IEEE:ACM/IEEE-ACM-Website-Final"
   npm start
   ```

2. **Browser - Test Registration:**
   - Go to: http://localhost:3000/ai-workshops.html
   - Click "Register Now" on AI Site Lab event
   - Click "I ACCEPT" on consent form
   - Fill in form:
     - Name: Test User
     - Email: your-test-email@gmail.com
     - Affiliation: Undergraduate Student
     - Student ID: 1234567
     - Department: Computer Science
   - Select AI familiarity: "Somewhat familiar"
   - Select Web knowledge: "Basic knowledge"
   - Click Likert button 4 for AI understanding
   - Click Likert button 5 for website confidence
   - Submit

3. **Browser - Check Dashboard:**
   - Go to: http://localhost:3000/admin.html
   - Should see 1 registration
   - Research Participants: 1
   - Export CSV and verify data

---

## 🐛 Troubleshooting

### "Server not running" error
**Solution:** Make sure you ran `npm start` in Terminal

### Registration doesn't appear in dashboard
**Solution:**
1. Check browser console (F12) for errors
2. Verify server is running
3. Refresh admin dashboard

### Email not sending
**Solution:**
1. Configure Gmail app password in server.js
2. See REGISTRATION_SETUP.md for detailed steps

### Form won't submit
**Solution:**
1. Make sure all required fields are filled
2. Both Likert scales must be clicked
3. Check browser console for validation errors

---

## 📞 Support

If you encounter issues:
1. Check server console for error messages
2. Check browser console (F12 → Console tab)
3. Review REGISTRATION_SETUP.md
4. Review SURVEY_SYSTEM_GUIDE.md

---

## 🎉 Success!

If all tests pass, your registration system is ready for the workshop!

**Next Steps:**
1. Configure email settings for confirmations
2. Share the registration link with participants
3. Monitor registrations via admin dashboard
4. Export data for research analysis

**Registration URL:**
`http://localhost:3000/ai-workshops.html#seminars`

---

*Last Updated: November 10, 2025*
*IEEE/ACM Monmouth University Chapter*
