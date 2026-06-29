/**
 * main.js — Shared client-side utilities for HomeServe
 * Auros Dark Teal Observatory Theme
 */

// ── Mobile menu toggle ──
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('mobileMenuToggle');
    const menu = document.getElementById('mobileMenu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const isHidden = menu.style.display === 'none' || menu.style.display === '';
            menu.style.display = isHidden ? 'block' : 'none';
        });
    }

    // ── Auto-dismiss success alerts after 5s ──
    document.querySelectorAll('.alert-dark-success').forEach(el => {
        setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease';
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 500);
        }, 5000);
    });

    // ── Highlight active nav link ──
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link-custom').forEach(link => {
        const href = link.getAttribute('href');
        if (href === '/' && currentPath === '/') {
            link.classList.add('active');
        } else if (href !== '/' && currentPath.startsWith(href)) {
            link.classList.add('active');
        }
    });

    // ── Confirm dangerous actions ──
    document.querySelectorAll('[data-confirm]').forEach(el => {
        el.addEventListener('click', function (e) {
            if (!confirm(this.dataset.confirm)) {
                e.preventDefault();
            }
        });
    });

    // ── Time input: min time validation if today is selected ──
    const dateInput = document.getElementById('booking_date');
    const timeInput = document.getElementById('booking_time');
    if (dateInput && timeInput) {
        dateInput.addEventListener('change', function () {
            const today = new Date().toISOString().split('T')[0];
            if (this.value === today) {
                const now = new Date();
                const hh = String(now.getHours()).padStart(2, '0');
                const mm = String(now.getMinutes()).padStart(2, '0');
                timeInput.min = `${hh}:${mm}`;
            } else {
                timeInput.removeAttribute('min');
            }
        });
    }

    // ── Format currency inputs display ──
    document.querySelectorAll('.currency-display').forEach(el => {
        const val = parseFloat(el.dataset.value);
        if (!isNaN(val)) {
            el.textContent = '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2 });
        }
    });

    // ── Custom Select Dropdowns ──
    document.querySelectorAll('.custom-dropdown-container').forEach(container => {
        const trigger = container.querySelector('.custom-dropdown-trigger');
        const menu = container.querySelector('.custom-dropdown-menu');
        const hiddenSelect = container.querySelector('select');
        const items = container.querySelectorAll('.custom-dropdown-item');

        if (!trigger || !menu || !hiddenSelect) return;

        // Toggle open state on trigger click
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-dropdown-container').forEach(c => {
                if (c !== container) c.classList.remove('open');
            });
            container.classList.toggle('open');
        });

        // Handle item clicks
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                const val = item.dataset.value;
                hiddenSelect.value = val;

                // Update visible label
                const span = trigger.querySelector('span');
                if (span) span.textContent = item.textContent.trim();

                // Update active highlight classes
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                container.classList.remove('open');

                // Trigger form submission by dispatching change event
                hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
    });

    // Close any open custom dropdown when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown-container').forEach(c => c.classList.remove('open'));
    });

    // ── Cursor tracking for hover effects ──
    const targetInteractiveSelector = '.btn-green, .btn-outline-custom';

    document.querySelectorAll(targetInteractiveSelector).forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty('--mouse-x', `${x}px`);
            el.style.setProperty('--mouse-y', `${y}px`);
        });

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty('--mouse-x', `${x}px`);
            el.style.setProperty('--mouse-y', `${y}px`);
        });

        el.addEventListener('mouseleave', () => {
            el.style.removeProperty('--mouse-x');
            el.style.removeProperty('--mouse-y');
        });
    });

    // ══════════════════════════════════════════════
    //  ANIMATION 1: FLOATING PARTICLE CONSTELLATION
    // ══════════════════════════════════════════════
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const canvas = document.createElement('canvas');
        canvas.classList.add('particle-canvas');
        heroSection.insertBefore(canvas, heroSection.firstChild);

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animId;

        function resizeCanvas() {
            canvas.width = heroSection.offsetWidth;
            canvas.height = heroSection.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.2;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.fadeDir = Math.random() > 0.5 ? 1 : -1;
                // Teal / cyan / lavender color mix
                const colors = [
                    [0, 130, 124],   // teal
                    [203, 255, 252], // cyan
                    [237, 255, 254], // ice mist
                    [253, 233, 255], // lilac wisp
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity += this.fadeDir * 0.003;
                if (this.opacity >= 0.7) this.fadeDir = -1;
                if (this.opacity <= 0.05) this.fadeDir = 1;
                // Wrap around
                if (this.x < -10) this.x = canvas.width + 10;
                if (this.x > canvas.width + 10) this.x = -10;
                if (this.y < -10) this.y = canvas.height + 10;
                if (this.y > canvas.height + 10) this.y = -10;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
                ctx.fill();
                // Glow effect
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity * 0.15})`;
                ctx.fill();
            }
        }

        // Create particles (reduced to 9 for low density visual focus)
        const count = 9;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }

        // Draw connections between nearby particles
        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        const alpha = (1 - dist / 120) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 130, 124, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawConnections();
            animId = requestAnimationFrame(animate);
        }
        animate();

        // Pause when not visible
        const heroObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animId) animate();
                } else {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
            });
        }, { threshold: 0.1 });
        heroObs.observe(heroSection);
    }

    // ══════════════════════════════════════════════
    //  ANIMATION 4: STAGGERED SCROLL REVEAL
    // ══════════════════════════════════════════════
    const revealTargets = document.querySelectorAll(
        '.service-card, .kpi-card, .chart-container, .dark-card, .review-card'
    );

    if (revealTargets.length > 0) {
        revealTargets.forEach(el => el.classList.add('reveal-on-scroll'));

        const scrollObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    scrollObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        revealTargets.forEach(el => scrollObs.observe(el));
    }

    // ══════════════════════════════════════════════
    //  ANIMATION 8: HERO HEADLINE TEXT REVEAL
    // ══════════════════════════════════════════════
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.classList.add('hero-text-reveal');
        const html = heroTitle.innerHTML;
        // Split text into words while preserving HTML tags
        const fragment = document.createElement('div');
        fragment.innerHTML = html;

        let wordIndex = 0;
        function wrapTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const words = node.textContent.split(/(\s+)/);
                const span = document.createDocumentFragment();
                words.forEach(word => {
                    if (word.trim() === '') {
                        span.appendChild(document.createTextNode(word));
                    } else {
                        const wordSpan = document.createElement('span');
                        wordSpan.classList.add('word');
                        wordSpan.textContent = word;
                        wordSpan.style.animationDelay = `${wordIndex * 0.08 + 0.2}s`;
                        wordIndex++;
                        span.appendChild(wordSpan);
                    }
                });
                node.parentNode.replaceChild(span, node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Process child nodes (copy to array first to avoid mutation issues)
                Array.from(node.childNodes).forEach(child => wrapTextNodes(child));
            }
        }

        wrapTextNodes(fragment);
        heroTitle.innerHTML = '';
        heroTitle.appendChild(fragment);
    }

    // ══════════════════════════════════════════════
    //  HERO SUBTITLE FADE IN
    // ══════════════════════════════════════════════
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        heroSubtitle.style.opacity = '0';
        heroSubtitle.style.transform = 'translateY(10px)';
        heroSubtitle.style.transition = 'opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s';
        requestAnimationFrame(() => {
            heroSubtitle.style.opacity = '1';
            heroSubtitle.style.transform = 'translateY(0)';
        });
    }
});
