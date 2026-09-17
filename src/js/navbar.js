// Navbar — Floating Oval Pill with Liquid Glass Indicator

export function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const indicator = document.getElementById('navIndicator');
  const sections = document.querySelectorAll('.section');
  let lastScrollY = 0;
  let ticking = false;

  // Position indicator on active link
  function moveIndicator(link, animate = true) {
    if (!link || !indicator) return;
    const pillRect = link.parentElement.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    const left = linkRect.left - pillRect.left;
    const width = linkRect.width;

    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;

    if (animate) {
      indicator.classList.add('morphing');
      setTimeout(() => indicator.classList.remove('morphing'), 500);
    }
  }

  // Set active nav link
  function setActive(sectionId) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === sectionId);
      if (link.dataset.section === sectionId) {
        moveIndicator(link);
      }
    });
  }

  // Click handling
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = document.getElementById(link.dataset.section);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Scroll spy
  function onScroll() {
    const scrollY = window.scrollY;

    // Hide/show navbar on scroll
    if (scrollY > 100) {
      if (scrollY > lastScrollY + 5) {
        navbar.classList.add('hidden');
      } else if (scrollY < lastScrollY - 5) {
        navbar.classList.remove('hidden');
      }
    } else {
      navbar.classList.remove('hidden');
    }
    lastScrollY = scrollY;

    // Determine active section
    let current = 'home';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 200;
      if (scrollY >= sectionTop) {
        current = section.id;
      }
    });
    setActive(current);
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial position
  const activeLink = document.querySelector('.nav-link.active');
  if (activeLink) {
    // Wait for fonts to load before positioning
    if (document.fonts) {
      document.fonts.ready.then(() => moveIndicator(activeLink, false));
    } else {
      setTimeout(() => moveIndicator(activeLink, false), 100);
    }
  }

  // Reposition on resize
  window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-link.active');
    if (active) moveIndicator(active, false);
  });
}
