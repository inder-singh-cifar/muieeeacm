/* ==========================================================================
   Events Calendar - IEEE/ACM Monmouth University Chapter
   Calendar logic, admin CRUD, dynamic categories, iCal/Google Calendar export
   ========================================================================== */

(function () {
    'use strict';

    // ---------- State ----------
    let events = [];
    let categories = [];
    let currentDate = new Date();
    let activeCategory = 'all';
    let isAdmin = false;
    let selectedEvent = null; // { event, occurrenceDate }
    let currentView = 'month'; // 'week' | 'month' | 'year' | 'list'

    const ADMIN_HASH = '2ad7d383b8af84b6a3db6b677c6389fd2ed69980355fab3c46cf4e8a95f35440'; // sha256 of admin password

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const DEFAULT_COLOR = '#5B6770'; // monmouth-gray fallback

    // ---------- DOM Refs ----------
    const $ = (id) => document.getElementById(id);

    const dom = {
        calendarGrid: $('calendarGrid'),
        calendarGridWrapper: $('calendarGridWrapper'),
        listView: $('listView'),
        weekView: $('weekView'),
        weekViewWrapper: $('weekViewWrapper'),
        yearView: $('yearView'),
        yearViewWrapper: $('yearViewWrapper'),
        currentMonth: $('currentMonth'),
        categoryFilters: $('categoryFilters'),
        calendarLegend: $('calendarLegend'),
        datePicker: $('datePicker'),
        // View toggle
        btnWeekView: $('btnWeekView'),
        btnCalendarView: $('btnCalendarView'),
        btnYearView: $('btnYearView'),
        btnListView: $('btnListView'),
        btnPrevMonth: $('btnPrevMonth'),
        btnNextMonth: $('btnNextMonth'),
        btnToday: $('btnToday'),
        // Admin
        adminBar: $('adminBar'),
        adminToggle: $('adminToggle'),
        adminActions: $('adminActions'),
        modalAdminActions: $('modalAdminActions'),
        btnAddEvent: $('btnAddEvent'),
        btnEditEvent: $('btnEditEvent'),
        btnDeleteEvent: $('btnDeleteEvent'),
        btnManageCategories: $('btnManageCategories'),
        // Admin password
        adminPasswordModal: $('adminPasswordModal'),
        adminPasswordInput: $('adminPasswordInput'),
        adminPasswordSubmit: $('adminPasswordSubmit'),
        adminPasswordCancel: $('adminPasswordCancel'),
        adminError: $('adminError'),
        // Event modal
        eventModal: $('eventModal'),
        modalTitle: $('modalTitle'),
        modalCategory: $('modalCategory'),
        modalDate: $('modalDate'),
        modalTime: $('modalTime'),
        modalLocation: $('modalLocation'),
        modalRecurrenceRow: $('modalRecurrenceRow'),
        modalRecurrence: $('modalRecurrence'),
        modalDescription: $('modalDescription'),
        modalClose: $('modalClose'),
        btnIcal: $('btnIcal'),
        btnGcal: $('btnGcal'),
        // Editor
        eventEditorOverlay: $('eventEditorOverlay'),
        editorTitle: $('editorTitle'),
        editorClose: $('editorClose'),
        editorCancel: $('editorCancel'),
        editorSave: $('editorSave'),
        editEventId: $('editEventId'),
        editTitle: $('editTitle'),
        editDescription: $('editDescription'),
        editCategory: $('editCategory'),
        editLocation: $('editLocation'),
        editStartTime: $('editStartTime'),
        editEndTime: $('editEndTime'),
        editRecurrenceType: $('editRecurrenceType'),
        editOnceDate: $('editOnceDate'),
        editWeekday: $('editWeekday'),
        editDayOfMonth: $('editDayOfMonth'),
        editStartDate: $('editStartDate'),
        editEndDate: $('editEndDate'),
        recurrenceFields: $('recurrenceFields'),
        toastContainer: $('toastContainer'),
        // Category manager
        categoryManagerOverlay: $('categoryManagerOverlay'),
        categoryManagerClose: $('categoryManagerClose'),
        categoryList: $('categoryList'),
        newCategoryName: $('newCategoryName'),
        newCategoryColor: $('newCategoryColor'),
        btnAddCategory: $('btnAddCategory'),
    };

    // ---------- Utilities ----------

    function padZero(n) { return n < 10 ? '0' + n : '' + n; }

    function formatDate(date) {
        return DAYS_FULL[date.getDay()] + ', ' + MONTHS[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    }

    function formatTime12(timeStr) {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return hour + ':' + padZero(m) + ' ' + ampm;
    }

    function getCategoryColor(categoryName) {
        const cat = categories.find(c => c.name === categoryName);
        return cat ? cat.color : DEFAULT_COLOR;
    }

    function isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = 'toast ' + (type || 'info');
        toast.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle') + '"></i> ' + message;
        dom.toastContainer.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; }, 2500);
        setTimeout(() => toast.remove(), 2800);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---------- Dynamic Category Rendering ----------

    function renderCategoryFilters() {
        let html = '<button class="category-filter' + (activeCategory === 'all' ? ' active' : '') + '" data-category="all">All Events</button>';
        categories.forEach(cat => {
            const isActive = activeCategory === cat.name;
            html += '<button class="category-filter' + (isActive ? ' active' : '') + '" data-category="' + escapeHtml(cat.name) + '"'
                + ' style="' + (isActive ? 'border-color:' + cat.color + ';background:' + cat.color + '1a;color:' + cat.color : '') + '">'
                + escapeHtml(cat.name) + '</button>';
        });
        dom.categoryFilters.innerHTML = html;
    }

    function renderLegend() {
        let html = '';
        categories.forEach(cat => {
            html += '<div class="legend-item"><span class="legend-dot" style="background:' + cat.color + '"></span> ' + escapeHtml(cat.name) + '</div>';
        });
        dom.calendarLegend.innerHTML = html;
    }

    function populateCategorySelect() {
        let html = '';
        categories.forEach(cat => {
            html += '<option value="' + escapeHtml(cat.name) + '">' + escapeHtml(cat.name) + '</option>';
        });
        html += '<option value="Other">Other</option>';
        dom.editCategory.innerHTML = html;
    }

    // ---------- Event Occurrence Generation ----------

    function toDateString(d) {
        return d.getFullYear() + '-' + padZero(d.getMonth() + 1) + '-' + padZero(d.getDate());
    }

    function generateOccurrences(event, rangeStart, rangeEnd) {
        const occurrences = [];
        const rec = event.recurrence;
        if (!rec) return occurrences;

        const excluded = new Set(event.excludedDates || []);

        if (rec.type === 'once') {
            const d = new Date(rec.date + 'T00:00:00');
            if (d >= rangeStart && d <= rangeEnd && !excluded.has(rec.date)) {
                occurrences.push(d);
            }
        } else if (rec.type === 'weekly' || rec.type === 'biweekly') {
            const start = new Date(rec.startDate + 'T00:00:00');
            const end = new Date(rec.endDate + 'T00:00:00');
            const effectiveStart = rangeStart > start ? rangeStart : start;
            const effectiveEnd = rangeEnd < end ? rangeEnd : end;

            let current = new Date(start);
            while (current.getDay() !== rec.day) {
                current.setDate(current.getDate() + 1);
            }

            const step = rec.type === 'biweekly' ? 14 : 7;

            while (current <= effectiveEnd) {
                if (current >= effectiveStart && !excluded.has(toDateString(current))) {
                    occurrences.push(new Date(current));
                }
                current.setDate(current.getDate() + step);
            }
        } else if (rec.type === 'monthly') {
            const start = new Date(rec.startDate + 'T00:00:00');
            const end = new Date(rec.endDate + 'T00:00:00');
            const effectiveStart = rangeStart > start ? rangeStart : start;
            const effectiveEnd = rangeEnd < end ? rangeEnd : end;

            let current = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth(), rec.dayOfMonth);
            if (current < effectiveStart) {
                current.setMonth(current.getMonth() + 1);
            }

            while (current <= effectiveEnd) {
                if (current.getDate() === rec.dayOfMonth && !excluded.has(toDateString(current))) {
                    occurrences.push(new Date(current));
                }
                current = new Date(current.getFullYear(), current.getMonth() + 1, rec.dayOfMonth);
            }
        }

        return occurrences;
    }

    function getEventsForMonth(year, month) {
        const rangeStart = new Date(year, month, 1);
        const rangeEnd = new Date(year, month + 1, 0, 23, 59, 59);

        const displayStart = new Date(rangeStart);
        displayStart.setDate(displayStart.getDate() - displayStart.getDay());
        const displayEnd = new Date(rangeEnd);
        displayEnd.setDate(displayEnd.getDate() + (6 - displayEnd.getDay()));

        const result = [];
        events.forEach(event => {
            if (activeCategory !== 'all' && event.category !== activeCategory) return;
            const occurrences = generateOccurrences(event, displayStart, displayEnd);
            occurrences.forEach(date => {
                result.push({ event, date });
            });
        });

        return result;
    }

    function getUpcomingEvents(monthsAhead) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setMonth(end.getMonth() + (monthsAhead || 4));

        const result = [];
        events.forEach(event => {
            if (activeCategory !== 'all' && event.category !== activeCategory) return;
            const occurrences = generateOccurrences(event, now, end);
            occurrences.forEach(date => {
                result.push({ event, date });
            });
        });

        result.sort((a, b) => a.date - b.date);
        return result;
    }

    // ---------- Week Helpers ----------

    function getWeekStart(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        return d;
    }

    function getEventsForWeek(weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59);

        const result = [];
        events.forEach(event => {
            if (activeCategory !== 'all' && event.category !== activeCategory) return;
            const occurrences = generateOccurrences(event, weekStart, weekEnd);
            occurrences.forEach(date => {
                result.push({ event, date });
            });
        });
        return result;
    }

    // ---------- Week View Rendering ----------

    function renderWeekView() {
        const weekStart = getWeekStart(currentDate);
        const today = new Date();

        // Update header label
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekStart.getMonth() === weekEnd.getMonth()) {
            dom.currentMonth.textContent = MONTHS[weekStart.getMonth()] + ' ' + weekStart.getDate() + ' - ' + weekEnd.getDate() + ', ' + weekStart.getFullYear();
        } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
            dom.currentMonth.textContent = MONTHS[weekStart.getMonth()].substring(0, 3) + ' ' + weekStart.getDate() + ' - ' + MONTHS[weekEnd.getMonth()].substring(0, 3) + ' ' + weekEnd.getDate() + ', ' + weekStart.getFullYear();
        } else {
            dom.currentMonth.textContent = MONTHS[weekStart.getMonth()].substring(0, 3) + ' ' + weekStart.getDate() + ', ' + weekStart.getFullYear() + ' - ' + MONTHS[weekEnd.getMonth()].substring(0, 3) + ' ' + weekEnd.getDate() + ', ' + weekEnd.getFullYear();
        }

        const weekEvents = getEventsForWeek(weekStart);

        // Build hours (12 AM to 11 PM — full 24 hours)
        const startHour = 0;
        const endHour = 23;

        let html = '<div class="week-header-row">';
        html += '<div class="week-time-gutter"></div>';
        for (let d = 0; d < 7; d++) {
            const dayDate = new Date(weekStart);
            dayDate.setDate(dayDate.getDate() + d);
            const isToday = isSameDay(dayDate, today);
            html += '<div class="week-day-header' + (isToday ? ' today' : '') + '">';
            html += '<span class="week-day-name">' + DAYS[d] + '</span>';
            html += '<span class="week-day-num' + (isToday ? ' today' : '') + '">' + dayDate.getDate() + '</span>';
            html += '</div>';
        }
        html += '</div>';

        html += '<div class="week-scroll-area">';
        html += '<div class="week-body">';
        html += '<div class="week-time-column">';
        for (let h = startHour; h <= endHour; h++) {
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayHour = h % 12 || 12;
            html += '<div class="week-time-label">' + displayHour + ' ' + ampm + '</div>';
        }
        html += '</div>';

        for (let d = 0; d < 7; d++) {
            const dayDate = new Date(weekStart);
            dayDate.setDate(dayDate.getDate() + d);
            const isToday = isSameDay(dayDate, today);
            const dayEvents = weekEvents.filter(e => isSameDay(e.date, dayDate));

            html += '<div class="week-day-column' + (isToday ? ' today' : '') + '">';

            // Hour grid lines
            for (let h = startHour; h <= endHour; h++) {
                html += '<div class="week-hour-cell"></div>';
            }

            // Place events as absolute positioned blocks
            dayEvents.forEach(({ event }) => {
                const [sh, sm] = event.startTime.split(':').map(Number);
                const [eh, em] = event.endTime.split(':').map(Number);
                const topPercent = ((sh - startHour) * 60 + sm) / ((endHour - startHour + 1) * 60) * 100;
                const heightPercent = ((eh - sh) * 60 + (em - sm)) / ((endHour - startHour + 1) * 60) * 100;
                const color = getCategoryColor(event.category);

                if (sh >= startHour && sh <= endHour) {
                    html += '<div class="week-event" style="top:' + topPercent + '%;height:' + Math.max(heightPercent, 2.5) + '%;background:' + color + ';" data-event-id="' + event.id + '" data-date="' + dayDate.toISOString() + '">';
                    html += '<span class="week-event-title">' + escapeHtml(event.title) + '</span>';
                    html += '<span class="week-event-time">' + formatTime12(event.startTime) + '</span>';
                    html += '</div>';
                }
            });

            html += '</div>';
        }

        html += '</div>'; // close week-body
        html += '</div>'; // close week-scroll-area

        dom.weekView.innerHTML = html;

        // Auto-scroll to ~7 AM so the user sees a useful range on load
        const weekBody = dom.weekView.querySelector('.week-scroll-area');
        if (weekBody) {
            const hourHeight = 56; // matches CSS .week-hour-cell height
            weekBody.scrollTop = hourHeight * 7; // 7 AM
        }

        // Event click handlers
        dom.weekView.querySelectorAll('.week-event').forEach(el => {
            el.addEventListener('click', () => {
                const event = events.find(e => e.id === el.dataset.eventId);
                const date = new Date(el.dataset.date);
                if (event) openEventModal(event, date);
            });
        });
    }

    // ---------- Year View Rendering ----------

    function renderYearView() {
        const year = currentDate.getFullYear();
        dom.currentMonth.textContent = '' + year;

        const today = new Date();
        let html = '';

        for (let month = 0; month < 12; month++) {
            const rangeStart = new Date(year, month, 1);
            const rangeEnd = new Date(year, month + 1, 0, 23, 59, 59);

            // Collect events for this month to mark dots
            const monthEvents = [];
            events.forEach(event => {
                if (activeCategory !== 'all' && event.category !== activeCategory) return;
                const occs = generateOccurrences(event, rangeStart, rangeEnd);
                occs.forEach(date => monthEvents.push(date));
            });

            const eventDays = new Set(monthEvents.map(d => d.getDate()));

            const firstDay = rangeStart.getDay();
            const totalDays = rangeEnd.getDate();
            const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

            html += '<div class="year-month-card" data-month="' + month + '">';
            html += '<div class="year-month-title">' + MONTHS[month] + '</div>';
            html += '<div class="year-mini-grid">';

            // Day headers
            DAYS.forEach(d => {
                html += '<span class="year-mini-header">' + d.charAt(0) + '</span>';
            });

            // Empty cells before first day
            for (let i = 0; i < firstDay; i++) {
                html += '<span class="year-mini-day empty"></span>';
            }

            // Days
            for (let day = 1; day <= totalDays; day++) {
                const isToday = isCurrentMonth && today.getDate() === day;
                const hasEvent = eventDays.has(day);
                let cls = 'year-mini-day';
                if (isToday) cls += ' today';
                if (hasEvent) cls += ' has-event';
                html += '<span class="' + cls + '" data-year="' + year + '" data-month="' + month + '" data-day="' + day + '">' + day + '</span>';
            }

            html += '</div>';
            html += '</div>';
        }

        dom.yearView.innerHTML = html;

        // Click a day to jump to that date in month view
        dom.yearView.querySelectorAll('.year-mini-day:not(.empty)').forEach(el => {
            el.addEventListener('click', () => {
                const y = parseInt(el.dataset.year);
                const m = parseInt(el.dataset.month);
                const d = parseInt(el.dataset.day);
                currentDate = new Date(y, m, d);
                setView('month');
            });
        });

        // Click month title to jump to that month
        dom.yearView.querySelectorAll('.year-month-title').forEach(el => {
            el.addEventListener('click', () => {
                const card = el.closest('.year-month-card');
                const m = parseInt(card.dataset.month);
                currentDate = new Date(year, m, 1);
                setView('month');
            });
        });
    }

    // ---------- Calendar Grid Rendering ----------

    function renderCalendarGrid() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        dom.currentMonth.textContent = MONTHS[month] + ' ' + year;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const eventsForMonth = getEventsForMonth(year, month);
        const today = new Date();

        let html = '';

        DAYS.forEach(d => {
            html += '<div class="day-header">' + d + '</div>';
        });

        const prevLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            const dayNum = prevLastDay - i;
            html += '<div class="calendar-day other-month"><span class="day-number">' + dayNum + '</span></div>';
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateObj = new Date(year, month, day);
            const isToday = isSameDay(dateObj, today);
            const classes = ['calendar-day'];
            if (isToday) classes.push('today');

            const dayEvents = eventsForMonth.filter(e => isSameDay(e.date, dateObj));

            html += '<div class="' + classes.join(' ') + '">';
            html += '<span class="day-number">' + day + '</span>';

            const maxShow = 3;
            dayEvents.slice(0, maxShow).forEach(({ event }) => {
                const color = getCategoryColor(event.category);
                html += '<div class="calendar-event" style="background:' + color + '" data-event-id="' + event.id + '" data-date="' + dateObj.toISOString() + '" title="' + escapeHtml(event.title) + '">' + escapeHtml(event.title) + '</div>';
            });

            if (dayEvents.length > maxShow) {
                html += '<div class="more-events" data-date="' + dateObj.toISOString() + '">+' + (dayEvents.length - maxShow) + ' more</div>';
            }

            html += '</div>';
        }

        const totalCells = startDay + totalDays;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remaining; i++) {
            html += '<div class="calendar-day other-month"><span class="day-number">' + i + '</span></div>';
        }

        dom.calendarGrid.innerHTML = html;

        dom.calendarGrid.querySelectorAll('.calendar-event').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = el.dataset.eventId;
                const date = new Date(el.dataset.date);
                const event = events.find(e => e.id === eventId);
                if (event) openEventModal(event, date);
            });
        });

        // Click a day number to jump to week view for that date
        dom.calendarGrid.querySelectorAll('.calendar-day:not(.other-month) .day-number').forEach(el => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const dayNum = parseInt(el.textContent);
                currentDate = new Date(year, month, dayNum);
                setView('week');
            });
        });
    }

    // ---------- List View Rendering ----------

    function renderListView() {
        const upcoming = getUpcomingEvents(6);

        if (upcoming.length === 0) {
            dom.listView.innerHTML = '<div class="no-events-message"><i class="fas fa-calendar-xmark"></i><p>No upcoming events found.</p></div>';
            return;
        }

        const grouped = {};
        upcoming.forEach(({ event, date }) => {
            const key = MONTHS[date.getMonth()] + ' ' + date.getFullYear();
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({ event, date });
        });

        let html = '';
        Object.entries(grouped).forEach(([monthLabel, items]) => {
            html += '<div class="list-month-group">';
            html += '<h3 class="list-month-header">' + monthLabel + '</h3>';

            items.forEach(({ event, date }) => {
                const color = getCategoryColor(event.category);
                html += '<div class="list-event-item" data-event-id="' + event.id + '" data-date="' + date.toISOString() + '">';
                html += '<div class="list-event-date">';
                html += '<span class="weekday">' + DAYS[date.getDay()] + '</span>';
                html += '<span class="day">' + date.getDate() + '</span>';
                html += '<span class="month">' + MONTHS[date.getMonth()].substring(0, 3) + '</span>';
                html += '</div>';
                html += '<div class="list-event-info">';
                html += '<span class="list-event-category" style="background:' + color + '">' + escapeHtml(event.category) + '</span>';
                html += '<h4>' + escapeHtml(event.title) + '</h4>';
                html += '<div class="list-event-meta">';
                html += '<span><i class="fas fa-clock"></i> ' + formatTime12(event.startTime) + ' - ' + formatTime12(event.endTime) + '</span>';
                html += '<span><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(event.location) + '</span>';
                html += '</div>';
                html += '</div>';
                html += '<div class="list-event-actions">';
                html += '<button class="add-to-cal-btn btn-list-ical" title="Download .ics"><i class="fas fa-download"></i></button>';
                html += '<button class="add-to-cal-btn btn-list-gcal" title="Google Calendar"><i class="fab fa-google"></i></button>';
                html += '</div>';
                html += '</div>';
            });

            html += '</div>';
        });

        dom.listView.innerHTML = html;

        dom.listView.querySelectorAll('.list-event-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cal-btn')) return;
                const eventId = el.dataset.eventId;
                const date = new Date(el.dataset.date);
                const event = events.find(ev => ev.id === eventId);
                if (event) openEventModal(event, date);
            });
        });

        dom.listView.querySelectorAll('.btn-list-ical').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.list-event-item');
                const event = events.find(ev => ev.id === item.dataset.eventId);
                const date = new Date(item.dataset.date);
                if (event) downloadICS(event, date);
            });
        });

        dom.listView.querySelectorAll('.btn-list-gcal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.list-event-item');
                const event = events.find(ev => ev.id === item.dataset.eventId);
                const date = new Date(item.dataset.date);
                if (event) window.open(buildGoogleCalendarUrl(event, date), '_blank');
            });
        });
    }

    // ---------- Event Detail Modal ----------

    function openEventModal(event, date) {
        selectedEvent = { event, date };

        const color = getCategoryColor(event.category);
        dom.modalTitle.textContent = event.title;
        dom.modalCategory.textContent = event.category;
        dom.modalCategory.style.background = color;
        dom.modalDate.textContent = formatDate(date);
        dom.modalTime.textContent = formatTime12(event.startTime) + ' - ' + formatTime12(event.endTime);
        dom.modalLocation.textContent = event.location;
        dom.modalDescription.textContent = event.description;

        const rec = event.recurrence;
        if (rec && rec.type !== 'once') {
            dom.modalRecurrenceRow.style.display = 'flex';
            let recText = '';
            if (rec.type === 'weekly') recText = 'Every ' + DAYS_FULL[rec.day];
            else if (rec.type === 'biweekly') recText = 'Every other ' + DAYS_FULL[rec.day];
            else if (rec.type === 'monthly') recText = 'Monthly on the ' + ordinal(rec.dayOfMonth);
            dom.modalRecurrence.innerHTML = '<span class="recurrence-badge"><i class="fas fa-redo"></i> ' + recText + '</span>';
        } else {
            dom.modalRecurrenceRow.style.display = 'none';
        }

        dom.btnGcal.href = buildGoogleCalendarUrl(event, date);
        dom.modalAdminActions.style.display = isAdmin ? 'flex' : 'none';
        dom.eventModal.classList.add('active');
    }

    function closeEventModal() {
        dom.eventModal.classList.remove('active');
        selectedEvent = null;
    }

    function ordinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    // ---------- Calendar Export ----------

    function buildICSString(event, date) {
        const startDt = new Date(date);
        const [sh, sm] = event.startTime.split(':').map(Number);
        startDt.setHours(sh, sm, 0, 0);

        const endDt = new Date(date);
        const [eh, em] = event.endTime.split(':').map(Number);
        endDt.setHours(eh, em, 0, 0);

        function icsDate(d) {
            return d.getFullYear().toString() +
                padZero(d.getMonth() + 1) +
                padZero(d.getDate()) + 'T' +
                padZero(d.getHours()) +
                padZero(d.getMinutes()) +
                padZero(d.getSeconds());
        }

        const now = new Date();
        let rrule = '';
        const rec = event.recurrence;

        if (rec && rec.type !== 'once') {
            const untilDate = new Date(rec.endDate + 'T23:59:59');
            if (rec.type === 'weekly') {
                rrule = 'RRULE:FREQ=WEEKLY;BYDAY=' + ['SU','MO','TU','WE','TH','FR','SA'][rec.day] + ';UNTIL=' + icsDate(untilDate) + '\n';
            } else if (rec.type === 'biweekly') {
                rrule = 'RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=' + ['SU','MO','TU','WE','TH','FR','SA'][rec.day] + ';UNTIL=' + icsDate(untilDate) + '\n';
            } else if (rec.type === 'monthly') {
                rrule = 'RRULE:FREQ=MONTHLY;BYMONTHDAY=' + rec.dayOfMonth + ';UNTIL=' + icsDate(untilDate) + '\n';
            }
        }

        return 'BEGIN:VCALENDAR\n' +
            'VERSION:2.0\n' +
            'PRODID:-//IEEE-ACM Monmouth//Events//EN\n' +
            'CALSCALE:GREGORIAN\n' +
            'METHOD:PUBLISH\n' +
            'BEGIN:VEVENT\n' +
            'UID:' + event.id + '@ieeeacm-monmouth\n' +
            'DTSTAMP:' + icsDate(now) + '\n' +
            'DTSTART:' + icsDate(startDt) + '\n' +
            'DTEND:' + icsDate(endDt) + '\n' +
            rrule +
            'SUMMARY:' + event.title + '\n' +
            'DESCRIPTION:' + (event.description || '').replace(/\n/g, '\\n') + '\n' +
            'LOCATION:' + (event.location || '') + '\n' +
            'ORGANIZER:IEEE/ACM Monmouth University Chapter\n' +
            'END:VEVENT\n' +
            'END:VCALENDAR';
    }

    function downloadICS(event, date) {
        const ics = buildICSString(event, date);
        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = event.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ +/g, '-') + '.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Calendar file downloaded!', 'success');
    }

    function buildGoogleCalendarUrl(event, date) {
        const startDt = new Date(date);
        const [sh, sm] = event.startTime.split(':').map(Number);
        startDt.setHours(sh, sm, 0, 0);

        const endDt = new Date(date);
        const [eh, em] = event.endTime.split(':').map(Number);
        endDt.setHours(eh, em, 0, 0);

        function gcalDate(d) {
            return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        }

        let recur = '';
        const rec = event.recurrence;
        if (rec && rec.type !== 'once') {
            const untilDate = new Date(rec.endDate + 'T23:59:59');
            if (rec.type === 'weekly') recur = '&recur=RRULE:FREQ=WEEKLY;UNTIL=' + gcalDate(untilDate);
            else if (rec.type === 'biweekly') recur = '&recur=RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=' + gcalDate(untilDate);
            else if (rec.type === 'monthly') recur = '&recur=RRULE:FREQ=MONTHLY;BYMONTHDAY=' + rec.dayOfMonth + ';UNTIL=' + gcalDate(untilDate);
        }

        return 'https://www.google.com/calendar/render?action=TEMPLATE' +
            '&text=' + encodeURIComponent(event.title) +
            '&dates=' + gcalDate(startDt) + '/' + gcalDate(endDt) +
            '&details=' + encodeURIComponent(event.description || '') +
            '&location=' + encodeURIComponent(event.location || '') +
            recur;
    }

    // ---------- Admin System ----------

    function promptAdminPassword() {
        return new Promise((resolve) => {
            const useSupabase = !!(window.supabaseClient && window.supabaseClient.auth && window.ADMIN_EMAIL);

            dom.adminPasswordModal.classList.add('active');
            dom.adminPasswordInput.value = '';
            dom.adminError.style.display = 'none';
            dom.adminError.textContent = 'Incorrect password. Please try again.';
            dom.adminPasswordInput.focus();

            function cleanup() {
                dom.adminPasswordModal.classList.remove('active');
                dom.adminPasswordSubmit.removeEventListener('click', onSubmit);
                dom.adminPasswordCancel.removeEventListener('click', onCancel);
                dom.adminPasswordInput.removeEventListener('keydown', onKey);
            }

            async function onSubmit() {
                const password = dom.adminPasswordInput.value;

                if (!password) {
                    dom.adminError.textContent = 'Enter the admin password.';
                    dom.adminError.style.display = 'block';
                    return;
                }

                if (useSupabase) {
                    // --- Supabase auth flow (email embedded) ---
                    dom.adminPasswordSubmit.disabled = true;
                    try {
                        const res = await window.supabaseClient.auth.signInWithPassword({
                            email: window.ADMIN_EMAIL,
                            password: password
                        });
                        if (res.error) {
                            dom.adminError.textContent = res.error.message || 'Sign-in failed.';
                            dom.adminError.style.display = 'block';
                            dom.adminPasswordInput.value = '';
                            dom.adminPasswordInput.focus();
                            dom.adminPasswordSubmit.disabled = false;
                            return;
                        }

                        // Check if user is in the admins table
                        const uid = res.data.user && res.data.user.id;
                        const token = res.data.session && res.data.session.access_token;
                        if (uid && token) {
                            const adminUrl = window.SUPABASE_URL.replace(/\/+$/, '') +
                                '/rest/v1/admins?select=user_id&user_id=eq.' + uid;
                            const adminResp = await fetch(adminUrl, {
                                headers: {
                                    'apikey': window.SUPABASE_ANON_KEY,
                                    'Authorization': 'Bearer ' + token
                                }
                            });
                            if (adminResp.ok) {
                                const arr = await adminResp.json();
                                if (!arr || !arr.length) {
                                    dom.adminError.textContent = 'You are not an admin.';
                                    dom.adminError.style.display = 'block';
                                    await window.supabaseClient.auth.signOut();
                                    dom.adminPasswordSubmit.disabled = false;
                                    return;
                                }
                            } else {
                                dom.adminError.textContent = 'Could not verify admin status.';
                                dom.adminError.style.display = 'block';
                                await window.supabaseClient.auth.signOut();
                                dom.adminPasswordSubmit.disabled = false;
                                return;
                            }
                        }

                        dom.adminPasswordSubmit.disabled = false;
                        cleanup();
                        resolve(true);
                    } catch (e) {
                        console.error('Supabase admin auth error', e);
                        dom.adminError.textContent = 'Sign-in failed. Try again.';
                        dom.adminError.style.display = 'block';
                        dom.adminPasswordSubmit.disabled = false;
                    }
                } else {
                    // --- Fallback: SHA256 hash check ---
                    const hash = await sha256(password);
                    if (hash === ADMIN_HASH) {
                        cleanup();
                        resolve(true);
                    } else {
                        dom.adminError.style.display = 'block';
                        dom.adminPasswordInput.value = '';
                        dom.adminPasswordInput.focus();
                    }
                }
            }

            function onCancel() {
                cleanup();
                resolve(false);
            }

            function onKey(e) {
                if (e.key === 'Enter') onSubmit();
                if (e.key === 'Escape') onCancel();
            }

            dom.adminPasswordSubmit.addEventListener('click', onSubmit);
            dom.adminPasswordCancel.addEventListener('click', onCancel);
            dom.adminPasswordInput.addEventListener('keydown', onKey);
        });
    }

    function setAdminMode(enabled) {
        isAdmin = enabled;
        if (enabled) {
            dom.adminBar.classList.add('admin-active');
            dom.adminActions.style.display = 'flex';
            showToast('Admin mode enabled', 'success');
        } else {
            dom.adminBar.classList.remove('admin-active');
            dom.adminActions.style.display = 'none';
            showToast('Admin mode disabled', 'info');
        }
    }

    // Expose setAdminMode so supabase-integration.js can auto-restore admin sessions
    window.setAdminMode = setAdminMode;

    // ---------- Category Manager ----------

    function openCategoryManager() {
        renderCategoryList();
        dom.categoryManagerOverlay.classList.add('active');
        dom.newCategoryName.value = '';
        // Reset swatches: activate the first preset swatch
        const swatches = document.querySelectorAll('#colorPresets .color-swatch');
        swatches.forEach(s => s.classList.remove('active'));
        if (swatches.length > 0) swatches[0].classList.add('active');
        const customSwatch = document.querySelector('#colorPresets .custom-swatch');
        if (customSwatch) customSwatch.style.background = '';
        dom.newCategoryColor.value = '#5B6770';
    }

    function closeCategoryManager() {
        dom.categoryManagerOverlay.classList.remove('active');
    }

    function renderCategoryList() {
        if (categories.length === 0) {
            dom.categoryList.innerHTML = '<p style="text-align:center;color:var(--monmouth-gray);font-size:0.9rem;">No categories yet. Add one below.</p>';
            return;
        }
        let html = '';
        categories.forEach(cat => {
            const inUse = events.some(e => e.category === cat.name);
            html += '<div class="category-row">';
            html += '<span class="category-row-color" style="background:' + cat.color + '"></span>';
            html += '<span class="category-row-name">' + escapeHtml(cat.name) + '</span>';
            if (inUse) {
                html += '<span class="category-row-badge">In use</span>';
            }
            html += '<button class="category-row-delete" data-id="' + cat.id + '" title="Remove category"><i class="fas fa-trash"></i></button>';
            html += '</div>';
        });
        dom.categoryList.innerHTML = html;

        dom.categoryList.querySelectorAll('.category-row-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const cat = categories.find(c => c.id === id);
                const inUse = events.some(e => e.category === cat.name);
                const msg = inUse
                    ? '"' + cat.name + '" is used by existing events. Events will keep their category label but it won\'t appear in filters.'
                    : 'Are you sure you want to remove the "' + cat.name + '" category?';
                const ok = await showDeleteConfirm('Remove Category', msg, { icon: 'tags', buttonText: 'Remove', mode: 'warning' });
                if (!ok) return;
                await deleteCategory(id);
            });
        });
    }

    function getSelectedSwatchColor() {
        const active = document.querySelector('#colorPresets .color-swatch.active');
        if (active && active.dataset.color) return active.dataset.color;
        return dom.newCategoryColor.value;
    }

    async function addCategory() {
        const name = dom.newCategoryName.value.trim();
        const color = getSelectedSwatchColor();
        if (!name) {
            showToast('Enter a category name.', 'error');
            return;
        }
        if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            showToast('Category already exists.', 'error');
            return;
        }

        const category = { id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, color };
        categories.push(category);
        saveToStorage();
        showToast('Category "' + name + '" added!', 'success');
        render();
        renderCategoryList();
        dom.newCategoryName.value = '';
    }

    async function deleteCategory(id) {
        categories = categories.filter(c => c.id !== id);
        saveToStorage();
        showToast('Category removed.', 'success');
        render();
        renderCategoryList();
    }

    // ---------- Event Editor ----------

    function openEditor(event) {
        populateCategorySelect();

        if (event) {
            dom.editorTitle.textContent = 'Edit Event';
            dom.editEventId.value = event.id;
            dom.editTitle.value = event.title;
            dom.editDescription.value = event.description;
            dom.editCategory.value = event.category;
            dom.editLocation.value = event.location;
            dom.editStartTime.value = event.startTime;
            dom.editEndTime.value = event.endTime;

            const rec = event.recurrence;
            dom.editRecurrenceType.value = rec.type;

            if (rec.type === 'once') {
                dom.editOnceDate.value = rec.date;
            } else if (rec.type === 'weekly' || rec.type === 'biweekly') {
                dom.editWeekday.value = rec.day;
                dom.editStartDate.value = rec.startDate;
                dom.editEndDate.value = rec.endDate;
            } else if (rec.type === 'monthly') {
                dom.editDayOfMonth.value = rec.dayOfMonth;
                dom.editStartDate.value = rec.startDate;
                dom.editEndDate.value = rec.endDate;
            }
        } else {
            dom.editorTitle.textContent = 'Add Event';
            dom.editEventId.value = '';
            dom.editTitle.value = '';
            dom.editDescription.value = '';
            dom.editCategory.value = categories.length ? categories[0].name : 'Other';
            dom.editLocation.value = '';
            dom.editStartTime.value = '';
            dom.editEndTime.value = '';
            dom.editRecurrenceType.value = 'once';
            dom.editOnceDate.value = '';
            dom.editWeekday.value = '4';
            dom.editDayOfMonth.value = '';
            dom.editStartDate.value = '';
            dom.editEndDate.value = '';
        }

        updateRecurrenceFields();
        dom.eventEditorOverlay.classList.add('active');
    }

    function closeEditor() {
        dom.eventEditorOverlay.classList.remove('active');
    }

    function updateRecurrenceFields() {
        const type = dom.editRecurrenceType.value;
        const onceEls = dom.recurrenceFields.querySelectorAll('.recurrence-once');
        const weeklyEls = dom.recurrenceFields.querySelectorAll('.recurrence-weekly');
        const monthlyEls = dom.recurrenceFields.querySelectorAll('.recurrence-monthly');
        const rangeEls = dom.recurrenceFields.querySelectorAll('.recurrence-range');

        onceEls.forEach(el => el.style.display = type === 'once' ? 'block' : 'none');
        weeklyEls.forEach(el => el.style.display = (type === 'weekly' || type === 'biweekly') ? 'block' : 'none');
        monthlyEls.forEach(el => el.style.display = type === 'monthly' ? 'block' : 'none');
        rangeEls.forEach(el => el.style.display = type !== 'once' ? 'grid' : 'none');
    }

    function buildEventFromForm() {
        const title = dom.editTitle.value.trim();
        const description = dom.editDescription.value.trim();
        const category = dom.editCategory.value;
        const location = dom.editLocation.value.trim();
        const startTime = dom.editStartTime.value;
        const endTime = dom.editEndTime.value;
        const recType = dom.editRecurrenceType.value;

        if (!title || !startTime || !endTime || !location) {
            showToast('Please fill in all required fields.', 'error');
            return null;
        }

        let recurrence;
        if (recType === 'once') {
            if (!dom.editOnceDate.value) {
                showToast('Please select a date.', 'error');
                return null;
            }
            recurrence = { type: 'once', date: dom.editOnceDate.value };
        } else if (recType === 'weekly' || recType === 'biweekly') {
            if (!dom.editStartDate.value || !dom.editEndDate.value) {
                showToast('Please select start and end dates.', 'error');
                return null;
            }
            recurrence = {
                type: recType,
                day: parseInt(dom.editWeekday.value),
                startDate: dom.editStartDate.value,
                endDate: dom.editEndDate.value,
            };
        } else if (recType === 'monthly') {
            if (!dom.editDayOfMonth.value || !dom.editStartDate.value || !dom.editEndDate.value) {
                showToast('Please fill in all recurrence fields.', 'error');
                return null;
            }
            recurrence = {
                type: 'monthly',
                dayOfMonth: parseInt(dom.editDayOfMonth.value),
                startDate: dom.editStartDate.value,
                endDate: dom.editEndDate.value,
            };
        }

        return { title, description, category, location, startTime, endTime, recurrence };
    }

    // ---------- Supabase Helpers ----------

    function supabaseHeaders() {
        const h = { 'apikey': window.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
        if (window.supabaseClient && window.supabaseClient.auth) {
            try {
                // Use the current session token if available
                const session = window.supabaseClient.auth.session && window.supabaseClient.auth.session();
                const token = session && session.access_token;
                if (token) h['Authorization'] = 'Bearer ' + token;
            } catch (e) { /* ignore */ }
        }
        return h;
    }

    async function getSupabaseToken() {
        if (!window.supabaseClient || !window.supabaseClient.auth) return null;
        try {
            const { data } = await window.supabaseClient.auth.getSession();
            return data && data.session && data.session.access_token;
        } catch (e) { return null; }
    }

    function supabaseRestUrl(path) {
        return window.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/' + path;
    }

    // Convert a Supabase row to the calendar event format
    function rowToEvent(row) {
        return {
            id: row.id,
            title: row.title,
            description: row.description || '',
            location: row.location || '',
            category: row.category || 'Meeting',
            startTime: row.start_time_local || '',
            endTime: row.end_time_local || '',
            recurrence: row.recurrence || { type: 'once' },
            excludedDates: row.excluded_dates || [],
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    // Convert a calendar event to a Supabase row
    function eventToRow(evt) {
        return {
            title: evt.title,
            description: evt.description || '',
            location: evt.location || '',
            category: evt.category || 'Meeting',
            start_time_local: evt.startTime || '',
            end_time_local: evt.endTime || '',
            recurrence: evt.recurrence || { type: 'once' },
            excluded_dates: evt.excludedDates || [],
            is_published: true
        };
    }

    function hasSupabase() {
        return !!(window.supabaseClient && window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
    }

    // ---------- localStorage Persistence ----------

    const STORAGE_KEY_EVENTS = 'ieeeacm_events';
    const STORAGE_KEY_CATEGORIES = 'ieeeacm_categories';
    const STORAGE_KEY_SEEDED = 'ieeeacm_seeded';

    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    }

    async function loadEvents() {
        // Try loading from Supabase first
        if (hasSupabase()) {
            try {
                const token = await getSupabaseToken();
                const headers = { 'apikey': window.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = 'Bearer ' + token;

                const resp = await fetch(supabaseRestUrl('events?select=*&order=created_at.desc'), { headers });
                if (resp.ok) {
                    const rows = await resp.json();
                    if (rows && rows.length > 0) {
                        events = rows.map(rowToEvent);
                        // Derive categories from events
                        const catNames = [...new Set(events.map(e => e.category || 'Meeting'))];
                        categories = catNames.map(name => {
                            const existing = DEFAULT_CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase());
                            return existing || { id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, color: DEFAULT_COLOR };
                        });
                        saveToStorage();
                        render();
                        return;
                    }
                }
            } catch (e) {
                console.warn('Failed to load events from Supabase, falling back to local:', e);
            }
        }

        // Fallback: localStorage or static seed
        const seeded = localStorage.getItem(STORAGE_KEY_SEEDED);
        const storedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
        const storedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);

        if (seeded && storedEvents) {
            events = JSON.parse(storedEvents) || [];
            categories = JSON.parse(storedCategories) || [];
        } else {
            await seedFromStatic();
            localStorage.setItem(STORAGE_KEY_SEEDED, 'true');
            saveToStorage();
        }
        render();
    }

    const DEFAULT_CATEGORIES = [
        { id: 'meeting', name: 'Meeting', color: '#002855' },
        { id: 'workshop', name: 'Workshop', color: '#E57200' },
        { id: 'competition', name: 'Competition', color: '#6a1b9a' },
        { id: 'career', name: 'Career', color: '#2e7d32' },
        { id: 'social', name: 'Social', color: '#c62828' }
    ];

    const DEFAULT_EVENTS = [
        { id: 'evt-001', title: 'General Body Meeting', description: 'Regular chapter meeting open to all members. Discuss upcoming events, project updates, and chapter business.', location: 'Howard Hall, Room 221', category: 'Meeting', startTime: '13:15', endTime: '14:30', recurrence: { type: 'weekly', day: 4, startDate: '2026-01-22', endDate: '2026-05-14' }, createdAt: '2026-01-10T12:00:00Z', updatedAt: '2026-01-10T12:00:00Z' },
        { id: 'evt-002', title: 'AI Workshop: Portfolio Building', description: 'Learn to build your personal portfolio website using AI-powered tools and modern web technologies. Bring your laptop!', location: 'Edison Hall, Room 201', category: 'Workshop', startTime: '13:15', endTime: '14:30', recurrence: { type: 'biweekly', day: 3, startDate: '2026-02-04', endDate: '2026-04-29' }, createdAt: '2026-01-10T12:00:00Z', updatedAt: '2026-01-10T12:00:00Z' },
        { id: 'evt-003', title: 'Hackathon Prep Session', description: 'Prepare for upcoming hackathons with team formation, brainstorming, and practice problems.', location: 'Howard Hall, Room 221', category: 'Competition', startTime: '15:00', endTime: '17:00', recurrence: { type: 'monthly', dayOfMonth: 15, startDate: '2026-02-15', endDate: '2026-05-15' }, createdAt: '2026-01-10T12:00:00Z', updatedAt: '2026-01-10T12:00:00Z' },
        { id: 'evt-004', title: 'Resume & Career Workshop', description: 'Get your resume reviewed and practice interview skills with industry mentors and chapter advisors.', location: 'Howard Hall, Room 221', category: 'Career', startTime: '14:00', endTime: '15:30', recurrence: { type: 'once', date: '2026-03-20' }, createdAt: '2026-01-10T12:00:00Z', updatedAt: '2026-01-10T12:00:00Z' },
        { id: 'evt-005', title: 'End of Semester Social', description: 'Celebrate the end of the semester with food, games, and recognition of outstanding members.', location: 'Student Center, Anacon Hall', category: 'Social', startTime: '17:00', endTime: '19:00', recurrence: { type: 'once', date: '2026-05-08' }, createdAt: '2026-01-10T12:00:00Z', updatedAt: '2026-01-10T12:00:00Z' }
    ];

    async function seedFromStatic() {
        try {
            const resp = await fetch('events.json');
            const data = await resp.json();
            if (Array.isArray(data)) {
                events = data;
                categories = [];
            } else {
                events = data.events || [];
                categories = data.categories || [];
            }
        } catch {
            // Fallback: use embedded defaults (works with file:// protocol)
            events = JSON.parse(JSON.stringify(DEFAULT_EVENTS));
            categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
        }
    }

    // ---------- Recurrence Action Chooser ----------

    function showRecurrenceChooser(mode) {
        return new Promise((resolve) => {
            const overlay = document.getElementById('recurrenceChooser');
            const title = document.getElementById('recurrenceChooserTitle');
            const cancel = document.getElementById('recurrenceChooserCancel');
            const options = overlay.querySelectorAll('.recurrence-option');

            title.textContent = mode === 'delete' ? 'Delete recurring event' : 'Edit recurring event';

            // Toggle delete styling on "all" button
            options.forEach(btn => {
                btn.classList.toggle('delete-mode', mode === 'delete');
            });

            overlay.classList.add('active');

            function cleanup() {
                overlay.classList.remove('active');
                options.forEach(btn => btn.removeEventListener('click', onOption));
                cancel.removeEventListener('click', onCancel);
                overlay.removeEventListener('click', onOverlay);
            }

            function onOption(e) {
                const action = e.currentTarget.dataset.action;
                cleanup();
                resolve(action);
            }

            function onCancel() {
                cleanup();
                resolve(null);
            }

            function onOverlay(e) {
                if (e.target === overlay) { cleanup(); resolve(null); }
            }

            options.forEach(btn => btn.addEventListener('click', onOption));
            cancel.addEventListener('click', onCancel);
            overlay.addEventListener('click', onOverlay);
        });
    }

    function isRecurring(event) {
        return event.recurrence && event.recurrence.type !== 'once';
    }

    // ---------- Delete Confirmation Modal ----------

    function showDeleteConfirm(title, message, opts) {
        opts = opts || {};
        return new Promise((resolve) => {
            const overlay = document.getElementById('deleteConfirmModal');
            const titleEl = document.getElementById('deleteConfirmTitle');
            const msgEl = document.getElementById('deleteConfirmMessage');
            const iconWrap = document.getElementById('deleteConfirmIcon');
            const cancelBtn = document.getElementById('deleteConfirmCancel');
            const okBtn = document.getElementById('deleteConfirmOk');

            titleEl.textContent = title;
            msgEl.textContent = message;
            iconWrap.innerHTML = '<i class="fas fa-' + (opts.icon || 'trash-alt') + '"></i>';
            okBtn.textContent = opts.buttonText || 'Delete';

            // Apply mode class for different color schemes
            var box = overlay.querySelector('.delete-confirm-box');
            box.classList.toggle('mode-warning', opts.mode === 'warning');
            iconWrap.classList.toggle('mode-warning', opts.mode === 'warning');
            okBtn.classList.toggle('mode-warning', opts.mode === 'warning');

            overlay.classList.add('active');

            function cleanup() {
                overlay.classList.remove('active');
                cancelBtn.removeEventListener('click', onCancel);
                okBtn.removeEventListener('click', onConfirm);
                overlay.removeEventListener('click', onOverlay);
            }

            function onConfirm() { cleanup(); resolve(true); }
            function onCancel() { cleanup(); resolve(false); }
            function onOverlay(e) { if (e.target === overlay) { cleanup(); resolve(false); } }

            cancelBtn.addEventListener('click', onCancel);
            okBtn.addEventListener('click', onConfirm);
            overlay.addEventListener('click', onOverlay);
        });
    }

    // ---------- Delete Logic ----------

    async function handleDelete() {
        if (!selectedEvent) return;
        const { event, date } = selectedEvent;

        if (!isRecurring(event)) {
            const ok = await showDeleteConfirm('Delete Event', 'Are you sure you want to delete "' + event.title + '"? This action cannot be undone.');
            if (!ok) return;
            deleteEventAll(event.id);
            return;
        }

        const action = await showRecurrenceChooser('delete');
        if (!action) return;

        if (action === 'single') {
            deleteSingleOccurrence(event, date);
        } else if (action === 'following') {
            deleteFollowingOccurrences(event, date);
        } else if (action === 'all') {
            deleteEventAll(event.id);
        }
    }

    function deleteEventAll(id) {
        events = events.filter(e => e.id !== id);
        supabaseDeleteEvent(id);
        saveToStorage();
        showToast('All occurrences deleted.', 'success');
        render();
        closeEventModal();
    }

    function deleteSingleOccurrence(event, date) {
        const dateStr = toDateString(date);
        if (!event.excludedDates) event.excludedDates = [];
        event.excludedDates.push(dateStr);
        supabaseUpdateEvent(event.id, event);
        saveToStorage();
        showToast('This occurrence deleted.', 'success');
        render();
        closeEventModal();
    }

    function deleteFollowingOccurrences(event, date) {
        // End the recurrence the day before this occurrence
        const prev = new Date(date);
        prev.setDate(prev.getDate() - 1);
        const newEndDate = toDateString(prev);
        const rec = event.recurrence;

        if (newEndDate < rec.startDate) {
            // This is the first occurrence — just delete the whole event
            deleteEventAll(event.id);
            return;
        }

        rec.endDate = newEndDate;
        // Also clean up any excludedDates that are now past the new end
        if (event.excludedDates) {
            event.excludedDates = event.excludedDates.filter(d => d <= newEndDate);
        }
        supabaseUpdateEvent(event.id, event);
        saveToStorage();
        showToast('This and following occurrences deleted.', 'success');
        render();
        closeEventModal();
    }

    // ---------- Edit Logic ----------

    async function handleEdit() {
        if (!selectedEvent) return;
        const { event, date } = selectedEvent;

        if (!isRecurring(event)) {
            openEditor(event);
            return;
        }

        const action = await showRecurrenceChooser('edit');
        if (!action) return;

        if (action === 'single') {
            // Pre-fill editor with the event data but set recurrence to "once" for this date
            openEditorForSingle(event, date);
        } else if (action === 'following') {
            openEditorForFollowing(event, date);
        } else if (action === 'all') {
            openEditor(event);
        }
    }

    function openEditorForSingle(event, date) {
        openEditor(event);
        // Override recurrence to "once" for this specific date
        dom.editEventId.value = ''; // Treat as a new event
        dom.editEventId.dataset.editSingleSource = event.id;
        dom.editEventId.dataset.editSingleDate = toDateString(date);
        dom.editRecurrenceType.value = 'once';
        dom.editOnceDate.value = toDateString(date);
        updateRecurrenceFields();
    }

    function openEditorForFollowing(event, date) {
        openEditor(event);
        dom.editEventId.value = ''; // New event for the following portion
        dom.editEventId.dataset.editFollowingSource = event.id;
        dom.editEventId.dataset.editFollowingDate = toDateString(date);
        // Adjust recurrence start to this date
        const rec = event.recurrence;
        if (rec.type === 'weekly' || rec.type === 'biweekly') {
            dom.editStartDate.value = toDateString(date);
        } else if (rec.type === 'monthly') {
            dom.editStartDate.value = toDateString(date);
        }
        updateRecurrenceFields();
    }

    // --- Supabase CRUD helpers (called when admin is signed in) ---

    async function supabaseInsertEvent(eventData) {
        if (!hasSupabase() || !isAdmin) return null;
        try {
            const token = await getSupabaseToken();
            if (!token) return null;
            const row = eventToRow(eventData);
            const resp = await fetch(supabaseRestUrl('events'), {
                method: 'POST',
                headers: { 'apikey': window.SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
                body: JSON.stringify(row)
            });
            if (resp.ok) {
                const arr = await resp.json();
                return arr && arr[0] ? arr[0].id : null;
            }
            console.error('Supabase insert failed:', resp.status, await resp.text());
        } catch (e) { console.error('Supabase insert error:', e); }
        return null;
    }

    async function supabaseUpdateEvent(id, eventData) {
        if (!hasSupabase() || !isAdmin) return;
        try {
            const token = await getSupabaseToken();
            if (!token) return;
            const row = eventToRow(eventData);
            row.updated_at = new Date().toISOString();
            if (eventData.excludedDates) row.excluded_dates = eventData.excludedDates;
            await fetch(supabaseRestUrl('events?id=eq.' + id), {
                method: 'PATCH',
                headers: { 'apikey': window.SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify(row)
            });
        } catch (e) { console.error('Supabase update error:', e); }
    }

    async function supabaseDeleteEvent(id) {
        if (!hasSupabase() || !isAdmin) return;
        try {
            const token = await getSupabaseToken();
            if (!token) return;
            await fetch(supabaseRestUrl('events?id=eq.' + id), {
                method: 'DELETE',
                headers: { 'apikey': window.SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
            });
        } catch (e) { console.error('Supabase delete error:', e); }
    }

    // --- End Supabase CRUD ---

    async function saveEvent(eventData) {
        const id = dom.editEventId.value;
        const now = new Date().toISOString();

        // Handle "this event only" edit
        const singleSource = dom.editEventId.dataset.editSingleSource;
        const singleDate = dom.editEventId.dataset.editSingleDate;
        if (singleSource && singleDate) {
            const original = events.find(e => e.id === singleSource);
            if (original) {
                if (!original.excludedDates) original.excludedDates = [];
                original.excludedDates.push(singleDate);
                supabaseUpdateEvent(singleSource, original);
            }
            eventData.id = 'evt-' + Date.now();
            eventData.createdAt = now;
            eventData.updatedAt = now;
            events.push(eventData);

            // Insert new one-off event to Supabase
            const newId = await supabaseInsertEvent(eventData);
            if (newId) eventData.id = newId;

            delete dom.editEventId.dataset.editSingleSource;
            delete dom.editEventId.dataset.editSingleDate;

            saveToStorage();
            showToast('This occurrence updated!', 'success');
            render();
            closeEditor();
            closeEventModal();
            return;
        }

        // Handle "this and following" edit
        const followingSource = dom.editEventId.dataset.editFollowingSource;
        const followingDate = dom.editEventId.dataset.editFollowingDate;
        if (followingSource && followingDate) {
            const original = events.find(e => e.id === followingSource);
            if (original && original.recurrence) {
                const prev = new Date(followingDate + 'T00:00:00');
                prev.setDate(prev.getDate() - 1);
                const newEnd = toDateString(prev);
                if (newEnd < original.recurrence.startDate) {
                    events = events.filter(e => e.id !== followingSource);
                    supabaseDeleteEvent(followingSource);
                } else {
                    original.recurrence.endDate = newEnd;
                    if (original.excludedDates) {
                        original.excludedDates = original.excludedDates.filter(d => d <= newEnd);
                    }
                    supabaseUpdateEvent(followingSource, original);
                }
            }
            eventData.id = 'evt-' + Date.now();
            eventData.createdAt = now;
            eventData.updatedAt = now;
            events.push(eventData);

            const newId = await supabaseInsertEvent(eventData);
            if (newId) eventData.id = newId;

            delete dom.editEventId.dataset.editFollowingSource;
            delete dom.editEventId.dataset.editFollowingDate;

            saveToStorage();
            showToast('This and following events updated!', 'success');
            render();
            closeEditor();
            closeEventModal();
            return;
        }

        // Standard save (new event or "all events" edit)
        if (id) {
            eventData.id = id;
            eventData.updatedAt = now;
            const idx = events.findIndex(e => e.id === id);
            if (idx !== -1) {
                eventData.excludedDates = events[idx].excludedDates || [];
                events[idx] = { ...events[idx], ...eventData };
            }
            supabaseUpdateEvent(id, eventData);
            showToast('Event updated!', 'success');
        } else {
            eventData.createdAt = now;
            eventData.updatedAt = now;
            const newId = await supabaseInsertEvent(eventData);
            eventData.id = newId || ('evt-' + Date.now());
            events.push(eventData);
            showToast('Event created!', 'success');
        }

        saveToStorage();
        render();
        closeEditor();
        closeEventModal();
    }

    async function deleteEvent(id) {
        events = events.filter(e => e.id !== id);
        supabaseDeleteEvent(id);
        saveToStorage();
        showToast('Event deleted.', 'success');
        render();
        closeEventModal();
    }

    // ---------- View Switching ----------

    function setView(view) {
        currentView = view;

        // Toggle active button
        [dom.btnWeekView, dom.btnCalendarView, dom.btnYearView, dom.btnListView].forEach(btn => btn.classList.remove('active'));
        if (view === 'week') dom.btnWeekView.classList.add('active');
        else if (view === 'month') dom.btnCalendarView.classList.add('active');
        else if (view === 'year') dom.btnYearView.classList.add('active');
        else if (view === 'list') dom.btnListView.classList.add('active');

        // Toggle active container
        dom.weekViewWrapper.classList.remove('active');
        dom.calendarGridWrapper.classList.remove('active');
        dom.yearViewWrapper.classList.remove('active');
        dom.listView.classList.remove('active');

        if (view === 'week') dom.weekViewWrapper.classList.add('active');
        else if (view === 'month') dom.calendarGridWrapper.classList.add('active');
        else if (view === 'year') dom.yearViewWrapper.classList.add('active');
        else if (view === 'list') dom.listView.classList.add('active');

        render();
    }

    // ---------- Render ----------

    function render() {
        renderCategoryFilters();
        renderLegend();
        if (currentView === 'week') renderWeekView();
        else if (currentView === 'month') renderCalendarGrid();
        else if (currentView === 'year') renderYearView();
        else if (currentView === 'list') renderListView();
    }

    // ---------- Event Listeners ----------

    function init() {
        // View toggle
        dom.btnWeekView.addEventListener('click', () => setView('week'));
        dom.btnCalendarView.addEventListener('click', () => setView('month'));
        dom.btnYearView.addEventListener('click', () => setView('year'));
        dom.btnListView.addEventListener('click', () => setView('list'));

        // Navigation (prev/next step depends on current view)
        dom.btnPrevMonth.addEventListener('click', () => {
            if (currentView === 'week') {
                currentDate.setDate(currentDate.getDate() - 7);
            } else if (currentView === 'month') {
                currentDate.setMonth(currentDate.getMonth() - 1);
            } else if (currentView === 'year') {
                currentDate.setFullYear(currentDate.getFullYear() - 1);
            } else {
                currentDate.setMonth(currentDate.getMonth() - 1);
            }
            render();
        });

        dom.btnNextMonth.addEventListener('click', () => {
            if (currentView === 'week') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else if (currentView === 'month') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            } else if (currentView === 'year') {
                currentDate.setFullYear(currentDate.getFullYear() + 1);
            } else {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            render();
        });

        dom.btnToday.addEventListener('click', () => {
            currentDate = new Date();
            render();
        });

        // Date picker — jump to any date
        dom.datePicker.addEventListener('change', () => {
            const val = dom.datePicker.value;
            if (val) {
                currentDate = new Date(val + 'T00:00:00');
                render();
            }
        });

        // Category filters (delegated since they're dynamic)
        dom.categoryFilters.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-filter');
            if (!btn) return;
            activeCategory = btn.dataset.category;
            render();
        });

        // Event modal
        dom.modalClose.addEventListener('click', closeEventModal);
        dom.eventModal.addEventListener('click', (e) => {
            if (e.target === dom.eventModal) closeEventModal();
        });

        dom.btnIcal.addEventListener('click', () => {
            if (selectedEvent) downloadICS(selectedEvent.event, selectedEvent.date);
        });

        // Google Calendar — explicitly open URL on click
        dom.btnGcal.addEventListener('click', (e) => {
            e.preventDefault();
            if (selectedEvent) {
                const url = buildGoogleCalendarUrl(selectedEvent.event, selectedEvent.date);
                window.open(url, '_blank', 'noopener');
            }
        });

        // Admin toggle
        dom.adminToggle.addEventListener('change', async () => {
            if (dom.adminToggle.checked) {
                const granted = await promptAdminPassword();
                if (granted) {
                    setAdminMode(true);
                } else {
                    dom.adminToggle.checked = false;
                }
            } else {
                // Sign out of Supabase if active
                if (window.supabaseClient && window.supabaseClient.auth) {
                    try { await window.supabaseClient.auth.signOut(); } catch (e) { /* ignore */ }
                }
                setAdminMode(false);
            }
        });

        // Admin: Add event
        dom.btnAddEvent.addEventListener('click', () => openEditor(null));

        // Admin: Edit event from modal (with recurrence chooser)
        dom.btnEditEvent.addEventListener('click', () => handleEdit());

        // Admin: Delete event (with recurrence chooser)
        dom.btnDeleteEvent.addEventListener('click', () => handleDelete());

        // Admin: Manage categories
        dom.btnManageCategories.addEventListener('click', openCategoryManager);
        dom.categoryManagerClose.addEventListener('click', closeCategoryManager);
        dom.categoryManagerOverlay.addEventListener('click', (e) => {
            if (e.target === dom.categoryManagerOverlay) closeCategoryManager();
        });
        dom.btnAddCategory.addEventListener('click', addCategory);
        dom.newCategoryName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addCategory();
        });

        // Color preset swatches
        const colorPresetsEl = document.getElementById('colorPresets');
        if (colorPresetsEl) {
            colorPresetsEl.addEventListener('click', (e) => {
                const swatch = e.target.closest('.color-swatch');
                if (!swatch || swatch.classList.contains('custom-swatch')) return;
                colorPresetsEl.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                // Reset custom swatch appearance
                const customSwatch = colorPresetsEl.querySelector('.custom-swatch');
                if (customSwatch) customSwatch.style.background = '';
            });

            // Custom color swatch
            dom.newCategoryColor.addEventListener('input', () => {
                const customSwatch = colorPresetsEl.querySelector('.custom-swatch');
                if (!customSwatch) return;
                const color = dom.newCategoryColor.value;
                colorPresetsEl.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                customSwatch.classList.add('active');
                customSwatch.dataset.color = color;
                customSwatch.style.background = color;
            });
        }

        // Editor
        dom.editorClose.addEventListener('click', closeEditor);
        dom.editorCancel.addEventListener('click', closeEditor);
        dom.eventEditorOverlay.addEventListener('click', (e) => {
            if (e.target === dom.eventEditorOverlay) closeEditor();
        });

        dom.editRecurrenceType.addEventListener('change', updateRecurrenceFields);

        dom.editorSave.addEventListener('click', async () => {
            const eventData = buildEventFromForm();
            if (eventData) await saveEvent(eventData);
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeEventModal();
                closeEditor();
                closeCategoryManager();
            }
        });

        // Load events and render
        loadEvents();
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
