// Timesheet Data Store
const timesheetStore = {
    profile: {
        name: 'Steven G.',
        role: 'Administrator',
        email: 'steven@enlightvision.com',
        phone: '+1 (555) 0123-4567',
        shift: 'Morning'
    },
    logs: [
        // Mock Logs
        { id: 1, date: '2025-12-09', staffName: 'Steven G.', inTime: '09:00', outTime: '17:00', totalHours: '08:00', status: 'Present', remarks: '' },
        { id: 2, date: '2025-12-10', staffName: 'Steven G.', inTime: '09:15', outTime: '17:10', totalHours: '07:55', status: 'Present', remarks: 'Traffic' },
        { id: 3, date: '2025-12-11', staffName: 'Steven G.', inTime: '08:55', outTime: null, totalHours: '-', status: 'Working', remarks: '' } // Today mock
    ],
    currentSession: {
        active: false,
        startTime: null,
        logId: null
    }
};

// Check LocalStorage or Init
function initStore() {
    const saved = localStorage.getItem('ev_timesheet_store');
    if (saved) {
        const parsed = JSON.parse(saved);
        timesheetStore.profile = parsed.profile;
        timesheetStore.logs = parsed.logs;
        timesheetStore.currentSession = parsed.currentSession;
    } else {
        // Init logic: Check if we have an open log for today in mocks
        const todayStr = new Date().toISOString().split('T')[0];
        const openLog = timesheetStore.logs.find(l => l.date === todayStr && !l.outTime);
        if (openLog) {
            timesheetStore.currentSession = {
                active: true,
                startTime: openLog.inTime, // This is string "HH:MM", we store it simple
                logId: openLog.id
            };
        }
    }
}

function saveStore() {
    localStorage.setItem('ev_timesheet_store', JSON.stringify(timesheetStore));
}

// -- DOM Elements --
const tabs = document.querySelectorAll('.timesheet-tab-btn');
const views = {
    attendance: document.getElementById('attendance-view'),
    reports: document.getElementById('reports-view'),
    profile: document.getElementById('profile-view')
};

// -- Init --
document.addEventListener('DOMContentLoaded', () => {
    initStore();
    setupTabs();
    setupLiveClock();

    // Initial Renders
    renderAttendance();
    renderProfile();

    // Set default report dates (First day of month to Today)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('report-from').valueAsDate = firstDay;
    document.getElementById('report-to').valueAsDate = today;

    // Setup Forms
    document.getElementById('profile-form').onsubmit = handleProfileUpdate;
    document.getElementById('edit-entry-form').onsubmit = handleEntryUpdate;
});

// -- Logic --

function setupLiveClock() {
    const clockEl = document.getElementById('live-clock');
    const dateEl = document.getElementById('live-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    setInterval(() => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        dateEl.textContent = now.toLocaleDateString('en-US', options);
    }, 1000);
}

function setupTabs() {
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            // Deactivate all
            tabs.forEach(t => {
                t.classList.remove('text-brand-600', 'border-brand-500');
                t.classList.add('text-gray-500', 'border-transparent');
            });
            Object.values(views).forEach(v => v.classList.add('hidden'));

            // Activate current
            btn.classList.remove('text-gray-500', 'border-transparent');
            btn.classList.add('text-brand-600', 'border-brand-500');
            const target = btn.getAttribute('data-tab');
            views[target].classList.remove('hidden');

            // Specific View Logic
            if (target === 'reports') renderReports();
        });
    });
}

// -- Attendance Section --

function renderAttendance() {
    const statusBadges = document.getElementById('status-badge');
    const actionContainer = document.getElementById('action-container');
    const remarksInput = document.getElementById('clock-remarks');

    // 1. Render Status
    if (timesheetStore.currentSession.active) {
        statusBadges.textContent = 'Clocked In';
        statusBadges.className = 'inline-flex items-center px-3 py-1 border border-green-200 text-sm font-medium bg-green-50 text-green-700';

        // Render Clock Out Button
        actionContainer.innerHTML = `
            <button onclick="handleClockOut()" class="w-full py-4 text-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg border border-transparent transition-transform transform active:scale-95">
                Clock Out
            </button>
        `;
        remarksInput.classList.remove('hidden');
    } else {
        statusBadges.textContent = 'Clocked Out';
        statusBadges.className = 'inline-flex items-center px-3 py-1 border border-gray-200 text-sm font-medium bg-gray-50 text-gray-500';

        // Render Clock In Button
        actionContainer.innerHTML = `
            <button onclick="handleClockIn()" class="w-full py-4 text-xl font-bold text-white bg-[#4a90e2] hover:bg-[#3b7bc4] shadow-lg border border-transparent transition-transform transform active:scale-95">
                Clock In
            </button>
        `;
        remarksInput.classList.add('hidden');
    }

    // 2. Render Today's Logs
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysLogs = timesheetStore.logs.filter(l => l.date === todayStr);
    const tbody = document.getElementById('today-table-body');

    if (todaysLogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No activity today.</td></tr>';
    } else {
        tbody.innerHTML = todaysLogs.map(l => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">${l.inTime}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${l.outTime || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${l.totalHours}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500 italic">${l.remarks || '-'}</td>
            </tr>
        `).join('');
    }
}

function handleClockIn() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const todayStr = now.toISOString().split('T')[0];

    const newLog = {
        id: Date.now(),
        date: todayStr,
        staffId: 1, // Mock
        staffName: timesheetStore.profile.name,
        inTime: timeStr,
        outTime: null,
        totalHours: '-',
        status: 'Working',
        remarks: ''
    };

    timesheetStore.logs.push(newLog);
    timesheetStore.currentSession = {
        active: true,
        startTime: timeStr,
        logId: newLog.id
    };

    saveStore();
    renderAttendance();
}

function handleClockOut() {
    const remarks = document.getElementById('clock-remarks').value;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // Update Log
    const logId = timesheetStore.currentSession.logId;
    const logIndex = timesheetStore.logs.findIndex(l => l.id === logId);

    if (logIndex > -1) {
        const log = timesheetStore.logs[logIndex];
        log.outTime = timeStr;
        log.remarks = remarks;
        log.status = 'Present';

        // Calculate Duration
        const start = parseTime(log.inTime); // returns minutes from midnight
        const end = parseTime(timeStr);
        const diffMins = end - start;
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        log.totalHours = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

        timesheetStore.logs[logIndex] = log;
    }

    timesheetStore.currentSession = { active: false, startTime: null, logId: null };
    document.getElementById('clock-remarks').value = ''; // Reset

    saveStore();
    renderAttendance();
}

function parseTime(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

// -- Reports Section --

function renderReports() {
    const fromDate = document.getElementById('report-from').value;
    const toDate = document.getElementById('report-to').value;
    const tbody = document.getElementById('reports-table-body');

    const filtered = timesheetStore.logs.filter(l => {
        if (!fromDate && !toDate) return true;
        const lDate = l.date;
        if (fromDate && lDate < fromDate) return false;
        if (toDate && lDate > toDate) return false;
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No logs found for this period.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(l => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-gray-900">${l.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">${l.staffName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">${l.inTime}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">${l.outTime || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500 font-mono">${l.totalHours}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold ${getStatusClass(l.status)}">
                    ${l.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                 <button onclick="openEditModal(${l.id})" class="text-[#4a90e2] hover:text-[#3b7bc4]">
                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                 </button>
            </td>
        </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function getStatusClass(status) {
    switch (status) {
        case 'Present': return 'bg-green-100 text-green-800';
        case 'Absent': return 'bg-red-100 text-red-800';
        case 'Late': return 'bg-yellow-100 text-yellow-800';
        case 'Working': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// -- Profile Section --

function renderProfile() {
    const p = timesheetStore.profile;
    document.getElementById('profile-name').value = p.name;
    document.getElementById('profile-role').value = p.role;
    document.getElementById('profile-email').value = p.email;
    document.getElementById('profile-phone').value = p.phone;
    document.getElementById('profile-shift').value = p.shift;
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    timesheetStore.profile = {
        name: formData.get('name'),
        role: formData.get('role'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        shift: formData.get('shift')
    };
    saveStore();
    alert('Profile updated successfully!');
}

// -- Edit Modal --

const modal = document.getElementById('timesheet-modal-overlay');

function openEditModal(id) {
    const log = timesheetStore.logs.find(l => l.id === id);
    if (!log) return;

    document.getElementById('edit-id').value = log.id;
    document.getElementById('edit-date').value = log.date;
    // Format times for input[type="time"] (HH:MM is mostly enough if valid)
    document.getElementById('edit-in').value = log.inTime ? log.inTime.slice(0, 5) : '';
    document.getElementById('edit-out').value = log.outTime ? log.outTime.slice(0, 5) : '';
    document.getElementById('edit-status').value = log.status === 'Working' ? 'Present' : log.status;
    document.getElementById('edit-remarks').value = log.remarks || '';

    modal.classList.remove('hidden');
}

function closeTimesheetModal() {
    modal.classList.add('hidden');
}

function handleEntryUpdate(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);
    const date = document.getElementById('edit-date').value;
    const inTime = document.getElementById('edit-in').value;
    const outTime = document.getElementById('edit-out').value;
    const status = document.getElementById('edit-status').value;
    const remarks = document.getElementById('edit-remarks').value;

    const logIndex = timesheetStore.logs.findIndex(l => l.id === id);
    if (logIndex > -1) {
        const log = timesheetStore.logs[logIndex];
        log.date = date;
        log.inTime = inTime;
        log.outTime = outTime;
        log.status = status;
        log.remarks = remarks;

        // Recalculate hours
        if (inTime && outTime) {
            const start = parseTime(inTime);
            const end = parseTime(outTime);
            const diffMins = end - start;
            if (diffMins > 0) {
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                log.totalHours = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
            } else {
                log.totalHours = '00:00';
            }
        } else {
            log.totalHours = '-';
        }

        timesheetStore.logs[logIndex] = log;
        saveStore();
        renderReports(); // Refresh report view
        renderAttendance(); // Refresh attendance view (in case we edited today)
        closeTimesheetModal();
    }
}
