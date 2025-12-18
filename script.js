function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', targetId);
      }
    });
  });
}

function setupRevealObserver() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function setupParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const elements = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!elements.length) return;
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      elements.forEach((el) => {
        const depth = parseFloat(el.dataset.parallax) || 0.1;
        el.style.transform = `translateY(${(scrollY * depth).toFixed(2)}px)`;
      });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setupCountUp() {
  const stats = document.querySelectorAll('[data-count-target]');
  if (!stats.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const targetValue = parseInt(entry.target.dataset.countTarget, 10);
      const duration = 1200;
      const strong = entry.target.querySelector('strong');
      if (!strong || Number.isNaN(targetValue)) return;
      const start = performance.now();
      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        strong.textContent = Math.round(targetValue * eased);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }, { threshold: 0.6 });
  stats.forEach((stat) => observer.observe(stat));
}

function setupCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.copy;
      if (!value || !navigator.clipboard) return;
      navigator.clipboard.writeText(value).then(() => {
        const original = button.textContent;
        button.textContent = '已复制 Copied';
        setTimeout(() => { button.textContent = original; }, 1400);
      });
    });
  });
}

function setupFloatingContact() {
  document.querySelectorAll('.floating-contact[data-contact]').forEach((wrapper) => {
    const button = wrapper.querySelector('button');
    const card = wrapper.querySelector('.floating-card');
    if (!button || !card) return;
    button.addEventListener('click', () => {
      card.classList.toggle('active');
    });
    document.addEventListener('click', (event) => {
      if (!wrapper.contains(event.target)) {
        card.classList.remove('active');
      }
    });
  });
}

function setupPageNavHighlight() {
  const nav = document.querySelector('[data-scroll-nav]');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const sections = links
    .map((link) => {
      const target = document.querySelector(link.getAttribute('href'));
      return target ? { link, target } : null;
    })
    .filter(Boolean);
  if (!sections.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        sections.forEach(({ link }) => link.classList.remove('active'));
        const active = sections.find((item) => item.target === entry.target);
        if (active) active.link.classList.add('active');
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(({ target }) => observer.observe(target));
}

function setupDetailsToggle() {
  const accordions = document.querySelectorAll('.service-accordion');
  if (!accordions.length) return;
  accordions.forEach((current) => {
    current.addEventListener('toggle', () => {
      if (current.open) {
        accordions.forEach((el) => {
          if (el !== current) el.removeAttribute('open');
        });
      }
    });
  });
}

function pageTransitionIn() {
  if (document.documentElement.classList.contains('no-transitions')) return;
  document.documentElement.style.opacity = 0;
  requestAnimationFrame(() => {
    document.documentElement.style.transition = 'opacity 420ms ease';
    document.documentElement.style.opacity = 1;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupSmoothScroll();
  setupRevealObserver();
  setupParallax();
  setupCountUp();
  setupCopyButtons();
  setupFloatingContact();
  setupPageNavHighlight();
  setupDetailsToggle();
  pageTransitionIn();
});
