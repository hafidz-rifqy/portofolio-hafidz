// Hero — 3D Tilt Photo + Profile Data

import { api } from './api.js';

export function initHero() {
  const container = document.getElementById('photo3d');
  const card = container?.querySelector('.photo-card');
  const glare = container?.querySelector('.photo-glare');
  const shadow = container?.querySelector('.photo-shadow');

  if (!container || !card) return;

  const MAX_TILT = 20;
  const GLARE_SIZE = 60;

  function handleMouseMove(e) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateY = (mouseX / (rect.width / 2)) * MAX_TILT;
    const rotateX = -(mouseY / (rect.height / 2)) * MAX_TILT;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    // Move glare
    if (glare) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2), transparent ${GLARE_SIZE}%)`;
      glare.style.opacity = '1';
    }

    // Move shadow
    if (shadow) {
      shadow.style.transform = `translateZ(-60px) translateX(${rotateY * -0.8}px) translateY(${20 + rotateX * 0.8}px)`;
      shadow.style.opacity = '0.35';
    }
  }

  function handleMouseLeave() {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.6s ease';

    if (glare) {
      glare.style.opacity = '0';
    }
    if (shadow) {
      shadow.style.transform = 'translateZ(-60px) translateY(20px)';
      shadow.style.opacity = '0.3';
      shadow.style.transition = 'all 0.6s ease';
    }

    setTimeout(() => {
      card.style.transition = 'transform 0.15s ease-out';
      if (shadow) shadow.style.transition = 'all 0.15s ease-out';
    }, 600);
  }

  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('mouseleave', handleMouseLeave);

  // Touch support
  container.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }, { passive: true });

  container.addEventListener('touchend', handleMouseLeave);

  // Load profile data
  loadProfile();
}

async function loadProfile() {
  try {
    const profile = await api.getProfile();
    if (!profile) return;

    const nameEl = document.getElementById('heroName');
    const titleEl = document.getElementById('heroTitle');
    const subtitleEl = document.getElementById('heroSubtitle');
    const photoEl = document.getElementById('heroPhoto');
    const aboutName = document.getElementById('aboutName');
    const aboutTitle = document.getElementById('aboutTitle');
    const aboutEmail = document.getElementById('aboutEmail');
    const aboutBio = document.getElementById('aboutBio');
    const downloadCV = document.getElementById('downloadCV');

    if (nameEl && profile.name) nameEl.textContent = profile.name;
    if (titleEl && profile.title) titleEl.textContent = profile.title;
    if (subtitleEl && profile.subtitle) subtitleEl.textContent = profile.subtitle;

    // Update about section
    if (aboutName && profile.name) aboutName.textContent = profile.name;
    if (aboutTitle && profile.title) aboutTitle.textContent = profile.title;
    if (aboutEmail && profile.email) aboutEmail.textContent = profile.email;
    if (aboutBio && profile.bio) aboutBio.innerHTML = `<p>${profile.bio}</p>`;

    // Photo
    if (photoEl && profile.photo) {
      photoEl.innerHTML = `<img src="${profile.photo}" alt="${profile.name}" />`;
    }

    // CV
    if (downloadCV && profile.cv_file) {
      downloadCV.href = profile.cv_file;
      downloadCV.style.display = 'inline-flex';
    } else if (downloadCV && !profile.cv_file) {
      downloadCV.style.opacity = '0.5';
      downloadCV.title = 'CV belum diupload. Upload melalui Admin Panel.';
      downloadCV.addEventListener('click', (e) => {
        if (!profile.cv_file) {
          e.preventDefault();
          showToast('CV belum tersedia. Upload melalui Admin Panel.', 'error');
        }
      });
    }

    // Update page title
    document.title = `${profile.name} — Portfolio`;

  } catch (err) {
    console.log('Using default profile data');
  }
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
