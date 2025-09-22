// ===== CONFIGURATION & CONSTANTS =====
const CONFIG = {
    // API Endpoints
    API_BASE: 'https://api.museum.example.com/v1',
    ENDPOINTS: {
        COLLECTIONS: '/collections',
        EVENTS: '/events',
        EXHIBITS: '/exhibits',
        CONTACT: '/contact'
    },
    
    // Animation Settings
    ANIMATION: {
        DURATION: {
            FAST: 300,
            MEDIUM: 500,
            SLOW: 800
        },
        EASING: {
            SMOOTH: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        THEME: 'museum_theme_preference',
        VISITS: 'museum_visit_count',
        FAVORITES: 'museum_favorite_items'
    },
    
    // Feature Toggles
    FEATURES: {
        ANALYTICS: true,
        OFFLINE_SUPPORT: true,
        PWA_ENABLED: true,
        LAZY_LOADING: true
    }
};

// ===== STATE MANAGEMENT =====
class MuseumState {
    constructor() {
        this.state = {
            theme: 'light',
            user: null,
            favorites: new Set(),
            currentExhibit: null,
            searchQuery: '',
            isLoading: false,
            isOnline: navigator.onLine,
            visitCount: 0,
            cart: new Map()
        };
        
        this.observers = new Set();
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.trackVisit();
    }
    
    // Observer Pattern for State Changes
    subscribe(observer) {
        this.observers.add(observer);
        return () => this.observers.delete(observer);
    }
    
    notifyObservers() {
        this.observers.forEach(observer => observer(this.state));
    }
    
    // State Updates
    setState(updates) {
        this.state = { ...this.state, ...updates };
        this.saveToStorage();
        this.notifyObservers();
        
        if (CONFIG.FEATURES.ANALYTICS) {
            this.trackStateChange(updates);
        }
    }
    
    // Persistent Storage
    loadFromStorage() {
        try {
            const theme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
            const visits = parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.VISITS)) || 0;
            const favorites = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES)) || [];
            
            this.setState({
                theme,
                visitCount: visits,
                favorites: new Set(favorites)
            });
        } catch (error) {
            console.warn('Failed to load state from storage:', error);
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, this.state.theme);
            localStorage.setItem(CONFIG.STORAGE_KEYS.VISITS, this.state.visitCount.toString());
            localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify([...this.state.favorites]));
        } catch (error) {
            console.warn('Failed to save state to storage:', error);
        }
    }
    
    // Utility Methods
    trackVisit() {
        const newCount = this.state.visitCount + 1;
        this.setState({ visitCount: newCount });
    }
    
    toggleFavorite(itemId) {
        const favorites = new Set(this.state.favorites);
        if (favorites.has(itemId)) {
            favorites.delete(itemId);
        } else {
            favorites.add(itemId);
        }
        this.setState({ favorites });
    }
    
    toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.setState({ theme: newTheme });
        document.documentElement.setAttribute('data-theme', newTheme);
    }
    
    setupEventListeners() {
        window.addEventListener('online', () => this.setState({ isOnline: true }));
        window.addEventListener('offline', () => this.setState({ isOnline: false }));
    }
    
    trackStateChange(updates) {
        // Analytics tracking for important state changes
        if ('theme' in updates) {
            this.analyticsTrack('theme_change', { theme: updates.theme });
        }
        if (updates.favorites) {
            this.analyticsTrack('favorites_update', { count: updates.favorites.size });
        }
    }
    
    analyticsTrack(event, data) {
        if (typeof gtag !== 'undefined') {
            gtag('event', event, data);
        }
    }
}

// ===== DOM MANAGER =====
class DOMManager {
    constructor() {
        this.cache = new Map();
        this.intersectionObserver = null;
        this.resizeObserver = null;
        this.setupObservers();
    }
    
    // DOM Query Methods with Caching
    $(selector, parent = document) {
        const key = `${selector}-${parent.tagName}`;
        if (!this.cache.has(key)) {
            this.cache.set(key, parent.querySelector(selector));
        }
        return this.cache.get(key);
    }
    
    $$(selector, parent = document) {
        const key = `all-${selector}-${parent.tagName}`;
        if (!this.cache.has(key)) {
            this.cache.set(key, parent.querySelectorAll(selector));
        }
        return this.cache.get(key);
    }
    
    // Element Creation with Attributes
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else if (key.startsWith('on')) {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }
    
    // Advanced Animation Methods
    animateElement(element, keyframes, options = {}) {
        return element.animate(keyframes, {
            duration: CONFIG.ANIMATION.DURATION.MEDIUM,
            easing: CONFIG.ANIMATION.EASING.SMOOTH,
            fill: 'both',
            ...options
        });
    }
    
    // Scroll-based Animations
    setupScrollAnimations() {
        const animatedElements = this.$$('[data-animate]');
        
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleScrollAnimation(entry.target);
                    this.intersectionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => this.intersectionObserver.observe(el));
    }
    
    handleScrollAnimation(element) {
        const animationType = element.dataset.animate;
        const delay = parseInt(element.dataset.delay) || 0;
        
        setTimeout(() => {
            element.style.visibility = 'visible';
            
            switch (animationType) {
                case 'fadeIn':
                    this.animateElement(element, [
                        { opacity: 0, transform: 'translateY(30px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ]);
                    break;
                    
                case 'slideInLeft':
                    this.animateElement(element, [
                        { opacity: 0, transform: 'translateX(-100px)' },
                        { opacity: 1, transform: 'translateX(0)' }
                    ]);
                    break;
                    
                case 'slideInRight':
                    this.animateElement(element, [
                        { opacity: 0, transform: 'translateX(100px)' },
                        { opacity: 1, transform: 'translateX(0)' }
                    ]);
                    break;
                    
                case 'scaleIn':
                    this.animateElement(element, [
                        { opacity: 0, transform: 'scale(0.8)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ]);
                    break;
            }
        }, delay);
    }
    
    // Responsive Helpers
    setupResponsiveHandlers() {
        this.resizeObserver = new ResizeObserver((entries) => {
            entries.forEach(entry => {
                this.handleResize(entry.target, entry.contentRect);
            });
        });
        
        this.resizeObserver.observe(document.documentElement);
    }
    
    handleResize(element, rect) {
        const breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        
        document.documentElement.setAttribute('data-viewport', 
            rect.width < breakpoints.mobile ? 'mobile' :
            rect.width < breakpoints.tablet ? 'tablet' : 'desktop'
        );
    }
    
    // Cleanup
    destroy() {
        this.intersectionObserver?.disconnect();
        this.resizeObserver?.disconnect();
        this.cache.clear();
    }
}

// ===== API SERVICE =====
class ApiService {
    constructor() {
        this.baseURL = CONFIG.API_BASE;
        this.cache = new Map();
        this.pendingRequests = new Map();
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const cacheKey = this.generateCacheKey(url, options);
        
        // Return cached response if available
        if (options.cache && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Prevent duplicate requests
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }
        
        try {
            const requestPromise = this.makeRequest(url, options);
            this.pendingRequests.set(cacheKey, requestPromise);
            
            const response = await requestPromise;
            
            // Cache successful responses
            if (options.cache && response.ok) {
                this.cache.set(cacheKey, response);
            }
            
            return response;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }
    
    async makeRequest(url, options) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };
        
        const config = {
            method: 'GET',
            ...options,
            headers
        };
        
        const timeout = options.timeout || 10000;
        
        return Promise.race([
            fetch(url, config),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
        ]);
    }
    
    generateCacheKey(url, options) {
        return `${url}-${JSON.stringify(options)}`;
    }
    
    // Specific API Methods
    async getCollections(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${CONFIG.ENDPOINTS.COLLECTIONS}?${queryString}`;
        
        return this.request(endpoint, {
            cache: true,
            timeout: 5000
        });
    }
    
    async submitContactForm(formData) {
        return this.request(CONFIG.ENDPOINTS.CONTACT, {
            method: 'POST',
            body: JSON.stringify(formData),
            cache: false
        });
    }
}

// ===== COMPONENT SYSTEM =====
class Component {
    constructor(element, props = {}) {
        this.element = element;
        this.props = props;
        this.state = {};
        this.isMounted = false;
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        if (this.isMounted) {
            this.render();
        }
    }
    
    mount() {
        this.isMounted = true;
        this.render();
        this.setupEventListeners();
    }
    
    unmount() {
        this.isMounted = false;
        this.cleanupEventListeners();
    }
    
    render() {
        // To be implemented by specific components
    }
    
    setupEventListeners() {
        // To be implemented by specific components
    }
    
    cleanupEventListeners() {
        // To be implemented by specific components
    }
}

// ===== SPECIFIC COMPONENTS =====
class NavigationComponent extends Component {
    setupEventListeners() {
        const menuToggle = this.element.querySelector('#menu-toggle');
        const navLinks = this.element.querySelector('.nav-links');
        
        if (menuToggle) {
            menuToggle.addEventListener('change', (e) => {
                this.handleMenuToggle(e.target.checked);
            });
        }
        
        // Smooth scrolling for anchor links
        this.element.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', this.handleSmoothScroll);
        });
    }
    
    handleMenuToggle(isOpen) {
        const navLinks = this.element.querySelector('.nav-links');
        if (isOpen) {
            navLinks.style.display = 'flex';
            this.animateMenuOpen();
        } else {
            this.animateMenuClose();
        }
    }
    
    animateMenuOpen() {
        const navLinks = this.element.querySelector('.nav-links');
        domManager.animateElement(navLinks, [
            { opacity: 0, transform: 'scaleY(0)' },
            { opacity: 1, transform: 'scaleY(1)' }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
    }
    
    handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

class VideoPlayerComponent extends Component {
    setupEventListeners() {
        const playButton = this.element.querySelector('.play-button');
        const videoPlaceholder = this.element.querySelector('.video-placeholder');
        
        if (playButton) {
            playButton.addEventListener('click', this.handlePlay.bind(this));
        }
        
        // Keyboard support
        this.element.addEventListener('keydown', this.handleKeydown.bind(this));
    }
    
    handlePlay() {
        const videoPlaceholder = this.element.querySelector('.video-placeholder');
        const iframe = this.element.querySelector('iframe');
        
        if (iframe) {
            videoPlaceholder.style.display = 'none';
            iframe.style.display = 'block';
            iframe.src += '&autoplay=1';
        }
    }
    
    handleKeydown(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.handlePlay();
        }
    }
}

// ===== MAIN APPLICATION =====
class MuseumApp {
    constructor() {
        this.stateManager = new MuseumState();
        this.domManager = new DOMManager();
        this.apiService = new ApiService();
        this.components = new Map();
        this.init();
    }
    
    async init() {
        try {
            this.setupServiceWorker();
            this.initializeComponents();
            this.setupGlobalEventListeners();
            this.handleInitialLoad();
            
            // Preload critical resources
            this.preloadResources();
            
            // Initialize analytics
            if (CONFIG.FEATURES.ANALYTICS) {
                this.initAnalytics();
            }
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showErrorState();
        }
    }
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator && CONFIG.FEATURES.PWA_ENABLED) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }
    
    initializeComponents() {
        // Initialize navigation component
        const navElement = this.domManager.$('.navbar');
        if (navElement) {
            this.components.set('navigation', new NavigationComponent(navElement));
            this.components.get('navigation').mount();
        }
        
        // Initialize video players
        this.domManager.$$('.video-container').forEach((videoEl, index) => {
            this.components.set(`video-${index}`, new VideoPlayerComponent(videoEl));
            this.components.get(`video-${index}`).mount();
        });
        
        // Setup scroll animations
        this.domManager.setupScrollAnimations();
        this.domManager.setupResponsiveHandlers();
    }
    
    setupGlobalEventListeners() {
        // Theme toggle
        const themeToggle = this.domManager.$('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.stateManager.toggleTheme();
            });
        }
        
        // Search functionality
        const searchInput = this.domManager.$('#search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        }
        
        // Favorite buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn')) {
                this.handleFavoriteToggle(e);
            }
        });
        
        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('ajax-form')) {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });
        
        // Intersection Observer for lazy loading
        this.setupLazyLoading();
    }
    
    handleInitialLoad() {
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', this.stateManager.state.theme);
        
        // Show welcome message for returning visitors
        if (this.stateManager.state.visitCount > 1) {
            this.showWelcomeBackMessage();
        }
        
        // Load initial data
        this.loadInitialData();
    }
    
    async loadInitialData() {
        try {
            this.showLoadingState();
            
            const [collectionsResponse, eventsResponse] = await Promise.all([
                this.apiService.getCollections({ limit: 6 }),
                this.apiService.request(CONFIG.ENDPOINTS.EVENTS)
            ]);
            
            if (collectionsResponse.ok) {
                const collections = await collectionsResponse.json();
                this.renderCollections(collections);
            }
            
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showErrorState('Failed to load content. Please check your connection.');
        }
    }
    
    renderCollections(collections) {
        const container = this.domManager.$('.collection-grid');
        if (!container) return;
        
        container.innerHTML = collections.map(item => `
            <div class="collection-card" data-animate="fadeIn">
                <div class="collection-icon">🏛️</div>
                <h3>${this.escapeHtml(item.title)}</h3>
                <p>${this.escapeHtml(item.description)}</p>
                <button class="btn btn-primary" onclick="app.viewCollection('${item.id}')">
                    View Details
                </button>
            </div>
        `).join('');
        
        // Trigger animations for new elements
        this.domManager.setupScrollAnimations();
    }
    
    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    showLoadingState() {
        const loadingEl = this.domManager.$('#loading-indicator') || 
                         this.createElement('div', { id: 'loading-indicator', className: 'loading' });
        document.body.appendChild(loadingEl);
    }
    
    hideLoadingState() {
        const loadingEl = this.domManager.$('#loading-indicator');
        if (loadingEl) {
            loadingEl.remove();
        }
    }
    
    showErrorState(message = 'Something went wrong. Please try again.') {
        // Implement error state display
        console.error(message);
    }
    
    preloadResources() {
        const criticalImages = [
            '/images/hero-bg.jpg',
            '/images/collections-preview.jpg'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = src;
            link.as = 'image';
            document.head.appendChild(link);
        });
    }
    
    initAnalytics() {
        // Google Analytics initialization
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }
    
    setupLazyLoading() {
        if ('IntersectionObserver' in window && CONFIG.FEATURES.LAZY_LOADING) {
            const lazyImages = this.domManager.$$('img[data-src]');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
}

// ===== ERROR BOUNDARY =====
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    
    // Send error to analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: true
        });
    }
});

// ===== PERFORMANCE MONITORING =====
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            
            if (CONFIG.FEATURES.ANALYTICS) {
                gtag('event', 'timing_complete', {
                    name: 'load',
                    value: loadTime,
                    event_category: 'Load Performance'
                });
            }
        }, 0);
    });
}

// ===== OFFLINE SUPPORT =====
if (CONFIG.FEATURES.OFFLINE_SUPPORT) {
    window.addEventListener('online', () => {
        // Sync any pending operations when coming online
        if (window.app && window.app.stateManager) {
            window.app.stateManager.setState({ isOnline: true });
        }
    });
    
    window.addEventListener('offline', () => {
        if (window.app && window.app.stateManager) {
            window.app.stateManager.setState({ isOnline: false });
        }
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    window.app = new MuseumApp();
    
    // Expose utility methods globally for debugging
    window.utils = {
        getState: () => window.app.stateManager.state,
        toggleTheme: () => window.app.stateManager.toggleTheme(),
        reloadData: () => window.app.loadInitialData()
    };
});

// ===== EXPORTS FOR MODULE SUPPORT =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MuseumApp,
        MuseumState,
        DOMManager,
        ApiService,
        Component
    };
}