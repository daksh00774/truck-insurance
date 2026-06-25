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
      c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
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

  // ---------- Data ----------
  const conditions = [
    { t: 'Sports Injuries', img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80' },
    { t: 'Orthopedic Injuries', img: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80' },
    { t: 'Neck Pain', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80' },
    { t: 'Back Pain', img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80' },
    { t: 'Shoulder Pain', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80' },
    { t: 'Running Injuries', img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80' },
    { t: 'Complex Pain', img: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80' },
    { t: 'Post-Surgical', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80' },
  ];

  const services = [
    { t: 'Physical Therapy', i: 'fa-stethoscope', d: 'Doctor-led, evidence-based rehabilitation tailored to your body and your goals.', s: 6 },
    { t: 'Sports Rehabilitation', i: 'fa-medal', d: 'Return-to-sport pathways for athletes of every level.', s: 6 },
    { t: 'Dry Needling', i: 'fa-syringe', d: 'Trigger-point release for stubborn muscular pain and tension.', s: 4 },
    { t: 'Manual Therapy', i: 'fa-hand-holding-medical', d: 'Hands-on mobilization, soft tissue, and joint techniques.', s: 4 },
    { t: 'Massage Therapy', i: 'fa-spa', d: 'Therapeutic and sport massage for recovery and performance.', s: 4 },
    { t: 'Strength Training', i: 'fa-dumbbell', d: 'Programmed strength work to build resilient, capable bodies.', s: 6 },
    { t: 'Performance Coaching', i: 'fa-bolt-lightning', d: '1-on-1 coaching to optimize speed, power, and capacity.', s: 6 },
    { t: 'Fitness Classes', i: 'fa-people-group', d: 'Small-group sessions blending mobility, conditioning and lifting.', s: 4 },
    { t: 'Nutrition Counseling', i: 'fa-apple-whole', d: 'Fuel strategies built around your training and recovery.', s: 4 },
    { t: 'Corporate Wellness', i: 'fa-briefcase-medical', d: 'On-site programs that reduce injuries and boost performance.', s: 4 },
    { t: 'Athletic Performance', i: 'fa-trophy', d: 'Year-round development for competitive athletes.', s: 12 },
  ];

  const stories = [
    { n: 'Marcus T.', r: 'ACL Reconstruction → Back on the Field in 7 Months', img: 'https://images.unsplash.com/photo-1554344728-77cf90d9ed26?auto=format&fit=crop&w=1200&q=80' },
    { n: 'Sarah K.', r: 'Chronic Back Pain → Pain-Free in 12 Weeks', img: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=1200&q=80' },
    { n: 'David L.', r: 'Shoulder Surgery → Lifting Heavier Than Ever', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80' },
  ];

  const team = [
    { n: 'Dr. Maya Reyes', role: 'DPT · Founder', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=80', b: 'Sports orthopedics & post-surgical rehab.' },
    { n: 'Dr. Jordan Chen', role: 'DPT · Performance Lead', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1000&q=80', b: 'Strength, ACL return-to-play, biomechanics.' },
    { n: 'Coach Alex Rivera', role: 'CSCS · Head Strength Coach', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=80', b: '10+ yrs collegiate & pro athlete prep.' },
    { n: 'Dr. Priya Nair', role: 'DPT · Manual Therapy', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=1000&q=80', b: 'Spine, hands-on therapy, complex pain.' },
  ];

  const faqs = [
    { q: 'Do you accept insurance?', a: 'We work with most major insurance providers. Our team will verify your benefits before your first visit so there are no surprises.' },
    { q: 'How long does a typical treatment plan last?', a: 'Most patients see meaningful improvement in 4–8 weeks. Plans are personalized based on your assessment, goals, and progress.' },
    { q: 'Will I see the same therapist every visit?', a: 'Yes. We pair you with a dedicated Doctor of Physical Therapy who manages your entire recovery journey.' },
    { q: 'Do you work with competitive athletes?', a: 'Absolutely — from youth and college to professional. Our performance center is built for athletes at every level.' },
    { q: 'How do I schedule my first appointment?', a: 'Use the booking form above or call us directly. New patient evaluations are available within 24–48 hours.' },
  ];

  // ---------- Render dynamic sections (only if target containers exist) ----------
  const swiperWrap = document.querySelector('.conditionsSwiper .swiper-wrapper');
  if (swiperWrap) {
    conditions.forEach((c) => {
      swiperWrap.insertAdjacentHTML('beforeend',
        `<div class="swiper-slide" style="width:380px"><div class="condition-card"><img src="${c.img}" alt="${c.t}"/><div class="body"><span class="pill">Treatment</span><h4>${c.t}</h4><div class="more">Learn More <i class="fa-solid fa-arrow-right"></i></div></div></div></div>`
      );
    });
  }

  const servicesGrid = $('#servicesGrid');
  if (servicesGrid) {
    services.forEach((s, i) => {
      servicesGrid.insertAdjacentHTML('beforeend',
        `<div class="card-glass service c-span-${s.s} reveal"><span class="num">0${(i + 1).toString().padStart(2, '0').slice(-2)}</span><div class="ico"><i class="fa-solid ${s.i}"></i></div><h3>${s.t}</h3><p>${s.d}</p></div>`
      );
    });
  }

  const storiesGrid = $('#storiesGrid');
  if (storiesGrid) {
    stories.forEach((s) => {
      storiesGrid.insertAdjacentHTML('beforeend',
        `<div class="col-md-6 col-lg-4 reveal"><div class="video-card"><img src="${s.img}"/><div class="veil"></div><div class="play"><i class="fa-solid fa-play"></i></div><div class="meta"><div class="who">${s.n}</div><h4>${s.r}</h4></div></div></div>`
      );
    });
  }

  const teamGrid = $('#teamGrid');
  if (teamGrid) {
    team.forEach((t) => {
      teamGrid.insertAdjacentHTML('beforeend',
        `<div class="col-sm-6 col-lg-3 reveal"><div class="person"><img src="${t.img}"/><div class="meta"><div class="role">${t.role}</div><h4>${t.n}</h4><p>${t.b}</p></div></div></div>`
      );
    });
  }

  const faqList = $('#faqList');
  if (faqList) {
    faqs.forEach((f, i) => {
      faqList.insertAdjacentHTML('beforeend',
        `<div class="faq reveal" data-i="${i}"><div class="q">${f.q} <i class="fa-solid fa-plus ic"></i></div><div class="a"><div class="inner">${f.a}</div></div></div>`
      );
    });

    faqList.addEventListener('click', (e) => {
      const item = e.target.closest('.faq');
      if (!item) return;
      $$('.faq').forEach((f) => { if (f !== item) f.classList.remove('open'); });
      item.classList.toggle('open');
    });
  }

  // ---------- Swiper ----------
  if (typeof Swiper !== 'undefined') {
    // Avoid creating multiple instances on HMR/refresh-like scenarios.
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

  // ---------- GSAP/ScrollTrigger animations ----------
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

