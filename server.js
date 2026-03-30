require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Groq = require('groq-sdk');
const fs = require('fs').promises;
const path = require('path');

// New deps

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

// Data file for storing registrations (legacy fallback)
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

// Save registration (legacy file)
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
        html: `...` // truncated for brevity (left unchanged)
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
let groq = null;
if (process.env.GROQ_API_KEY) { groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); }

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

// Get all registrations (admin only)
app.get('/api/registrations', requireAdmin, async (req, res) => {
    try {
        // If Postgres is configured, prefer to read from DB
        if (pool) {
            const { rows } = await pool.query('SELECT id, payload, created_at FROM public.registrations ORDER BY created_at DESC');
            return res.json({ success: true, registrations: rows });
        }

        const registrations = await getRegistrations();
        return res.json({ success: true, registrations });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations'
        });
    }
});

// Get registrations by event
app.get('/api/registrations/:eventId', requireAdmin, async (req, res) => {
    try {
        if (pool) {
            const { rows } = await pool.query('SELECT id, payload, created_at FROM public.registrations WHERE payload->>\'eventId\' = $1 ORDER BY created_at DESC', [req.params.eventId]);
            return res.json({ success: true, registrations: rows });
        }

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
initializeRegistrationsFile().then(async () => {
    app.listen(PORT, () => {
        console.log(`\u2705 Server running on http://localhost:${PORT}`);
        console.log(`\ud83d\udce7 Email service configured`);
        console.log(`\ud83d\udcca Admin interface: http://localhost:${PORT}/admin.html`);
        if (pool) console.log('Admin auth endpoints available (POST /auth/login, POST /auth/init-admin)');
    });
});
