// Checklist Data Store
const checklistStore = {
    // Templates defined by Admin
    templates: [
        {
            id: 1,
            name: 'Morning Opening',
            tasks: [
                { text: 'Check Inventory Levels' },
                { text: 'Turn on lights' },
                { text: 'Check AC temperature' }
            ],
            shift: ['Morning'],
            status: 'active',
            createdBy: 'Admin'
        },
        {
            id: 2,
            name: 'Kitchen Hygiene',
            tasks: [
                { text: 'Clean Countertops' },
                { text: 'Sanitize Sink' },
                { text: 'Check expire dates' }
            ],
            shift: ['Morning', 'Evening'],
            status: 'active',
            createdBy: 'Admin'
        },
        {
            id: 3,
            name: 'Closing Safety',
            tasks: [
                { text: 'Turn off Gas Valves' },
                { text: 'Lock Back Door' },
                { text: 'Count Cash Drawer' }
            ],
            shift: ['Night'],
            status: 'active',
            createdBy: 'Admin'
        }
    ],
    // Generated Daily Instances (Card Instances)
    dailyCards: []
};

// State
let checklistTab = 'daily'; // 'daily', 'templates', 'reports'
const checklistPaginationState = {
    templates: { page: 1, limit: 10 }
};

// DOM Elements
const checklistViews = {
    daily: document.getElementById('daily-view'),
    templates: document.getElementById('templates-view'),
    reports: document.getElementById('reports-view')
};
const checklistModal = document.getElementById('checklist-modal-overlay');
const checklistModalContent = document.getElementById('checklist-modal-content');

// -- Initialization --
function initChecklist() {
    setupChecklistTabs();
    generateDailyCards(); // Simulate generation
    renderChecklist();

    // Close modal on outside click
    checklistModal.addEventListener('click', (e) => {
        if (e.target === checklistModal) closeChecklistModal();
    });
}

// -- Tab Logic --
function setupChecklistTabs() {
    const tabs = document.querySelectorAll('.checklist-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // UI Update
            tabs.forEach(t => {
                t.classList.remove('text-brand-600', 'border-brand-500');
                t.classList.add('text-gray-500', 'border-transparent');
            });
            tab.classList.add('text-brand-600', 'border-brand-500');
            tab.classList.remove('text-gray-500', 'border-transparent');

            // View Switch
            checklistTab = tab.dataset.tab;

            // Hide All
            Object.values(checklistViews).forEach(el => el.classList.add('hidden'));

            // Show Selected
            if (checklistViews[checklistTab]) {
                checklistViews[checklistTab].classList.remove('hidden');
            }

            renderChecklist();
        });
    });
}

// -- Daily Generation (Simulation) --
function generateDailyCards() {
    if (checklistStore.dailyCards.length === 0) {
        checklistStore.templates.forEach(t => {
            if (t.status === 'active') {
                t.shift.forEach(kShift => {
                    // Create one card per shift instance
                    checklistStore.dailyCards.push({
                        id: Date.now() + Math.random(),
                        templateId: t.id,
                        title: t.name,
                        shift: kShift,
                        tasks: t.tasks.map(sub => ({ ...sub, isDone: false })), // Clone tasks
                        date: new Date().toISOString().split('T')[0]
                    });
                });
            }
        });
    }
}

// -- Rendering --
function renderChecklist() {
    if (checklistTab === 'daily') {
        renderDailyBoard();
        updateDashboardStats();
    } else if (checklistTab === 'templates') {
        renderTemplatesGrid();
    }
    // Reports handled manually by user action
    if (window.lucide) lucide.createIcons();
}

function updateDashboardStats() {
    const cards = checklistStore.dailyCards;
    // Calculate total subtasks
    let totalSubtasks = 0;
    let completedSubtasks = 0;

    cards.forEach(card => {
        card.tasks.forEach(t => {
            totalSubtasks++;
            if (t.isDone) completedSubtasks++;
        });
    });

    const pending = totalSubtasks - completedSubtasks;

    // Updated Stats Logic
    const completedEl = document.getElementById('completed-count');
    const pendingEl = document.getElementById('pending-count');

    if (completedEl) completedEl.textContent = completedSubtasks;
    if (pendingEl) pendingEl.textContent = pending;
}

// -- Kanban Board Rendering --
function renderDailyBoard() {
    const shifts = ['Morning', 'Evening', 'Night'];
    const cards = checklistStore.dailyCards;

    shifts.forEach(shift => {
        const colId = `col-${shift.toLowerCase()}`;
        const countId = `count-${shift.toLowerCase()}`;
        const container = document.getElementById(colId);
        const countBadge = document.getElementById(countId);

        if (!container) return;

        const shiftCards = cards.filter(c => c.shift === shift);

        // Update Count
        if (countBadge) countBadge.textContent = shiftCards.length;

        // Render Tasks Flattened
        const tasksHTML = shiftCards.flatMap(card => {
            return card.tasks.map((task, idx) => `
                <div class="bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-200 transition-all">
                    <label class="flex items-start gap-3 cursor-pointer select-none">
                        <input type="checkbox" 
                            ${task.isDone ? 'checked' : ''} 
                            onchange="toggleSubTask('${card.id}', ${idx})"
                            class="mt-0.5 custom-checkbox rounded border-gray-300 text-[#4a90e2] focus:ring-[#4a90e2]">
                        <span class="text-sm text-gray-700 ${task.isDone ? 'line-through text-gray-400' : 'hover:text-gray-900'} transition-colors leading-snug">
                            ${task.text}
                        </span>
                    </label>
                </div>
            `);
        }).join('');

        container.innerHTML = tasksHTML;
    });
}

function toggleSubTask(cardId, taskIdx) {
    const card = checklistStore.dailyCards.find(c => c.id == cardId); // Loose equality for string/number id
    if (card && card.tasks[taskIdx]) {
        card.tasks[taskIdx].isDone = !card.tasks[taskIdx].isDone;
        renderChecklist();
    }
}

// -- Templates Rendering --
function renderTemplatesGrid() {
    const tbody = document.getElementById('templates-table');
    if (!tbody) return;

    let html = `
        <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
                <th class="px-6 py-3 text-left">
                     <input type="checkbox" onclick="toggleChecklistAll(this)" class="custom-checkbox border-gray-300 text-[#4a90e2] focus:ring-[#4a90e2]">
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shifts</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
    `;

    const templates = checklistStore.templates;
    const { page, limit } = checklistPaginationState.templates;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = templates.slice(start, end);

    if (paginatedData.length === 0) {
        html += `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No tasks found.</td></tr>`;
    } else {
        html += paginatedData.map(t => `
            <tr>
                <td class="px-6 py-4">
                     <input type="checkbox" class="custom-checkbox border-gray-300 text-[#4a90e2] focus:ring-[#4a90e2]" onclick="toggleChecklistRow(this)">
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${t.name}</div>
                    <div class="text-xs text-gray-500 mt-1">${t.tasks.length} sub-tasks</div>
                </td>
                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${t.shift.map(s => {
            let classes = 'bg-gray-100 text-gray-600 border-gray-200';
            if (s === 'Morning') classes = 'bg-amber-50 text-amber-700 border-amber-200';
            if (s === 'Evening') classes = 'bg-indigo-50 text-indigo-700 border-indigo-200';
            if (s === 'Night') classes = 'bg-slate-100 text-slate-700 border-slate-200';
            return `<span class="inline-flex items-center px-2 py-0.5 text-xs font-medium ${classes} mr-1 border shadow-sm">${s}</span>`;
        }).join('')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                     <span style="border-radius: 50px !important;" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-[50px] ${t.status === 'active' ? 'bg-[#15803d] text-white' : 'bg-gray-300 text-gray-800'}">
                        ${t.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <button onclick="toggleActionMenu(event, ${t.id})" class="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i data-lucide="more-vertical" class="w-5 h-5"></i>
                     </button>
                </td>
            </tr>
        `).join('');
    }

    html += `</tbody>`;
    tbody.innerHTML = html;

    updateChecklistPaginationControls('templates', templates.length);
}

// -- Modal Logic (Dynamic Tasks) --
let currentTasksList = [];

function openChecklistModal(templateId = null) {
    checklistModal.classList.remove('hidden');
    currentTasksList = []; // Reset

    let isEdit = false;
    let template = null;

    if (templateId) {
        isEdit = true;
        template = checklistStore.templates.find(t => t.id === templateId);
        if (template) {
            currentTasksList = [...template.tasks];
        }
    }

    renderModalContent(isEdit, template);
}

function renderModalContent(isEdit, template) {
    const title = isEdit ? 'Edit Task' : 'New Task';
    document.getElementById('checklist-modal-title').textContent = title;

    checklistModalContent.innerHTML = `
        <form id="add-template-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Template Name</label>
                <input type="text" name="name" value="${template ? template.name : ''}" required class="mt-1 block w-full border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4a90e2] focus:border-[#4a90e2] sm:text-sm">
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tasks List</label>
                <div class="flex gap-2 mb-2">
                    <input type="text" id="new-task-input" placeholder="e.g. Check Oil Level" class="block w-full border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-[#4a90e2] focus:border-[#4a90e2] sm:text-sm" onkeypress="handleTaskEnter(event)">
                    <button type="button" onclick="addModalTask()" class="px-3 py-2 border border-transparent shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700">Add</button>
                </div>
                <div id="modal-tasks-list" class="space-y-2 max-h-40 overflow-y-auto border border-gray-100 p-2 bg-gray-50">
                    <!-- Tasks injected here -->
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700">Shifts</label>
                <div class="mt-2 flex shadow-sm select-none">
                    <label class="relative flex-1 cursor-pointer group">
                        <input type="checkbox" name="shift" value="Morning" ${template && template.shift.includes('Morning') ? 'checked' : ''} class="peer sr-only">
                        <div class="px-4 py-2 text-sm text-center border border-gray-300 border-r-0 bg-white text-gray-700 peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-checked:border-blue-500 peer-checked:z-10 hover:bg-gray-50 transition-all font-medium">
                            Morning
                        </div>
                    </label>
                    <label class="relative flex-1 cursor-pointer group">
                        <input type="checkbox" name="shift" value="Evening" ${template && template.shift.includes('Evening') ? 'checked' : ''} class="peer sr-only">
                        <div class="px-4 py-2 text-sm text-center border border-gray-300 border-r-0 bg-white text-gray-700 peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-checked:border-blue-500 peer-checked:z-10 hover:bg-gray-50 transition-all font-medium">
                            Evening
                        </div>
                    </label>
                    <label class="relative flex-1 cursor-pointer group">
                        <input type="checkbox" name="shift" value="Night" ${template && template.shift.includes('Night') ? 'checked' : ''} class="peer sr-only">
                        <div class="px-4 py-2 text-sm text-center border border-gray-300 bg-white text-gray-700 peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-checked:border-blue-500 peer-checked:z-10 hover:bg-gray-50 transition-all font-medium">
                            Night
                        </div>
                    </label>
                </div>
            </div>

             <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div class="flex items-center">
                    <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="status" id="template-status-toggle" value="active" ${!template || template.status === 'active' ? 'checked' : ''} 
                            class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                            onchange="document.getElementById('status-label-text').textContent = this.checked ? 'Active' : 'Inactive'">
                        <label for="template-status-toggle" class="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer"></label>
                    </div>
                    <label for="template-status-toggle" class="text-sm text-gray-700" id="status-label-text">${!template || template.status === 'active' ? 'Active' : 'Inactive'}</label>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
                <button type="button" onclick="closeChecklistModal()" class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium text-white bg-[#4a90e2] hover:bg-[#3b7bc4]">Save</button>
            </div>
        </form>
    `;

    renderModalTasksList();

    document.getElementById('add-template-form').onsubmit = (e) => handleSaveTemplate(e, isEdit ? template.id : null);
}

function handleTaskEnter(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addModalTask();
    }
}

function addModalTask() {
    const input = document.getElementById('new-task-input');
    const text = input.value.trim();
    if (text) {
        currentTasksList.push({ text: text });
        input.value = '';
        renderModalTasksList();
        input.focus();
    }
}

function removeModalTask(idx) {
    currentTasksList.splice(idx, 1);
    renderModalTasksList();
}

function renderModalTasksList() {
    const container = document.getElementById('modal-tasks-list');
    if (currentTasksList.length === 0) {
        container.innerHTML = '<span class="text-xs text-gray-400 italic px-2">No tasks added yet.</span>';
        return;
    }

    container.innerHTML = currentTasksList.map((t, idx) => `
        <div class="flex justify-between items-center text-sm bg-white p-2 border border-gray-100">
            <span class="text-gray-700 truncate">${t.text}</span>
            <button type="button" onclick="removeModalTask(${idx})" class="text-red-400 hover:text-red-600">
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function handleSaveTemplate(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const shifts = [];
    document.querySelectorAll('input[name="shift"]:checked').forEach(cb => shifts.push(cb.value));

    if (shifts.length === 0) {
        alert('Please select at least one shift.');
        return;
    }

    if (currentTasksList.length === 0) {
        alert('Please add at least one task to the list.');
        return;
    }

    const templateData = {
        name: formData.get('name'),
        tasks: [...currentTasksList],
        shift: shifts,
        status: formData.get('status') ? 'active' : 'inactive',
    };

    if (id) {
        // Edit
        const tIdx = checklistStore.templates.findIndex(t => t.id === id);
        if (tIdx > -1) {
            checklistStore.templates[tIdx] = { ...checklistStore.templates[tIdx], ...templateData };
        }
    } else {
        // Create
        checklistStore.templates.push({
            id: Date.now(),
            ...templateData,
            createdBy: 'Admin'
        });
    }

    closeChecklistModal();
    renderChecklist();
    // In real app, we might check if we need to generate new cards for today
}

function closeChecklistModal() {
    checklistModal.classList.add('hidden');
}

function editTemplate(id) {
    openChecklistModal(id);
}

function deleteTemplate(id) {
    if (confirm('Are you sure you want to delete this template?')) {
        checklistStore.templates = checklistStore.templates.filter(t => t.id !== id);
        renderChecklist();
    }
}

// -- Reports --
function generateReport() {
    const fromDate = document.getElementById('report-from-date').value;
    const toDate = document.getElementById('report-to-date').value;

    // In simulation, we just show all generated cards as if they fall in range
    // In real app, filter checklistStore.history or fetch from API

    const cards = checklistStore.dailyCards; // Mock history
    const tbody = document.getElementById('reports-table-body');
    const noData = document.getElementById('no-report-data');

    if (cards.length === 0) {
        tbody.innerHTML = '';
        noData.classList.remove('hidden');
        return;
    }

    noData.classList.add('hidden');
    tbody.innerHTML = cards.map(c => {
        const doneCount = c.tasks.filter(t => t.isDone).length;
        const total = c.tasks.length;
        const status = doneCount === total && total > 0 ?
            '<span class="text-green-600 font-semibold">Completed</span>' :
            `<span class="text-orange-500 font-medium">Pending (${doneCount}/${total})</span>`;

        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${c.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${c.title}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${c.shift}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${status}</td>
            </tr>
        `;
    }).join('');
}

function exportReport(type) {
    alert(`Export to ${type.toUpperCase()} feature would run here.`);
}

// -- Shared Helpers --
function toggleChecklistAll(source) {
    // Only for templates table
    if (checklistTab !== 'templates') return;
    const checkboxes = document.querySelectorAll('#templates-table tbody input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = source.checked);
}

function toggleChecklistRow(checkbox) {
    // Optional row highlight
}

function updateChecklistPaginationControls(type, totalItems) {
    // Simple pagination reuse - Logic similar to before but skipped for brevity if not strictly requested redone
    // Keeping it simple as focus was on new features
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
    initChecklist();
    setupActionMenu();
});

// --- Action Menu Logic ---
let activeActionId = null;
let checklistActionMenu = null;

function setupActionMenu() {
    checklistActionMenu = document.getElementById('action-menu');
    if (!checklistActionMenu) return;

    // const openBtn = document.getElementById('action-open');
    const editBtn = document.getElementById('action-edit');
    const deleteBtn = document.getElementById('action-delete');

    // if (openBtn) openBtn.onclick = () => handleChecklistAction('open');
    if (editBtn) editBtn.onclick = () => handleChecklistAction('edit');
    if (deleteBtn) deleteBtn.onclick = () => handleChecklistAction('delete');

    document.addEventListener('click', (e) => {
        if (!checklistActionMenu.contains(e.target) && !e.target.closest('button[onclick^="toggleActionMenu"]')) {
            closeActionMenu();
        }
    });

    window.addEventListener('scroll', closeActionMenu, true);
}

function toggleActionMenu(e, id) {
    if (!checklistActionMenu) setupActionMenu();
    e.stopPropagation();

    if (activeActionId === id && !checklistActionMenu.classList.contains('hidden')) {
        closeActionMenu();
        return;
    }

    activeActionId = id;

    const rect = e.currentTarget.getBoundingClientRect();
    checklistActionMenu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    checklistActionMenu.style.left = `${rect.right + window.scrollX - 128}px`;

    checklistActionMenu.classList.remove('hidden');
}

function closeActionMenu() {
    if (checklistActionMenu) checklistActionMenu.classList.add('hidden');
    activeActionId = null;
}

function handleChecklistAction(type) {
    if (!activeActionId) return;
    // if (type === 'open') alert(`View/Open functionality for ID: ${activeActionId}`);
    if (type === 'edit') editTemplate(activeActionId);
    if (type === 'delete') deleteTemplate(activeActionId);
    closeActionMenu();
}
