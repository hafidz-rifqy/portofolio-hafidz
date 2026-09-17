// Experience — Interactive Timeline

import { api } from './api.js';

export function initExperience() {
  loadExperience();
}

async function loadExperience() {
  try {
    const items = await api.getExperience();
    renderTimeline(items);
  } catch (err) {
    console.error('Failed to load experience:', err);
  }
}

function renderTimeline(items) {
  const timeline = document.getElementById('timeline');
  if (!timeline || !items.length) return;

  timeline.innerHTML = items.map((item, i) => `
    <div class="timeline-item animate-on-scroll" style="transition-delay: ${i * 0.1}s">
      <div class="timeline-node"></div>
      <div class="timeline-card" data-tilt>
        <span class="timeline-type-badge ${item.type}">${item.type === 'work' ? '💼 Kerja' : '🎓 Pendidikan'}</span>
        <div class="timeline-period">${item.period}</div>
        <h3 class="timeline-title">${item.title}</h3>
        <div class="timeline-institution">${item.institution}</div>
        <p class="timeline-description">${item.description}</p>
      </div>
    </div>
  `).join('');

  // Add 3D tilt to timeline cards
  initTimelineTilt();

  // Scroll animations
  initScrollAnimations();
}

function initTimelineTilt() {
  const cards = document.querySelectorAll('.timeline-card[data-tilt]');
  const MAX_TILT = 8;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateY = (mouseX / (rect.width / 2)) * MAX_TILT;
      const rotateX = -(mouseY / (rect.height / 2)) * MAX_TILT;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => {
        card.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease';
      }, 500);
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}
