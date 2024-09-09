// Utility function to select a single element and return null if not found
const selectElement = (selector) => document.querySelector(selector) || null;
// Toggle navigation links visibility
const handleMenuToggle = () => {
  const menuIcon = selectElement('.menu-icon');
  const navLinks = selectElement('.nav-links');
  if (menuIcon && navLinks) {
    menuIcon.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  } else {
    console.warn('Menu icon or navigation links not found.');
  }
};
// Smooth scroll for anchor links
const setupSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = selectElement(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.warn(`Target element ${this.getAttribute('href')} not found.`);
      }
    });
  });
};
// Handle video card clicks and open video modal
const setupVideoModals = () => {
  const videoCards = document.querySelectorAll('.video-card video');
  if (videoCards.length === 0) {
    console.warn('No video cards found.');
    return;
  }
  videoCards.forEach(video => {
    video.addEventListener('click', () => {
      const videoSrc = video.currentSrc;
      if (videoSrc) {
        openVideoModal(videoSrc);
      } else {
        console.warn('Video source not found.');
      }
    });
  });
};
// Create and display a video modal
const openVideoModal = (src) => {
  const modal = document.createElement('div');
  modal.classList.add('video-modal');
  modal.innerHTML = `
    <div class="video-modal-content" role="dialog" aria-labelledby="video-modal-title" aria-modal="true">
      <button class="close-btn" aria-label="Close">&times;</button>
      <video controls autoplay>
        <source src="${src}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
  `;
  document.body.appendChild(modal);
  const closeBtn = modal.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.remove();
  });
};
// Handle sticky navbar and scroll-top button functionality
const handleScrollEffects = () => {
  const navbar = selectElement('.navbar');
  const scrollTopBtn = selectElement('.scroll-top-btn');
  const handleScroll = () => {
    if (navbar) {
      navbar.classList.toggle('sticky', window.scrollY > 100);
    }
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 200);
    }
  };
  // Debounce scroll event for performance optimization
  window.addEventListener('scroll', debounce(handleScroll, 10));

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } else {
    console.warn('Scroll-top button not found.');
  }
};
// Debounce function to limit the rate at which a function is executed
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
// Lazy loading images
const setupLazyLoading = () => {
  const lazyImages = document.querySelectorAll('img.lazy');
  if (lazyImages.length === 0) {
    console.warn('No lazy images found.');
    return;
  }
  const lazyLoad = (image) => {
    image.src = image.dataset.src;
    image.classList.remove('lazy');
  };
  if ('IntersectionObserver' in window) {
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          lazyLoad(entry.target);
          lazyImageObserver.unobserve(entry.target);
        }
      });
    });
    lazyImages.forEach(image => lazyImageObserver.observe(image));
  } else {
    // Fallback for browsers without IntersectionObserver support
    lazyImages.forEach(image => lazyLoad(image));
  }
};
// Handle form submission with basic validation
const handleFormSubmission = (form, isSignup) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the default form submission

    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    if (isSignup) {
      const confirmPassword = form.querySelector('input[name="confirm-password"]').value;

      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
    }
    if (email && password) {
      // Mock API request simulation
      setTimeout(() => {
        alert(`Form submitted successfully!`);
        form.reset(); // Clear the form fields after submission
      }, 1000);
    } else {
      alert('Please fill in all fields.');
    }
  });
};
// Initialize login page functionalities
const initLoginPage = () => {
  const loginForm = selectElement('#login-form');
  if (loginForm) {
    handleFormSubmission(loginForm, false);
  }
};
// Initialize signup page functionalities
const initSignupPage = () => {
  const signupForm = selectElement('#signup-form');
  if (signupForm) {
    handleFormSubmission(signupForm, true);
  }
};
// Initialize functionalities based on the current page
const initAuthPage = () => {
  if (document.body.classList.contains('auth-page')) {
    if (selectElement('#login-form')) {
      initLoginPage();
    } else if (selectElement('#signup-form')) {
      initSignupPage();
    }
  }
};
// Initialize all functionalities on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  handleMenuToggle();
  setupSmoothScroll();
  setupVideoModals();
  handleScrollEffects();
  setupLazyLoading();
  initAuthPage(); // Initialize authentication page functionalities if applicable
});
// Add resize event listener if needed for responsive adjustments
window.addEventListener('resize', () => {
  // Add any responsive adjustments or reinitializations here if needed
  console.log('Window resized.');
});
