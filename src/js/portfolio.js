// Portfolio — Tabs with Liquid Glass + Cards

import { api } from './api.js';

let allPortfolio = [];
let currentCategory = 'project';

export function initPortfolio() {
  const tabs = document.querySelectorAll('.portfolio-tab');
  const indicator = document.getElementById('portfolioIndicator');
  const grid = document.getElementById('portfolioGrid');

  // Move tab indicator
  function moveTabIndicator(tab, animate = true) {
    if (!tab || !indicator) return;
    const barRect = tab.parentElement.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();

    indicator.style.left = `${tabRect.left - barRect.left}px`;
    indicator.style.width = `${tabRect.width}px`;

    if (animate) {
      indicator.classList.add('morphing');
      setTimeout(() => indicator.classList.remove('morphing'), 500);
    }
  }

  // Tab click
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      moveTabIndicator(tab);
      renderCards();
    });
  });

  // Initial indicator
  const activeTab = document.querySelector('.portfolio-tab.active');
  if (activeTab) {
    if (document.fonts) {
      document.fonts.ready.then(() => moveTabIndicator(activeTab, false));
    } else {
      setTimeout(() => moveTabIndicator(activeTab, false), 100);
    }
  }

  window.addEventListener('resize', () => {
    const active = document.querySelector('.portfolio-tab.active');
    if (active) moveTabIndicator(active, false);
  });

  // Load data
  loadPortfolio();
}

async function loadPortfolio() {
  try {
    allPortfolio = await api.getPortfolio();
    renderCards();
  } catch (err) {
    console.error('Failed to load portfolio:', err);
  }
}

function renderCards() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  const filtered = allPortfolio.filter(item => item.category === currentCategory);

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color: var(--text-muted); padding: 3rem;">Belum ada data. Tambahkan melalui Admin Panel.</div>`;
    return;
  }

  if (currentCategory === 'techstack') {
    grid.innerHTML = filtered.map((item, i) => renderTechCard(item, i)).join('');
  } else {
    grid.innerHTML = filtered.map((item, i) => renderProjectCard(item, i)).join('');
  }

  // Add animation delays
  grid.querySelectorAll('.portfolio-card, .tech-card-wrapper').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.1}s`;
  });

  // Attach event listeners
  grid.querySelectorAll('[data-detail-id]').forEach(btn => {
    btn.addEventListener('click', () => showDetail(btn.dataset.detailId));
  });
}

function renderProjectCard(item, index) {
  const hasImage = item.image ? `<img src="${item.image}" alt="${item.title}" />` : `<div class="portfolio-card-icon">📁</div>`;

  return `
    <div class="portfolio-card" style="animation-delay: ${index * 0.1}s">
      <div class="portfolio-card-image">${hasImage}</div>
      <div class="portfolio-card-body">
        <h3 class="portfolio-card-title">${item.title}</h3>
        <p class="portfolio-card-desc">${item.description}</p>
        <div class="portfolio-card-footer">
          ${item.site_url ? `<a href="${item.site_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Kunjungi Situs</a>` : ''}
          <button class="btn-icon" data-detail-id="${item.id}" title="Lihat Detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderTechCard(item, index) {
  const icons = {
    'JavaScript': '⚡', 'TypeScript': '🔷', 'React': '⚛️', 'Node.js': '🟢',
    'Python': '🐍', 'Database': '🗄️', 'DevOps': '🚀', 'default': '💻'
  };

  const iconKey = Object.keys(icons).find(k => item.title.includes(k)) || 'default';

  return `
    <div class="tech-card-wrapper portfolio-card" style="animation-delay: ${index * 0.1}s">
      <div class="tech-card">
        <div class="tech-card-icon">${icons[iconKey]}</div>
        <div class="tech-card-content">
          <div class="tech-card-title">${item.title}</div>
          <div class="tech-card-sub">${item.description}</div>
          <div class="tech-card-duration">${item.duration}</div>
        </div>
        <button class="btn-icon" data-detail-id="${item.id}" title="Lihat Detail">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function showDetail(id) {
  const item = allPortfolio.find(p => p.id === parseInt(id));
  if (!item) return;

  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  const techTags = item.tech_used
    ? item.tech_used.split(',').map(t => `<span class="modal-tag">${t.trim()}</span>`).join('')
    : '';

  content.innerHTML = `
    <h3>${item.title}</h3>
    <p>${item.detail || item.description}</p>
    ${item.duration ? `<p><strong>Durasi:</strong> ${item.duration}</p>` : ''}
    ${item.site_url ? `<p><a href="${item.site_url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="margin-top: 0.5rem;">Kunjungi Situs →</a></p>` : ''}
    ${techTags ? `<div class="modal-meta">${techTags}</div>` : ''}
  `;

  overlay.classList.add('active');
}

// Close modal
document.getElementById('modalClose')?.addEventListener('click', () => {
  document.getElementById('modalOverlay')?.classList.remove('active');
});
document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove('active');
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('modalOverlay')?.classList.remove('active');
  }
});
