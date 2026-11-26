/**
 * 3D İletişim Hizmetleri — Motion & Smooth Scroll Engine
 * GSAP 3 + ScrollTrigger + Lenis Smooth Scroll
 * Safe visibility guaranteed (once: true, immediateRender: false, clearProps)
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initSmoothScrollAndAnimations() {
    if (prefersReducedMotion) return;

    const hasLenis = typeof window.Lenis !== 'undefined';
    const hasGsap = typeof window.gsap !== 'undefined';
    const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

    /* ----------------------------------------------------------------------
       1. LENIS SMOOTH SCROLL
       ---------------------------------------------------------------------- */
    let lenis = null;

    if (hasLenis) {
      lenis = new window.Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5
      });

      window.agencyLenis = lenis;

      if (hasGsap && hasScrollTrigger) {
        lenis.on('scroll', window.ScrollTrigger.update);
        window.gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        window.gsap.ticker.lagSmoothing(0);
      } else {
        const raf = (time) => {
          lenis.raf(time);
          window.requestAnimationFrame(raf);
        };
        window.requestAnimationFrame(raf);
      }

      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (!targetId || targetId === '#') return;
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, { offset: -88 });
          }
        });
      });
    }

    if (!hasGsap) return;

    const gsap = window.gsap;
    if (hasScrollTrigger) {
      gsap.registerPlugin(window.ScrollTrigger);
    }

    /* ----------------------------------------------------------------------
       2. HERO & SUBPAGE HERO ENTRANCE TIMELINE
       ---------------------------------------------------------------------- */
    if (document.querySelector('.hero')) {
      const heroTl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.85, clearProps: 'transform,opacity' }
      });

      heroTl
        .from('.hero__eyebrow', { y: 16, opacity: 0, duration: 0.55 })
        .from('.hero__title', { y: 28, opacity: 0 }, '-=0.35')
        .from('.hero__subgrid', { y: 22, opacity: 0, duration: 0.7 }, '-=0.45')
        .from('.hero-slider', { y: 26, opacity: 0, duration: 0.8 }, '-=0.45');
    } else if (document.querySelector('.page-hero')) {
      const pageHeroTl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.8, clearProps: 'transform,opacity' }
      });

      pageHeroTl
        .from('.page-hero .breadcrumb', { y: 14, opacity: 0, duration: 0.45 })
        .from('.page-hero__title', { y: 26, opacity: 0 }, '-=0.3')
        .from('.page-hero__subgrid', { y: 20, opacity: 0, duration: 0.65 }, '-=0.4');
    }

    if (!hasScrollTrigger) return;

    /* ----------------------------------------------------------------------
       3. SAFE EDITORIAL SECTION REVEALS (NEVER STUCK AT OPACITY 0)
       ---------------------------------------------------------------------- */
    gsap.utils.toArray('[data-reveal="fade-up"]').forEach((el) => {
      gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 0.75,
        ease: 'power3.out',
        immediateRender: false,
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true
        }
      });
    });

    const statCards = gsap.utils.toArray('.stat-card');
    if (statCards.length) {
      gsap.from(statCards, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        immediateRender: false,
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.stats-grid',
          start: 'top 90%',
          once: true
        }
      });
    }

    const serviceRows = gsap.utils.toArray('.service-row');
    if (serviceRows.length) {
      gsap.from(serviceRows, {
        y: 18,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out',
        immediateRender: false,
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.service-list',
          start: 'top 90%',
          once: true
        }
      });
    }

    const projectCards = gsap.utils.toArray('.project-card');
    projectCards.forEach((card) => {
      gsap.from(card, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        immediateRender: false,
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          once: true
        }
      });
    });

    const principleCards = gsap.utils.toArray('.principle-card');
    if (principleCards.length) {
      gsap.from(principleCards, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        immediateRender: false,
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.principles__grid',
          start: 'top 90%',
          once: true
        }
      });
    }

    const wordmark = document.querySelector('.footer-wordmark__text');
    if (wordmark) {
      gsap.from(wordmark, {
        yPercent: 28,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        immediateRender: false,
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.footer-wordmark',
          start: 'top 96%',
          once: true
        }
      });
    }

    // Refresh ScrollTrigger once all lazy images settle
    window.ScrollTrigger.refresh();
  }

  window.addEventListener('load', initSmoothScrollAndAnimations);
})();
