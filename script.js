const LANG_DEFAULT = 'zh';
const LANG_MAP = { zh: 'zh-Hans', yue: 'zh-Hant', en: 'en' };
const LANG_NAMES = { zh: '简体中文', yue: '粵語', en: 'English' };
const i18nCache = {};

async function loadI18n(lang) {
  if (i18nCache[lang]) return i18nCache[lang];
  const response = await fetch(`i18n/${lang}.json`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to load language pack');
  const data = await response.json();
  i18nCache[lang] = data;
  return data;
}

function applyTranslations(messages, lang) {
  document.documentElement.lang = LANG_MAP[lang] || LANG_MAP[LANG_DEFAULT];
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (!key || !(key in messages)) return;
    node.textContent = messages[key];
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((node) => {
    const key = node.dataset.i18n;
    const attr = node.dataset.i18nAttr;
    if (!key || !(key in messages) || !attr) return;
    attr.split(',').forEach((name) => {
      node.setAttribute(name.trim(), messages[key]);
    });
  });
  const currentLangLabel = document.querySelector('[data-current-lang]');
  if (currentLangLabel) {
    currentLangLabel.textContent = LANG_NAMES[lang] || LANG_NAMES[LANG_DEFAULT];
  }
}

async function setLanguage(lang, updateHistory = true) {
  const targetLang = LANG_MAP[lang] ? lang : LANG_DEFAULT;
  try {
    const messages = await loadI18n(targetLang);
    applyTranslations(messages, targetLang);
    localStorage.setItem('nenya-lang', targetLang);
    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', targetLang);
      window.history.replaceState({}, '', url);
    }
  } catch (err) {
    console.warn(err);
    if (targetLang !== LANG_DEFAULT) setLanguage(LANG_DEFAULT);
  }
}

function initLanguage() {
  const paramsLang = new URLSearchParams(window.location.search).get('lang');
  const storedLang = localStorage.getItem('nenya-lang');
  const initial = paramsLang || storedLang || LANG_DEFAULT;
  setLanguage(initial, false);
  const langMenu = document.querySelector('[data-lang-menu]');
  if (!langMenu) return;
  const trigger = langMenu.querySelector('.lang-trigger');
  trigger?.addEventListener('click', () => {
    const expanded = langMenu.dataset.open === 'true';
    langMenu.dataset.open = expanded ? 'false' : 'true';
    trigger.setAttribute('aria-expanded', (!expanded).toString());
  });
  langMenu.querySelectorAll('[data-lang-option]').forEach((btn) => {
    btn.addEventListener('click', () => {
      langMenu.dataset.open = 'false';
      trigger?.setAttribute('aria-expanded', 'false');
      setLanguage(btn.dataset.langOption, true);
    });
  });
  document.addEventListener('click', (event) => {
    if (!langMenu.contains(event.target)) {
      langMenu.dataset.open = 'false';
      trigger?.setAttribute('aria-expanded', 'false');
    }
  });
}

function setupTabs() {
  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const list = tabs.querySelector('[data-tab-list]');
    const indicator = tabs.querySelector('[data-tab-indicator]');
    const buttons = list ? Array.from(list.querySelectorAll('[role="tab"]')) : [];
    const panels = Array.from(tabs.querySelectorAll('[data-tab-panel]'));
    if (!buttons.length || !panels.length) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function activate(targetId) {
      buttons.forEach((btn) => {
        const isActive = btn.dataset.tabTarget === targetId;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', isActive.toString());
      });
      panels.forEach((panel) => {
        const isActive = panel.dataset.tabPanel === targetId;
        panel.classList.toggle('is-active', isActive);
        panel.toggleAttribute('hidden', !isActive);
      });
      if (indicator && !prefersReduced) {
        const activeBtn = buttons.find((btn) => btn.dataset.tabTarget === targetId);
        if (activeBtn) {
          const { offsetWidth, offsetLeft } = activeBtn;
          const parentOffset = activeBtn.offsetParent?.offsetLeft || 0;
          indicator.style.width = `${offsetWidth}px`;
          indicator.style.transform = `translateX(${offsetLeft - parentOffset}px)`;
        }
      }
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => activate(btn.dataset.tabTarget));
    });
    const initial = buttons.find((btn) => btn.classList.contains('is-active')) || buttons[0];
    if (initial) activate(initial.dataset.tabTarget);
  });
}

function setupReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.section, .hero').forEach((el) => observer.observe(el));
}

function setupHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const toggle = header.querySelector('[data-nav-toggle]');
  const nav = header.querySelector('.primary-nav');
  const update = () => {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  update();
  window.addEventListener('scroll', update, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = header.dataset.menuOpen === 'true';
    header.dataset.menuOpen = open ? 'false' : 'true';
    toggle.setAttribute('aria-expanded', (!open).toString());
  });
  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      header.dataset.menuOpen = 'false';
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  setupTabs();
  setupReveal();
  setupHeader();
});
