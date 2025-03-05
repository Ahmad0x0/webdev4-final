document.addEventListener('DOMContentLoaded', function () {
    // Mobile navigation functionality
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');

    if (mobileNavToggle && sidebar && overlay) {
        function toggleNav() {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            const icon = mobileNavToggle.querySelector('i');
            if (icon) {
                if (sidebar.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }

        mobileNavToggle.addEventListener('click', toggleNav);
        overlay.addEventListener('click', toggleNav);

        // Close menu when clicking a nav link on mobile
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    toggleNav();
                }
            });
        });

        // Close menu when window is resized
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
                toggleNav();
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.clear();
            alert('Logging out...');
            window.location.href = 'login.html';
        });
    }
});