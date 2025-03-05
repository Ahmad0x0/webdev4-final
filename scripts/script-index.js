
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const loginBtn = document.getElementById('loginBtn');
    const navItems = navLinks ? navLinks.getElementsByTagName('a') : [];

    // Enhanced Navigation Animation
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.glass-nav');
        if (nav) {
            if (window.scrollY > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    });

    // Mobile Menu Toggle
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('show');
            
            // Toggle hamburger animation if needed
            this.classList.toggle('active');
            
            // Log to debug
            console.log('Menu clicked, toggle status:', navLinks.classList.contains('show'));
        });
    }

    // Navigation Item Active State
    if (navItems.length > 0) {
        for (let item of navItems) {
            item.addEventListener('click', function(e) {
                // Remove active class from all nav items
                for (let navItem of navItems) {
                    navItem.classList.remove('active');
                }
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Close mobile menu when a nav item is clicked
                if (window.innerWidth <= 850) {
                    navLinks.classList.remove('show');
                    menuToggle.classList.remove('active');
                }
            });
        }
    }

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animation on Scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 1s ease forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.card, .account-card, .timeline-item').forEach(el => {
            observer.observe(el);
        });
    }

    // Login functionality
    function updateLoginState() {
        if (!loginBtn) return;
        
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username');
        
        if (isLoggedIn) {
            loginBtn.textContent = `Welcome, ${username}`;
            loginBtn.onclick = logout;
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => {
                window.location.href = 'login.html';
            };
        }
    }

    function logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        updateLoginState();
    }

    updateLoginState();

    // Handle contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
});