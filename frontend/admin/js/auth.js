document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const errorMsg = document.getElementById('loginError') || document.getElementById('signupError');
    const successMsg = document.getElementById('signupSuccess');

    const API_URL = (typeof CONFIG !== 'undefined' && CONFIG.apiUrl)
        ? `${CONFIG.apiUrl}/auth`
        : 'https://hariharabikebazar.onrender.com/api/auth';

    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('signup.html') || window.location.pathname.endsWith('/admin/')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // If not logged in and trying to access dashboard, redirect to login
        if (window.location.pathname.endsWith('dashboard.html')) {
            window.location.href = 'index.html';
        }
    }

    function showError(message) {
        if (errorMsg) {
            errorMsg.textContent = message;
            setTimeout(() => {
                errorMsg.textContent = '';
            }, 4000);
        }
    }

    function showSuccess(message) {
        if (successMsg) {
            successMsg.textContent = message;
            setTimeout(() => {
                successMsg.textContent = '';
            }, 4000);
        }
    }

    // --- Login Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = loginForm.username.value;
            const password = loginForm.password.value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    sessionStorage.setItem('adminUsername', data.username);
                    window.location.href = 'dashboard.html';
                } else {
                    showError(data.error || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('Server error. Is the backend running?');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        });
    }

    // --- Signup Logic ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = signupForm.username.value;
            const password = signupForm.password.value;
            const submitBtn = signupForm.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating...';

            try {
                const response = await fetch(`${API_URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showSuccess('Account created successfully! You can now log in.');
                    signupForm.reset();
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    showError(data.error || 'Signup failed');
                }
            } catch (error) {
                console.error('Signup error:', error);
                showError('Server error. Is the backend running?');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminUsername');
            window.location.href = 'index.html';
        });
    }
});
