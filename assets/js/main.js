/* ============================================================
   CYBERSPOT — main.js
   ============================================================ */

/* ── Navbar scroll behaviour ── */
(function () {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
})();

/* ── Mobile hamburger ── */
(function () {
  const btn = document.getElementById('hamburger');
  const drawer = document.getElementById('mobile-drawer');
  const nav = document.getElementById('navbar');
  if (!btn || !drawer) return;

  btn.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    nav.classList.toggle('drawer-open', open);
  });

  // close drawer on link click
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
      nav.classList.remove('drawer-open');
    });
  });
})();

/* ── Hero typewriter ── */
(function () {
  const el = document.getElementById('hero-headline');
  if (!el) return;

  const text = "Your Full 24/7 Cybersecurity Team. Ready in Days, Not Months.";
  let i = 0;
  el.innerHTML = '<span class="cursor"></span>';

  function type() {
    if (i < text.length) {
      const cursor = el.querySelector('.cursor');
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
      setTimeout(type, i < 10 ? 60 : 38);
    }
  }
  // small delay before starting
  setTimeout(type, 500);
})();

/* ── Scroll-reveal via Intersection Observer ── */
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => io.observe(el));
})();

/* ── Service card accordion ── */
(function () {
  document.querySelectorAll('.card-header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.service-card');
      const isOpen = card.classList.contains('open');

      // close all
      document.querySelectorAll('.service-card').forEach(c => c.classList.remove('open'));

      // toggle clicked
      if (!isOpen) card.classList.add('open');
    });
  });
})();

/* ── Use-case tabs ── */
(function () {
  const btns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });
})();

/* ── Count-up animation ── */
(function () {
  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    const isFloat = el.dataset.target.includes('.');
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const step = 16;
    const steps = duration / step;
    let current = 0;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    }, step);
  }

  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = '1';
        animateCount(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
})();

/* ── Contact form handler (Formspree) ── */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('.form-submit .btn');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.style.display = 'none';
        const ty = document.getElementById('thank-you');
        if (ty) ty.classList.add('show');
      } else {
        const data = await response.json();
        const msg = (data.errors && data.errors.map(e => e.message).join(', '))
                    || 'Something went wrong. Please try again.';
        btn.textContent = msg;
        btn.disabled = false;
      }
    } catch (err) {
      btn.textContent = 'Network error — please try again.';
      btn.disabled = false;
    }
  });
})();
