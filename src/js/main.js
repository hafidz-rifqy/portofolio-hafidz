// Main Entry Point — Initialize All Modules

import { initNavbar } from './navbar.js';
import { initHero } from './hero.js';
import { initPortfolio } from './portfolio.js';
import { initExperience } from './experience.js';
import { initContact } from './contact.js';

// Theme toggle
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Load saved theme or respect system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  toggle?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initHero();
  initPortfolio();
  initExperience();
  initContact();

  // Global scroll animations for non-JS loaded elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-title, .about-glass-card, .contact-card, .contact-form, .comments-section').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
});
