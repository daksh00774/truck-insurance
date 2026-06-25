// Locomotion custom interactions
// - Works on index.html (full homepage)
// - Does not error on contact.html (guarded by element checks)

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Reveal on scroll ----------
  const revealEls = $$('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el) => io.observe(el));
  }

  // ---------- Nav scroll style toggle ----------
  const nav = $('#nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ---------- Smooth anchor scrolling ----------
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.length <= 1) return;

      const t = document.querySelector(href);
      if (!t) return;

      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.pageYOffset - 60;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  // ---------- Exit intent popup ----------
  const exitPopup = $('#exitPopup');
  const closeExit = $('#closeExit');
  if (exitPopup && closeExit) {
    let shown = false;
    document.addEventListener('mouseout', (e) => {
      if (shown) return;
      if (e.clientY < 10 && !e.relatedTarget) {
        exitPopup.classList.add('show');
        shown = true;
      }
    });
    closeExit.addEventListener('click', () => exitPopup.classList.remove('show'));
  }

  // ---------- Mouse glow ----------
  const mouseGlow = $('#mouseGlow');
  if (mouseGlow) {
    window.addEventListener('mousemove', (e) => {
      mouseGlow.style.left = e.clientX + 'px';
      mouseGlow.style.top = e.clientY + 'px';
    });
    mouseGlow.addEventListener('mouseleave', () => { mouseGlow.style.opacity = '0'; });
    mouseGlow.addEventListener('mouseenter', () => { mouseGlow.style.opacity = '1'; });
  }

  // ---------- Card mouse-follow glow ----------
  $$('.card-glass').forEach((c) => {
    c.addEventListener('mousemove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      c.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    });
  });

  // ---------- Scroll progress bar ----------
  const sp = $('#scrollProg');
  if (sp) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const sc = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      sp.style.width = sc + '%';
    });
  }

  // ---------- Index-only enhancements ----------
  // If these core elements are missing (contact page), skip.
  const isHomePage = !!$('.conditionsSwiper') || !!$('#servicesGrid');
  if (!isHomePage) return;

  // Ensure GSAP + ScrollTrigger exist (they are loaded on index.html)
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Swiper is also loaded on index.html. Only init if needed.
  if (typeof Swiper !== 'undefined') {
    if (!document.querySelector('.conditionsSwiper')?.swiper) {
      try {
        new Swiper('.conditionsSwiper', {
          slidesPerView: 'auto',
          spaceBetween: 20,
          navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
          loop: true,
        });
      } catch (_) {
        // no-op
      }
    }
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero text
  if ($('.hero h1 span')) {
    gsap.from('.hero h1 span', {
      y: 80,
      opacity: 0,
      duration: 1.1,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.1,
    });
  }

  // Counter
  $$('.count').forEach((el) => {
    const to = +el.dataset.to;
    if (Number.isNaN(to)) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          innerText: to,
          duration: 2,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate: function () {
            el.innerText = Math.floor(this.targets()[0].innerText);
          },
        });
      },
    });
  });

  // Bars + rings
  $$('.bar > span').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        el.style.width = el.dataset.w + '%';
      },
    });
  });

  $$('.ring-prog').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        const p = +el.dataset.p;
        let cur = 0;
        const step = () => {
          cur += 1;
          if (cur <= p) {
            el.style.setProperty('--p', cur);
            requestAnimationFrame(step);
          }
        };
        step();
      },
    });
  });

  // Booking steps
  const nextStepBtn = $('#nextStep');
  const prevStepBtn = $('#prevStep');
  if (nextStepBtn && prevStepBtn) {
    let step = 1;
    const maxStep = 4;

    const panes = () => $$('.step-pane');
    const dots = () => $$('.steps .s');

    function setStep(n) {
      step = Math.max(1, Math.min(maxStep, n));
      panes().forEach((p) => { p.style.display = (+p.dataset.pane === step ? 'block' : 'none'); });
      dots().forEach((d) => {
        const i = +d.dataset.step;
        d.classList.toggle('done', i < step);
        d.classList.toggle('active', i === step);
      });
      nextStepBtn.innerHTML = step === maxStep
        ? 'Confirm Booking <i class="fa-solid fa-check ms-2"></i>'
        : 'Continue <i class="fa-solid fa-arrow-right ms-2"></i>';
    }

    nextStepBtn.addEventListener('click', () => {
      if (step === maxStep) {
        alert('Thank you! A team member will reach out within the hour to confirm.');
        return;
      }
      setStep(step + 1);
    });

    prevStepBtn.addEventListener('click', () => setStep(step - 1));

    $$('.pick').forEach((b) => b.addEventListener('click', () => {
      const group = b.parentElement.parentElement;
      $$('.pick', group).forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
    }));
  }
})();

