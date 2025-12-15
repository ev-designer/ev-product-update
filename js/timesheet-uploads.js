// ====== FILE UPLOAD FUNCTIONS ======

// File Validation
function validateFileSize(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    return file.size <= maxSize;
}

function validateFileExtension(file) {
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'webp', 'pdf', 'doc', 'docx'];
    const ext = file.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(ext);
}

function isImageFile(file) {
    return file.type.startsWith('image/');
}

// Photo Upload Handler
let currentPhoto = null;

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate
    if (!validateFileSize(file)) {
        alert('Photo file size must be less than 5MB');
        event.target.value = '';
        return;
    }

    if (!isImageFile(file)) {
        alert('Only image files (JPEG, PNG, WEBP) are allowed for photo');
        event.target.value = '';
        return;
    }

    // Read and preview
    const reader = new FileReader();
    reader.onload = (e) => {
        currentPhoto = e.target.result;
        document.getElementById('photo-preview-img').src = e.target.result;
        document.getElementById('photo-placeholder').classList.add('hidden');
        document.getElementById('photo-preview').classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    currentPhoto = null;
    document.getElementById('profile-photo').value = '';
    document.getElementById('photo-placeholder').classList.remove('hidden');
    document.getElementById('photo-preview').classList.add('hidden');
}

// ID Proof Upload Handler
let idProofFiles = [];

function handleIDProofUpload(event) {
    const files = Array.from(event.target.files);

    for (const file of files) {
        // Validate
        if (!validateFileSize(file)) {
            alert(`File "${file.name}" exceeds 5MB limit`);
            continue;
        }

        if (!validateFileExtension(file)) {
            alert(`File "${file.name}" has an unsupported extension`);
            continue;
        }

        // Read file
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                isImage: isImageFile(file)
            };
            idProofFiles.push(fileData);
            renderIDProofList();
        };
        reader.readAsDataURL(file);
    }

    // Clear input
    event.target.value = '';
}

function removeIDProof(index) {
    idProofFiles.splice(index, 1);
    renderIDProofList();
}

function renderIDProofList() {
    const container = document.getElementById('id-proof-list');
    if (idProofFiles.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = idProofFiles.map((file, index) => {
        const sizeKB = (file.size / 1024).toFixed(1);

        if (file.isImage) {
            return `
                <div class="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                    <img src="${file.data}" class="w-16 h-16 object-cover rounded" />
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-700 truncate">${file.name}</p>
                        <p class="text-xs text-gray-500">${sizeKB} KB</p>
                    </div>
                    <button type="button" onclick="removeIDProof(${index})" class="text-red-600 hover:text-red-800 p-1">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                    <div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <i data-lucide="file-text" class="w-5 h-5 text-gray-600"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-700 truncate">${file.name}</p>
                        <p class="text-xs text-gray-500">${sizeKB} KB</p>
                    </div>
                    <button type="button" onclick="removeIDProof(${index})" class="text-red-600 hover:text-red-800 p-1">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
        }
    }).join('');

    if (window.lucide) lucide.createIcons();
}
