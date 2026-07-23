// Portfolio JavaScript — "Desktop" edition
// Modules: theme, clock, window manager (open/close/drag/focus), dock,
// skills meter, contact form, trash easter egg

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileLayout = () => window.matchMedia('(max-width: 720px)').matches;

// Theme Management (day / night)
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

// Wallpaper Picker — lets visitors swap the desktop background
class WallpaperManager {
    constructor() {
        this.options = {
            'nebula': "url('./assets/nebula-bg.jpg')",
            'starry-night': "url('./assets/starry-night.jpg')",
            'black-hole': "url('./assets/black-hole.jpg')",
            'earth': "url('./assets/earth.jpg')"
        };
        this.defaultWallpaper = 'nebula';
        this.picker = document.querySelector('[data-wallpaper-picker]');
        this.init();
    }

    init() {
        const saved = localStorage.getItem('wallpaper');
        this.setWallpaper(saved && this.options[saved] ? saved : this.defaultWallpaper, false);

        if (!this.picker) return;

        this.picker.querySelectorAll('[data-wallpaper]').forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.setWallpaper(swatch.dataset.wallpaper);
            });
        });
    }

    setWallpaper(key, persist = true) {
        const value = this.options[key];
        if (!value) return;

        document.documentElement.style.setProperty('--wallpaper-image', value);
        document.documentElement.setAttribute('data-wallpaper', key);

        if (persist) {
            localStorage.setItem('wallpaper', key);
        }

        if (this.picker) {
            this.picker.querySelectorAll('[data-wallpaper]').forEach(swatch => {
                swatch.classList.toggle('active', swatch.dataset.wallpaper === key);
            });
        }
    }
}

// Menu bar clock
class ClockManager {
    constructor() {
        this.el = document.getElementById('menubar-clock');
        if (!this.el) return;
        this.update();
        setInterval(() => this.update(), 15000);
    }

    update() {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        this.el.textContent = `${date}  ${time}`;
    }
}

// Skills Animation Manager — animates bar width and counts the percentage up
class SkillsAnimationManager {
    constructor() {
        this.animated = false;
    }

    animate() {
        const skillItems = document.querySelectorAll('.skill-item');

        skillItems.forEach(item => {
            const bar = item.querySelector('.skill-progress');
            const label = item.querySelector('.skill-percentage');
            if (!bar) return;

            const target = parseInt(bar.getAttribute('data-progress'), 10) || 0;
            bar.style.width = '0%';

            requestAnimationFrame(() => {
                bar.style.width = target + '%';
            });

            if (label && !prefersReducedMotion) {
                this.countUp(label, target);
            } else if (label) {
                label.textContent = target + '%';
            }
        });
    }

    countUp(el, target) {
        const duration = 1000;
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

// Toast (used by the Trash icon and other small confirmations)
class ToastManager {
    constructor() {
        this.el = document.getElementById('toast');
        this.timeout = null;
    }

    show(message, duration = 2400) {
        if (!this.el) return;
        this.el.textContent = message;
        this.el.classList.add('visible');
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.el.classList.remove('visible');
        }, duration);
    }
}

// Window Manager — open/close/focus/drag for the finder-style windows
class WindowManager {
    constructor({ onOpen } = {}) {
        this.windows = new Map();
        this.zIndex = 50;
        this.topId = null;
        this.onOpen = onOpen || (() => {});
        this.iconOpenAudio = null;

        document.querySelectorAll('.window').forEach(el => {
            const id = el.dataset.window;
            this.windows.set(id, el);
            this.bindWindow(el, id);
        });

        document.querySelectorAll('[data-open]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const isIconTrigger = trigger.classList.contains('desktop-icon') || trigger.classList.contains('dock-item');
                if (isIconTrigger) {
                    this.playIconOpenSound();
                }
                this.open(trigger.dataset.open);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.topId) {
                this.close(this.topId);
            }
        });
    }

    bindWindow(el, id) {
        el.addEventListener('pointerdown', () => this.focus(id));

        const closeBtn = el.querySelector('[data-close]');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close(id);
            });
        }

        const handle = el.querySelector('[data-drag-handle]');
        if (handle) {
            this.bindDrag(el, handle);
        }
    }

    bindDrag(el, handle) {
        let dragging = false;
        let startX = 0;
        let startY = 0;
        let origLeft = 0;
        let origTop = 0;

        const onPointerDown = (e) => {
            if (isMobileLayout()) return;
            if (e.target.closest('.tl')) return;

            const desktop = document.getElementById('desktop');
            const desktopRect = desktop.getBoundingClientRect();
            const rect = el.getBoundingClientRect();

            el.style.left = `${rect.left - desktopRect.left}px`;
            el.style.top = `${rect.top - desktopRect.top}px`;
            el.style.transform = 'none';

            origLeft = rect.left - desktopRect.left;
            origTop = rect.top - desktopRect.top;
            startX = e.clientX;
            startY = e.clientY;
            dragging = true;

            el.classList.add('dragging');
            handle.setPointerCapture(e.pointerId);
        };

        const onPointerMove = (e) => {
            if (!dragging) return;
            const desktop = document.getElementById('desktop');
            const desktopRect = desktop.getBoundingClientRect();

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = origLeft + dx;
            let newTop = origTop + dy;

            newLeft = Math.min(Math.max(newLeft, -el.offsetWidth + 140), desktopRect.width - 140);
            newTop = Math.min(Math.max(newTop, 0), desktopRect.height - 44);

            el.style.left = `${newLeft}px`;
            el.style.top = `${newTop}px`;
        };

        const onPointerUp = (e) => {
            if (!dragging) return;
            dragging = false;
            el.classList.remove('dragging');
            try { handle.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
        };

        handle.addEventListener('pointerdown', onPointerDown);
        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onPointerUp);
        handle.addEventListener('pointercancel', onPointerUp);
    }

    playIconOpenSound() {
        if (prefersReducedMotion) return;
        try {
            if (!this.iconOpenAudio) {
                this.iconOpenAudio = new Audio('assets/iconopen.mp3');
                this.iconOpenAudio.volume = 0.5;
            }
            this.iconOpenAudio.currentTime = 0;
            const playPromise = this.iconOpenAudio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => { /* Autoplay may be blocked; ignore */ });
            }
        } catch (err) {
            /* Audio is best-effort; silently ignore any playback errors */
        }
    }

    open(id) {
        const el = this.windows.get(id);
        if (!el) return;

        el.classList.remove('minimized');
        el.classList.add('open');
        el.setAttribute('aria-hidden', 'false');

        requestAnimationFrame(() => {
            el.classList.add('visible');
        });

        this.focus(id);
        this.onOpen(id);
    }

    close(id) {
        const el = this.windows.get(id);
        if (!el) return;

        el.classList.remove('visible');
        el.setAttribute('aria-hidden', 'true');

        const finish = () => el.classList.remove('open');
        if (prefersReducedMotion) {
            finish();
        } else {
            setTimeout(finish, 220);
        }

        if (this.topId === id) {
            this.topId = null;
        }
        this.updateActiveNav();
    }

    focus(id) {
        const el = this.windows.get(id);
        if (!el || !el.classList.contains('open')) return;

        this.zIndex += 1;
        el.style.zIndex = this.zIndex;
        this.topId = id;
        this.updateActiveNav();
    }

    updateActiveNav() {
        document.querySelectorAll('.menubar-link').forEach(link => {
            link.classList.toggle('active', link.dataset.open === this.topId);
        });
    }

    getOpenIds() {
        return Array.from(this.windows.entries())
            .filter(([, el]) => el.classList.contains('open'))
            .map(([id]) => id);
    }

    closeAllWindows() {
        this.getOpenIds().forEach(id => this.close(id));
    }

    minimizeAll() {
        this.getOpenIds().forEach(id => {
            const el = this.windows.get(id);
            if (!el) return;
            el.classList.remove('visible');
            el.classList.add('minimized');
        });
        this.topId = null;
        this.updateActiveNav();
    }

    bringAllToFront() {
        const openIds = this.getOpenIds();
        openIds.forEach(id => {
            const el = this.windows.get(id);
            if (!el) return;
            el.classList.remove('minimized');
            el.classList.add('visible');
            this.zIndex += 1;
            el.style.zIndex = this.zIndex;
        });
        if (openIds.length) {
            this.topId = openIds[openIds.length - 1];
        }
        this.updateActiveNav();
    }
}

// Lock screen — greets visitors with a live clock before revealing the desktop
class LockScreen {
    constructor(onUnlock) {
        this.el = document.getElementById('lockscreen');
        this.dateEl = document.getElementById('lock-date');
        this.clockEl = document.getElementById('lock-clock');
        this.unlockBtn = document.getElementById('lock-unlock-btn');
        this.onUnlock = onUnlock || (() => {});
        this.unlocked = false;

        if (!this.el) {
            this.onUnlock();
            return;
        }

        this.init();
    }

    init() {
        this.updateTime();
        this.timer = setInterval(() => this.updateTime(), 1000);

        this.el.addEventListener('click', () => this.unlock());
        this.unlockBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.unlock();
        });
        document.addEventListener('keydown', (e) => {
            if (!this.unlocked && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.unlock();
            }
        });
    }

    updateTime() {
        const now = new Date();
        if (this.clockEl) {
            this.clockEl.textContent = now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
        if (this.dateEl) {
            this.dateEl.textContent = now.toLocaleDateString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    playUnlockSound() {
        try {
            if (!this.unlockAudio) {
                this.unlockAudio = new Audio('assets/unlock.mp3');
                this.unlockAudio.volume = 0.6;
            }
            this.unlockAudio.currentTime = 0;
            const playPromise = this.unlockAudio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => { /* Autoplay may be blocked; ignore */ });
            }
        } catch (err) {
            /* Audio is best-effort; silently ignore any playback errors */
        }
    }

    unlock() {
        if (this.unlocked) return;
        this.unlocked = true;
        clearInterval(this.timer);

        if (!prefersReducedMotion) {
            this.playUnlockSound();
        }

        this.el.classList.add('unlocking');
        this.el.setAttribute('aria-hidden', 'true');

        const finish = () => { this.el.style.display = 'none'; };
        if (prefersReducedMotion) {
            finish();
        } else {
            setTimeout(finish, 650);
        }

        this.onUnlock();
    }
}

// Welcome modal — greets first-time visitors each session
class WelcomeModal {
    constructor() {
        this.overlay = document.getElementById('welcome-overlay');
        this.closeBtn = document.getElementById('welcome-close');
        if (!this.overlay) return;

        this.init();
    }

    init() {
        this.closeBtn?.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('visible')) {
                this.close();
            }
        });
    }

    maybeOpen() {
        const alreadySeen = sessionStorage.getItem('welcomeSeen');
        if (!alreadySeen) {
            this.open();
        }
    }

    open() {
        this.overlay.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => this.overlay.classList.add('visible'));
        this.closeBtn?.focus();
        sessionStorage.setItem('welcomeSeen', '1');
    }

    close() {
        this.overlay.classList.remove('visible');
        this.overlay.setAttribute('aria-hidden', 'true');
    }
}

// Trash icon — small easter egg, no destructive behavior
class TrashManager {
    constructor(toast) {
        this.toast = toast;
        this.icon = document.getElementById('trash-icon');
        if (this.icon) {
            this.icon.addEventListener('click', () => this.empty());
        }
    }

    empty() {
        this.toast.show('Nothing in here — just an empty trash can 🌿');
    }
}

// Window Menu — the "Window" dropdown in the menu bar (Close/Minimize/Bring to Front)
class WindowMenuManager {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.menu = document.querySelector('[data-menu]');
        if (!this.menu) return;

        this.trigger = this.menu.querySelector('[data-menu-trigger]');
        this.dropdown = this.menu.querySelector('.menubar-menu-dropdown');
        this.open = false;

        this.init();
    }

    init() {
        this.trigger?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        this.dropdown?.querySelectorAll('[data-window-action]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.runAction(item.dataset.windowAction);
                this.close();
            });
        });

        document.addEventListener('click', (e) => {
            if (this.open && !this.menu.contains(e.target)) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.open) {
                this.close();
            }
        });
    }

    runAction(action) {
        if (!this.windowManager) return;
        if (action === 'close-all') {
            this.windowManager.closeAllWindows();
        } else if (action === 'minimize-all') {
            this.windowManager.minimizeAll();
        } else if (action === 'front-all') {
            this.windowManager.bringAllToFront();
        }
    }

    toggle() {
        this.open ? this.close() : this.openMenu();
    }

    openMenu() {
        this.open = true;
        this.dropdown?.classList.add('visible');
        this.dropdown?.setAttribute('aria-hidden', 'false');
        this.trigger?.setAttribute('aria-expanded', 'true');
    }

    close() {
        this.open = false;
        this.dropdown?.classList.remove('visible');
        this.dropdown?.setAttribute('aria-hidden', 'true');
        this.trigger?.setAttribute('aria-expanded', 'false');
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
        this.wallpaperManager = new WallpaperManager();
        this.clockManager = new ClockManager();
        this.skillsAnimationManager = new SkillsAnimationManager();
        this.contactFormManager = new ContactFormManager();
        this.toastManager = new ToastManager();
        this.trashManager = new TrashManager(this.toastManager);
        this.welcomeModal = new WelcomeModal();
        this.lockScreen = new LockScreen(() => {
            setTimeout(() => this.welcomeModal.maybeOpen(), prefersReducedMotion ? 150 : 550);
        });

        this.windowManager = new WindowManager({
            onOpen: (id) => {
                if (id === 'skills') {
                    this.skillsAnimationManager.animate();
                }
            }
        });

        this.windowMenuManager = new WindowMenuManager(this.windowManager);

        document.body.classList.remove('loading');
        this.setFooterYear();
    }

    setFooterYear() {
        const yearEl = document.getElementById('year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }
}

// Initialize the application
const app = new PortfolioApp();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        WallpaperManager,
        ClockManager,
        SkillsAnimationManager,
        ContactFormManager,
        ToastManager,
        WindowManager,
        WindowMenuManager,
        TrashManager,
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
