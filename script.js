document.addEventListener('DOMContentLoaded', () => {
    const scrollTopBtn = document.querySelector('.scroll-top-btn');

    // Show or hide the scroll-to-top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.style.display = 'block';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    // Smooth scroll to the top of the page
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});


document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-links button[data-target]');
    const sections = document.querySelectorAll('.page-section');
    const messageBox = document.getElementById('message-box');
    const authStatus = document.getElementById('auth-status');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authLinks = document.getElementById('auth-links');
    const signupButton = document.getElementById('btn-signup');
    const loginButton = document.getElementById('btn-login');
    const profileButton = document.getElementById('btn-profile');
    const logoutButton = document.getElementById('btn-logout');
    const userEmailDisplay = document.getElementById('user-email-display');
    const userIdDisplay = document.getElementById('user-id-display');

    // Show Message
    const showMessage = (message, type) => {
        messageBox.textContent = message;
        messageBox.classList.remove('hidden', 'success', 'error');
        messageBox.classList.add('show', type);
        setTimeout(() => {
            messageBox.classList.remove('show');
            messageBox.classList.add('hidden');
        }, 3000);
    };

    // Toggle Mobile Menu
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Section Switching
    const switchSection = (targetId) => {
        sections.forEach(section => section.classList.add('hidden'));
        document.getElementById(targetId).classList.remove('hidden');
        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(`button[data-target="${targetId}"]`).classList.add('active');
        if (window.innerWidth < 1024) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    };

    // Navigation Click Handler
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            switchSection(targetId);
        });
    });

    // Simulate Authentication
    const checkAuthStatus = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            authStatus.textContent = `Welcome, ${user.email}!`;
            signupButton.classList.add('hidden');
            loginButton.classList.add('hidden');
            authLinks.classList.remove('hidden');
            userEmailDisplay.textContent = user.email;
            userIdDisplay.textContent = user.id;
        } else {
            authStatus.textContent = 'Please log in to continue.';
            signupButton.classList.remove('hidden');
            loginButton.classList.remove('hidden');
            authLinks.classList.add('hidden');
        }
    };

    // Login Form Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Simulated login validation
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.email === email && storedUser.password === password) {
            showMessage('Login successful!', 'success');
            checkAuthStatus();
            switchSection('home-section');
            loginForm.reset();
        } else {
            showMessage('Invalid email or password.', 'error');
        }
    });

    // Signup Form Submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        // Simulated signup
        const user = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            email,
            password
        };
        localStorage.setItem('user', JSON.stringify(user));
        showMessage('Account created successfully!', 'success');
        checkAuthStatus();
        switchSection('home-section');
        signupForm.reset();
    });

    // Logout
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('user');
        showMessage('Logged out successfully.', 'success');
        checkAuthStatus();
        switchSection('home-section');
    });

    // Initial Setup
    checkAuthStatus();
    switchSection('home-section');
});


document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const museumCards = document.querySelectorAll('.museum-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to the clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            museumCards.forEach(card => {
                // Get the category from the data-attribute
                const cardCategory = card.getAttribute('data-category');

                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 10);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 500); // Wait for transition
                }
            });
        });
    });
});









document.addEventListener('DOMContentLoaded', () => {
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');

    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            const videoCard = thumbnail.closest('.video-card');
            const videoId = thumbnail.getAttribute('data-video-id');

            // Hide the thumbnail and play button
            thumbnail.style.display = 'none';

            // Create the iframe element
            const iframe = document.createElement('iframe');
            iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&modestbranding=1`);
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', '');

            // Append the iframe to the video card
            videoCard.insertBefore(iframe, videoCard.querySelector('h3'));
        });
    });
});