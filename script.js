// Portfolio JavaScript
// Modules: theme, navigation, scroll progress, reveal animations,
// skills meter, contact form, project card interaction

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Theme Management
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

// Navigation Manager (desktop scroll-spy, navbar elevation, mobile menu)
class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navLinksList = document.getElementById('nav-links');
        this.navBackdrop = document.getElementById('nav-backdrop');
        this.init();
    }

    init() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        window.addEventListener('scroll', utils.throttle(() => {
            this.highlightActiveSection();
            this.handleNavbarScroll();
        }, 100));

        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        }
        if (this.navBackdrop) {
            this.navBackdrop.addEventListener('click', () => this.closeMobileMenu());
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMobileMenu();
        });

        // Run once on load in case the page opens mid-scroll (refresh)
        this.handleNavbarScroll();
    }

    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        this.closeMobileMenu();

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    }

    toggleMobileMenu() {
        const isOpen = this.navLinksList.classList.toggle('open');
        this.hamburger.classList.toggle('active', isOpen);
        this.hamburger.setAttribute('aria-expanded', String(isOpen));
        if (this.navBackdrop) this.navBackdrop.classList.toggle('open', isOpen);
        document.body.classList.toggle('no-scroll', isOpen);
    }

    closeMobileMenu() {
        this.navLinksList.classList.remove('open');
        this.hamburger.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
        if (this.navBackdrop) this.navBackdrop.classList.remove('open');
        document.body.classList.remove('no-scroll');
    }

    highlightActiveSection() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');

        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.scrollY >= sectionTop - 200) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    handleNavbarScroll() {
        if (!this.navbar) return;
        // Use a class instead of inline styles so light/dark theme colors
        // (defined in CSS) are respected instead of being overwritten.
        this.navbar.classList.toggle('scrolled', window.scrollY > 40);
    }
}

// Scroll progress bar
class ScrollProgressManager {
    constructor() {
        this.bar = document.getElementById('scroll-progress');
        if (!this.bar) return;
        this.init();
    }

    init() {
        window.addEventListener('scroll', utils.throttle(() => this.update(), 20));
        window.addEventListener('resize', utils.throttle(() => this.update(), 100));
        this.update();
    }

    update() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        this.bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    }
}

// Skills Animation Manager — animates bar width and counts the percentage up
class SkillsAnimationManager {
    constructor() {
        this.animated = false;
        this.init();
    }

    init() {
        const skillsSection = document.querySelector('.skills');
        if (skillsSection) {
            const observer = new IntersectionObserver(
                (entries) => this.handleSkillsIntersection(entries),
                { threshold: 0.4 }
            );
            observer.observe(skillsSection);
        }
    }

    handleSkillsIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.animated) {
                this.animated = true;
                this.animateSkillBars();
            }
        });
    }

    animateSkillBars() {
        const skillItems = document.querySelectorAll('.skill-item');

        skillItems.forEach(item => {
            const bar = item.querySelector('.skill-progress');
            const label = item.querySelector('.skill-percentage');
            if (!bar) return;

            const target = parseInt(bar.getAttribute('data-progress'), 10) || 0;
            bar.style.width = target + '%';
            bar.classList.add('animated');

            if (label && !prefersReducedMotion) {
                this.countUp(label, target);
            } else if (label) {
                label.textContent = target + '%';
            }
        });
    }

    countUp(el, target) {
        const duration = 1200;
        const start = performance.now();

        const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(eased * target);
            el.textContent = value + '%';
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }
}

// Contact Form Manager
class ContactFormManager {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.status = document.getElementById('form-status');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        this.clearFieldErrors();

        if (this.validateForm(data)) {
            this.submitForm(data);
        }
    }

    validateForm(data) {
        const errors = [];

        if (!data.name || !data.name.trim()) {
            errors.push({ field: 'name', message: 'Name is required' });
        }

        if (!data.email || !data.email.trim()) {
            errors.push({ field: 'email', message: 'Email is required' });
        } else if (!this.isValidEmail(data.email)) {
            errors.push({ field: 'email', message: 'Enter a valid email address' });
        }

        if (!data.subject || !data.subject.trim()) {
            errors.push({ field: 'subject', message: 'Subject is required' });
        }

        if (!data.message || !data.message.trim()) {
            errors.push({ field: 'message', message: 'Message is required' });
        }

        if (errors.length > 0) {
            this.showErrors(errors);
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    clearFieldErrors() {
        document.querySelectorAll('.form-group.has-error').forEach(group => {
            group.classList.remove('has-error');
        });
    }

    showErrors(errors) {
        errors.forEach(err => {
            const input = document.getElementById(err.field);
            if (input) {
                input.closest('.form-group').classList.add('has-error');
            }
        });

        this.setStatus(errors.map(e => e.message).join(' · '), 'error');
    }

    submitForm(data) {
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : 'Send Message';

        if (submitButton) {
            submitButton.textContent = 'Opening mail app…';
            submitButton.disabled = true;
        }

        const recipient = 'shreyahalder013@gmail.com';
        const subject = `Portfolio Contact: ${data.subject}`;
        const body = `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`;
        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        const mailClient = window.open(mailtoLink, '_blank');
        if (!mailClient) {
            window.location.href = mailtoLink;
        }

        this.setStatus('Your email app should open with your message ready to send. If it does not, email me directly at shreyahalder013@gmail.com.', 'success');

        if (submitButton) {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }

        this.form.reset();
    }

    setStatus(message, type) {
        if (!this.status) return;
        this.status.textContent = message;
        this.status.className = `form-status visible ${type}`;

        if (type === 'success') {
            setTimeout(() => {
                this.status.classList.remove('visible');
            }, 6000);
        }
    }
}

// Reveal Observer — staggered fade-up for sections and their children
class RevealObserver {
    constructor() {
        this.init();
    }

    init() {
        const targets = document.querySelectorAll('.reveal');

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            targets.forEach(el => el.classList.add('fade-in-up'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries, observer),
            { threshold: 0.12, rootMargin: '0px 0px -80px 0px' }
        );

        targets.forEach(el => observer.observe(el));
    }

    handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }
}

// Project card tilt — subtle, disabled for reduced motion / touch
class ProjectCardTilt {
    constructor() {
        if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
        this.cards = document.querySelectorAll('.project-card');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMove(e, card));
            card.addEventListener('mouseleave', () => this.reset(card));
        });
    }

    handleMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-4px)`;
    }

    reset(card) {
        card.style.transform = '';
    }
}

// Main Application
class PortfolioApp {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        this.themeManager = new ThemeManager();
        this.navigationManager = new NavigationManager();
        this.scrollProgressManager = new ScrollProgressManager();
        this.skillsAnimationManager = new SkillsAnimationManager();
        this.contactFormManager = new ContactFormManager();
        this.revealObserver = new RevealObserver();
        this.projectCardTilt = new ProjectCardTilt();

        document.body.classList.remove('loading');

        this.setFooterYear();
        this.initializeSubtitleReveal();
    }

    setFooterYear() {
        const yearEl = document.getElementById('year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }

    initializeSubtitleReveal() {
        const subtitle = document.querySelector('.hero-subtitle');
        if (!subtitle) return;

        if (prefersReducedMotion) {
            return;
        }

        const text = subtitle.textContent;
        subtitle.setAttribute('aria-label', text);
        subtitle.textContent = '';

        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                subtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 45);
            }
        };

        setTimeout(typeWriter, 500);
    }
}

// Utility functions
const utils = {
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
    },

    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Initialize the application
const app = new PortfolioApp();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        NavigationManager,
        ScrollProgressManager,
        SkillsAnimationManager,
        ContactFormManager,
        RevealObserver,
        ProjectCardTilt,
        PortfolioApp
    };
}

// Keyboard navigation affordance
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});
