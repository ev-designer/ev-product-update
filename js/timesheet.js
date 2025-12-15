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
        { id: 3, date: '2025-12-11', staffName: 'Steven G.', inTime: '08:55', outTime: null, totalHours: '-', status: 'Working', remarks: '' }, // Today mock
        { id: 4, date: '2025-12-09', staffName: 'Alice M.', inTime: '08:00', outTime: '16:00', totalHours: '08:00', status: 'Present', remarks: '' },
        { id: 5, date: '2025-12-10', staffName: 'Bob D.', inTime: '10:00', outTime: '18:00', totalHours: '08:00', status: 'Present', remarks: '' }
    ],
    currentSession: {
        active: false,
        startTime: null, // milliseconds timestamp
        formattedStartTime: null, // HH:MM string for display/log consistency
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
            // Reconstruct likely start time
            const [h, m] = openLog.inTime.split(':').map(Number);
            const now = new Date();
            const assumedStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0).getTime();

            timesheetStore.currentSession = {
                active: true,
                startTime: assumedStart,
                formattedStartTime: openLog.inTime,
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
    setupStopwatch();

    // Initial Renders
    renderAttendance();
    renderProfile();

    // Set default report dates (First day of month to Today)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const fromEl = document.getElementById('report-from');
    const toEl = document.getElementById('report-to');

    if (fromEl && toEl) {
        fromEl.valueAsDate = firstDay;
        toEl.valueAsDate = today;
    }

    populateUserFilter();
    const userFilterInfo = document.getElementById('report-user-filter');
    if (userFilterInfo) {
        userFilterInfo.addEventListener('change', renderReports);
    }

    // Setup Forms
    const pForm = document.getElementById('profile-form');
    if (pForm) pForm.onsubmit = handleProfileUpdate;

    const eForm = document.getElementById('edit-entry-form');
    if (eForm) eForm.onsubmit = handleEntryUpdate;
});

// -- Logic --

function setupTabs() {
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            // Deactivate all
            tabs.forEach(t => {
                t.classList.remove('text-brand-600', 'border-brand-500');
                t.classList.add('text-gray-500', 'border-transparent');
            });
            Object.values(views).forEach(v => {
                if (v) v.classList.add('hidden');
            });

            // Activate current
            btn.classList.remove('text-gray-500', 'border-transparent');
            btn.classList.add('text-brand-600', 'border-brand-500');
            const target = btn.getAttribute('data-tab');
            if (views[target]) views[target].classList.remove('hidden');

            // Specific View Logic
            if (target === 'reports') renderReports();
        });
    });
}

// -- Stopwatch & Clock Logic --
function setupStopwatch() {
    const stopwatchEl = document.getElementById('stopwatch');
    if (!stopwatchEl) return;

    setInterval(() => {
        if (timesheetStore.currentSession.active && timesheetStore.currentSession.startTime) {
            const now = Date.now();
            const diff = now - timesheetStore.currentSession.startTime;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            stopwatchEl.textContent =
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            stopwatchEl.classList.add('text-brand-600', 'bg-brand-50', 'border-brand-200');
            stopwatchEl.classList.remove('text-gray-700', 'bg-gray-100', 'border-gray-200');
        } else {
            stopwatchEl.textContent = "00:00:00";
            stopwatchEl.classList.remove('text-brand-600', 'bg-brand-50', 'border-brand-200');
            stopwatchEl.classList.add('text-gray-700', 'bg-gray-100', 'border-gray-200');
        }

        // Also update date display if exists
        const dateDisplay = document.getElementById('current-date-display');
        if (dateDisplay) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
        }
    }, 1000);
}


// -- Attendance Section --

function renderAttendance() {
    const actionContainer = document.getElementById('header-action-container');
    const tbody = document.getElementById('attendance-table-body');

    // 1. Render Header Buttons (Clock In/Out) - Small is better
    if (actionContainer) {
        if (timesheetStore.currentSession.active) {
            actionContainer.innerHTML = `
                <button onclick="handleClockOut()" class="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded shadow-sm border border-transparent transition-transform transform active:scale-95 flex items-center gap-2">
                    <i data-lucide="log-out" class="w-4 h-4"></i> Clock Out
                </button>
            `;
        } else {
            actionContainer.innerHTML = `
                <button onclick="handleClockIn()" class="px-3 py-1.5 text-sm font-medium text-white bg-[#4a90e2] hover:bg-[#3b7bc4] rounded shadow-sm border border-transparent transition-transform transform active:scale-95 flex items-center gap-2">
                    <i data-lucide="log-in" class="w-4 h-4"></i> Clock In
                </button>
            `;
        }
        if (window.lucide) lucide.createIcons();
    }

    // 2. Render Attendance History (All logs sorted by date desc)
    if (tbody) {
        const sortedLogs = [...timesheetStore.logs].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedLogs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No attendance history found.</td></tr>';
        } else {
            tbody.innerHTML = sortedLogs.map(l => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-gray-900">${l.date}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">${l.inTime}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-500">${l.outTime || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-500 font-mono">${l.totalHours}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(l.status)}">
                            ${l.status}
                        </span>
                    </td>
                </tr>
            `).join('');
        }
    }
}

function handleClockIn() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const todayStr = now.toISOString().split('T')[0];

    // Check if already exist for today just in case
    const existing = timesheetStore.logs.find(l => l.date === todayStr);
    if (existing && existing.outTime === null) {
        alert("You are already clocked in!");
        return;
    }

    const newLog = {
        id: Date.now(),
        date: todayStr,
        staffId: 1, // Mock
        staffName: timesheetStore.profile.name,
        inTime: timeStr,
        outTime: null,
        totalHours: '-',
        status: 'Working', // Attendance marked as Present effectively on clock in (or Working until out)
        remarks: ''
    };

    timesheetStore.logs.push(newLog);
    timesheetStore.currentSession = {
        active: true,
        startTime: now.getTime(),
        formattedStartTime: timeStr,
        logId: newLog.id
    };

    saveStore();
    renderAttendance();
}

function handleClockOut() {
    // No remarks input anymore as per request
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // Update Log
    const logId = timesheetStore.currentSession.logId;
    const logIndex = timesheetStore.logs.findIndex(l => l.id === logId);

    if (logIndex > -1) {
        const log = timesheetStore.logs[logIndex];
        log.outTime = timeStr;
        log.status = 'Present';

        // Calculate Duration
        const start = parseTime(log.inTime); // returns minutes from midnight
        const end = parseTime(timeStr);
        let diffMins = end - start;
        if (diffMins < 0) diffMins = 0; // Fallback

        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        log.totalHours = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

        timesheetStore.logs[logIndex] = log;
    }

    timesheetStore.currentSession = { active: false, startTime: null, formattedStartTime: null, logId: null };

    saveStore();
    renderAttendance();
}

function parseTime(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

// -- Reports Section --

// -- Reports Section --

function populateUserFilter() {
    const select = document.getElementById('report-user-filter');
    if (!select) return;

    // Get unique users
    const users = [...new Set(timesheetStore.logs.map(l => l.staffName))].sort();

    // Keep 'All Users' default behavior but clear old opts
    select.innerHTML = '';

    users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.textContent = u;
        select.appendChild(opt);
    });
}

function renderReports() {
    const fromDateEl = document.getElementById('report-from');
    const toDateEl = document.getElementById('report-to');
    const userFilterEl = document.getElementById('report-user-filter');

    // Stats Elements
    const statStaff = document.getElementById('stat-total-staff');
    const statPresent = document.getElementById('stat-present');
    const statAbsent = document.getElementById('stat-absent');
    const statHours = document.getElementById('stat-total-hours');

    // Safety check
    const fromDate = fromDateEl ? fromDateEl.value : null;
    const toDate = toDateEl ? toDateEl.value : null;

    // Handle Multi-Select for User Filter
    let selectedUsers = [];
    if (userFilterEl) {
        selectedUsers = Array.from(userFilterEl.selectedOptions).map(opt => opt.value);
    }

    const tbody = document.getElementById('reports-table-body');
    if (!tbody) return;

    // Filter Logs
    const filtered = timesheetStore.logs.filter(l => {
        const lDate = l.date;
        if (fromDate && lDate < fromDate) return false;
        if (toDate && lDate > toDate) return false;
        if (selectedUsers.length > 0 && !selectedUsers.includes(l.staffName)) return false;
        return true;
    });

    // Calculate Stats
    // 1. Total Staff (Unique in filtered range or general? Usually distinct staff in logs)
    const uniqueStaff = new Set(filtered.map(l => l.staffName));
    if (statStaff) statStaff.textContent = uniqueStaff.size;

    // 2. Present/Absent Today (or in range? "Present Today" implies Today, but usually specific to filter results in general reports)
    // Let's stick to "In Range" counts if filtering, OR strictly Today if labels say "Today". 
    // The UI says "Present Today"/"Absent Today" - let's calculate for TODAY regardless of filter, 
    // OR if the user expects these to reflect the report. 
    // Given the prompt "Present/Absent counts" as general stats, let's make them reactive to the FILTERED VIEW for better utility,
    // but caption them effectively. I will treat them as "Present (Range)" / "Absent (Range)".
    // BUT the label is hardcoded HTML "Today". 
    // Let's calculate strictly for TODAY for the "Today" cards to be accurate to their labels.

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysLogs = timesheetStore.logs.filter(l => l.date === todayStr);
    const presentCount = todaysLogs.filter(l => l.status === 'Present' || l.status === 'Working').length;
    const absentCount = todaysLogs.filter(l => l.status === 'Absent').length;

    if (statPresent) statPresent.textContent = presentCount;
    if (statAbsent) statAbsent.textContent = absentCount;

    // 3. Total Hours (Range) - based on filtered data
    let totalMins = 0;
    filtered.forEach(l => {
        if (l.totalHours && l.totalHours !== '-') {
            const [h, m] = l.totalHours.split(':').map(Number);
            totalMins += (h * 60) + m;
        }
    });
    const totalH = Math.floor(totalMins / 60);
    const totalM = totalMins % 60;
    if (statHours) statHours.textContent = `${String(totalH).padStart(2, '0')}:${String(totalM).padStart(2, '0')}`;


    // Render Table
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No logs found for this period.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(l => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-gray-900">${l.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">${l.staffName}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">${l.status === 'Absent' ? '-' : (l.inTime || '-')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500">${l.status === 'Absent' ? '-' : (l.outTime || '-')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-500 font-mono">${l.status === 'Absent' ? '00:00' : l.totalHours}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(l.status)}">
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

function exportReport(type) {
    if (type === 'pdf') alert("Exporting to PDF... (Feature Placeholder)");
    if (type === 'excel') alert("Exporting to Excel... (Feature Placeholder)");
    // In real app, generate Blob/CSV or use jspdf/sheetjs
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
    const els = {
        name: document.getElementById('profile-name'),
        role: document.getElementById('profile-role'),
        email: document.getElementById('profile-email'),
        phone: document.getElementById('profile-phone'),
        shift: document.getElementById('profile-shift')
    };

    if (els.name) els.name.value = p.name;
    if (els.role) els.role.value = p.role;
    if (els.email) els.email.value = p.email;
    if (els.phone) els.phone.value = p.phone;
    if (els.shift) els.shift.value = p.shift;
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

    if (modal) modal.classList.remove('hidden');

    // Populate Fields
    document.getElementById('edit-id').value = log.id;
    document.getElementById('edit-date').value = log.date;
    document.getElementById('edit-remarks').value = log.remarks || '';

    // Status (Radio)
    const status = log.status === 'Working' ? 'Present' : log.status; // Normalize Working->Present
    const radio = document.querySelector(`input[name="status"][value="${status}"]`);
    if (radio) radio.checked = true;

    // Toggle Fields
    toggleTimeFields(status === 'Present');

    // Time fields
    document.getElementById('edit-in').value = log.inTime ? log.inTime.slice(0, 5) : '';
    document.getElementById('edit-out').value = log.outTime ? log.outTime.slice(0, 5) : '';
}

function toggleTimeFields(isPresent) {
    const container = document.getElementById('time-fields-container');
    if (container) {
        if (isPresent) {
            container.classList.remove('hidden');
            container.classList.add('grid');
        } else {
            container.classList.add('hidden');
            container.classList.remove('grid');
        }
    }
}

function closeTimesheetModal() {
    if (modal) modal.classList.add('hidden');
}



function handleEntryUpdate(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);
    const date = document.getElementById('edit-date').value;
    const remarks = document.getElementById('edit-remarks').value;

    // Get status from radio
    const statusEl = document.querySelector('input[name="status"]:checked');
    const status = statusEl ? statusEl.value : 'Present';

    const logIndex = timesheetStore.logs.findIndex(l => l.id === id);
    if (logIndex > -1) {
        const log = timesheetStore.logs[logIndex];

        // Block modification if date is in future? (Optional requirement check)
        const todayStr = new Date().toISOString().split('T')[0];
        if (date > todayStr) {
            alert("Cannot modify future dates.");
            return;
        }

        log.date = date;
        log.remarks = remarks;
        log.status = status;

        if (status === 'Absent') {
            log.inTime = null;
            log.outTime = null;
            log.totalHours = '00:00';
        } else {
            // Present
            const inTime = document.getElementById('edit-in').value;
            const outTime = document.getElementById('edit-out').value;
            log.inTime = inTime;
            log.outTime = outTime;

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
        }

        timesheetStore.logs[logIndex] = log;
        saveStore();
        renderReports();
        renderAttendance();
        closeTimesheetModal();
    }
}

function deleteTimesheetEntry() {
    const id = parseInt(document.getElementById('edit-id').value);
    if (confirm("Are you sure you want to delete this timesheet entry?")) {
        timesheetStore.logs = timesheetStore.logs.filter(l => l.id !== id);
        saveStore();
        renderReports();
        renderAttendance();
        closeTimesheetModal();
    }
}
