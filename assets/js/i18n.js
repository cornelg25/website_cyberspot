/* ============================================================
   CYBERSPOT — i18n.js
   Multilingual engine: IP detection + language switcher
   ============================================================ */

const I18N = (function () {

  /* ── Supported languages ── */
  const LANGUAGES = {
    en: { label: 'EN', name: 'English',    flag: '🇬🇧' },
    fr: { label: 'FR', name: 'Français',   flag: '🇫🇷' },
    nl: { label: 'NL', name: 'Nederlands', flag: '🇳🇱' },
    ro: { label: 'RO', name: 'Română',     flag: '🇷🇴' }
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
      current.innerHTML = `${LANGUAGES[lang].flag} ${LANGUAGES[lang].label} <i class="fa-solid fa-chevron-down" style="font-size:0.65rem;margin-left:3px;opacity:0.7;"></i>`;
    }
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });
  }

  /* ── Detect language from IP ── */
  async function detectFromIP() {
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
        🇬🇧 EN <i class="fa-solid fa-chevron-down" style="font-size:0.65rem;margin-left:3px;opacity:0.7;"></i>
      </button>
      <ul class="lang-dropdown" role="listbox" aria-label="Language options">
        ${Object.entries(LANGUAGES).map(([code, l]) => `
          <li>
            <button class="lang-option" data-lang="${code}" role="option" aria-selected="false">
              <span class="lang-flag">${l.flag}</span>
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
