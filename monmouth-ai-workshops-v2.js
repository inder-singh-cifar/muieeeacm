/* ==========================================================================
   Monmouth CSSE AI Workshops - JavaScript
   Matching Department Website Functionality
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initSidebarActive();
});

/* ==========================================================================
   Mobile Menu Toggle
   ========================================================================== */

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav-menu');

    if (toggle && nav) {
        toggle.addEventListener('click', function() {
            const isOpen = nav.style.display === 'flex';

            if (isOpen) {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'flex';
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '100%';
                nav.style.left = '0';
                nav.style.right = '0';
                nav.style.background = 'var(--monmouth-blue)';
                nav.style.padding = '1rem';
                nav.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!toggle.contains(e.target) && !nav.contains(e.target)) {
                if (window.innerWidth < 1024) {
                    nav.style.display = 'none';
                }
            }
        });

        // Close menu on window resize if desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 1024) {
                nav.style.display = '';
                nav.style.flexDirection = '';
                nav.style.position = '';
                nav.style.top = '';
                nav.style.left = '';
                nav.style.right = '';
                nav.style.background = '';
                nav.style.padding = '';
                nav.style.boxShadow = '';
            }
        });
    }
}

/* ==========================================================================
   Smooth Scrolling
   ========================================================================== */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#' || href === '') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const nav = document.querySelector('.nav-menu');
                if (window.innerWidth < 1024 && nav) {
                    nav.style.display = 'none';
                }
            }
        });
    });
}

/* ==========================================================================
   Sidebar Active State
   ========================================================================== */

function initSidebarActive() {
    const sections = document.querySelectorAll('.content-section[id]');
    const navLinks = document.querySelectorAll('.supernav a[href^="#"]');

    function updateActiveLink() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            if (href === `#${current}`) {
                link.classList.add('active');
                link.style.background = '#fff';
                link.style.color = 'var(--monmouth-orange)';
                link.style.borderLeft = '4px solid var(--monmouth-orange)';
            } else {
                link.style.background = '';
                link.style.color = '';
                link.style.borderLeft = '';
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
}

/* ==========================================================================
   Sticky Header Enhancement
   ========================================================================== */

let lastScroll = 0;
const header = document.querySelector('.site-header');

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }

    lastScroll = currentScroll;
});

/* ==========================================================================
   Animation on Scroll (Fade In)
   ========================================================================== */

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';
            entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.research-item, .project-card, .event-card, .team-member').forEach(el => {
    observer.observe(el);
});

/* ==========================================================================
   Print Friendly Styles
   ========================================================================== */

window.addEventListener('beforeprint', function() {
    // Expand all collapsed sections for printing
    document.querySelectorAll('.navigator').forEach(el => {
        el.style.display = 'block';
    });
});

window.addEventListener('afterprint', function() {
    // Restore normal display
    if (window.innerWidth < 1024) {
        document.querySelectorAll('.navigator').forEach(el => {
            el.style.display = 'none';
        });
    }
});

/* ==========================================================================
   Console Branding
   ========================================================================== */

console.log('%c Monmouth University CSSE ', 'background: #002855; color: #E57200; font-size: 16px; font-weight: bold; padding: 10px;');
console.log('%c AI Workshops & Research Lab ', 'background: #0d64b2; color: white; font-size: 12px; padding: 5px;');
console.log('Learn more: https://www.monmouth.edu/department-of-csse/');
