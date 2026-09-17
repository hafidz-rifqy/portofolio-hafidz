// Contact — Form, Social Links, Comments

import { api } from './api.js';

export function initContact() {
  loadSocialLinks();
  loadComments();
  initContactForm();
  initCommentForm();
  initSSE();
  document.getElementById('currentYear').textContent = new Date().getFullYear();
}

// Social Link SVG Icons
const socialIcons = {
  github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.4a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.6a6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 4.77 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon fill="#fff" points="9.545,15.568 15.818,12 9.545,8.432"/></svg>`,
  email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
};

async function loadSocialLinks() {
  try {
    const links = await api.getSocial();
    const container = document.getElementById('socialLinks');
    if (!container || !links.length) return;

    container.innerHTML = links.map(link => {
      const icon = socialIcons[link.icon] || socialIcons[link.platform] || socialIcons.email;
      return `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-link" title="${link.platform}">${icon}</a>`;
    }).join('');
  } catch (err) {
    console.error('Failed to load social links:', err);
  }
}

async function loadComments() {
  try {
    const comments = await api.getComments();
    renderComments(comments);
  } catch (err) {
    console.error('Failed to load comments:', err);
  }
}

function renderComments(comments) {
  const list = document.getElementById('commentsList');
  const countEl = document.getElementById('commentCount');
  if (!list) return;

  if (countEl) countEl.textContent = `(${comments.length})`;

  if (comments.length === 0) {
    list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Belum ada komentar. Jadilah yang pertama!</p>';
    return;
  }

  list.innerHTML = comments.map(c => {
    const initial = c.name.charAt(0).toUpperCase();
    const timeAgo = getTimeAgo(new Date(c.created_at));
    const avatarContent = c.avatar_image 
      ? `<img src="${c.avatar_image}" alt="${escapeHtml(c.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
      : initial;
    
    return `
      <div class="comment-item" data-id="${c.id}">
        <div class="comment-avatar" style="background: ${c.avatar_image ? 'transparent' : c.avatar_color}">${avatarContent}</div>
        <div class="comment-body">
          <div class="comment-author">${escapeHtml(c.name)}</div>
          <div class="comment-text">${escapeHtml(c.message)}</div>
          <div class="comment-time">${timeAgo}</div>
        </div>
      </div>
    `;
  }).join('');
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) return;

    try {
      await api.postContact({ name, email, message });
      showToast('Pesan berhasil dikirim! 🎉', 'success');
      form.reset();
    } catch (err) {
      showToast('Gagal mengirim pesan. Coba lagi.', 'error');
    }
  });
}

function initCommentForm() {
  const form = document.getElementById('commentForm');
  if (!form) return;

  const colorRow = document.getElementById('commentColorRow');
  const imageInput = document.getElementById('commentImage');
  const imageName = document.getElementById('commentImageName');
  let selectedFile = null;

  if (imageInput) {
    imageInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        selectedFile = e.target.files[0];
        imageName.textContent = selectedFile.name;
        imageName.style.display = 'inline';
        if (colorRow) colorRow.style.display = 'none';
      } else {
        selectedFile = null;
        imageName.style.display = 'none';
        if (colorRow) colorRow.style.display = 'flex';
      }
    });
  }

  // Avatar color picker
  let selectedColor = '#6366f1';
  const colorBtns = document.querySelectorAll('.avatar-color-btn');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.color;
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('commentName').value.trim();
    const message = document.getElementById('commentMessage').value.trim();

    if (!name || !message) return;

    try {
      // Optimistic logic removed, will rely purely on SSE if server handles it, 
      // but for instant local feel, we just await server response which triggers SSE anyway.
      // We will let SSE handle the actual prepend to prevent duplicate rendering if possible.
      // Wait, let's keep it simple: we submit, and let SSE do the appending.
      
      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('name', name);
        payload.append('message', message);
        payload.append('avatar_image', selectedFile);
      } else {
        payload = { name, message, avatar_color: selectedColor };
      }

      await api.postComment(payload);
      
      form.reset();
      selectedFile = null;
      if (imageName) imageName.style.display = 'none';
      if (colorRow) colorRow.style.display = 'flex';

      // Re-select first color
      colorBtns.forEach(b => b.classList.remove('active'));
      if(colorBtns[0]) colorBtns[0].classList.add('active');
      selectedColor = '#6366f1';

      showToast('Komentar berhasil ditambahkan! ✨', 'success');
    } catch (err) {
      showToast('Gagal mengirim komentar. Coba lagi.', 'error');
    }
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initSSE() {
  const evtSource = new EventSource('/api/events');
  
  evtSource.addEventListener('new-comment', event => {
    const c = JSON.parse(event.data);
    const list = document.getElementById('commentsList');
    const countEl = document.getElementById('commentCount');
    if (!list) return;

    // Check if it already exists (optimistic update fallback)
    if (list.querySelector(`[data-id="${c.id}"]`)) return;

    if (list.querySelector('p')) list.innerHTML = '';

    const initial = c.name.charAt(0).toUpperCase();
    const avatarContent = c.avatar_image 
      ? `<img src="${c.avatar_image}" alt="${escapeHtml(c.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
      : initial;

    const html = `
      <div class="comment-item" data-id="${c.id}">
        <div class="comment-avatar" style="background: ${c.avatar_image ? 'transparent' : c.avatar_color}">${avatarContent}</div>
        <div class="comment-body">
          <div class="comment-author">${escapeHtml(c.name)}</div>
          <div class="comment-text">${escapeHtml(c.message)}</div>
          <div class="comment-time">Baru saja</div>
        </div>
      </div>
    `;
    list.insertAdjacentHTML('afterbegin', html);

    const currentCount = parseInt(countEl?.textContent?.match(/\d+/)?.[0] || '0');
    if (countEl) countEl.textContent = `(${currentCount + 1})`;
  });

  evtSource.addEventListener('delete-comment', event => {
    const id = event.data;
    const item = document.querySelector(`.comment-item[data-id="${id}"]`);
    if (item) {
      item.remove();
      const countEl = document.getElementById('commentCount');
      if (countEl) {
        const currentCount = parseInt(countEl.textContent.match(/\d+/)?.[0] || '1');
        countEl.textContent = `(${Math.max(0, currentCount - 1)})`;
      }
      
      const list = document.getElementById('commentsList');
      if (list && list.children.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Belum ada komentar. Jadilah yang pertama!</p>';
      }
    }
  });

  evtSource.onerror = () => {
    console.warn('SSE connection lost on public site, reconnecting...');
  };
}
