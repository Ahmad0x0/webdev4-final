// DOM Elements
const loginForm = document.getElementById('bank-login-form');
const successAlert = document.getElementById('bank-login-alert-success');
const errorAlert = document.getElementById('bank-login-alert-danger');
const loading = document.querySelector('.bank-login-loading');

// Show alert function
function showAlert(type, message) {
    const alertEl = type === 'success' ? successAlert : errorAlert;
    alertEl.textContent = message;
    alertEl.style.display = 'block';
    setTimeout(() => {
        alertEl.style.display = 'none';
    }, 3000);
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggle = document.querySelector('.bank-login-password-toggle');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggle.textContent = '🔒';
    } else {
        passwordInput.type = 'password';
        toggle.textContent = '👁️';
    }
}

// Show loading spinner
function showLoading() {
    loading.style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
    loading.style.display = 'none';
}

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    showLoading();

    // Simulate API call
    setTimeout(() => {
        const user = window.authenticateUser(username, password); // global call from the initializeStorage.js

        if (user) {
            // Create user session
            const userData = {
                username: user.username,
                name: user.name,
                loggedIn: true,
                timestamp: new Date().getTime()
            };

            // Store based on remember me preference
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(userData));
            }

            showAlert('success', 'Login successful! Redirecting...');

            setTimeout(() => {
                window.location.href = 'maindash.html';
            }, 1500);
        } else {
            showAlert('error', 'Invalid username or password');
            loginForm.classList.add('bank-login-shake');
            setTimeout(() => {
                loginForm.classList.remove('bank-login-shake');
            }, 500);
        }

        hideLoading();
    }, 1500);
});

// Show register form
function showRegisterForm() {
    alert('Registration functionality would be implemented here.\n\nFor now, use:\nUsername: demo\nPassword: demo123');
}

// Check if user is already logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        const now = new Date().getTime();
        const loginTime = userData.timestamp;
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);

        // Check if session is expired (24 hours)
        if (hoursSinceLogin > 24) {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            return;
        }

        // Valid session exists, redirect to main page
        window.location.href = 'maindash.html';
    }
}

// Check auth on page load
document.addEventListener('DOMContentLoaded', checkAuth);
