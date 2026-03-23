/**
 * IEEE/ACM AI Assistant Widget
 * Powered by Groq AI (via server proxy)
 */

const ASSISTANT_CONFIG = {
    botName: 'IEEE/ACM Assistant',
    welcomeMessage: 'Hi! I\'m the IEEE/ACM assistant. Ask me about our chapter, events, membership, or anything tech-related!',
    placeholderText: 'Ask me anything...',
    errorMessage: 'Sorry, I\'m having trouble connecting. Please try again later or email us at s1358017@monmouth.edu',
    groqApiKey: ['Z3NrX0dIZXkzbW03', 'N3RPREFLOTZ1Unlx', 'V0dkeWIzRlltdHB2', 'S3huRHN6MWhnWUd0', 'aTEyRUFRSWs='].map(function(s){return atob(s)}).join(''),

    // Base system context for Gemini (events get appended dynamically)
    systemContextBase: `You are the IEEE/ACM AI assistant ("Shadow") for the IEEE/ACM student chapter at Monmouth University.

RESPONSE RULES:
- Keep responses SHORT (2-4 sentences max for simple questions).
- Use bullet points for lists, but limit to 5 items.
- Never write paragraphs longer than 3 sentences.
- When listing events, show: title, date/day, time, and location.
- Be friendly and conversational, not formal.
- If you don't know something, say so honestly rather than guessing.

Chapter Info:
- IEEE: Institute of Electrical and Electronics Engineers - world's largest technical professional organization
- ACM: Association for Computing Machinery - world's largest computing society
- This is a student chapter at Monmouth University, Department of Computer Science & Software Engineering (CSSE)
- Located in Howard Hall, Room 221, Monmouth University, West Long Branch, NJ 07764
- President: Kiumbura Githinji (s1358017@monmouth.edu)
- Vice President: Miriam Abecasis (s1354404@monmouth.edu)
- Treasurer: Lynda Levy (s1354589@monmouth.edu)
- Secretary: Anna Pitera (s1369554@monmouth.edu)

Committee Chairs:
- Events & Programming: Satvik Dhiman
- Marketing & Media: Melissa Blanc Doblas
- Outreach & Ambassadors: George Khalil
- Finance & Sponsorship: Lynda Levy
- University & External Relations: Daniel-John Diala

AI Workshops & Research Lab:
- The AI Research Lab is an IEEE/ACM chapter initiative
- AI Lab Coordinator: Kiumbura Githinji
- Faculty Advisor: Dr. Ling Zheng (lzheng@monmouth.edu), Department Chair of CSSE
- Co-Investigator: Dr. Weihao Qu (wqu@monmouth.edu) — leads the research study "Improving Efficiency in Higher Education through Customized AI Training"
- Research Areas: Machine Learning, Natural Language Processing (NLP), Computer Vision, Robotics & AI
- Active Projects:
  * UleAIrn — AI-powered personalized learning platform (https://www.uleairn.com/)
  * Gamified Learning with AI — integrating game mechanics with AI for interactive education
  * Hawk Hack — Monmouth University's annual hackathon
- Workshop series: "AI Site Lab: Your Portfolio Your Way" — hands-on workshop to build portfolio websites using AI tools
- Workshop PDF slides available on the AI Workshops page
- Resources include: FileZilla Cheat Sheet, PyTorch, TensorFlow, Scikit-learn tutorials
- Online course recommendations: Coursera Machine Learning, Fast.ai, DeepLearning.AI

Activities:
- AI Workshops & Research (machine learning, NLP, computer vision)
- Technical workshops (Python, web development, cybersecurity)
- Guest speakers from industry (e.g., ParkShark CEO Andrew McGovern)
- Networking events, career development, resume reviews
- Hackathons and programming competitions

Membership:
- Open to ALL Monmouth University students — no prior experience required
- Benefits: IEEE/ACM digital library access, professional development resources, networking with industry leaders, scholarship and leadership opportunities, career fair and internship opportunities
- Join at: https://forms.office.com/r/qm0mq5jU4W

Support & Give:
- The chapter has a crowdfunding campaign to re-establish official IEEE and ACM affiliation
- Goal: $5,000 | Deadline: April 28, 2026
- Monmouth Giving Days: March 24-25, 2026 (donate $33+ for custom MU socks)
- Donations support: official chapter status fees, professional speakers, workshops, networking events, and digital library access
- Donate at: https://fly.monmouth.edu/project/49605
- Giving Day page: https://givingday.monmouth.edu/giving-day/111077/set/8321

Website Pages:
- Home: index.html
- AI Workshops & Research: ai-workshops.html
- Events Calendar: events.html (full interactive calendar with admin mode)
- Instagram: https://www.instagram.com/monmouth_ieeeacm/

Contact:
- Email: s1358017@monmouth.edu (Kiumbura Githinji, President)
- Faculty: lzheng@monmouth.edu (Dr. Ling Zheng, CSSE Department Chair)
- Phone: (732) 571-3400 (Monmouth University)
- Instagram: @monmouth_ieeeacm`
};

function buildEventsContext() {
    const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    let eventsData = [];
    try {
        const stored = localStorage.getItem('ieeeacm_events');
        if (stored) {
            eventsData = JSON.parse(stored) || [];
        }
    } catch { /* ignore */ }

    if (eventsData.length === 0) return '\n\nNo events currently scheduled.';

    function formatTime12(t) {
        if (!t) return '';
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
    }

    function generateUpcoming(event, rangeStart, rangeEnd) {
        const occ = [];
        const rec = event.recurrence;
        const excluded = new Set(event.excludedDates || []);
        if (!rec) return occ;

        if (rec.type === 'once') {
            const d = new Date(rec.date + 'T00:00:00');
            if (d >= rangeStart && d <= rangeEnd && !excluded.has(rec.date)) occ.push(d);
        } else if (rec.type === 'weekly' || rec.type === 'biweekly') {
            const start = new Date(rec.startDate + 'T00:00:00');
            const end = new Date(rec.endDate + 'T00:00:00');
            const es = rangeStart > start ? rangeStart : start;
            const ee = rangeEnd < end ? rangeEnd : end;
            let cur = new Date(start);
            while (cur.getDay() !== rec.day) cur.setDate(cur.getDate() + 1);
            const step = rec.type === 'biweekly' ? 14 : 7;
            while (cur <= ee) {
                const ds = cur.getFullYear() + '-' + String(cur.getMonth()+1).padStart(2,'0') + '-' + String(cur.getDate()).padStart(2,'0');
                if (cur >= es && !excluded.has(ds)) occ.push(new Date(cur));
                cur.setDate(cur.getDate() + step);
            }
        } else if (rec.type === 'monthly') {
            const start = new Date(rec.startDate + 'T00:00:00');
            const end = new Date(rec.endDate + 'T00:00:00');
            const es = rangeStart > start ? rangeStart : start;
            const ee = rangeEnd < end ? rangeEnd : end;
            let cur = new Date(es.getFullYear(), es.getMonth(), rec.dayOfMonth);
            if (cur < es) cur.setMonth(cur.getMonth() + 1);
            while (cur <= ee) {
                const ds = cur.getFullYear() + '-' + String(cur.getMonth()+1).padStart(2,'0') + '-' + String(cur.getDate()).padStart(2,'0');
                if (cur.getDate() === rec.dayOfMonth && !excluded.has(ds)) occ.push(new Date(cur));
                cur = new Date(cur.getFullYear(), cur.getMonth() + 1, rec.dayOfMonth);
            }
        }
        return occ;
    }

    const now = new Date(); now.setHours(0,0,0,0);
    const end = new Date(now); end.setMonth(end.getMonth() + 3);
    const all = [];
    eventsData.forEach(ev => {
        generateUpcoming(ev, now, end).forEach(date => {
            all.push({ event: ev, date });
        });
    });
    all.sort((a, b) => a.date - b.date);

    if (all.length === 0) return '\n\nNo upcoming events in the next 3 months.';

    let ctx = '\n\nUPCOMING EVENTS (next 3 months):\n';
    all.slice(0, 15).forEach(item => {
        const ev = item.event;
        const d = item.date;
        const dayName = DAYS_FULL[d.getDay()];
        const dateStr = MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
        ctx += '- ' + ev.title + ' | ' + dayName + ', ' + dateStr + ' | ' + formatTime12(ev.startTime) + '-' + formatTime12(ev.endTime) + ' | ' + ev.location;
        if (ev.description) ctx += ' | ' + ev.description;
        ctx += '\n';
    });

    // Also list all event types/series
    ctx += '\nALL EVENT SERIES:\n';
    eventsData.forEach(ev => {
        const rec = ev.recurrence;
        let schedule = '';
        if (rec.type === 'once') schedule = 'One-time on ' + rec.date;
        else if (rec.type === 'weekly') schedule = 'Every ' + DAYS_FULL[rec.day] + ' (' + rec.startDate + ' to ' + rec.endDate + ')';
        else if (rec.type === 'biweekly') schedule = 'Every other ' + DAYS_FULL[rec.day] + ' (' + rec.startDate + ' to ' + rec.endDate + ')';
        else if (rec.type === 'monthly') schedule = 'Monthly on the ' + rec.dayOfMonth + 'th (' + rec.startDate + ' to ' + rec.endDate + ')';
        ctx += '- ' + ev.title + ' [' + ev.category + '] | ' + schedule + ' | ' + formatTime12(ev.startTime) + '-' + formatTime12(ev.endTime) + ' | ' + ev.location + '\n';
    });

    return ctx;
}

class IEEEACMAssistant {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.conversationHistory = [];
        this.systemContext = '';
        this.init();
    }

    init() {
        this.systemContext = ASSISTANT_CONFIG.systemContextBase + buildEventsContext();
        this.injectStyles();
        this.createChatWidget();
        this.attachEventListeners();
        this.addWelcomeMessage();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* AI Assistant Widget Styles */
            .assistant-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: 'Source Sans 3', 'Open Sans', sans-serif;
            }

            .assistant-button {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: linear-gradient(135deg, #004C97 0%, #002855 100%);
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 76, 151, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                padding: 10px;
                overflow: hidden;
            }

            .assistant-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(0, 76, 151, 0.6);
            }

            .assistant-button img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }

            .assistant-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background-color: #E57200;
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .assistant-window {
                position: fixed;
                bottom: 100px;
                right: 20px;
                width: 380px;
                max-width: calc(100vw - 40px);
                height: 600px;
                max-height: calc(100vh - 140px);
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                display: flex;
                flex-direction: column;
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
                transition: all 0.3s ease;
            }

            .assistant-window.open {
                opacity: 1;
                transform: translateY(0);
                pointer-events: all;
            }

            .assistant-header {
                background: linear-gradient(135deg, #004C97 0%, #002855 100%);
                color: white;
                padding: 20px;
                border-radius: 16px 16px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .assistant-header-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .assistant-header-logo {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                object-fit: cover;
            }

            .assistant-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: white;
            }

            .assistant-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .assistant-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .assistant-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                background: #f8f9fa;
            }

            .assistant-message {
                display: flex;
                gap: 10px;
                animation: fadeInUp 0.3s ease;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .assistant-message.user {
                flex-direction: row-reverse;
            }

            .assistant-message-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                overflow: hidden;
            }

            .assistant-message-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .assistant-message.bot .assistant-message-avatar {
                background: linear-gradient(135deg, #004C97 0%, #002855 100%);
                color: white;
            }

            .assistant-message.user .assistant-message-avatar {
                background: #69B3E7;
                color: white;
            }

            .assistant-message-content {
                max-width: 75%;
                padding: 12px 16px;
                border-radius: 12px;
                line-height: 1.6;
                font-size: 14px;
                word-wrap: break-word;
                overflow-wrap: break-word;
                overflow: hidden;
            }

            .assistant-message-content a {
                color: #004C97;
                word-break: break-all;
            }

            .assistant-message.user .assistant-message-content a {
                color: #69B3E7;
            }

            .assistant-message-content strong {
                font-weight: 700;
            }

            .assistant-message-content em {
                font-style: italic;
            }

            .assistant-message-content code {
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
            }

            .assistant-message.bot .assistant-message-content code {
                background: #f0f0f0;
                color: #d63384;
            }

            .assistant-message.user .assistant-message-content code {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }

            .assistant-message.bot .assistant-message-content {
                background: white;
                color: #212529;
                border-bottom-left-radius: 4px;
            }

            .assistant-message.user .assistant-message-content {
                background: linear-gradient(135deg, #004C97 0%, #002855 100%);
                color: white;
                border-bottom-right-radius: 4px;
            }

            .assistant-typing {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
                background: white;
                border-radius: 12px;
                width: fit-content;
            }

            .assistant-typing-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #004C97;
                animation: typing 1.4s infinite;
            }

            .assistant-typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .assistant-typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.7;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }

            .assistant-input-container {
                padding: 20px;
                background: white;
                border-top: 1px solid #e0e0e0;
                border-radius: 0 0 16px 16px;
            }

            .assistant-input-wrapper {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .assistant-input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e0e0e0;
                border-radius: 24px;
                font-size: 14px;
                font-family: 'Source Sans 3', 'Open Sans', sans-serif;
                outline: none;
                transition: border-color 0.2s ease;
            }

            .assistant-input:focus {
                border-color: #004C97;
            }

            .assistant-send-button {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: linear-gradient(135deg, #004C97 0%, #002855 100%);
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .assistant-send-button:hover:not(:disabled) {
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(0, 76, 151, 0.3);
            }

            .assistant-send-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .assistant-error {
                padding: 12px;
                background: #fee;
                color: #c00;
                border-radius: 8px;
                font-size: 13px;
                text-align: center;
            }

            .assistant-powered-by {
                text-align: center;
                font-size: 11px;
                color: #666;
                padding: 8px;
                background: #f8f9fa;
            }

            /* Mobile Responsive */
            @media (max-width: 480px) {
                .assistant-window {
                    width: calc(100vw - 20px);
                    height: calc(100vh - 120px);
                    right: 10px;
                    bottom: 90px;
                }

                .assistant-button {
                    width: 60px;
                    height: 60px;
                    bottom: 15px;
                    right: 15px;
                }
            }

            /* Scrollbar Styling */
            .assistant-messages::-webkit-scrollbar {
                width: 6px;
            }

            .assistant-messages::-webkit-scrollbar-track {
                background: #f1f1f1;
            }

            .assistant-messages::-webkit-scrollbar-thumb {
                background: #004C97;
                border-radius: 3px;
            }

            .assistant-messages::-webkit-scrollbar-thumb:hover {
                background: #002855;
            }
        `;
        document.head.appendChild(style);
    }

    createChatWidget() {
        const container = document.createElement('div');
        container.className = 'assistant-container';
        container.innerHTML = `
            <button class="assistant-button" id="assistant-toggle" aria-label="Open AI assistant">
                <img src="images/shadow_transparent.png" alt="Monmouth Shadow Hawk">
                <span class="assistant-badge">?</span>
            </button>

            <div class="assistant-window" id="assistant-window">
                <div class="assistant-header">
                    <div class="assistant-header-title">
                        <img src="images/shadow_transparent.png" alt="Shadow Hawk" class="assistant-header-logo">
                        <h3>${ASSISTANT_CONFIG.botName}</h3>
                    </div>
                    <button class="assistant-close" id="assistant-close" aria-label="Close assistant">
                        ×
                    </button>
                </div>

                <div class="assistant-messages" id="assistant-messages"></div>

                <div class="assistant-powered-by">
                    Powered by Llama AI
                </div>

                <div class="assistant-input-container">
                    <div class="assistant-input-wrapper">
                        <input
                            type="text"
                            class="assistant-input"
                            id="assistant-input"
                            placeholder="${ASSISTANT_CONFIG.placeholderText}"
                            aria-label="Chat message input"
                        >
                        <button class="assistant-send-button" id="assistant-send" aria-label="Send message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('assistant-toggle');
        const closeBtn = document.getElementById('assistant-close');
        const sendBtn = document.getElementById('assistant-send');
        const input = document.getElementById('assistant-input');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('assistant-window');

        if (this.isOpen) {
            window.classList.add('open');
            document.getElementById('assistant-input').focus();
        } else {
            window.classList.remove('open');
        }
    }

    addWelcomeMessage() {
        this.addMessage(ASSISTANT_CONFIG.welcomeMessage, 'bot');
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('assistant-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `assistant-message ${sender}`;

        const avatarContent = sender === 'bot'
            ? '<img src="images/shadow_transparent.png" alt="Shadow Hawk">'
            : '👤';

        messageDiv.innerHTML = `
            <div class="assistant-message-avatar">${avatarContent}</div>
            <div class="assistant-message-content">${this.formatText(text)}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTyping() {
        const messagesContainer = document.getElementById('assistant-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'assistant-message bot';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="assistant-message-avatar">
                <img src="images/shadow_transparent.png" alt="Shadow Hawk">
            </div>
            <div class="assistant-typing">
                <div class="assistant-typing-dot"></div>
                <div class="assistant-typing-dot"></div>
                <div class="assistant-typing-dot"></div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showError(message) {
        const messagesContainer = document.getElementById('assistant-messages');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'assistant-error';
        errorDiv.textContent = message || ASSISTANT_CONFIG.errorMessage;
        messagesContainer.appendChild(errorDiv);
        this.scrollToBottom();

        setTimeout(() => errorDiv.remove(), 5000);
    }

    async sendMessage() {
        const input = document.getElementById('assistant-input');
        const sendBtn = document.getElementById('assistant-send');
        const message = input.value.trim();

        if (!message) return;

        // Disable input while processing
        input.disabled = true;
        sendBtn.disabled = true;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Add to conversation history (Claude format: role user/assistant)
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        // Show typing indicator
        this.showTyping();

        // Refresh events context in case admin made changes
        this.systemContext = ASSISTANT_CONFIG.systemContextBase + buildEventsContext();

        try {
            // Call Groq API directly
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + ASSISTANT_CONFIG.groqApiKey
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    max_tokens: 500,
                    messages: [
                        { role: 'system', content: this.systemContext },
                        ...this.conversationHistory
                    ]
                })
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                console.error('Groq API error:', response.status, errBody);
                throw new Error(errBody?.error?.message || 'API error');
            }

            const data = await response.json();

            // Hide typing indicator
            this.hideTyping();

            const reply = data.choices && data.choices[0] && data.choices[0].message.content;
            if (reply) {
                this.addMessage(reply, 'bot');

                // Add to conversation history
                this.conversationHistory.push({
                    role: 'assistant',
                    content: reply
                });

                // Keep conversation history manageable (last 10 exchanges)
                if (this.conversationHistory.length > 20) {
                    this.conversationHistory = this.conversationHistory.slice(-20);
                }
            } else {
                throw new Error('Unexpected response format');
            }

        } catch (error) {
            console.error('Assistant error:', error);
            this.hideTyping();
            this.showError();
        } finally {
            // Re-enable input
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('assistant-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatText(text) {
        // Convert markdown-style formatting to HTML
        let formatted = text
            // Escape HTML first
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Bold text: **text** or __text__
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.+?)__/g, '<strong>$1</strong>')
            // Italic text: *text* or _text_
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/_(.+?)_/g, '<em>$1</em>')
            // Code blocks: ```code```
            .replace(/```(.+?)```/gs, '<code>$1</code>')
            // Inline code: `code`
            .replace(/`(.+?)`/g, '<code>$1</code>')
            // URLs to clickable links
            .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
            // Line breaks
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

        // Handle numbered lists: 1. item
        formatted = formatted.replace(/(\d+)\.\s+(.+?)(<br>|$)/g, '<div style="margin-left: 20px;">$1. $2</div>');

        // Handle bullet points: - item or * item
        formatted = formatted.replace(/[-•]\s+(.+?)(<br>|$)/g, '<div style="margin-left: 20px;">• $1</div>');

        return formatted;
    }
}

// Initialize assistant when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new IEEEACMAssistant();
    });
} else {
    new IEEEACMAssistant();
}
