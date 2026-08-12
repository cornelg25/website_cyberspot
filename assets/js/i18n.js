/* ============================================================
   CYBERSPOT — i18n.js
   Multilingual engine: IP detection + language switcher
   ============================================================ */

const I18N = (function () {

  /* ── Supported languages ── */
  /* Flags are inline SVG (data URI) so they render on Windows,
     which does not support regional-indicator flag emoji. */
  const FLAGS = {
    gb: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="60" height="30"><clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath><clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><g clip-path="url(#s)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#t)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>'),
    fr: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="60" height="40"><rect width="1" height="2" x="0" fill="#0055A4"/><rect width="1" height="2" x="1" fill="#fff"/><rect width="1" height="2" x="2" fill="#EF4135"/></svg>'),
    nl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="60" height="40"><rect width="3" height="2" fill="#fff"/><rect width="3" height="0.667" y="0" fill="#AE1C28"/><rect width="3" height="0.667" y="1.333" fill="#21468B"/></svg>'),
    ro: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="60" height="40"><rect width="1" height="2" x="0" fill="#002B7F"/><rect width="1" height="2" x="1" fill="#FCD116"/><rect width="1" height="2" x="2" fill="#CE1126"/></svg>')
  };

  const LANGUAGES = {
    en: { label: 'EN', name: 'English',    flag: FLAGS.gb },
    fr: { label: 'FR', name: 'Français',   flag: FLAGS.fr },
    nl: { label: 'NL', name: 'Nederlands', flag: FLAGS.nl },
    ro: { label: 'RO', name: 'Română',     flag: FLAGS.ro }
  };

  /* ── Country → language map ── */
  const COUNTRY_LANG = {
    FR: 'fr', MC: 'fr',                     // France, Monaco
    BE: 'en',                                // Belgium → English
    NL: 'nl',                                // Netherlands
    SR: 'nl',                                // Suriname
    RO: 'ro', MD: 'ro',                     // Romania, Moldova
    LU: 'fr', CH: 'fr',                     // Luxembourg, Switzerland → French
    // All others → English (default)
  };

  /* ── State ── */
  let currentLang = 'en';
  let translations = {};

  /* ── Load a JSON language file ── */
  async function loadLang(lang) {
    const res = await fetch(`assets/lang/${lang}.json?v=${Date.now()}`);
    if (!res.ok) throw new Error(`Failed to load lang: ${lang}`);
    return res.json();
  }

  /* ── Apply translations to the DOM ── */
  function applyTranslations(t) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        el.innerHTML = t[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });

    // Update html lang attribute
    document.documentElement.lang = currentLang;
  }

  /* ── Switch language ── */
  async function switchLang(lang) {
    if (!LANGUAGES[lang]) return;
    currentLang = lang;

    try {
      translations = await loadLang(lang);
      applyTranslations(translations);
      localStorage.setItem('cs_lang', lang);
      updateSwitcherUI(lang);

      // Re-run typewriter if switching while on hero
      if (window.I18N_onLangChange) window.I18N_onLangChange(lang, translations);
    } catch (e) {
      console.warn('i18n error:', e);
    }
  }

  /* ── Update the switcher UI ── */
  function updateSwitcherUI(lang) {
    const current = document.getElementById('lang-current');
    if (current) {
      current.innerHTML = `<img class="lang-flag-img" src="${LANGUAGES[lang].flag}" alt="" /> ${LANGUAGES[lang].label} <i class="fa-solid fa-chevron-down" style="font-size:0.65rem;margin-left:3px;opacity:0.7;"></i>`;
    }
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });
  }

  /* ── Detect language from IP ── */
  async function detectFromIP() {
    // 0. URL ?lang= parameter takes top priority (used by landing-page CTAs)
    try {
      const urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang && LANGUAGES[urlLang.toLowerCase()]) return urlLang.toLowerCase();
    } catch (e) { /* ignore */ }

    // 1. Check localStorage preference first
    const saved = localStorage.getItem('cs_lang');
    if (saved && LANGUAGES[saved]) return saved;

    // 2. Try browser language as fast fallback
    const browserLang = (navigator.language || '').slice(0, 2).toLowerCase();
    if (LANGUAGES[browserLang]) {
      // Still try IP for accuracy, but use browser as default
    }

    // 3. IP geolocation
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        const country = (data.country_code || '').toUpperCase();
        if (COUNTRY_LANG[country]) return COUNTRY_LANG[country];
      }
    } catch (e) {
      // IP detection failed — fall through to browser language
    }

    // 4. Use browser language if supported
    if (LANGUAGES[browserLang]) return browserLang;

    // 5. Default to English
    return 'en';
  }

  /* ── Build the language switcher dropdown ── */
  function buildSwitcher() {
    const wrapper = document.getElementById('lang-switcher');
    if (!wrapper) return;

    wrapper.innerHTML = `
      <button id="lang-current" class="lang-current" aria-haspopup="listbox" aria-expanded="false" aria-label="Select language">
        <img class="lang-flag-img" src="${LANGUAGES.en.flag}" alt="" /> EN <i class="fa-solid fa-chevron-down" style="font-size:0.65rem;margin-left:3px;opacity:0.7;"></i>
      </button>
      <ul class="lang-dropdown" role="listbox" aria-label="Language options">
        ${Object.entries(LANGUAGES).map(([code, l]) => `
          <li>
            <button class="lang-option" data-lang="${code}" role="option" aria-selected="false">
              <img class="lang-flag-img" src="${l.flag}" alt="" />
              <span class="lang-name">${l.label}</span>
            </button>
          </li>
        `).join('')}
      </ul>
    `;

    // Toggle dropdown
    const btn = document.getElementById('lang-current');
    const dropdown = wrapper.querySelector('.lang-dropdown');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = wrapper.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });

    // Close on outside click
    document.addEventListener('click', () => {
      wrapper.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });

    // Language option clicks
    wrapper.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        switchLang(opt.dataset.lang);
        wrapper.classList.remove('open');
        btn.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ── Init ── */
  async function init() {
    buildSwitcher();
    const lang = await detectFromIP();
    await switchLang(lang);
  }

  return { init, switchLang, getCurrentLang: () => currentLang, getTranslations: () => translations };

})();

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18N.init());
} else {
  I18N.init();
}
