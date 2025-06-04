// Global variables
let currentUser = null;
let isAdmin = false;
let approvedDivers = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadTrainingForms();
    loadApprovedDivers();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Navigation
    setupSmoothScrolling();

    // Authentication
    setupAuthEvents();

    // Modal events
    setupModalEvents();

    // Admin panel events
    setupAdminEvents();

}

// Smooth scrolling for navigation
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Authentication Events
function setupAuthEvents() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBtn = document.getElementById('admin-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Login button click
    loginBtn.addEventListener('click', () => {
        openModal('login-modal');
    });

    // Logout button click
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            showMessage('Logged out successfully', 'success');
        }).catch((error) => {
            showMessage('Error logging out: ' + error.message, 'error');
        });
    });

    // Admin button click
    adminBtn.addEventListener('click', () => {
        openModal('admin-modal');
        loadAdminPanel();
    });

    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                closeModal('login-modal');
                showMessage('Logged in successfully', 'success');
                loginForm.reset();
            })
            .catch((error) => {
                showMessage('Login error: ' + error.message, 'error');
            });
    });

    // Register form submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Update profile with display name
                return userCredential.user.updateProfile({
                    displayName: name
                });
            })
            .then(() => {
                closeModal('login-modal');
                showMessage('Account created successfully', 'success');
                registerForm.reset();
            })
            .catch((error) => {
                showMessage('Registration error: ' + error.message, 'error');
            });
    });

    // Auth tab switching
    const authTabBtns = document.querySelectorAll('.auth-tabs .tab-btn');
    authTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchAuthTab(tabId);
        });
    });
}

// Switch authentication tabs
function switchAuthTab(tabId) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.modal .tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Modal Events
function setupModalEvents() {
    const closeButtons = document.querySelectorAll('.close-modal');

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Open modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Admin Panel Events
function setupAdminEvents() {
    // Admin tab switching
    const adminTabBtns = document.querySelectorAll('.admin-tabs .tab-btn');
    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchAdminTab(tabId);
        });
    });

    // Add training form submission
    const addFormForm = document.getElementById('add-form');
    addFormForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTrainingForm();
    });

    // Add diver form submission
    const addDiverForm = document.getElementById('add-diver-form');
    addDiverForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addApprovedDiver();
    });
}

// Switch admin tabs
function switchAdminTab(tabId) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#admin-modal .tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`.admin-tabs [data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Load admin panel data
function loadAdminPanel() {
    loadAdminFormsList();
    loadAdminDiversList();
}


// Training Forms Management
async function loadTrainingForms() {
    try {
        const formsSnapshot = await db.collection('trainingForms').orderBy('date', 'asc').get();
        const mediterraneanContainer = document.getElementById('mediterranean-forms');
        const eilatContainer = document.getElementById('eilat-forms');

        mediterraneanContainer.innerHTML = '';
        eilatContainer.innerHTML = '';

        if (formsSnapshot.empty) {
            mediterraneanContainer.innerHTML = '<p>No Mediterranean training sessions available.</p>';
            eilatContainer.innerHTML = '<p>No Eilat training sessions available.</p>';
            return;
        }

        formsSnapshot.forEach((doc) => {
            const formData = doc.data();
            const formElement = createTrainingFormElement(doc.id, formData);

            if (formData.location === 'mediterranean') {
                mediterraneanContainer.appendChild(formElement);
            } else if (formData.location === 'eilat') {
                eilatContainer.appendChild(formElement);
            }
        });
    } catch (error) {
        console.error('Error loading training forms:', error);
        showMessage('Error loading training forms', 'error');
    }
}

// Create training form element
function createTrainingFormElement(formId, formData) {
    const formDiv = document.createElement('div');
    formDiv.className = 'training-form';
    formDiv.dataset.formId = formId;

    const maxDivers = formData.location === 'mediterranean' ? 4 : 7;
    const maxWaiting = 2;

    formDiv.innerHTML = `
        <div class="form-date">${formatDate(formData.date)}</div>
        
        <div class="divers-section">
            <h4>Divers (${maxDivers} spots)</h4>
            ${Array.from({length: maxDivers}, (_, i) => `
                <div class="diver-slot">
                    <select class="diver-select" data-slot="${i}" data-form-id="${formId}">
                        <option value="">Select diver...</option>
                    </select>
                    <button class="ok-btn" onclick="confirmDiverSelection('${formId}', ${i}, false)" style="display: none;">OK</button>
                    <button class="clear-btn" onclick="clearDiverSlot('${formId}', ${i})" disabled>Clear</button>
                </div>
            `).join('')}
        </div>

        <div class="waiting-section">
            <h4>Waiting List (${maxWaiting} spots)</h4>
            ${Array.from({length: maxWaiting}, (_, i) => `
                <div class="waiting-slot">
                    <select class="waiting-select" data-slot="${i}" data-form-id="${formId}">
                        <option value="">Select diver...</option>
                    </select>
                    <button class="ok-btn" onclick="confirmDiverSelection('${formId}', ${i}, true)" style="display: none;">OK</button>
                    <button class="clear-btn" onclick="clearWaitingSlot('${formId}', ${i})" disabled>Clear</button>
                </div>
            `).join('')}
        </div>
    `;

    // Populate dropdowns with approved divers
    populateDropdowns(formDiv, formId);

    // Load existing registrations
    loadFormRegistrations(formId, formDiv);

    return formDiv;
}

// Populate dropdowns with approved divers
async function populateDropdowns(formElement, formId) {
    const selects = formElement.querySelectorAll('select');

    selects.forEach(select => {
        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select diver...</option>';

        // Add approved divers
        approvedDivers.forEach(diver => {
            const option = document.createElement('option');
            option.value = diver.id;
            option.textContent = diver.name;
            select.appendChild(option);
        });

        // Add event listener for selection
        select.addEventListener('change', (e) => {
            handleDiverSelection(e, formId);
        });
    });
}

// Handle diver selection
function handleDiverSelection(event, formId) {
    const select = event.target;
    const diverId = select.value;
    const slot = select.dataset.slot;
    const isWaiting = select.classList.contains('waiting-select');
    const okBtn = select.parentElement.querySelector('.ok-btn');
    const clearBtn = select.parentElement.querySelector('.clear-btn');

    if (!diverId) {
        okBtn.style.display = 'none';
        return;
    }

    // Show OK button for non-admin users, auto-confirm for admin users
    if (!currentUser || !isAdmin) {
        okBtn.style.display = 'inline-block';
    } else {
        // Auto-confirm for admin users
        confirmDiverSelection(formId, slot, isWaiting);
    }
}

// Confirm diver selection and lock the row
async function confirmDiverSelection(formId, slot, isWaiting) {
    const selectClass = isWaiting ? 'waiting-select' : 'diver-select';
    const select = document.querySelector(`[data-form-id="${formId}"][data-slot="${slot}"].${selectClass}`);
    const okBtn = select.parentElement.querySelector('.ok-btn');
    const clearBtn = select.parentElement.querySelector('.clear-btn');
    
    const diverId = select.value;
    const diverName = select.options[select.selectedIndex].text;

    if (!diverId) return;

    try {
        // Save selection to Firestore
        const registrationData = {
            formId: formId,
            diverId: diverId,
            diverName: diverName,
            slot: parseInt(slot),
            isWaiting: isWaiting,
            registeredBy: currentUser ? currentUser.uid : 'anonymous',
            registeredAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('registrations').add(registrationData);

        // Lock the row for non-admin users
        select.classList.add('filled');
        select.disabled = !isAdmin; // Only admin can change filled slots
        okBtn.style.display = 'none';
        clearBtn.disabled = false;
        clearBtn.style.display = isAdmin ? 'inline-block' : 'none'; // Only show clear for admin

        showMessage(`Successfully registered ${diverName}`, 'success');

    } catch (error) {
        console.error('Error registering diver:', error);
        showMessage('Error registering diver: ' + error.message, 'error');
        select.value = '';
        okBtn.style.display = 'none';
    }
}

// Clear diver slot (authenticated users only)
async function clearDiverSlot(formId, slot) {
    if (!currentUser) {
        showMessage('Please log in to clear registrations', 'error');
        return;
    }

    try {
        // Find and delete the registration
        const registrationsSnapshot = await db.collection('registrations')
            .where('formId', '==', formId)
            .where('slot', '==', slot)
            .where('isWaiting', '==', false)
            .get();

        registrationsSnapshot.forEach(async (doc) => {
            await doc.ref.delete();
        });

        // Update UI
        const select = document.querySelector(`[data-form-id="${formId}"][data-slot="${slot}"].diver-select`);
        select.value = '';
        select.classList.remove('filled');
        select.parentElement.querySelector('.clear-btn').disabled = true;

        showMessage('Registration cleared successfully', 'success');

    } catch (error) {
        console.error('Error clearing registration:', error);
        showMessage('Error clearing registration', 'error');
    }
}

// Clear waiting slot (authenticated users only)
async function clearWaitingSlot(formId, slot) {
    if (!currentUser) {
        showMessage('Please log in to clear registrations', 'error');
        return;
    }

    try {
        // Find and delete the registration
        const registrationsSnapshot = await db.collection('registrations')
            .where('formId', '==', formId)
            .where('slot', '==', slot)
            .where('isWaiting', '==', true)
            .get();

        registrationsSnapshot.forEach(async (doc) => {
            await doc.ref.delete();
        });

        // Update UI
        const select = document.querySelector(`[data-form-id="${formId}"][data-slot="${slot}"].waiting-select`);
        select.value = '';
        select.classList.remove('filled');
        select.parentElement.querySelector('.clear-btn').disabled = true;

        showMessage('Waiting list registration cleared successfully', 'success');

    } catch (error) {
        console.error('Error clearing waiting registration:', error);
        showMessage('Error clearing waiting registration', 'error');
    }
}

// Load existing registrations for a form
async function loadFormRegistrations(formId, formElement) {
    try {
        const registrationsSnapshot = await db.collection('registrations')
            .where('formId', '==', formId)
            .get();

        registrationsSnapshot.forEach((doc) => {
            const registration = doc.data();
            const selectClass = registration.isWaiting ? 'waiting-select' : 'diver-select';
            const select = formElement.querySelector(`[data-slot="${registration.slot}"].${selectClass}`);

            if (select) {
                select.value = registration.diverId;
                select.classList.add('filled');
                select.disabled = !isAdmin; // Lock for non-admin users
                
                const okBtn = select.parentElement.querySelector('.ok-btn');
                const clearBtn = select.parentElement.querySelector('.clear-btn');
                
                okBtn.style.display = 'none';
                clearBtn.disabled = false;
                clearBtn.style.display = isAdmin ? 'inline-block' : 'none'; // Only show clear for admin
            }
        });
    } catch (error) {
        console.error('Error loading form registrations:', error);
    }
}

// Add new training form (authenticated users only)
async function addTrainingForm() {
    if (!currentUser) {
        showMessage('Please log in to add training forms', 'error');
        return;
    }

    const location = document.getElementById('form-location').value;
    const date = document.getElementById('form-date').value;

    if (!location || !date) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    try {
        const formData = {
            location: location,
            date: date,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        };

        await db.collection('trainingForms').add(formData);

        showMessage('Training form added successfully', 'success');
        document.getElementById('add-form').reset();
        loadTrainingForms();
        loadAdminFormsList();

    } catch (error) {
        console.error('Error adding training form:', error);
        showMessage('Error adding training form: ' + error.message, 'error');
    }
}

// Load approved divers
async function loadApprovedDivers() {
    try {
        const diversSnapshot = await db.collection('approvedDivers').orderBy('name').get();
        approvedDivers = [];

        diversSnapshot.forEach((doc) => {
            approvedDivers.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Update all dropdowns
        const allSelects = document.querySelectorAll('.diver-select, .waiting-select');
        allSelects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select diver...</option>';

            approvedDivers.forEach(diver => {
                const option = document.createElement('option');
                option.value = diver.id;
                option.textContent = diver.name;
                select.appendChild(option);
            });

            // Restore previous selection
            select.value = currentValue;
        });

    } catch (error) {
        console.error('Error loading approved divers:', error);
        showMessage('Error loading approved divers', 'error');
    }
}

// Add approved diver (authenticated users only)
async function addApprovedDiver() {
    if (!currentUser) {
        showMessage('Please log in to add approved divers', 'error');
        return;
    }

    const name = document.getElementById('diver-name').value.trim();

    if (!name) {
        showMessage('Please enter a diver name', 'error');
        return;
    }

    try {
        const diverData = {
            name: name,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        };

        await db.collection('approvedDivers').add(diverData);

        showMessage('Approved diver added successfully', 'success');
        document.getElementById('add-diver-form').reset();
        loadApprovedDivers();
        loadAdminDiversList();

    } catch (error) {
        console.error('Error adding approved diver:', error);
        showMessage('Error adding approved diver: ' + error.message, 'error');
    }
}

// Load admin forms list
async function loadAdminFormsList() {
    try {
        const formsSnapshot = await db.collection('trainingForms').orderBy('date', 'desc').get();
        const formsList = document.getElementById('admin-forms-list');

        formsList.innerHTML = '';

        if (formsSnapshot.empty) {
            formsList.innerHTML = '<p>No training forms created yet.</p>';
            return;
        }

        formsSnapshot.forEach((doc) => {
            const formData = doc.data();
            const formDiv = document.createElement('div');
            formDiv.className = 'form-item';

            formDiv.innerHTML = `
                <h4>${formData.location === 'mediterranean' ? 'Mediterranean Sea' : 'Eilat'}</h4>
                <p>Date: ${formatDate(formData.date)}</p>
                <p>Created: ${formData.createdAt ? formatDate(formData.createdAt.toDate()) : 'Unknown'}</p>
                <button class="remove-btn" onclick="removeTrainingForm('${doc.id}')">Remove Form</button>
            `;

            formsList.appendChild(formDiv);
        });
    } catch (error) {
        console.error('Error loading admin forms list:', error);
    }
}

// Load admin divers list
async function loadAdminDiversList() {
    try {
        const diversSnapshot = await db.collection('approvedDivers').orderBy('name').get();
        const diversList = document.getElementById('divers-list');

        diversList.innerHTML = '';

        if (diversSnapshot.empty) {
            diversList.innerHTML = '<p>No approved divers yet.</p>';
            return;
        }

        diversSnapshot.forEach((doc) => {
            const diverData = doc.data();
            const diverDiv = document.createElement('div');
            diverDiv.className = 'diver-item';

            diverDiv.innerHTML = `
                <span>${diverData.name}</span>
                <button class="remove-btn" onclick="removeApprovedDiver('${doc.id}')">Remove</button>
            `;

            diversList.appendChild(diverDiv);
        });
    } catch (error) {
        console.error('Error loading admin divers list:', error);
    }
}

// Remove training form (authenticated users only)
async function removeTrainingForm(formId) {
    if (!currentUser) {
        showMessage('Please log in to remove training forms', 'error');
        return;
    }

    if (!confirm('Are you sure you want to remove this training form? This will also remove all registrations.')) {
        return;
    }

    try {
        // Remove all registrations for this form
        const registrationsSnapshot = await db.collection('registrations')
            .where('formId', '==', formId)
            .get();

        const batch = db.batch();
        registrationsSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Remove the form
        batch.delete(db.collection('trainingForms').doc(formId));

        await batch.commit();

        showMessage('Training form removed successfully', 'success');
        loadTrainingForms();
        loadAdminFormsList();

    } catch (error) {
        console.error('Error removing training form:', error);
        showMessage('Error removing training form: ' + error.message, 'error');
    }
}

// Remove approved diver (authenticated users only)
async function removeApprovedDiver(diverId) {
    if (!currentUser) {
        showMessage('Please log in to remove approved divers', 'error');
        return;
    }

    if (!confirm('Are you sure you want to remove this approved diver? This will also remove all their registrations.')) {
        return;
    }

    try {
        // Remove all registrations for this diver
        const registrationsSnapshot = await db.collection('registrations')
            .where('diverId', '==', diverId)
            .get();

        const batch = db.batch();
        registrationsSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Remove the diver
        batch.delete(db.collection('approvedDivers').doc(diverId));

        await batch.commit();

        showMessage('Approved diver removed successfully', 'success');
        loadApprovedDivers();
        loadAdminDiversList();
        loadTrainingForms(); // Reload to update dropdowns

    } catch (error) {
        console.error('Error removing approved diver:', error);
        showMessage('Error removing approved diver: ' + error.message, 'error');
    }
}

// Utility Functions
function formatDate(date) {
    if (typeof date === 'string') {
        return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Insert at the top of the main content
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Firebase auth state change listener
auth.onAuthStateChanged(async (user) => {
    currentUser = user;

    if (user) {
        // All authenticated users have admin access
        isAdmin = true;

        // Update UI based on auth state
        updateAuthUI(user);

        // Reload data
        loadTrainingForms();
        loadApprovedDivers();
    } else {
        isAdmin = false;
        updateAuthUI(null);
    }
});

// Update authentication UI
function updateAuthUI(user) {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBtn = document.getElementById('admin-btn');
    const userInfo = document.getElementById('user-info');

    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        userInfo.style.display = 'inline-block';
        userInfo.textContent = `Welcome, ${user.displayName || user.email}`;
        adminBtn.style.display = 'inline-block'; // All authenticated users see admin panel
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        adminBtn.style.display = 'none';
        userInfo.style.display = 'none';
    }
}

// Make functions globally accessible
window.clearDiverSlot = clearDiverSlot;
window.clearWaitingSlot = clearWaitingSlot;
window.removeTrainingForm = removeTrainingForm;
window.removeApprovedDiver = removeApprovedDiver;
window.confirmDiverSelection = confirmDiverSelection;