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
        { id: 1, date: '2023-10-25', invoiceNo: 'INV-001', itemName: 'Cola 300ml', inventoryFrom: 'company_warehouse', type: 'in', uom: 'Can', quantity: 50, unitPrice: 2.50, total: 125.00, extraNote: 'First batch' },
        { id: 2, date: '2023-10-26', invoiceNo: 'INV-002', itemName: 'Cheese Burger', inventoryFrom: 'store_purchase', type: 'in', uom: 'Pcs', quantity: 30, unitPrice: 12.00, total: 360.00, extraNote: 'Fresh ingredients' },
        { id: 3, date: '2023-10-27', invoiceNo: '', itemName: 'Cola 300ml', inventoryFrom: 'company_warehouse', type: 'out', uom: 'Can', quantity: 15, unitPrice: 2.50, total: 37.50, extraNote: 'Lunch rush' }
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
const stockFromDate = document.getElementById('stock-from-date');
const stockToDate = document.getElementById('stock-to-date');

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
    // Set Date
    const dateEl = document.getElementById('header-date');
    if (dateEl) dateEl.textContent = new Date().toDateString();

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
    populateCategoryFilter();
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

    // Items Filter Dropdown
    const itemsFilterBtn = document.getElementById('items-filter-btn');
    const itemsFilterDropdown = document.getElementById('items-filter-dropdown');
    const itemsCategoryFilter = document.getElementById('items-category-filter');
    const itemsStatusFilter = document.getElementById('items-status-filter');

    if (itemsFilterBtn && itemsFilterDropdown) {
        itemsFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            itemsFilterDropdown.classList.toggle('hidden');
            // Close export dropdown if open
            const exportDropdown = document.getElementById('items-export-dropdown');
            if (exportDropdown) exportDropdown.classList.add('hidden');
        });

        // Prevent dropdown from closing when clicking inside it
        itemsFilterDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Items Export Dropdown
    const itemsExportBtn = document.getElementById('items-export-btn');
    const itemsExportDropdown = document.getElementById('items-export-dropdown');

    if (itemsExportBtn && itemsExportDropdown) {
        itemsExportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            itemsExportDropdown.classList.toggle('hidden');
            // Close filter dropdown if open
            if (itemsFilterDropdown) itemsFilterDropdown.classList.add('hidden');
        });

        // Prevent dropdown from closing when clicking inside it
        itemsExportDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (itemsFilterDropdown && !itemsFilterDropdown.contains(e.target) && e.target !== itemsFilterBtn) {
            itemsFilterDropdown.classList.add('hidden');
        }
        if (itemsExportDropdown && !itemsExportDropdown.contains(e.target) && e.target !== itemsExportBtn) {
            itemsExportDropdown.classList.add('hidden');
        }
    });

    // Filter change handlers - apply filters when changed
    if (itemsCategoryFilter) {
        itemsCategoryFilter.addEventListener('change', () => {
            paginationState.items.page = 1; // Reset to first page
            render();
        });
    }
    if (itemsStatusFilter) {
        itemsStatusFilter.addEventListener('change', () => {
            paginationState.items.page = 1; // Reset to first page
            render();
        });
    }

    // Stock Specific Filters
    if (stockFromDate) stockFromDate.addEventListener('change', render);
    if (stockToDate) stockToDate.addEventListener('change', render);

    // Stock Export Dropdown
    const stockExportBtn = document.getElementById('stock-export-btn');
    const stockExportDropdown = document.getElementById('stock-export-dropdown');

    if (stockExportBtn && stockExportDropdown) {
        stockExportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stockExportDropdown.classList.toggle('hidden');
        });

        // Add to global close listener if not covered
        // Note: The global listener below covers itemsExportDropdown, we should extend it or add specific logic here
        // Ideally, we modify the existing global listener, but appending here is safer
        document.addEventListener('click', (e) => {
            if (!stockExportDropdown.contains(e.target) && e.target !== stockExportBtn) {
                stockExportDropdown.classList.add('hidden');
            }
        });
    }
    if (stockToDate) stockToDate.addEventListener('change', render);
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
    `;

    if (paginatedData.length === 0) {
        html += `<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No categories found</td></tr>`;
    } else {
        html += paginatedData.map(c => {
            return `
            <tr class="hover:bg-black/5 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="custom-checkbox" onclick="toggleRow(this)">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${c.name}</td>
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

    // Get filter values
    const categoryFilter = document.getElementById('items-category-filter');
    const statusFilter = document.getElementById('items-status-filter');
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const statusValue = statusFilter ? statusFilter.value : '';

    const filtered = store.items.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(query) || i.code.toLowerCase().includes(query);
        const matchesCategory = categoryValue ? i.categoryId === parseInt(categoryValue) : true;
        const matchesStatus = statusValue ? i.status === statusValue : true;
        return matchesSearch && matchesCategory && matchesStatus;
    });

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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
    `;

    if (paginatedData.length === 0) {
        html += `<tr><td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">No items found</td></tr>`;
    } else {
        html += paginatedData.map(i => {
            return `
            <tr class="hover:bg-black/5 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="custom-checkbox" onclick="toggleRow(this)">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${i.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${i.uom || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${i.price.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${i.stock}</td>
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
    const fromDateValue = stockFromDate ? stockFromDate.value : '';
    const toDateValue = stockToDate ? stockToDate.value : '';

    const filtered = store.stockLogs.filter(l => {
        // Date range filtering
        let matchesDateRange = true;
        if (fromDateValue && toDateValue) {
            matchesDateRange = l.date >= fromDateValue && l.date <= toDateValue;
        } else if (fromDateValue) {
            matchesDateRange = l.date >= fromDateValue;
        } else if (toDateValue) {
            matchesDateRange = l.date <= toDateValue;
        }

        return matchesDateRange;
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice#</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory From</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UoM</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra Note</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
    `;

    if (paginatedData.length === 0) {
        html += `<tr><td colspan="12" class="px-6 py-4 text-center text-sm text-gray-500">No logs found</td></tr>`;
    } else {
        html += paginatedData.map(l => {
            // Format inventory source for display
            const inventoryFromDisplay = l.inventoryFrom
                ? (l.inventoryFrom === 'company_warehouse' ? 'Company Warehouse' : 'Store Purchase')
                : '-';

            return `
            <tr class="hover:bg-black/5 transition-colors">
                 <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="custom-checkbox" onclick="toggleRow(this)">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${l.invoiceNo || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${l.itemName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${inventoryFromDisplay}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span style="border-radius: 50px !important;" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-[50px] ${l.type === 'in' ? 'bg-[#15803d] text-white' : 'bg-red-700 text-white'}">
                        ${l.type === 'in' ? 'Received' : 'Consumed'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${l.uom || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${l.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${l.unitPrice ? l.unitPrice.toFixed(2) : '0.00'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹${l.total ? l.total.toFixed(2) : '0.00'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${l.extraNote || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${l.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="toggleActionMenu(event, ${l.id}, 'stock')" class="action-btn text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i data-lucide="more-vertical" class="w-5 h-5"></i>
                    </button>
                </td>
            </tr>
        `}).join('');
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
    const modalContainer = document.getElementById('modal-container');
    modalOverlay.classList.remove('hidden');

    // Reset Modal Width to default first
    if (modalContainer) {
        modalContainer.classList.remove('max-w-5xl', 'max-w-4xl', 'max-w-6xl');
        modalContainer.classList.add('max-w-md');
    }

    if (currentTab === 'categories') {
        modalTitle.textContent = 'Add Item Category';
        modalContent.innerHTML = `
            <form id="add-category-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Category Name</label>
                    <input type="text" name="name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div class="flex items-center">
                        <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="status" id="cat-status-toggle" value="active" checked 
                                class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                onchange="document.getElementById('cat-status-label').textContent = this.checked ? 'Active' : 'Inactive'">
                            <label for="cat-status-toggle" class="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer"></label>
                        </div>
                        <label for="cat-status-toggle" class="text-sm text-gray-700" id="cat-status-label">Active</label>
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
        modalTitle.textContent = 'Add Raw Item Template';
        const catOptions = store.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        modalContent.innerHTML = `
            <form id="add-item-form" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Name <span class="text-red-500">*</span></label>
                        <input type="text" name="name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                    </div>
                    <div>
                         <label class="block text-sm font-medium text-gray-700">Category <span class="text-red-500">*</span></label>
                        <select name="categoryId" required class="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                            ${catOptions}
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">UoM</label>
                        <input type="text" name="uom" placeholder="e.g. Pcs, Box, Can" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Price (₹) <span class="text-red-500">*</span></label>
                        <input type="number" step="0.01" name="price" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div class="flex items-center">
                        <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="status" id="item-status-toggle" value="active" checked 
                                class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                onchange="document.getElementById('item-status-label').textContent = this.checked ? 'Active' : 'Inactive'">
                            <label for="item-status-toggle" class="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer"></label>
                        </div>
                        <label for="item-status-toggle" class="text-sm text-gray-700" id="item-status-label">Active</label>
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
        // Stock Entry Modal - Enhanced with singular row entries
        modalTitle.textContent = 'Add Stock Entry';

        // Reset counter for new modal
        stockItemRowCounter = 0;

        // Make modal wider for this view
        if (modalContainer) {
            modalContainer.classList.remove('max-w-md');
            modalContainer.classList.add('max-w-5xl');
        }

        modalContent.innerHTML = `
            <form id="add-stock-form" class="space-y-6">
                <!-- Header Information - Compact 4 Column Grid -->
                <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Invoice Number <span class="text-red-500">*</span></label>
                        <input type="text" id="stock-invoice-no" placeholder="INV-XXX" required class="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date <span class="text-red-500">*</span></label>
                        <input type="date" id="stock-date" required value="${new Date().toISOString().split('T')[0]}" class="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-sm">
                    </div>
                     <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Inventory From <span class="text-red-500">*</span></label>
                        <select id="stock-inventory-from" required class="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-sm">
                            <option value="company_warehouse">Company Warehouse</option>
                            <option value="store_purchase">Store Purchase</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Entry Type <span class="text-red-500">*</span></label>
                        <select id="stock-type" required class="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-sm">
                            <option value="in">Stock IN (+)</option>
                            <option value="out">Stock OUT (-)</option>
                        </select>
                    </div>
                    <div class="col-span-4">
                        <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Extra Note</label>
                         <textarea id="stock-extra-note" placeholder="Add any additional notes here..." class="block w-full border border-gray-300 shadow-sm py-1.5 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-sm resize-y" rows="2"></textarea>
                    </div>
                </div>

                <!-- Items Section -->
                <div>
                   <div class="mb-2">
                        <h4 class="text-sm font-bold text-gray-800">Items List</h4>
                    </div>

                    <!-- Column Headers -->
                    <!-- Column Headers -->
                    <div class="grid grid-cols-12 gap-3 px-2 py-2 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div class="col-span-4">Item Name <span class="text-red-500">*</span></div>
                        <div class="col-span-2">UoM <span class="text-red-500">*</span></div>
                        <div class="col-span-2">Quantity <span class="text-red-500">*</span></div>
                        <div class="col-span-2">Unit Price (₹) <span class="text-red-500">*</span></div>
                        <div class="col-span-1">Total (₹)</div>
                        <div class="col-span-1 text-center">Action</div>
                    </div>

                    <div id="stock-items-container" class="border border-t-0 border-gray-200 divide-y divide-gray-200 bg-white max-h-[300px] overflow-y-auto">
                        <!-- Items will be added here dynamically -->
                    </div>
                    
                    <!-- Add Item Button (Moved Position) -->
                    <div class="mt-2 text-left">
                        <button type="button" onclick="addStockItemRow()" class="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none">
                            <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                            Add Item
                        </button>
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                    <button type="submit" class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4a90e2] hover:bg-[#3b7bc4]">Save Entry</button>
                </div>
            </form>
        `;

        document.getElementById('add-stock-form').onsubmit = handleAddStock;

        // Add first item row by default
        setTimeout(() => {
            addStockItemRow();
            if (window.lucide) lucide.createIcons();
        }, 0);
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
        status: formData.get('status') ? 'active' : 'inactive'
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
        uom: formData.get('uom') || '',
        createdBy: 'Admin', // Default value since field was removed
        price: parseFloat(formData.get('price')),
        stock: 0, // Default to 0 since Initial Stock field was removed
        tax: 0,
        status: formData.get('status') ? 'active' : 'inactive'
    };
    store.items.push(newItem);

    closeModal();
    render();

    // Repopulate category filter after adding new item
    populateCategoryFilter();
}

// Helper functions for stock modal - Enhanced for multiple items
let stockItemRowCounter = 0;

function addStockItemRow() {
    const container = document.getElementById('stock-items-container');
    if (!container) return;

    const rowId = ++stockItemRowCounter;
    const itemOptions = store.items.map(i =>
        `<option value="${i.id}" data-price="${i.price}" data-uom="${i.uom || ''}">${i.name} (Stock: ${i.stock})</option>`
    ).join('');

    const rowHTML = `
        <div class="stock-item-row grid grid-cols-12 gap-3 p-2 items-center hover:bg-gray-50" data-row-id="${rowId}">
            <div class="col-span-4">
                <select class="item-select block w-full bg-white border border-gray-300 rounded-none shadow-sm py-1.5 px-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-sm" 
                        onchange="updateItemRowData(${rowId})" required>
                    ${itemOptions}
                </select>
            </div>
            
            <div class="col-span-2">
                <input type="text" class="item-uom block w-full bg-gray-50 border border-gray-300 rounded-none shadow-sm py-1.5 px-2 focus:outline-none text-sm text-gray-500 cursor-not-allowed" 
                       placeholder="UoM" required disabled>
            </div>
            
            <div class="col-span-2">
                <input type="number" class="item-quantity block w-full border border-gray-300 rounded-none shadow-sm py-1.5 px-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-sm" 
                       min="1" required onchange="calculateItemTotal(${rowId})">
            </div>
            
            <div class="col-span-2">
                <input type="number" class="item-price block w-full border border-gray-300 rounded-none shadow-sm py-1.5 px-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-sm" 
                       step="0.01" required onchange="calculateItemTotal(${rowId})">
            </div>
            
            <div class="col-span-1">
                <input type="number" class="item-total block w-full border border-gray-300 rounded-none shadow-sm py-1.5 px-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-sm text-right" 
                       step="0.01" onchange="calculateItemPrice(${rowId})" value="0.00">
            </div>
            
            <div class="col-span-1 text-center">
                <button type="button" onclick="removeStockItemRow(${rowId})" class="text-red-500 hover:text-red-700 focus:outline-none p-1 rounded-full hover:bg-red-50 transition-colors" title="Remove Item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', rowHTML);

    // Initialize the first item's data
    updateItemRowData(rowId);

    if (window.lucide) lucide.createIcons();
}

// Ensure clean close
function closeModal() {
    modalOverlay.classList.add('hidden');
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.classList.remove('max-w-5xl', 'max-w-4xl', 'max-w-6xl');
        modalContainer.classList.add('max-w-md'); // Reset to default width
    }
}

function removeStockItemRow(rowId) {
    const row = document.querySelector(`[data - row - id= "${rowId}"]`);
    if (row) {
        const container = document.getElementById('stock-items-container');
        // Prevent removing the last item
        if (container.querySelectorAll('.stock-item-row').length > 1) {
            row.remove();
        } else {
            alert('At least one item is required!');
        }
    }
}

function updateItemRowData(rowId) {
    const row = document.querySelector(`[data - row - id= "${rowId}"]`);
    if (!row) return;

    const select = row.querySelector('.item-select');
    const uomInput = row.querySelector('.item-uom');
    const priceInput = row.querySelector('.item-price');

    if (select && uomInput && priceInput) {
        const selectedOption = select.options[select.selectedIndex];
        const price = selectedOption.getAttribute('data-price');
        const uom = selectedOption.getAttribute('data-uom');

        uomInput.value = uom || '';
        priceInput.value = price || '0';

        calculateItemTotal(rowId);
    }
}

function calculateItemTotal(rowId) {
    const row = document.querySelector(`[data - row - id= "${rowId}"]`);
    if (!row) return;

    const quantity = row.querySelector('.item-quantity');
    const unitPrice = row.querySelector('.item-price');
    const total = row.querySelector('.item-total');

    if (quantity && unitPrice && total) {
        const qty = parseFloat(quantity.value) || 0;
        const price = parseFloat(unitPrice.value) || 0;
        total.value = (qty * price).toFixed(2);
    }
}

function calculateItemPrice(rowId) {
    const row = document.querySelector(`[data-row-id="${rowId}"]`);
    if (!row) return;

    const quantity = row.querySelector('.item-quantity');
    const unitPrice = row.querySelector('.item-price');
    const total = row.querySelector('.item-total');

    if (quantity && unitPrice && total) {
        const qty = parseFloat(quantity.value) || 0;
        const tot = parseFloat(total.value) || 0;

        if (qty > 0) {
            unitPrice.value = (tot / qty).toFixed(2);
        }
    }
}

function handleAddStock(e) {
    e.preventDefault();

    // Get header information
    const invoiceNo = document.getElementById('stock-invoice-no').value;
    const date = document.getElementById('stock-date').value;
    const inventoryFrom = document.getElementById('stock-inventory-from').value;
    const type = document.getElementById('stock-type').value;
    const extraNote = document.getElementById('stock-extra-note').value;

    // Get all item rows
    const itemRows = document.querySelectorAll('.stock-item-row');

    if (itemRows.length === 0) {
        alert('Please add at least one item!');
        return;
    }

    let hasError = false;
    const stockEntries = [];

    itemRows.forEach(row => {
        const itemSelect = row.querySelector('.item-select');
        const itemId = parseInt(itemSelect.value);
        const itemName = itemSelect.options[itemSelect.selectedIndex].text.split(' (Stock:')[0];
        const uom = row.querySelector('.item-uom').value;
        const quantity = parseInt(row.querySelector('.item-quantity').value);
        const unitPrice = parseFloat(row.querySelector('.item-price').value);
        const total = parseFloat(row.querySelector('.item-total').value);

        const item = store.items.find(i => i.id === itemId);
        if (!item) {
            hasError = true;
            return;
        }

        // Validate stock for OUT entries
        if (type === 'out' && item.stock < quantity) {
            alert(`Insufficient stock for ${item.name}! Available: ${item.stock} `);
            hasError = true;
            return;
        }

        stockEntries.push({
            item,
            itemName,
            uom,
            quantity,
            unitPrice,
            total
        });
    });

    if (hasError) return;

    // Process all entries
    stockEntries.forEach(entry => {
        // Update Item Stock
        if (type === 'in') {
            entry.item.stock += entry.quantity;
        } else {
            entry.item.stock -= entry.quantity;
        }

        // Add Log Entry
        store.stockLogs.unshift({
            id: Date.now() + Math.random(), // Ensure unique IDs
            date: date,
            invoiceNo: invoiceNo || '',
            itemName: entry.itemName,
            inventoryFrom: inventoryFrom,
            type: type,
            uom: entry.uom,
            quantity: entry.quantity,
            unitPrice: entry.unitPrice,
            total: entry.total,
            extraNote: extraNote || ''
        });
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

// Export Functions
function exportItems(format) {
    if (format === 'pdf') {
        alert('Exporting items as PDF... (Feature to be implemented)');
    } else if (format === 'excel') {
        alert('Exporting items as Excel... (Feature to be implemented)');
    }
    // Close dropdown after export
    const exportDropdown = document.getElementById('items-export-dropdown');
    if (exportDropdown) exportDropdown.classList.add('hidden');
}

function exportStock(format) {
    if (format === 'pdf') {
        alert('Exporting stock entries as PDF... (Feature to be implemented)');
    } else if (format === 'excel') {
        alert('Exporting stock entries as Excel... (Feature to be implemented)');
    }
    const exportDropdown = document.getElementById('stock-export-dropdown');
    if (exportDropdown) exportDropdown.classList.add('hidden');
}

// Populate category filter dropdown
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('items-category-filter');
    if (categoryFilter && store.categories) {
        // Clear existing options except "All Categories"
        categoryFilter.innerHTML = '<option value="">All Categories</option>';

        // Add category options
        store.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categoryFilter.appendChild(option);
        });
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);
