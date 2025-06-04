// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCuLVudY3rCQacnwSfv4hosgYgGmfx2ygs",
    authDomain: "peak-performance-b752a.firebaseapp.com",
    projectId: "peak-performance-b752a",
    storageBucket: "peak-performance-b752a.firebasestorage.app",
    messagingSenderId: "533539646137",
    appId: "1:533539646137:web:f747ac4ff0a7512a26c968",
    measurementId: "G-XZ7KS1XP84"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Firebase Auth state observer
auth.onAuthStateChanged((user) => {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const adminBtn = document.getElementById('admin-btn');
    const userInfo = document.getElementById('user-info');

    if (user) {
        // User is signed in
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        userInfo.style.display = 'inline-block';
        userInfo.textContent = `Welcome, ${user.displayName || user.email}`;

        // All authenticated users are admins
        adminBtn.style.display = 'inline-block';
    } else {
        // User is signed out
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        adminBtn.style.display = 'none';
        userInfo.style.display = 'none';
    }
});