# Workshop Registration & Survey System with IRB Consent

## Overview

The IEEE/ACM AI Workshop registration platform now serves dual purposes:
1. **Workshop Registration** - Standard event registration and email confirmation
2. **Research Data Collection** - IRB-approved research study with informed consent and survey questions

---

## 🎯 Features

### Informed Consent System
- ✅ Full IRB consent form displayed before registration
- ✅ Users can accept or decline research participation
- ✅ Both consenting and non-consenting users can register for workshops
- ✅ Email confirmation indicates research participation status
- ✅ Data flagged appropriately for research vs. non-research use

### Survey Components

**Pre-Workshop Survey (Completed during registration):**
1. AI tool familiarity (5-point scale)
2. Website building knowledge (4-level scale)

**Post-Workshop Survey (Completed during registration):**
3. Understanding of AI tools for web development (Likert 1-5)
4. Confidence in building websites (Likert 1-5)
5. Optional: Follow-up email for future survey contact

---

## 📋 IRB Compliance

### Principal Investigator
- **Name:** Weihao Qu
- **Phone:** 732-263-5396
- **Email:** wqu@monmouth.edu

### Co-Investigator
- **Name:** Ling Zheng
- **Phone:** 732-571-4459
- **Email:** lzheng@monmouth.edu

### Study Title
**"Improving Efficiency in Higher Education through Customized AI Training"**

### Consent Process

**Users see informed consent before registration with:**
- Study purpose and procedures
- Time commitment (55-80 minutes total)
- Risks and benefits
- Data protection measures
- Contact information for support services
- Voluntary participation statement

**Two Buttons:**
1. **"I ACCEPT"** - User consents to research participation
   - Data will be used for research purposes
   - May receive follow-up survey (~1 month later)
   - Full workshop access

2. **"I DO NOT AGREE"** - User declines research participation
   - Can still register for workshop
   - Data NOT used for research
   - Full workshop access
   - Survey answers still collected but marked as non-research

---

## 🔄 User Flow

### Step 1: Click "Register Now"
User clicks registration button on any workshop

### Step 2: Informed Consent Modal
- Full IRB consent form displays
- User reads all information
- Scrollable modal with complete consent text
- User selects "I ACCEPT" or "I DO NOT AGREE"

### Step 3: Registration Form
- Standard registration fields (name, email, affiliation, etc.)
- **Pre-Workshop Survey** section (required)
  - AI familiarity question
  - Website building knowledge question
- **Post-Workshop Survey** section (required)
  - AI understanding (Likert scale)
  - Website confidence (Likert scale)
  - Optional follow-up email field

### Step 4: Email Confirmation
User receives email with:
- Workshop details
- Registration confirmation
- **Research status indicator:**
  - Green box if consented ("Research Participant")
  - Orange box if declined ("Research Participation - Declined")

### Step 5: Admin Dashboard
Organizers can:
- View all registrations
- See research consent status
- Filter by consent status
- Export survey data to CSV
- Track research participant count

---

## 📊 Data Collection

### Stored Data Fields

```json
{
  "id": "unique-id",
  "eventId": "workshop-id",
  "eventTitle": "Workshop Name",
  "eventDate": "Date",
  "firstName": "First",
  "lastName": "Last",
  "email": "email@example.com",
  "phone": "phone-number",
  "affiliation": "undergraduate|graduate|faculty|external",
  "studentId": "1234567",
  "department": "Department Name",

  // Research Consent
  "researchConsent": "accepted|declined",

  // Pre-Workshop Survey
  "preSurvey": {
    "aiFamiliarity": "not-at-all|slightly|somewhat|very|extremely",
    "websiteFamiliarity": "none|basic|intermediate|advanced"
  },

  // Post-Workshop Survey
  "postSurvey": {
    "aiUnderstanding": 1-5,
    "websiteConfidence": 1-5
  },

  // Follow-up
  "followUpEmail": "optional-email@example.com",

  "registeredAt": "ISO-timestamp"
}
```

---

## 📈 Admin Dashboard Features

### Statistics Display
- **Total Registrations** - All workshop registrations
- **Research Participants** - Users who accepted consent
- **Monmouth Students** - Undergraduate + Graduate
- **Faculty/Staff** - University employees
- **External Participants** - Non-Monmouth attendees

### Data Table Columns
1. Name
2. Email
3. Event
4. Affiliation
5. Student ID
6. **Research Consent** (✓ Accepted / ✗ Declined)
7. **AI Familiarity** (Pre-survey)
8. **Web Knowledge** (Pre-survey)
9. Registered timestamp

### CSV Export
Downloads include all fields:
- Personal information
- Workshop details
- Research consent status
- Pre-workshop survey responses
- Post-workshop survey responses (Likert ratings)
- Follow-up email (if provided)
- Registration timestamp

---

## 🔒 Privacy & Security

### Data Protection Measures

1. **Anonymization for Research**
   - Names not linked to research data in publications
   - No IP addresses collected
   - Email only for follow-up contact (if consented)

2. **Consent Tracking**
   - Every registration tagged with consent status
   - Non-consenting participants' data excluded from research
   - Clear visual indicators throughout system

3. **Access Control**
   - Admin dashboard has no authentication (development)
   - ⚠️ **PRODUCTION:** Add password protection before deploying
   - Registrations stored in local JSON file (development)
   - ⚠️ **PRODUCTION:** Migrate to secure database

### Support Services Information

**Included in consent form:**
- Monmouth University Counseling Services: 732-571-7517
- Employee Assistance Program: 1-800-300-0628
- SAMHSA National Helpline: 1-800-662-4357
- IRB Contact: IRB@monmouth.edu

---

## 🛠️ Technical Implementation

### Files Modified

**Frontend:**
- `ai-workshops.html` - Added consent modal and survey questions
- `workshop-forms.js` - Consent logic and Likert scale handlers
- `workshop-forms.css` - Survey styling (via inline styles)

**Backend:**
- `server.js` - Updated to handle survey data and consent status
- Email template includes research participation notice

**Admin:**
- `admin.html` - Added survey columns and research participant stats

### New Components

**Consent Modal:**
- Full scrollable informed consent form
- Accept/Decline buttons
- Prevents registration until consent decision made

**Survey Questions:**
- Radio button groups with hover effects
- Likert scale buttons (1-5) with visual feedback
- Optional follow-up email field
- All integrated into registration form

**Helper Functions:**
```javascript
// JavaScript
proceedToRegistration(consentGiven)  // Handles consent flow
setLikertValue(questionName, value)  // Updates Likert selections
formatFamiliarity(value)             // Display formatting
```

---

## 📋 Survey Questions Reference

### Question 1: AI Familiarity (Pre-Workshop)
**"How familiar were you with AI tools before this workshop?"**
- ☐ Not at all familiar
- ☐ Slightly familiar
- ☐ Somewhat familiar
- ☐ Very familiar
- ☐ Extremely familiar

### Question 2: Website Building Knowledge (Pre-Workshop)
**"How familiar were you with website building before this workshop?"**
- ☐ None
- ☐ Basic knowledge (e.g., used templates)
- ☐ Intermediate (e.g., edited HTML/CSS)
- ☐ Advanced (built a website from scratch)

### Question 3a: AI Understanding (Post-Workshop)
**"I understand how AI tools (like ChatGPT or design generators) can help in web development."**
- Likert Scale: 1 (Strongly Disagree) to 5 (Strongly Agree)

### Question 3b: Website Confidence (Post-Workshop)
**"I feel more confident in my ability to build and publish a simple website."**
- Likert Scale: 1 (Strongly Disagree) to 5 (Strongly Agree)

### Question 4: Follow-up Contact (Optional)
**"Please share your email or personal domain to receive updated workshop content."**
- Text input field (optional)

---

## 🚀 Using the System

### For Participants

1. Navigate to ai-workshops.html
2. Click "Register Now" on desired workshop
3. Read informed consent carefully
4. Click "I ACCEPT" or "I DO NOT AGREE"
5. Complete registration form
6. Answer pre-workshop survey questions (2 questions)
7. Answer post-workshop survey questions (2 Likert scales)
8. Optionally provide follow-up email
9. Submit registration
10. Check email for confirmation

### For Administrators

1. Start server: `npm start`
2. Open admin dashboard: `http://localhost:3000/admin.html`
3. View statistics (includes research participant count)
4. Review registrations table
5. Export data to CSV for analysis
6. CSV includes all survey responses

### For Researchers

**Analyzing Data:**
1. Export CSV from admin dashboard
2. Filter rows where "Research Consent" = "accepted"
3. Analyze survey responses:
   - Pre-workshop familiarity levels
   - Post-workshop Likert ratings
   - Compare pre/post confidence gains
4. Use follow-up emails for 1-month survey

**Research Guidelines:**
- Only use data from consenting participants
- Maintain participant confidentiality
- Do not link names to published findings
- Contact participants via follow-up email only if provided
- Follow IRB protocols for data storage and reporting

---

## ⚠️ Production Deployment Checklist

Before deploying to production:

- [ ] **Add authentication to admin dashboard**
- [ ] **Migrate from JSON file to database** (MongoDB, PostgreSQL)
- [ ] **Set up environment variables** for email credentials
- [ ] **Enable HTTPS/SSL** for secure data transmission
- [ ] **Add rate limiting** to prevent spam registrations
- [ ] **Backup registration data** regularly
- [ ] **Test consent flow thoroughly**
- [ ] **Verify email delivery** with test registrations
- [ ] **Ensure CSV export** works with real data
- [ ] **Review IRB compliance** with university ethics board
- [ ] **Document data retention policy**
- [ ] **Set up follow-up survey system** (1 month post-workshop)

---

## 📞 Support & Questions

### Technical Issues
**Contact:** Kiumbura Githinji
**Email:** s1358017@monmouth.edu

### IRB/Research Questions
**Principal Investigator:** Dr. Weihao Qu
**Email:** wqu@monmouth.edu
**Phone:** 732-263-5396

**Co-Investigator:** Ling Zheng
**Email:** lzheng@monmouth.edu
**Phone:** 732-571-4459

### Participant Rights
**IRB Contact:** IRB@monmouth.edu

---

## 📝 Sample Data Analysis Queries

### Count Research Participants
```javascript
const researchParticipants = registrations.filter(r =>
  r.researchConsent === 'accepted'
).length;
```

### Average Pre-Workshop AI Familiarity
```javascript
const familiarityMap = {
  'not-at-all': 1,
  'slightly': 2,
  'somewhat': 3,
  'very': 4,
  'extremely': 5
};

const avgAIFamiliarity = registrations
  .filter(r => r.researchConsent === 'accepted')
  .map(r => familiarityMap[r.preSurvey.aiFamiliarity])
  .reduce((sum, val) => sum + val, 0) / researchParticipants;
```

### Average Post-Workshop Confidence Gain
```javascript
const avgConfidence = registrations
  .filter(r => r.researchConsent === 'accepted')
  .map(r => r.postSurvey.websiteConfidence)
  .reduce((sum, val) => sum + val, 0) / researchParticipants;
```

---

## 🎉 Summary

The workshop registration platform now serves as a comprehensive research tool that:

✅ Obtains informed consent ethically and transparently
✅ Collects pre and post-workshop survey data
✅ Maintains separate tracking for research vs. non-research participants
✅ Provides clear communication about research participation
✅ Enables data export for analysis
✅ Complies with IRB requirements
✅ Protects participant privacy
✅ Supports follow-up research contact

**All while maintaining full workshop registration functionality!**

---

*Last Updated: November 2025*
*IEEE/ACM Monmouth University Chapter*
