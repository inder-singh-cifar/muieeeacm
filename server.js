require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Groq = require('groq-sdk');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Email configuration (using Gmail - you'll need to set up app password)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with your email
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'  // Replace with your app password
    }
});

// Data file for storing registrations
const REGISTRATIONS_FILE = path.join(__dirname, 'registrations.json');

// Initialize registrations file if it doesn't exist
async function initializeRegistrationsFile() {
    try {
        await fs.access(REGISTRATIONS_FILE);
    } catch {
        await fs.writeFile(REGISTRATIONS_FILE, JSON.stringify([]));
    }
}

// Read registrations
async function getRegistrations() {
    try {
        const data = await fs.readFile(REGISTRATIONS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save registration
async function saveRegistration(registration) {
    const registrations = await getRegistrations();
    registration.id = Date.now().toString();
    registration.registeredAt = new Date().toISOString();
    registrations.push(registration);
    await fs.writeFile(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));
    return registration;
}

// Send confirmation email
async function sendConfirmationEmail(registration) {
    // Check if user consented to research
    const isResearchParticipant = registration.researchConsent === 'accepted';

    const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: registration.email,
        subject: `Registration Confirmed: ${registration.eventTitle}${isResearchParticipant ? ' - Research Participant' : ''}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #004C97 0%, #002855 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 30px;
            background: #f9f9f9;
        }
        .workshop-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #E57200;
        }
        .detail-row {
            margin: 10px 0;
        }
        .label {
            font-weight: bold;
            color: #002855;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #E57200;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Registration Confirmed!</h1>
    </div>

    <div class="content">
        <p>Dear ${registration.firstName} ${registration.lastName},</p>

        <p>Thank you for registering for our AI Workshop! We're excited to have you join us.</p>

        <div class="workshop-details">
            <h2 style="color: #002855; margin-top: 0;">Workshop Details</h2>

            <div class="detail-row">
                <span class="label">Event:</span> ${registration.eventTitle}
            </div>

            <div class="detail-row">
                <span class="label">Date:</span> ${registration.eventDate}
            </div>

            <div class="detail-row">
                <span class="label">Affiliation:</span> ${registration.affiliation}
            </div>

            ${registration.studentId ? `
            <div class="detail-row">
                <span class="label">Student ID:</span> ${registration.studentId}
            </div>
            ` : ''}

            ${registration.organization ? `
            <div class="detail-row">
                <span class="label">Organization:</span> ${registration.organization}
            </div>
            ` : ''}
        </div>

        ${isResearchParticipant ? `
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p style="margin: 0;"><strong>✅ Research Participant</strong></p>
            <p style="margin: 10px 0 0 0;">Thank you for consenting to participate in our research study! You may receive a follow-up survey approximately one month after the workshop. Your participation helps us improve our AI training programs.</p>
        </div>
        ` : `
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <p style="margin: 0;"><strong>ℹ️ Research Participation</strong></p>
            <p style="margin: 10px 0 0 0;">You chose not to participate in the research study. Your workshop registration data will not be used for research purposes, but you'll still enjoy the full workshop experience!</p>
        </div>
        `}

        <p><strong>What to bring:</strong></p>
        <ul>
            <li>Your laptop (charged)</li>
            <li>A notebook for taking notes</li>
            <li>Your enthusiasm for learning!</li>
        </ul>

        <p><strong>Location:</strong> Howard Hall, Room 221<br>
        Monmouth University<br>
        West Long Branch, NJ 07764</p>

        <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:s1358017@monmouth.edu">s1358017@monmouth.edu</a></p>

        <center>
            <a href="https://www.instagram.com/monmouth_ieeeacm/" class="button">Follow Us on Instagram</a>
        </center>
    </div>

    <div class="footer">
        <p>IEEE/ACM Monmouth University Student Chapter<br>
        Howard Hall, Room 221 | West Long Branch, NJ 07764<br>
        <a href="mailto:s1358017@monmouth.edu">s1358017@monmouth.edu</a> |
        <a href="https://www.instagram.com/monmouth_ieeeacm/">@monmouth_ieeeacm</a></p>
    </div>
</body>
</html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to:', registration.email);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// Fundraising stats cache (scrape at most every 10 minutes)
let fundraiseCache = { data: null, fetchedAt: 0 };
const FUNDRAISE_URL = 'https://fly.monmouth.edu/project/49605/wall';
const FUNDRAISE_CACHE_MS = 10 * 60 * 1000; // 10 minutes

async function scrapeFundraiseStats() {
    const now = Date.now();
    if (fundraiseCache.data && (now - fundraiseCache.fetchedAt) < FUNDRAISE_CACHE_MS) {
        return fundraiseCache.data;
    }

    try {
        const res = await fetch(FUNDRAISE_URL);
        const html = await res.text();

        // Extract amount raised: look for dollar amount like "$234"
        const raisedMatch = html.match(/\$([0-9,]+)\s*<\/?\w[^>]*>\s*(?:<[^>]*>\s*)*\d+%/s)
            || html.match(/\$([0-9,]+)/);
        const raised = raisedMatch ? parseInt(raisedMatch[1].replace(/,/g, '')) : null;

        // Extract percentage
        const pctMatch = html.match(/(\d+)%/);
        const percent = pctMatch ? parseInt(pctMatch[1]) : null;

        // Extract donors count
        const donorsMatch = html.match(/(\d+)\s*Donor/i);
        const donors = donorsMatch ? parseInt(donorsMatch[1]) : null;

        // Extract goal
        const goalMatch = html.match(/\$([0-9,]+)\s*Goal/i);
        const goal = goalMatch ? parseInt(goalMatch[1].replace(/,/g, '')) : 5000;

        if (raised !== null) {
            fundraiseCache.data = { raised, donors: donors || 0, goal, percent: percent || 0 };
            fundraiseCache.fetchedAt = now;
        }

        return fundraiseCache.data || { raised: 0, donors: 0, goal: 5000, percent: 0 };
    } catch (error) {
        console.error('Fundraise scrape error:', error.message);
        return fundraiseCache.data || { raised: 0, donors: 0, goal: 5000, percent: 0 };
    }
}

// Groq AI client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// API Routes

// AI Chat proxy endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { systemContext, messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Messages array is required'
            });
        }

        if (!process.env.GROQ_API_KEY) {
            console.error('GROQ_API_KEY is not set');
            return res.status(500).json({
                success: false,
                message: 'AI service is not configured'
            });
        }

        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            max_tokens: 500,
            messages: [
                { role: 'system', content: systemContext || '' },
                ...messages
            ]
        });

        const reply = response.choices[0].message.content;
        res.json({ success: true, reply });

    } catch (error) {
        console.error('Groq API error:', error.message);
        res.status(500).json({
            success: false,
            message: 'AI service error. Please try again.'
        });
    }
});

// Live fundraising stats endpoint
app.get('/api/fundraise-stats', async (req, res) => {
    try {
        const stats = await scrapeFundraiseStats();
        res.json({ success: true, ...stats });
    } catch (error) {
        console.error('Fundraise stats error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

// Register for workshop
app.post('/api/register', async (req, res) => {
    try {
        const registration = req.body;

        // Validate required fields
        if (!registration.firstName || !registration.lastName || !registration.email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Save registration
        const savedRegistration = await saveRegistration(registration);

        // Send confirmation email
        await sendConfirmationEmail(savedRegistration);

        res.json({
            success: true,
            message: 'Registration successful! Check your email for confirmation.',
            registrationId: savedRegistration.id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

// Get all registrations (admin only - add authentication in production)
app.get('/api/registrations', async (req, res) => {
    try {
        const registrations = await getRegistrations();
        res.json({ success: true, registrations });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations'
        });
    }
});

// Get registrations by event
app.get('/api/registrations/:eventId', async (req, res) => {
    try {
        const registrations = await getRegistrations();
        const eventRegistrations = registrations.filter(
            reg => reg.eventId === req.params.eventId
        );
        res.json({ success: true, registrations: eventRegistrations });
    } catch (error) {
        console.error('Error fetching event registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event registrations'
        });
    }
});

// Initialize and start server
initializeRegistrationsFile().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📧 Email service configured`);
        console.log(`📊 Admin interface: http://localhost:${PORT}/admin.html`);
    });
});
