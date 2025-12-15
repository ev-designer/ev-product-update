// Timesheet Data Store
const timesheetStore = {
    profile: {
        name: 'Steven G.',
        role: 'Administrator',
        email: 'steven@enlightvision.com',
        phone: '+1 (555) 0123-4567',
        shift: 'Morning',
        gender: 'Male',
        photo: null,
        idProofs: [],
        joiningDate: '',
        referenceFrom: '',
        location: ''
    },
    logs: [

        // Mock Logs
        { id: 1, date: '2025-12-09', staffName: 'Steven G.', inTime: '09:00', outTime: '17:00', totalHours: '08:00', status: 'Present', remarks: '' },
        { id: 2, date: '2025-12-10', staffName: 'Steven G.', inTime: '09:15', outTime: '17:10', totalHours: '07:55', status: 'Present', remarks: 'Traffic' },
        { id: 3, date: '2025-12-11', staffName: 'Steven G.', inTime: '08:55', outTime: null, totalHours: '-', status: 'Working', remarks: '' }, // Today mock
        { id: 4, date: '2025-12-09', staffName: 'Alice M.', inTime: '08:00', outTime: '16:00', totalHours: '08:00', status: 'Present', remarks: '' },
        { id: 5, date: '2025-12-10', staffName: 'Bob D.', inTime: '10:00', outTime: '18:00', totalHours: '08:00', status: 'Present', remarks: '' },

        // New Users
        { id: 6, date: '2025-12-09', staffName: 'David K.', inTime: '09:30', outTime: '18:30', totalHours: '09:00', status: 'Present', remarks: '' },
        { id: 7, date: '2025-12-09', staffName: 'Sarah L.', inTime: '08:45', outTime: '17:15', totalHours: '08:30', status: 'Present', remarks: '' },
        { id: 8, date: '2025-12-09', staffName: 'Michael B.', inTime: '-', outTime: '-', totalHours: '00:00', status: 'Absent', remarks: 'Sick' },

        { id: 9, date: '2025-12-10', staffName: 'David K.', inTime: '09:30', outTime: '18:30', totalHours: '09:00', status: 'Present', remarks: '' },
        { id: 10, date: '2025-12-10', staffName: 'Sarah L.', inTime: '09:00', outTime: '17:00', totalHours: '08:00', status: 'Present', remarks: '' },
        { id: 11, date: '2025-12-10', staffName: 'Michael B.', inTime: '10:00', outTime: '16:00', totalHours: '06:00', status: 'Present', remarks: 'Half day' },

        { id: 12, date: '2025-12-11', staffName: 'David K.', inTime: '09:30', outTime: null, totalHours: '-', status: 'Working', remarks: '' },
        { id: 13, date: '2025-12-11', staffName: 'Sarah L.', inTime: '08:50', outTime: null, totalHours: '-', status: 'Working', remarks: '' },
        { id: 14, date: '2025-12-11', staffName: 'Michael B.', inTime: '09:05', outTime: null, totalHours: '-', status: 'Working', remarks: '' },

        // Batch 3 - More Users (Emily, James, Linda, Robert, Jennifer)
        // Dec 10
        { id: 20, date: '2025-12-10', staffName: 'Emily R.', inTime: '08:55', outTime: '17:05', totalHours: '08:10', status: 'Present', remarks: '' },
        { id: 21, date: '2025-12-10', staffName: 'James T.', inTime: '09:10', outTime: '17:10', totalHours: '08:00', status: 'Present', remarks: '' },
        { id: 22, date: '2025-12-10', staffName: 'Linda W.', inTime: '-', outTime: '-', totalHours: '00:00', status: 'Absent', remarks: 'Personal Leave' },

        // Dec 11
        { id: 30, date: '2025-12-11', staffName: 'Emily R.', inTime: '09:00', outTime: null, totalHours: '-', status: 'Working', remarks: '' },
        { id: 31, date: '2025-12-11', staffName: 'James T.', inTime: '09:15', outTime: null, totalHours: '-', status: 'Working', remarks: '' },
        { id: 32, date: '2025-12-11', staffName: 'Linda W.', inTime: '08:30', outTime: null, totalHours: '-', status: 'Working', remarks: '' },
        { id: 33, date: '2025-12-11', staffName: 'Robert C.', inTime: '10:00', outTime: null, totalHours: '-', status: 'Working', remarks: 'Late Start' },
        { id: 34, date: '2025-12-11', staffName: 'Jennifer A.', inTime: '08:45', outTime: null, totalHours: '-', status: 'Working', remarks: '' },

        // Dec 15 (Today)
        { id: 40, date: '2025-12-15', staffName: 'Steven G.', inTime: '10:00', outTime: '10:01', totalHours: '00:01', status: 'Present', remarks: '' },
        { id: 41, date: '2025-12-15', staffName: 'Steven G.', inTime: '10:05', outTime: null, totalHours: '-', status: 'Working', remarks: '' },
        { id: 42, date: '2025-12-15', staffName: 'Steven G.', inTime: '10:10', outTime: '10:11', totalHours: '00:01', status: 'Present', remarks: '' },
        { id: 43, date: '2025-12-15', staffName: 'Steven G.', inTime: '10:15', outTime: '10:16', totalHours: '00:01', status: 'Present', remarks: '' },
        { id: 44, date: '2025-12-15', staffName: 'Steven G.', inTime: '10:20', outTime: '10:21', totalHours: '00:01', status: 'Present', remarks: '' }
    ],
    currentSession: {
        active: false,
        startTime: null, // milliseconds timestamp
        formattedStartTime: null, // HH:MM string for display/log consistency
        logId: null
    }
};

let reportState = {}; // Store state: { '2025-12-09': { expanded: boolean, selectedUsers: string[], dropdownOpen: boolean } }

// Check LocalStorage or Init
function initStore() {
    const saved = localStorage.getItem('ev_timesheet_store_v2');
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
    localStorage.setItem('ev_timesheet_store_v2', JSON.stringify(timesheetStore));
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

function populateUserFilter() {
    // No-op: Removed global filter as per design change
}

// Global click listener for closing dropdowns
document.addEventListener('click', (e) => {
    // If click is not inside a dropdown toggle or menu, close all
    if (!e.target.closest('.user-multiselect-dropdown') && !e.target.closest('.user-multiselect-btn')) {
        Object.keys(reportState).forEach(date => {
            if (reportState[date].dropdownOpen) {
                reportState[date].dropdownOpen = false;
                renderReports(); // Re-render to close
            }
        });
    }
});

function renderReports() {
    const fromDateEl = document.getElementById('report-from');
    const toDateEl = document.getElementById('report-to');

    // Stats Elements - REMOVED
    // const statStaff = document.getElementById('stat-total-staff');
    // const statPresent = document.getElementById('stat-present');
    // const statAbsent = document.getElementById('stat-absent');
    // const statHours = document.getElementById('stat-total-hours');

    const fromDate = fromDateEl ? fromDateEl.value : null;
    const toDate = toDateEl ? toDateEl.value : null;

    const tbody = document.getElementById('reports-table-body');
    if (!tbody) return;

    // 1. Filter Logs by Date Range Only
    const filteredLogs = timesheetStore.logs.filter(l => {
        const lDate = l.date;
        if (fromDate && lDate < fromDate) return false;
        if (toDate && lDate > toDate) return false;
        return true;
    });

    // 2. Stats calculation - REMOVED
    // const uniqueStaff = new Set(filteredLogs.map(l => l.staffName));
    // if (statStaff) statStaff.textContent = uniqueStaff.size;
    // ... etc

    // 3. Group by Date
    const grouped = filteredLogs.reduce((acc, log) => {
        if (!acc[log.date]) acc[log.date] = [];
        acc[log.date].push(log);
        return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort().reverse();

    if (sortedDates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No logs found for this period.</td></tr>';
        return;
    }

    // 4. Render Rows
    // 4. Render Rows
    // 4. Render Rows
    tbody.innerHTML = sortedDates.map(date => {
        const dayLogs = grouped[date];
        const dayUsers = [...new Set(dayLogs.map(l => l.staffName))].sort();

        if (!reportState[date]) {
            reportState[date] = {
                expanded: false,
                actionMenuLogId: null,
                exportMenuOpen: false
            };
        }

        const state = reportState[date];

        return `
            <!-- Main Row -->
            <tr onclick="toggleAccordion('${date}')" class="hover:bg-gray-50 border-b border-gray-100 transition-colors bg-white cursor-pointer">
                <td class="px-6 py-4 whitespace-nowrap text-gray-900 font-bold align-top pt-5">${date}</td>
                
                <!-- Users Column Hidden -->

                <td class="px-6 py-4 whitespace-nowrap text-right align-top pt-5">
                    <button class="text-gray-400 hover:text-brand-600 transition-colors bg-transparent border-0 cursor-pointer">
                        ${state.expanded
                ? '<i data-lucide="chevron-up" class="w-5 h-5"></i>'
                : '<i data-lucide="chevron-down" class="w-5 h-5"></i>'}
                    </button>
                </td>
            </tr>

            <!-- Accordion Detail Row -->
            <tr class="${state.expanded ? '' : 'hidden'} bg-white">
                <td colspan="3" class="px-0 py-4 border-b border-gray-100">
                    <div class="px-6 pb-2 flex justify-end relative">
                         <button onclick="toggleExportMenu('${date}', event)" class="p-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors bg-white cursor-pointer" title="Export Options">
                            <i data-lucide="download" class="w-4 h-4"></i>
                         </button>
                         
                         ${state.exportMenuOpen ? `
                            <div class="absolute right-6 top-12 w-48 bg-white border border-gray-200 shadow-lg rounded-sm z-20 export-menu-dropdown origin-top-right animate-in fade-in zoom-in-95 duration-100" style="margin-top: -10px;">
                                <div class="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-gray-50">
                                    <span class="font-bold text-gray-800 text-sm">Export Options</span>
                                    <i data-lucide="upload" class="w-4 h-4 text-gray-400"></i>
                                </div>
                                <button onclick="exportDateReport('${date}', 'pdf')" class="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors border-b border-gray-50 flex items-center gap-2 cursor-pointer">
                                    Export As PDF
                                </button>
                                <button onclick="exportDateReport('${date}', 'excel')" class="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors flex items-center gap-2 cursor-pointer">
                                    Export As Excel
                                </button>
                            </div>
                         ` : ''}
                    </div>

                    <div class="px-6">
                        <div class="bg-white border border-gray-200 rounded-sm">
                            <table class="min-w-full divide-y divide-gray-200" style="min-width: 100%;">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Name</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">In</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Out</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hours</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    ${dayLogs.map(l => `
                                        <tr class="hover:bg-gray-50 group">
                                            <td onclick="event.stopPropagation(); openEditModal(${l.id})" class="px-6 py-3 text-sm text-gray-900 font-bold cursor-pointer hover:text-brand-600 transition-colors" title="Click to edit">${l.staffName}</td>
                                            <td class="px-6 py-3 text-sm text-gray-500">${l.inTime || '-'}</td>
                                            <td class="px-6 py-3 text-sm text-gray-500">${l.outTime || '-'}</td>
                                            <td class="px-6 py-3 text-sm text-gray-500 font-mono">${l.totalHours}</td>
                                            <td class="px-6 py-3 text-sm">
                                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(l.status)}" style="border-radius: 50px !important;">
                                                    ${l.status}
                                                </span>
                                            </td>
                                            <td class="px-6 py-3 text-right text-sm">
                                                <div class="flex items-center justify-end gap-2">
                                                    <button type="button" onclick="event.stopPropagation(); openEditModal(${l.id})" class="text-gray-400 hover:text-brand-600 p-1 transition-colors cursor-pointer" title="Edit">
                                                        <i data-lucide="edit-2" class="w-4 h-4"></i>
                                                    </button>
                                                    <button type="button" onclick="event.stopPropagation(); deleteLogEntry(${l.id})" class="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer" title="Delete">
                                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

function renderUserDropdown(date, allUsers, state) {
    const isAll = state.selectedUsers.length === allUsers.length;
    const count = state.selectedUsers.length;
    const label = isAll ? 'All Users' : `${count} User${count !== 1 ? 's' : ''}`;

    return `
        <div class="relative w-full max-w-xs user-multiselect-dropdown">
            <button type="button" onclick="toggleDropdown('${date}')" 
                class="user-multiselect-btn w-full bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded-md shadow-sm text-left text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 flex justify-between items-center group hover:border-brand-300">
                <span class="truncate block">${label}</span>
                <i data-lucide="chevron-down" class="w-4 h-4 text-gray-400 group-hover:text-brand-500"></i>
            </button>
            
            <div class="${state.dropdownOpen ? 'block' : 'hidden'} absolute z-50 mt-1 w-full bg-white shadow-xl rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                 <div class="px-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center" onclick="toggleSelectAll('${date}', ${!isAll})">
                    <input type="checkbox" ${isAll ? 'checked' : ''} class="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 pointer-events-none">
                    <span class="ml-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Select All</span>
                </div>
                
                ${allUsers.map(u => {
        const isSelected = state.selectedUsers.includes(u);
        return `
                        <div class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer" onclick="toggleUserSelection('${date}', '${u}')">
                             <input type="checkbox" ${isSelected ? 'checked' : ''} class="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 pointer-events-none">
                             <span class="ml-2 text-sm text-gray-700">${u}</span>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;
}

function toggleDropdown(date) {
    if (reportState[date]) {
        // Toggle
        reportState[date].dropdownOpen = !reportState[date].dropdownOpen;
        renderReports();
    }
}

function toggleAccordion(date) {
    if (reportState[date]) {
        reportState[date].expanded = !reportState[date].expanded;
        renderReports();
    }
}

function toggleUserSelection(date, user) {
    if (reportState[date]) {
        const idx = reportState[date].selectedUsers.indexOf(user);
        if (idx > -1) {
            reportState[date].selectedUsers.splice(idx, 1);
        } else {
            reportState[date].selectedUsers.push(user);
        }
        reportState[date].expanded = true;
        renderReports();
    }
}

function toggleSelectAll(date, shouldSelectAll) {
    if (reportState[date]) {
        const filteredLogs = timesheetStore.logs.filter(l => l.date === date);
        const allUsers = [...new Set(filteredLogs.map(l => l.staffName))];

        if (shouldSelectAll) {
            reportState[date].selectedUsers = [...allUsers];
            reportState[date].expanded = true;
        } else {
            reportState[date].selectedUsers = [];
        }
        renderReports();
    }
}

function exportReport(type) {
    if (type === 'pdf') alert("Exporting to PDF... (Feature Placeholder)");
    if (type === 'excel') alert("Exporting to Excel... (Feature Placeholder)");
    // In real app, generate Blob/CSV or use jspdf/sheetjs
}

function exportDateReport(date, type) {
    if (!type) {
        alert(`Exporting ${date}...`);
        return;
    }
    alert(`Exporting report for date: ${date} as ${type.toUpperCase()}...`);
    // Close menu
    if (reportState[date]) {
        reportState[date].exportMenuOpen = false;
        renderReports();
    }
}

function toggleExportMenu(date, event) {
    if (event) event.stopPropagation();
    const state = reportState[date];
    // Close other export menus?
    Object.keys(reportState).forEach(k => {
        if (k !== date) reportState[k].exportMenuOpen = false;
    });

    state.exportMenuOpen = !state.exportMenuOpen;
    renderReports();
}

function toggleActionMenu(date, logId, event) {
    if (event) event.stopPropagation();

    // Toggle logic: if already open, close it. If different, open new.
    const state = reportState[date];
    if (state.actionMenuLogId === logId) {
        state.actionMenuLogId = null;
    } else {
        // Close any other open menus in other dates (optional, but good UX)
        Object.keys(reportState).forEach(k => reportState[k].actionMenuLogId = null);
        state.actionMenuLogId = logId;
    }
    renderReports();
}

function deleteLogEntry(id) {
    if (confirm('Are you sure you want to delete this timesheet entry?')) {
        // Find and remove
        const idx = timesheetStore.logs.findIndex(l => l.id === id);
        if (idx !== -1) {
            timesheetStore.logs.splice(idx, 1);
            saveStore();
            renderReports(); // Re-render to show updates
            // Also update stats if needed, renderReports does it.
        }
    }
}

// Global click to close action menus
document.addEventListener('click', (e) => {
    // Close Action Menu
    if (!e.target.closest('button[onclick^="toggleActionMenu"]') && !e.target.closest('.action-menu-dropdown')) {
        let changed = false;
        if (typeof reportState !== 'undefined') {
            Object.keys(reportState).forEach(k => {
                if (reportState[k].actionMenuLogId !== null) {
                    reportState[k].actionMenuLogId = null;
                    changed = true;
                }
            });
            if (changed) renderReports();
        }
    }

    // Close Export Menu
    if (!e.target.closest('button[onclick^="toggleExportMenu"]') && !e.target.closest('.export-menu-dropdown')) {
        let changed = false;
        if (typeof reportState !== 'undefined') {
            Object.keys(reportState).forEach(k => {
                if (reportState[k].exportMenuOpen) {
                    reportState[k].exportMenuOpen = false;
                    changed = true;
                }
            });
            if (changed) renderReports();
        }
    }
});

function getStatusClass(status) {
    switch (status) {
        case 'Present': return 'bg-[#15803d] text-white';
        case 'Absent': return 'bg-red-700 text-white';
        case 'Late': return 'bg-yellow-600 text-white';
        case 'Working': return 'bg-blue-600 text-white';
        case 'Half Day': return 'bg-orange-500 text-white';
        default: return 'bg-gray-300 text-gray-800';
    }
}

// -- Profile Section --
function renderProfile() {
    const p = timesheetStore.profile;
    const els = {
        name: document.getElementById('profile-name'),
        email: document.getElementById('profile-email'),
        phone: document.getElementById('profile-phone'),
        role: document.getElementById('profile-role'),
        shiftInput: document.getElementById('profile-shift-input'),
        joiningDate: document.getElementById('profile-joining-date'),
        location: document.getElementById('profile-location'),
        reference: document.getElementById('profile-reference')
    };

    // Basic fields
    if (els.name) els.name.value = p.name || '';
    if (els.email) els.email.value = p.email || '';
    if (els.phone) els.phone.value = p.phone || '';
    if (els.role) els.role.value = p.role || '';
    if (els.joiningDate) els.joiningDate.value = p.joiningDate || '';
    if (els.location) els.location.value = p.location || '';
    if (els.reference) els.reference.value = p.referenceFrom || '';

    // Gender
    if (p.gender) {
        const genderInput = document.getElementById('profile-gender-input');
        if (genderInput) genderInput.value = p.gender;
        selectGender(p.gender, false);
    }

    // Shift
    if (els.shiftInput) {
        els.shiftInput.value = p.shift;
        selectShift(p.shift, false);
    }

    // Photo
    if (p.photo) {
        currentPhoto = p.photo;
        document.getElementById('photo-preview-img').src = p.photo;
        document.getElementById('photo-placeholder').classList.add('hidden');
        document.getElementById('photo-preview').classList.remove('hidden');
    } else {
        removePhoto();
    }

    // ID Proofs
    if (p.idProofs && p.idProofs.length > 0) {
        idProofFiles = p.idProofs;
        renderIDProofList();
    } else {
        idProofFiles = [];
        renderIDProofList();
    }

    if (window.lucide) lucide.createIcons();
}

function selectShift(shift, updateInput = true) {
    if (updateInput) {
        const input = document.getElementById('profile-shift-input');
        if (input) input.value = shift;
    }

    // Visual Update
    const buttons = document.querySelectorAll('.shift-btn');
    buttons.forEach(btn => {
        if (btn.dataset.value === shift) {
            btn.classList.add('bg-blue-50', 'text-[#4a90e2]', 'border-blue-200');
            btn.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-50');
        } else {
            btn.classList.remove('bg-blue-50', 'text-[#4a90e2]', 'border-blue-200');
            btn.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-50');
        }
    });
}

function selectGender(gender, updateInput = true) {
    if (updateInput) {
        const input = document.getElementById('profile-gender-input');
        if (input) input.value = gender;
    }

    const buttons = document.querySelectorAll('.gender-btn');
    buttons.forEach(btn => {
        if (btn.dataset.value === gender) {
            btn.classList.add('bg-blue-50', 'text-[#4a90e2]', 'border-blue-200');
            btn.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-50');
        } else {
            btn.classList.remove('bg-blue-50', 'text-[#4a90e2]', 'border-blue-200');
            btn.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-50');
        }
    });
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    timesheetStore.profile = {
        name: formData.get('name'),
        role: formData.get('role'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        shift: formData.get('shift'),
        gender: formData.get('gender'),
        photo: currentPhoto, // From upload handler
        idProofs: idProofFiles, // From upload handler
        joiningDate: formData.get('joiningDate'),
        referenceFrom: formData.get('referenceFrom'),
        location: formData.get('location')
    };

    saveStore();
    alert('Profile updated successfully!');
}

// -- Edit Modal --

const modal = document.getElementById('timesheet-modal-overlay');

function openEditModal(id) {
    console.log('openEditModal called with id:', id);
    const log = timesheetStore.logs.find(l => l.id === id);
    if (!log) {
        console.error('Log entry not found for id:', id);
        return;
    }

    if (modal) {
        modal.classList.remove('hidden');
        console.log('Modal opened');

        // Add click-outside-to-close handler with a small delay to avoid catching the same click
        setTimeout(() => {
            modal.onclick = function (e) {
                if (e.target === modal) {
                    console.log('Clicked outside modal, closing');
                    closeTimesheetModal();
                }
            };
        }, 100);
    }

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
    console.log('closeTimesheetModal called');
    if (modal) {
        modal.classList.add('hidden');
        modal.onclick = null; // Remove the click handler
    }
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
