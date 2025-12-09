// Initial Data
const store = {
    categories: [
        { id: 1, name: 'Beverages', description: 'Soft drinks, juices, and water', status: 'active' },
        { id: 2, name: 'Food', description: 'Burgers, pizzas, sandwiches', status: 'active' },
        { id: 3, name: 'Sides', description: 'Fries, salads, dips', status: 'inactive' }
    ],
    items: [
        { id: 1, code: 'BEV-001', name: 'Cola 300ml', categoryId: 1, price: 2.50, tax: 10, stock: 150, uom: 'Can', createdBy: 'Admin', status: 'active' },
        { id: 2, code: 'FOD-001', name: 'Cheese Burger', categoryId: 2, price: 12.00, tax: 15, stock: 45, uom: 'Pcs', createdBy: 'Chef John', status: 'active' },
        { id: 3, code: 'FOD-002', name: 'Veggie Pizza', categoryId: 2, price: 15.50, tax: 15, stock: 20, uom: 'Box', createdBy: 'Admin', status: 'inactive' }
    ],
    // Log entries for stock movement
    stockLogs: [
        { id: 1, date: '2023-10-25', itemName: 'Cola 300ml', type: 'in', quantity: 50, reason: 'Initial Stock' }
    ]
};

// Current State
let currentTab = 'categories'; // categories, items, stock
let searchQuery = '';

// DOM Elements
const views = {
    categories: document.getElementById('categories-view'),
    items: document.getElementById('items-view'),
    stock: document.getElementById('stock-view')
};
const tabs = document.querySelectorAll('.tab-btn');

// Categories Specific Controls
const categoriesSearch = document.getElementById('categories-search');
const categoriesStatusFilter = document.getElementById('categories-status-filter');
const categoriesAddBtn = document.getElementById('categories-add-btn');

// Items Specific Controls
const itemsSearch = document.getElementById('items-search');
const itemsAddBtn = document.getElementById('items-add-btn');

// Stock Specific Controls
const stockSearch = document.getElementById('stock-search');
const stockTypeFilter = document.getElementById('stock-type-filter');
const stockDateFilter = document.getElementById('stock-date-filter');

// Pagination State
const paginationState = {
    categories: { page: 1, limit: 10 },
    items: { page: 1, limit: 10 },
    stock: { page: 1, limit: 10 }
};

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

// --- Initialization ---
function init() {
    setupTabs();
    setupSearch();

    // Handle URL Hash or Default
    const hash = window.location.hash.replace('#', '');
    if (['categories', 'items', 'stock'].includes(hash)) {
        switchTab(hash);
    } else {
        switchTab(currentTab);
    }

    render();
    setupModal();
}

// --- Tab Logic ---
function setupTabs() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            switchTab(target);
        });
    });
}

function switchTab(tabName) {
    currentTab = tabName;

    // Update Tab UI
    tabs.forEach(t => {
        if (t.dataset.tab === tabName) {
            t.classList.remove('text-gray-500', 'border-transparent', 'hover:text-gray-700', 'hover:border-gray-300');
            t.classList.add('text-brand-600', 'border-brand-500');
        } else {
            t.classList.add('text-gray-500', 'border-transparent', 'hover:text-gray-700', 'hover:border-gray-300');
            t.classList.remove('text-brand-600', 'border-brand-500');
        }
    });

    // Update Views
    Object.keys(views).forEach(key => {
        if (key === tabName) {
            views[key].classList.remove('hidden');
        } else {
            views[key].classList.add('hidden');
        }
    });

    // NOTE: Shared Layout Logic Removed. All views now have self-contained controls.
    render();
}

function setupUrlHash() {
    const hash = window.location.hash.replace('#', '');
    if (['categories', 'items', 'stock'].includes(hash)) {
        switchTab(hash);
    }
}

// --- Interaction Logic ---
function setupSearch() {
    // Categories Controls
    if (categoriesSearch) categoriesSearch.addEventListener('input', render);
    if (categoriesStatusFilter) categoriesStatusFilter.addEventListener('change', render);
    if (categoriesAddBtn) {
        categoriesAddBtn.addEventListener('click', () => {
            currentTab = 'categories'; // Ensure correct context
            openAddModal();
        });
    }

    // Items Specific Controls
    if (itemsSearch) itemsSearch.addEventListener('input', render);
    if (itemsAddBtn) {
        itemsAddBtn.addEventListener('click', () => {
            // currentTab is already 'items'
            openAddModal();
        });
    }

    // Stock Specific Filters
    if (stockSearch) stockSearch.addEventListener('input', render);
    if (stockTypeFilter) stockTypeFilter.addEventListener('change', render);
    if (stockDateFilter) stockDateFilter.addEventListener('change', render);
}

function setupModal() {
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

function closeModal() {
    modalOverlay.classList.add('hidden');
}
// --- Checkbox Logic ---
function toggleSelectAll(source) {
    const tableId = currentTab === 'categories' ? 'categories-table' :
        currentTab === 'items' ? 'items-table' : 'stock-table';
    const tbody = document.getElementById(tableId).querySelector('tbody');
    const checkboxes = tbody.querySelectorAll('.custom-checkbox');

    checkboxes.forEach(cb => {
        cb.checked = source.checked;
        toggleRow(cb);
    });
}

function toggleRow(checkbox) {
    const row = checkbox.closest('tr');
    if (checkbox.checked) {
        row.classList.add('bg-blue-50');
    } else {
        row.classList.remove('bg-blue-50');
    }
}

// --- Action Menu Logic ---
let activeActionId = null;
let activeActionType = null; // 'category' or 'item'
let actionMenu = null; // Lazy load

function setupActionMenu() {
    actionMenu = document.getElementById('action-menu');
    // Buttons in menu
    document.getElementById('action-open').addEventListener('click', () => handleAction('open'));
    document.getElementById('action-edit').addEventListener('click', () => handleAction('edit'));
    document.getElementById('action-delete').addEventListener('click', () => handleAction('delete'));

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!actionMenu.contains(e.target) && !e.target.closest('.action-btn')) {
            closeActionMenu();
        }
    });

    // Handle scroll closes menu
    window.addEventListener('scroll', closeActionMenu, true);
}

function toggleActionMenu(e, id, type) {
    e.stopPropagation();

    // If clicking same button and menu is open, close it
    if (activeActionId === id && activeActionType === type && !actionMenu.classList.contains('hidden')) {
        closeActionMenu();
        return;
    }

    activeActionId = id;
    activeActionType = type;

    // Position menu
    const rect = e.currentTarget.getBoundingClientRect();
    actionMenu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    actionMenu.style.left = `${rect.right + window.scrollX - 128}px`; // Align right edge (128 is w-32)

    actionMenu.classList.remove('hidden');
}

function closeActionMenu() {
    actionMenu.classList.add('hidden');
    activeActionId = null;
    activeActionType = null;
}

function handleAction(action) {
    if (!activeActionId || !activeActionType) return;

    if (action === 'open') {
        // Implement Open logic if needed, currently generic alert or log
        // console.log(`Open ${activeActionType} ${activeActionId}`);
    } else if (action === 'edit') {
        if (activeActionType === 'category') editCategory(activeActionId);
        else if (activeActionType === 'item') editItem(activeActionId);
    } else if (action === 'delete') {
        if (activeActionType === 'category') deleteCategory(activeActionId);
        else if (activeActionType === 'item') deleteItem(activeActionId);
    }

    closeActionMenu();
}

// --- Rendering ---
function render() {
    // Ensure menu setup is called once
    if (!window.menuSetupDone) {
        setupActionMenu();
        window.menuSetupDone = true;
    }
    if (currentTab === 'categories') renderCategories();
    else if (currentTab === 'items') renderItems();
    else if (currentTab === 'stock') renderStock();

    // Re-init generic things if needed
    if (window.lucide) lucide.createIcons();
}

function renderCategories() {
    const tbody = document.getElementById('categories-table');

    const query = categoriesSearch ? categoriesSearch.value.toLowerCase() : '';
    const statusVal = categoriesStatusFilter ? categoriesStatusFilter.value : '';

    const filtered = store.categories.filter(c => {
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesStatus = statusVal ? c.status === statusVal : true;
        return matchesName && matchesStatus;
    });

    const totalItems = filtered.length;
    const { page, limit } = paginationState.categories;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filtered.slice(start, end);

    let html = `
        <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left">
                    <input type="checkbox" class="custom-checkbox" onclick="toggleSelectAll(this)">
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Count</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
    `;

    if (paginatedData.length === 0) {
        html += `<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No categories found</td></tr>`;
    } else {
        html += paginatedData.map(c => {
            // Calculate items count
            const count = store.items.filter(i => i.categoryId === c.id).length;

            return `
            <tr class="hover:bg-black/5 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="custom-checkbox" onclick="toggleRow(this)">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${c.name}</td>
                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${count} items</td>
                 <td class="px-6 py-4 whitespace-nowrap">
                    <span style="border-radius: 50px !important;" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-[50px] ${c.status === 'active' ? 'bg-[#15803d] text-white' : 'bg-gray-300 text-gray-800'}">
                        ${c.status ? (c.status.charAt(0).toUpperCase() + c.status.slice(1)) : 'Active'}
                    </span>
                 </td>
                 <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="toggleActionMenu(event, ${c.id}, 'category')" class="action-btn text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i data-lucide="more-vertical" class="w-5 h-5"></i>
                    </button>
                </td>
            </tr>
        `}).join('');
    }

    html += `</tbody>`;
    tbody.innerHTML = html;

    // Append Pagination
    updatePaginationControls('categories', totalItems);
}

function renderItems() {
    const tbody = document.getElementById('items-table');
    // Use specific items search input
    const query = itemsSearch ? itemsSearch.value.toLowerCase() : '';

    const filtered = store.items.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.code.toLowerCase().includes(query)
    );

    const totalItems = filtered.length;
    const { page, limit } = paginationState.items;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filtered.slice(start, end);

    let html = `
        <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left">
                    <input type="checkbox" class="custom-checkbox" onclick="toggleSelectAll(this)">
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
    `;

    if (paginatedData.length === 0) {
        html += `<tr><td colspan="8" class="px-6 py-4 text-center text-sm text-gray-500">No items found</td></tr>`;
    } else {
        html += paginatedData.map(i => {
            return `
            <tr class="hover:bg-black/5 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="custom-checkbox" onclick="toggleRow(this)">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${i.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${i.uom || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${i.stock}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${i.price.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${i.createdBy || 'Admin'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span style="border-radius: 50px !important;" onclick="toggleItemStatus(${i.id})" class="cursor-pointer px-2 inline-flex text-xs leading-5 font-semibold rounded-[50px] ${i.status === 'active' ? 'bg-[#15803d] text-white' : 'bg-gray-300 text-gray-800'}">
                        ${i.status.charAt(0).toUpperCase() + i.status.slice(1)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="toggleActionMenu(event, ${i.id}, 'item')" class="action-btn text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i data-lucide="more-vertical" class="w-5 h-5"></i>
                    </button>
                </td>
            </tr>
        `}).join('');
    }

    html += `</tbody>`;
    tbody.innerHTML = html;

    // Append Pagination
    updatePaginationControls('items', totalItems);
}

function renderStock() {
    const tbody = document.getElementById('stock-table');

    // Get filter values
    const sQuery = stockSearch ? stockSearch.value.toLowerCase() : '';
    const typeValue = stockTypeFilter ? stockTypeFilter.value : '';
    const dateValue = stockDateFilter ? stockDateFilter.value : '';

    const filtered = store.stockLogs.filter(l => {
        const matchesSearch = l.itemName.toLowerCase().includes(sQuery) || l.reason.toLowerCase().includes(sQuery);
        const matchesType = typeValue ? l.type === typeValue : true;
        const matchesDate = dateValue ? l.date === dateValue : true;
        return matchesSearch && matchesType && matchesDate;
    });

    const totalItems = filtered.length;
    const { page, limit } = paginationState.stock;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filtered.slice(start, end);

    let html = `
        <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left">
                    <input type="checkbox" class="custom-checkbox" onclick="toggleSelectAll(this)">
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
    `;

    if (paginatedData.length === 0) {
        html += `<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No logs found</td></tr>`;
    } else {
        html += paginatedData.map(l => `
            <tr class="hover:bg-black/5 transition-colors">
                 <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="custom-checkbox" onclick="toggleRow(this)">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${l.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${l.itemName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span style="border-radius: 50px !important;" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-[50px] ${l.type === 'in' ? 'bg-[#15803d] text-white' : 'bg-red-700 text-white'}">
                        ${l.type.toUpperCase()}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${l.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${l.reason}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="toggleActionMenu(event, ${l.id}, 'stock')" class="action-btn text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i data-lucide="more-vertical" class="w-5 h-5"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    html += `</tbody>`;
    tbody.innerHTML = html;

    updatePaginationControls('stock', totalItems);
}

// Full Render Pagination with ID injection
function updatePaginationControls(type, totalItems) {
    const tableContainer = document.querySelector(`#${type}-table`).closest('.bg-white');
    // Remove existing pagination if any
    const existing = tableContainer.querySelector('.pagination-container');
    if (existing) existing.remove();

    const { page, limit } = paginationState[type];
    const totalPages = Math.ceil(totalItems / limit);
    const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, totalItems);

    const paginationHTML = `
        <div class="pagination-container px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div class="flex items-center gap-4">
               <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-700">Show</span>
                    <select onchange="changeLimit('${type}', this.value)" class="border-gray-300 rounded text-sm focus:ring-brand-500 focus:border-brand-500 p-1 border">
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
                <button onclick="changePage('${type}', ${page - 1})" ${page === 1 ? 'disabled' : ''} class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                    <span class="sr-only">Previous</span>
                </button>
                
                ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        // Simple logic: show first 5 or logic for windowing (for now just simple 1-5 or simple range around current)
        // Implementing simple logic: if totalPages <= 5 show all. Else show current window.
        // Improving to exact mock requirement: just numbers.

        let p = i + 1;
        if (totalPages > 5) {
            // Centering logic can be complex, sticking to simple list for now or just current +- 2
            if (page > 3) p = page - 2 + i;
            if (p > totalPages) return '';
        }

        return `
                    <button onclick="changePage('${type}', ${p})" class="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${page === p ? 'z-10 bg-brand-50 border-brand-500 text-brand-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}">
                        ${p}
                    </button>
                    `;
    }).join('')}

                <button onclick="changePage('${type}', ${page + 1})" ${page === totalPages || totalPages === 0 ? 'disabled' : ''} class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                    <span class="sr-only">Next</span>
                </button>
            </div>
        </div>
    `;

    tableContainer.insertAdjacentHTML('beforeend', paginationHTML);
    lucide.createIcons();
}

function changePage(type, newPage) {
    if (newPage < 1) return;
    // Max page check needed but handled by disabled buttons mostly
    paginationState[type].page = newPage;
    render();
}

function changeLimit(type, newLimit) {
    paginationState[type].limit = parseInt(newLimit);
    paginationState[type].page = 1; // Reset to page 1
    render();
}


// --- Actions & Modals ---

function openAddModal() {
    modalOverlay.classList.remove('hidden');
    if (currentTab === 'categories') {
        modalTitle.textContent = 'Add Item Group';
        modalContent.innerHTML = `
            <form id="add-category-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Category Name</label>
                    <input type="text" name="name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center">
                            <input id="cat-status-active" name="status" type="radio" value="active" checked class="focus:ring-brand-500 h-4 w-4 text-brand-600 border-gray-300">
                            <label for="cat-status-active" class="ml-2 block text-sm text-gray-700">Active</label>
                        </div>
                        <div class="flex items-center">
                            <input id="cat-status-inactive" name="status" type="radio" value="inactive" class="focus:ring-[#a855f7] h-4 w-4 text-[#a855f7] border-gray-300">
                            <label for="cat-status-inactive" class="ml-2 block text-sm text-gray-700">Inactive</label>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                    <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4a90e2] hover:bg-[#3b7bc4]">Save</button>
                </div>
            </form>
        `;
        document.getElementById('add-category-form').onsubmit = handleAddCategory;

    } else if (currentTab === 'items') {
        modalTitle.textContent = 'Add Inventory Item';
        const catOptions = store.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        modalContent.innerHTML = `
            <form id="add-item-form" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" name="name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                    </div>
                    <div>
                         <label class="block text-sm font-medium text-gray-700">Category</label>
                        <select name="categoryId" class="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                            ${catOptions}
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">UOM</label>
                        <input type="text" name="uom" placeholder="e.g. Pcs, Box" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                    </div>
                     <div>
                        <label class="block text-sm font-medium text-gray-700">Created By</label>
                        <select name="createdBy" class="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Staff">Staff</option>
                            <option value="User">User</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input type="number" step="0.01" name="price" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Initial Stock</label>
                        <input type="number" name="stock" value="0" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center">
                            <input id="status-active" name="status" type="radio" value="active" checked class="focus:ring-brand-500 h-4 w-4 text-brand-600 border-gray-300">
                            <label for="status-active" class="ml-2 block text-sm text-gray-700">Active</label>
                        </div>
                        <div class="flex items-center">
                            <input id="status-inactive" name="status" type="radio" value="inactive" class="focus:ring-[#a855f7] h-4 w-4 text-[#a855f7] border-gray-300">
                            <label for="status-inactive" class="ml-2 block text-sm text-gray-700">Inactive</label>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                    <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4a90e2] hover:bg-[#3b7bc4]">Save</button>
                </div>
            </form>
        `;
        document.getElementById('add-item-form').onsubmit = handleAddItem;
    } else {
        // Stock Entry Modal
        modalTitle.textContent = 'Add Stock Entry';
        const itemOptions = store.items.map(i => `<option value="${i.id}">${i.name} (Cur: ${i.stock})</option>`).join('');
        modalContent.innerHTML = `
            <form id="add-stock-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Select Item</label>
                    <select name="itemId" class="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                        ${itemOptions}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                     <div>
                        <label class="block text-sm font-medium text-gray-700">Entry Type</label>
                        <select name="type" class="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                            <option value="in">Stock IN (+)</option>
                            <option value="out">Stock OUT (-)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Quantity</label>
                        <input type="number" name="quantity" min="1" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Reason / Supplier</label>
                    <input type="text" name="reason" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                </div>
                <div class="flex justify-end gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                    <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4a90e2] hover:bg-[#3b7bc4]">Save Entry</button>
                </div>
            </form>
        `;
        document.getElementById('add-stock-form').onsubmit = handleAddStock;
    }
}

// FORM HANDLERS

function handleAddCategory(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCat = {
        id: Date.now(),
        name: formData.get('name'),
        description: '',
        status: formData.get('status')
    };
    store.categories.push(newCat);
    closeModal();
    render();
}

function handleAddItem(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
        id: Date.now(),
        code: 'GEN-' + Date.now().toString().slice(-4), // Auto-gen code
        name: formData.get('name'),
        categoryId: parseInt(formData.get('categoryId')),
        uom: formData.get('uom'),
        createdBy: formData.get('createdBy'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        tax: 0,
        status: formData.get('status')
    };
    store.items.push(newItem);

    // Log initial stock
    if (newItem.stock > 0) {
        store.stockLogs.unshift({
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            itemName: newItem.name,
            type: 'in',
            quantity: newItem.stock,
            reason: 'Opening Stock'
        });
    }

    closeModal();
    render();
}

function handleAddStock(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const itemId = parseInt(formData.get('itemId'));
    const type = formData.get('type');
    const qty = parseInt(formData.get('quantity'));
    const reason = formData.get('reason');

    const item = store.items.find(i => i.id === itemId);
    if (!item) return;

    // Update Item Stock
    if (type === 'in') {
        item.stock += qty;
    } else {
        if (item.stock < qty) {
            alert('Insufficient stock!');
            return;
        }
        item.stock -= qty;
    }

    // Add Log
    store.stockLogs.unshift({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        itemName: item.name,
        type: type,
        quantity: qty,
        reason: reason
    });

    closeModal();
    render();
}


// DELETE & EDIT Stubs

function deleteCategory(id) {
    if (confirm('Delete this category?')) {
        store.categories = store.categories.filter(c => c.id !== id);
        render();
    }
}

function deleteItem(id) {
    if (confirm('Delete this item?')) {
        store.items = store.items.filter(i => i.id !== id);
        render();
    }
}

function toggleItemStatus(id) {
    const item = store.items.find(i => i.id === id);
    if (item) {
        item.status = item.status === 'active' ? 'inactive' : 'active';
        render();
    }
}

function editCategory(id) {
    alert('Edit feature would open modal pre-filled. Simplified for demo.');
}

function editItem(id) {
    alert('Edit feature would open modal pre-filled. Simplified for demo.');
}

// Start
document.addEventListener('DOMContentLoaded', init);
