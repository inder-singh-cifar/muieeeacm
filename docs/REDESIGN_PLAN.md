# IEEE/ACM Website Redesign Plan
## Integration with AI Workshops & Monmouth Styling

---

## 🎯 Project Overview

**Goal:** Redesign the IEEE/ACM student chapter website to match Monmouth University's official academic department styling (as seen in the CSSE AI Workshops page) while clearly showing that AI Workshops are an IEEE/ACM chapter activity.

---

## 📁 New File Structure

```
IEEE:ACM Webpage/
├── index.html                          (NEW - Redesigned main page)
├── index-old.html                      (BACKUP - Your original page)
├── ai-workshops.html                   (NEW - AI Workshops as IEEE/ACM activity)
├── executive-board.html                (EXISTING - Will update navigation)
│
├── monmouth-ai-workshops-v2.css        (NEW - Monmouth styling)
├── workshop-forms.css                  (NEW - Registration forms)
├── monmouth-ai-workshops-v2.js         (NEW - Interactive features)
├── workshop-forms.js                   (NEW - Form handling)
│
├── styles.css                          (KEEP - For backward compatibility)
├── script.js                           (KEEP - Existing functionality)
├── chatbot.js                          (KEEP - AI Assistant)
│
├── logo_shadow.svg                     (KEEP - IEEE/ACM logo)
├── ieee-logo.jpg                       (KEEP - IEEE logo)
├── acm-logo.png                        (KEEP - ACM logo)
│
└── Documentation files                 (KEEP - All existing docs)
```

---

## 🎨 Design System

### Color Palette:
```
Primary:
- Monmouth Blue: #002855 (Headers, navigation)
- IEEE Blue: #004C97 (Accents, links)
- Monmouth Orange: #E57200 (Call-to-action buttons)

Secondary:
- Monmouth Light Blue: #0d64b2 (Hover states)
- Monmouth Gray: #5B6770 (Body text)
- Light Gray: #f7f7f7 (Backgrounds)
```

### Typography:
```
Headings: 'Crimson Text', Georgia, serif
Body: 'Source Sans 3', -apple-system, sans-serif
```

### Layout:
```
- Maximum width: 1400px
- Sticky header with Monmouth blue background
- Breadcrumb navigation
- Sidebar navigation (on content pages)
- Full-width hero sections with overlays
```

---

## 📄 Page Descriptions

### 1. **index.html** (IEEE/ACM Main Page - REDESIGNED)

**Sections:**
1. **Header**
   - Monmouth University branding
   - Navigation: Home | About | Activities | AI Workshops | Events | Team | Join
   - IEEE/ACM logos integrated

2. **Breadcrumbs**
   ```
   Home > Student Life > Student Organizations > IEEE/ACM Chapter
   ```

3. **Hero Section**
   - Full-width image with overlay
   - Title: "IEEE/ACM Monmouth University Chapter"
   - Subtitle: Professional organization for computer science & engineering students

4. **Main Content** (with sidebar navigation)
   - About the Chapter
   - What is IEEE/ACM
   - Why Join
   - Featured Activities (with AI Workshops highlighted)
   - Upcoming Events
   - Leadership Team
   - Membership Information

5. **Footer**
   - Monmouth University styling
   - Quick links
   - Contact information
   - Social media links

**Key Changes:**
- Academic/professional appearance
- Matches Monmouth departmental pages
- Clear hierarchy and readability
- AI Workshops prominently featured as chapter activity

---

### 2. **ai-workshops.html** (AI Workshops Sub-page - NEW)

**Sections:**
1. **Header** (Same as main page)

2. **Breadcrumbs**
   ```
   Home > Student Life > IEEE/ACM Chapter > AI Workshops & Research
   ```

3. **Hero Section**
   - Title: "AI Workshops & Research"
   - Subtitle: "An IEEE/ACM Chapter Initiative"
   - Note: Clearly shows this is part of IEEE/ACM

4. **Main Content** (with sidebar navigation)
   - About AI Workshops
   - Research Areas
   - Active Projects
   - Workshops & Seminars (with registration)
   - Research Team
   - Resources
   - Contact Information

5. **Event Cards** (Interactive)
   - Featured upcoming workshops
   - Date, time, location
   - Speaker information
   - "Register Now" buttons → Registration modal

6. **Registration Modal**
   - Personal Information
   - Affiliation (Student/Faculty/External)
   - Student ID for Monmouth students
   - Interests & Preferences
   - Dietary restrictions
   - Accessibility needs
   - Form validation & submission

**Key Features:**
- Professional event management system
- Easy registration process
- Clear IEEE/ACM branding
- Integration with main chapter site

---

### 3. **Navigation Structure**

```
IEEE/ACM Main Site (index.html)
│
├── About
│   └── What is IEEE/ACM
│   └── Chapter History
│   └── Mission & Vision
│
├── Activities
│   ├── AI Workshops & Research ← Links to ai-workshops.html
│   ├── Technical Workshops
│   ├── Guest Speakers
│   ├── Hackathons
│   └── Research Projects
│
├── AI Workshops (ai-workshops.html)
│   ├── About AI Lab
│   ├── Research Areas
│   ├── Active Projects
│   ├── Workshops & Seminars
│   ├── Research Team
│   └── Resources
│
├── Events
│   └── Calendar
│   └── Past Events
│
├── Team
│   ├── Executive Board → executive-board.html
│   └── Faculty Advisors
│
└── Join
    └── Membership Form
    └── Benefits
    └── Contact
```

---

## 🔗 Integration Points

### How AI Workshops Connects to IEEE/ACM:

1. **Main Page Highlight:**
   ```html
   <section id="featured-activities">
       <h2>Featured Chapter Activities</h2>
       <div class="activity-card featured">
           <h3>AI Workshops & Research</h3>
           <p>Join our cutting-edge AI research initiative...</p>
           <a href="ai-workshops.html" class="btn-primary">Explore AI Workshops</a>
       </div>
   </section>
   ```

2. **Navigation Link:**
   - Top nav includes "AI Workshops" as prominent link
   - Sidebar nav on all pages includes AI Workshops

3. **Breadcrumbs Show Hierarchy:**
   - Clearly shows AI Workshops is under IEEE/ACM

4. **Consistent Branding:**
   - IEEE/ACM logos on all pages
   - Unified color scheme
   - Same header/footer across all pages

5. **Cross-linking:**
   - AI Workshops page has "Back to IEEE/ACM Main" button
   - Main page has "View All AI Workshops" link
   - Event listings show IEEE/ACM sponsorship

---

## 🎯 Key Features

### Main Page (index.html):
✅ Monmouth University academic styling
✅ Professional navigation & breadcrumbs
✅ Hero section with IEEE/ACM focus
✅ Sidebar navigation
✅ Activities grid (highlighting AI Workshops)
✅ Event listings
✅ Team showcase
✅ Membership information
✅ AI Assistant chatbot (existing)
✅ Mobile responsive

### AI Workshops Page (ai-workshops.html):
✅ Clear IEEE/ACM chapter branding
✅ Workshop/event listings
✅ Registration system with modal forms
✅ Research areas & projects
✅ Team profiles
✅ Resources & links
✅ Contact information
✅ Toast notifications for form submission
✅ Mobile responsive

---

## 📱 Responsive Design

### Desktop (> 1024px):
- Full sidebar navigation
- Multi-column layouts
- Large hero images
- Expanded event cards

### Tablet (768px - 1024px):
- Collapsible sidebar
- 2-column layouts
- Adjusted typography
- Touch-friendly buttons

### Mobile (< 768px):
- Hamburger menu
- Single-column stacked layout
- Mobile-optimized forms
- Larger tap targets

---

## 🚀 Interactive Features

### Registration System:
1. Click "Register Now" on any workshop
2. Modal opens with pre-filled event details
3. Form with validation:
   - Required fields marked with *
   - Student ID validation (7 digits)
   - Email format validation
   - Phone number formatting
4. Student-specific fields (conditional)
5. Success/error toast messages
6. Form submission handling

### AI Assistant:
- Existing chatbot remains functional
- Available on all pages
- Can answer questions about both:
  - IEEE/ACM chapter activities
  - AI Workshops & events

### Navigation:
- Sticky header
- Smooth scrolling
- Active page highlighting
- Mobile toggle menu

---

## 📊 Content Strategy

### Main Page Messaging:
```
"IEEE/ACM at Monmouth University"
↓
"Professional development for CS & Engineering students"
↓
"Workshops • Research • Networking • Career Development"
↓
"Featured: AI Workshops & Research Initiative"
```

### AI Workshops Messaging:
```
"AI Workshops & Research"
↓
"An IEEE/ACM Chapter Initiative"
↓
"Cutting-edge AI research and hands-on workshops"
↓
"Open to all Monmouth students"
```

---

## ✅ Implementation Checklist

### Phase 1: Setup
- [x] Copy CSS files (monmouth-ai-workshops-v2.css, workshop-forms.css)
- [x] Copy JS files (monmouth-ai-workshops-v2.js, workshop-forms.js)
- [ ] Backup original index.html
- [ ] Create REDESIGN_PLAN.md (this file)

### Phase 2: Main Page
- [ ] Create new index.html with Monmouth styling
- [ ] Add header with navigation
- [ ] Add breadcrumbs
- [ ] Create hero section
- [ ] Build main content with sidebar
- [ ] Highlight AI Workshops in activities
- [ ] Add events section
- [ ] Include team section
- [ ] Create footer

### Phase 3: AI Workshops Page
- [ ] Create ai-workshops.html
- [ ] Add IEEE/ACM branding
- [ ] Include breadcrumb showing it's under IEEE/ACM
- [ ] Add workshop/event listings
- [ ] Implement registration modal
- [ ] Add research sections
- [ ] Include team profiles
- [ ] Test registration forms

### Phase 4: Integration
- [ ] Link pages together via navigation
- [ ] Ensure consistent header/footer
- [ ] Cross-link between pages
- [ ] Update executive-board.html navigation
- [ ] Test all navigation flows

### Phase 5: Testing
- [ ] Test on desktop (Chrome, Firefox, Safari)
- [ ] Test on tablet (iPad, Android)
- [ ] Test on mobile (iPhone, Android)
- [ ] Test all forms and modals
- [ ] Test AI Assistant on all pages
- [ ] Validate all links
- [ ] Check responsive breakpoints

### Phase 6: Deployment
- [ ] Review all content
- [ ] Final testing
- [ ] Backup old site
- [ ] Deploy new site
- [ ] Update GitHub
- [ ] Announce to members

---

## 🎨 Visual Comparison

### Before (Current):
```
Bootstrap-based design
Bright blue (#004C97) primary color
Card-based layout
Generic student org appearance
AI Workshops not integrated
```

### After (Redesigned):
```
Monmouth academic department styling
Deep blue (#002855) primary with IEEE blue accents
Sidebar + content layout
Professional university page appearance
AI Workshops prominently integrated as chapter activity
```

---

## 💡 Benefits of This Redesign

### For Students:
✅ More professional appearance
✅ Easier to find AI Workshops
✅ Clear activity registration
✅ Better mobile experience
✅ Clearer chapter structure

### For IEEE/ACM:
✅ Official university department appearance
✅ Showcases AI Workshops initiative
✅ Better recruitment tool
✅ Matches university branding
✅ More credible to external visitors

### For University:
✅ Consistent with other department pages
✅ Shows active student research
✅ Professional representation
✅ Easy to link from official pages

---

## 📞 Next Steps

1. **Review this plan** - Make sure this matches your vision
2. **Approve changes** - Confirm you want to proceed
3. **Implementation** - I'll create all the files
4. **Testing** - Test locally before deploying
5. **Deployment** - Push to GitHub/hosting

---

## ❓ Questions to Confirm

Before I create all the files, please confirm:

1. ✅ Use Monmouth blue (#002855) as primary color?
2. ✅ Show AI Workshops as IEEE/ACM activity?
3. ✅ Include registration system for workshops?
4. ✅ Keep AI Assistant chatbot?
5. ✅ Backup original files as index-old.html?
6. ✅ Use breadcrumbs showing hierarchy?
7. ✅ Sidebar navigation on content pages?

---

**Ready to proceed with creating all files?**

Let me know and I'll generate:
- index.html (redesigned main page)
- ai-workshops.html (workshops sub-page)
- Updated navigation across all pages

---

*Created: 2025-11-07*
*For: IEEE/ACM Monmouth University Chapter*
