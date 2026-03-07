/**
 * AVIRUP BASAK — PORTFOLIO JAVASCRIPT
 * Features: Custom cursor, navbar, hero canvas, scroll reveals,
 *           skill bar animation, mobile menu, form validation,
 *           scroll-to-top, active nav highlighting
 */

/* ============================================================
   1. CUSTOM CURSOR
   ============================================================ */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
let animFrame;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Dot follows instantly
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

// Ring follows with lerp (smooth lag)
function animateCursor() {
  const speed = 0.12;
  ringX += (mouseX - ringX) * speed;
  ringY += (mouseY - ringY) * speed;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  animFrame = requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover effect on interactive elements
document.querySelectorAll('a, button, .skill-card, .project-card, .gallery-item')
  .forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });


/* ============================================================
   2. NAVBAR — scroll state & active link
   ============================================================ */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Scrolled class for compact navbar
  navbar.classList.toggle('scrolled', window.scrollY > 50);

  // Active nav link based on scroll position
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) {
      current = sec.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });

  // Scroll to top button visibility
  scrollTopBtn.classList.toggle('show', window.scrollY > 400);
}, { passive: true });


/* ============================================================
   3. MOBILE HAMBURGER MENU
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navLinksMenu = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksMenu.classList.toggle('open');
});

// Close menu when a link is clicked
navLinksMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksMenu.classList.remove('open');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinksMenu.classList.remove('open');
  }
});


/* ============================================================
   4. HERO CANVAS — Animated particle network
   ============================================================ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const COUNT = 80;
  const MAX_DIST = 130;
  const ACCENT = [0, 212, 255];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : (Math.random() < 0.5 ? -5 : H + 5);
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT.join(',')},${this.alpha})`;
      ctx.fill();
    }
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${ACCENT.join(',')},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
  resize();
  init();
  loop();
})();


/* ============================================================
   5. SCROLL REVEAL — IntersectionObserver
   ============================================================ */
const revealEls = document.querySelectorAll(
  '.reveal-up, .reveal-left, .reveal-right'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Respect custom delay from inline style
      const delay = entry.target.style.getPropertyValue('--delay') || '0s';
      entry.target.style.transitionDelay = delay;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));


/* ============================================================
   6. SKILL BARS — animate width when card enters viewport
   ============================================================ */
const skillCards = document.querySelectorAll('.skill-card');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

skillCards.forEach(card => skillObserver.observe(card));


/* ============================================================
   7. CONTACT FORM VALIDATION
   ============================================================ */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

function showError(fieldId, errId, msg) {
  document.getElementById(fieldId).classList.add('error');
  document.getElementById(errId).textContent = msg;
}

function clearError(fieldId, errId) {
  document.getElementById(fieldId).classList.remove('error');
  document.getElementById(errId).textContent = '';
}

// Live validation clear on input
['name', 'email', 'message'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    clearError(id, id + 'Error');
  });
});

contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  clearError('name', 'nameError');
  clearError('email', 'emailError');
  clearError('message', 'messageError');

  if (!name) {
    showError('name', 'nameError', 'Please enter your name.');
    valid = false;
  } else if (name.length < 2) {
    showError('name', 'nameError', 'Name must be at least 2 characters.');
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showError('email', 'emailError', 'Please enter your email.');
    valid = false;
  } else if (!emailRegex.test(email)) {
    showError('email', 'emailError', 'Please enter a valid email address.');
    valid = false;
  }

  if (!message) {
    showError('message', 'messageError', 'Please enter a message.');
    valid = false;
  } else if (message.length < 10) {
    showError('message', 'messageError', 'Message must be at least 10 characters.');
    valid = false;
  }

  if (valid) {
    // Simulate form submission (replace with real endpoint)
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      contactForm.reset();
      submitBtn.innerHTML = '<i class="ph ph-paper-plane-tilt"></i> Send Message';
      submitBtn.disabled = false;
      formSuccess.classList.add('show');
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    }, 1200);
  }
});


/* ============================================================
   8. SCROLL TO TOP BUTTON
   ============================================================ */
const scrollTopBtn = document.getElementById('scrollTop');
scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ============================================================
   9. SMOOTH SCROLLING for nav links (fallback for older browsers)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ============================================================
   10. HERO ENTRANCE ANIMATION — trigger on load
   ============================================================ */
window.addEventListener('load', () => {
  // The CSS transitions handle entrance via reveal-up + visible
  document.querySelectorAll('.hero .reveal-up').forEach(el => {
    el.classList.add('visible');
  });
});