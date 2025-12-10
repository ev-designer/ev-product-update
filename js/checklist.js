// Checklist Data Store
const checklistStore = {
    // Templates defined by Admin
    templates: [
        { id: 1, name: 'Morning Opening', task: 'Check Inventory Levels', shift: ['Morning'], status: 'active', createdBy: 'Admin' },
        { id: 2, name: 'Kitchen Hygiene', task: 'Clean Countertops', shift: ['Morning', 'Evening'], status: 'active', createdBy: 'Admin' },
        { id: 3, name: 'Closing Safety', task: 'Turn off Gas Valves', shift: ['Night'], status: 'active', createdBy: 'Admin' }
    ],
    // Generated Daily Tasks (Simulated)
    dailyTasks: []
};

// State
let checklistTab = 'daily'; // 'daily' or 'templates'
let checklistSearchQuery = '';
const checklistPaginationState = {
    daily: { page: 1, limit: 10 },
    templates: { page: 1, limit: 10 }
};

// DOM Elements
const checklistViews = {
    daily: document.getElementById('daily-view'),
    templates: document.getElementById('templates-view')
};
const checklistModal = document.getElementById('checklist-modal-overlay');
const checklistModalContent = document.getElementById('checklist-modal-content');

// -- Initialization --
function initChecklist() {
    setupChecklistTabs();
    generateDailyTasks(); // Simulate generation
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
            if (checklistTab === 'daily') {
                document.getElementById('daily-view').classList.remove('hidden');
                document.getElementById('templates-view').classList.add('hidden');
            } else {
                document.getElementById('daily-view').classList.add('hidden');
                document.getElementById('templates-view').classList.remove('hidden');
            }
            renderChecklist();
        });
    });
}

// -- Daily Task Generation (Simulation) --
function generateDailyTasks() {
    // In a real app, this runs via cron job at midnight.
    // Here we generate if empty.
    if (checklistStore.dailyTasks.length === 0) {
        checklistStore.templates.forEach(t => {
            if (t.status === 'active') {
                checklistStore.dailyTasks.push({
                    id: Date.now() + Math.random(),
                    templateId: t.id,
                    taskName: t.task,
                    shift: t.shift,
                    isDone: false,
                    markedBy: null,
                    timestamp: null
                });
            }
        });
    }
}

// -- Rendering --
function renderChecklist() {
    if (checklistTab === 'daily') {
        renderDailyGrid();
    } else {
        renderTemplatesGrid();
    }
    lucide.createIcons();
}

function renderDailyGrid() {
    const tbody = document.getElementById('daily-table');
    if (!tbody) return;

    let html = `
        <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
                <th class="px-6 py-3 text-left">
                     <input type="checkbox" onclick="toggleChecklistAll(this)" class="custom-checkbox rounded border-gray-300 text-brand-600 focus:ring-brand-500">
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shift</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
    `;

    // Filter logic can go here
    // Pagination Logic
    const tasks = checklistStore.dailyTasks;
    const totalItems = tasks.length;
    const { page, limit } = checklistPaginationState.daily;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = tasks.slice(start, end);

    if (paginatedData.length === 0) {
        html += `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No tasks for today.</td></tr>`;
    } else {
        html += paginatedData.map(task => `
            <tr>
                <td class="px-6 py-4">
                     <input type="checkbox" class="custom-checkbox rounded border-gray-300 text-brand-600 focus:ring-brand-500" onclick="toggleChecklistRow(this)">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${task.taskName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${task.shift.map(s => `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-1">${s}</span>`).join('')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${task.isDone
                ? `<span class="text-green-600 font-medium">Done</span> <span class="text-xs text-gray-400">(${task.timestamp})</span>`
                : '<span class="text-gray-400">Pending</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="toggleTaskStatus(${task.id})" type="button" 
                        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${task.isDone ? 'bg-[#4a90e2]' : 'bg-gray-200'}" 
                        role="switch" aria-checked="${task.isDone}">
                        <span aria-hidden="true" 
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${task.isDone ? 'translate-x-5' : 'translate-x-0'}">
                        </span>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    html += `</tbody>`;
    tbody.innerHTML = html;

    updateChecklistPaginationControls('daily', totalItems);
}

function renderTemplatesGrid() {
    const tbody = document.getElementById('templates-table');
    if (!tbody) return;

    let html = `
        <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
                <th class="px-6 py-3 text-left">
                     <input type="checkbox" onclick="toggleChecklistAll(this)" class="custom-checkbox rounded border-gray-300 text-brand-600 focus:ring-brand-500">
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Template Name</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shift</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
    `;

    const templates = checklistStore.templates;
    const totalItems = templates.length;
    const { page, limit } = checklistPaginationState.templates;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = templates.slice(start, end);

    if (paginatedData.length === 0) {
        html += `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No templates found.</td></tr>`;
    } else {
        html += paginatedData.map(t => `
            <tr>
                <td class="px-6 py-4">
                     <input type="checkbox" class="custom-checkbox rounded border-gray-300 text-brand-600 focus:ring-brand-500" onclick="toggleChecklistRow(this)">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${t.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${t.task}</td>
                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${t.shift.map(s => `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1">${s}</span>`).join('')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                     <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${t.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <button onclick="editTemplate(${t.id})" class="text-indigo-600 hover:text-indigo-900 mr-2"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                     <button onclick="deleteTemplate(${t.id})" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </td>
            </tr>
        `).join('');
    }

    html += `</tbody>`;
    tbody.innerHTML = html;

    updateChecklistPaginationControls('templates', totalItems);
}

// -- Actions --
function toggleTaskStatus(taskId) {
    const task = checklistStore.dailyTasks.find(t => t.id === taskId);
    if (task) {
        task.isDone = !task.isDone;
        if (task.isDone) {
            task.markedBy = 'User'; // Simulated user
            task.timestamp = new Date().toLocaleString();
        } else {
            task.markedBy = null;
            task.timestamp = null;
        }
        renderChecklist();
    }
}

function deleteTemplate(id) {
    if (confirm('Are you sure you want to delete this template?')) {
        checklistStore.templates = checklistStore.templates.filter(t => t.id !== id);
        renderChecklist();
    }
}

// -- Modal Logic --
function openChecklistModal() {
    checklistModal.classList.remove('hidden');
    checklistModalContent.innerHTML = `
        <form id="add-template-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Template Name</label>
                <input type="text" name="name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Task</label>
                <input type="text" name="task" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Shift</label>
                <div class="mt-2 space-y-2">
                    <label class="inline-flex items-center">
                        <input type="checkbox" name="shift" value="Morning" class="form-checkbox h-4 w-4 text-brand-600 border-gray-300 rounded">
                        <span class="ml-2 text-sm text-gray-700">Morning</span>
                    </label>
                    <label class="inline-flex items-center ml-4">
                        <input type="checkbox" name="shift" value="Evening" class="form-checkbox h-4 w-4 text-brand-600 border-gray-300 rounded">
                        <span class="ml-2 text-sm text-gray-700">Evening</span>
                    </label>
                    <label class="inline-flex items-center ml-4">
                        <input type="checkbox" name="shift" value="Night" class="form-checkbox h-4 w-4 text-brand-600 border-gray-300 rounded">
                        <span class="ml-2 text-sm text-gray-700">Night</span>
                    </label>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div class="flex items-center">
                    <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="status" id="template-status-toggle" value="active" checked 
                            class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                            onchange="document.getElementById('status-label-text').textContent = this.checked ? 'Active' : 'Inactive'">
                        <label for="template-status-toggle" class="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer"></label>
                    </div>
                    <label for="template-status-toggle" class="text-sm text-gray-700" id="status-label-text">Active</label>
                </div>
            </div>
            <div class="flex justify-end gap-3 pt-4">
                <button type="button" onclick="closeChecklistModal()" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4a90e2] hover:bg-[#3b7bc4]">Save Template</button>
            </div>
        </form>
    `;
    document.getElementById('add-template-form').onsubmit = handleAddTemplate;
}

function closeChecklistModal() {
    checklistModal.classList.add('hidden');
}

function handleAddTemplate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const shifts = [];
    document.querySelectorAll('input[name="shift"]:checked').forEach(cb => shifts.push(cb.value));

    // Validation
    if (shifts.length === 0) {
        alert('Please select at least one shift.');
        return;
    }

    const newTemplate = {
        id: Date.now(),
        name: formData.get('name'),
        task: formData.get('task'),
        shift: shifts,
        status: formData.get('status') ? 'active' : 'inactive',
        createdBy: 'Admin'
    };

    checklistStore.templates.push(newTemplate);
    closeChecklistModal();
    renderChecklist();
    // Re-run daily generation to see if new task applies (optional, but good for demo)
    generateDailyTasks();
}

function editTemplate(id) {
    const t = checklistStore.templates.find(temp => temp.id === id);
    if (!t) return;

    openChecklistModal();
    document.getElementById('checklist-modal-title').textContent = 'Edit Template';

    // Fill Form
    const form = document.getElementById('add-template-form');
    form.name.value = t.name;
    form.task.value = t.task;
    // Handle shift checkboxes
    // Clear existing checks first
    form.querySelectorAll('input[name="shift"]').forEach(cb => cb.checked = false);
    t.shift.forEach(s => {
        const cb = form.querySelector(`input[value="${s}"]`);
        if (cb) cb.checked = true;
    });
    // Handle status toggle
    const toggle = form.querySelector('input[name="status"]');
    if (toggle) {
        toggle.checked = t.status === 'active';
        document.getElementById('status-label-text').textContent = t.status === 'active' ? 'Active' : 'Inactive';
    }

    // Override Submit Handler
    form.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const shifts = [];
        document.querySelectorAll('input[name="shift"]:checked').forEach(cb => shifts.push(cb.value));

        if (shifts.length === 0) {
            alert('Please select at least one shift.');
            return;
        }

        // Update
        t.name = formData.get('name');
        t.task = formData.get('task');
        t.shift = shifts;
        t.status = formData.get('status') ? 'active' : 'inactive';

        closeChecklistModal();
        renderChecklist();
        generateDailyTasks();
        // Reset title for next time (or handle in open)
        document.getElementById('checklist-modal-title').textContent = 'Add Template';
    };
}



function toggleChecklistAll(source) {
    const tableId = checklistTab === 'daily' ? 'daily-table' : 'templates-table';
    const tbody = document.getElementById(tableId).querySelector('tbody');
    const checkboxes = tbody.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = source.checked;
        toggleChecklistRow(cb);
    });
}

function toggleChecklistRow(checkbox) {
    const row = checkbox.closest('tr');
    if (checkbox.checked) {
        row.classList.add('bg-blue-50');
    } else {
        row.classList.remove('bg-blue-50');
    }
}

function updateChecklistPaginationControls(type, totalItems) {
    const tableId = type === 'daily' ? 'daily-table' : 'templates-table';
    const tableContainer = document.querySelector(`#${tableId}`).closest('.bg-white');

    // Remove existing pagination if any
    const existing = tableContainer.querySelector('.pagination-container');
    if (existing) existing.remove();

    const { page, limit } = checklistPaginationState[type];
    const totalPages = Math.ceil(totalItems / limit);
    const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, totalItems);

    const paginationHTML = `
        <div class="pagination-container px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div class="flex items-center gap-4">
               <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-700">Show</span>
                    <select onchange="changeChecklistLimit('${type}', this.value)" class="border-gray-300 rounded text-sm focus:ring-brand-500 focus:border-brand-500 p-1 border">
                        <option value="10" ${limit == 10 ? 'selected' : ''}>10</option>
                        <option value="20" ${limit == 20 ? 'selected' : ''}>20</option>
                        <option value="30" ${limit == 30 ? 'selected' : ''}>30</option>
                        <option value="50" ${limit == 50 ? 'selected' : ''}>50</option>
                    </select>
                </div>
                <span class="text-sm text-gray-700">
                    Showing <span class="font-medium">${startItem}</span> to <span class="font-medium">${endItem}</span> of <span class="font-medium">${totalItems}</span> results
                </span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="changeChecklistPage('${type}', ${page - 1})" ${page === 1 ? 'disabled' : ''} class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                    <span class="sr-only">Previous</span>
                </button>
                
                ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let p = i + 1;
        if (totalPages > 5) {
            if (page > 3) p = page - 2 + i;
            if (p > totalPages) return '';
        }
        return `
                    <button onclick="changeChecklistPage('${type}', ${p})" class="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${page === p ? 'z-10 bg-brand-50 border-brand-500 text-brand-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}">
                        ${p}
                    </button>
                    `;
    }).join('')}

                <button onclick="changeChecklistPage('${type}', ${page + 1})" ${page === totalPages || totalPages === 0 ? 'disabled' : ''} class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                    <span class="sr-only">Next</span>
                </button>
            </div>
        </div>
    `;

    tableContainer.insertAdjacentHTML('beforeend', paginationHTML);
    if (window.lucide) lucide.createIcons();
}

function changeChecklistPage(type, newPage) {
    if (newPage < 1) return;
    checklistPaginationState[type].page = newPage;
    renderChecklist();
}

function changeChecklistLimit(type, newLimit) {
    checklistPaginationState[type].limit = parseInt(newLimit);
    checklistPaginationState[type].page = 1;
    renderChecklist();
}

// Init on load
document.addEventListener('DOMContentLoaded', initChecklist);
