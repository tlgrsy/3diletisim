/**
 * 3D İletişim Hizmetleri — Motion & Smooth Scroll Engine
 * GSAP 3 + ScrollTrigger + Lenis Smooth Scroll
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
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.6
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

      // Smooth anchor links
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (!targetId || targetId === '#') return;
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, { offset: -84 });
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
        defaults: { ease: 'power4.out', duration: 0.95 }
      });

      heroTl
        .from('.hero__eyebrow', { y: 18, opacity: 0, duration: 0.65 })
        .from('.hero__title', { y: 36, opacity: 0 }, '-=0.45')
        .from('.hero__subgrid', { y: 26, opacity: 0, duration: 0.8 }, '-=0.55')
        .from('.hero-slider', { y: 32, opacity: 0, duration: 0.9 }, '-=0.55');
    } else if (document.querySelector('.page-hero')) {
      const pageHeroTl = gsap.timeline({
        defaults: { ease: 'power4.out', duration: 0.9 }
      });

      pageHeroTl
        .from('.page-hero .breadcrumb', { y: 16, opacity: 0, duration: 0.55 })
        .from('.page-hero__title', { y: 32, opacity: 0 }, '-=0.35')
        .from('.page-hero__subgrid', { y: 24, opacity: 0, duration: 0.75 }, '-=0.5');
    }

    if (!hasScrollTrigger) return;

    /* ----------------------------------------------------------------------
       3. EDITORIAL SECTION REVEALS
       ---------------------------------------------------------------------- */
    gsap.utils.toArray('[data-reveal="fade-up"]').forEach((el) => {
      gsap.from(el, {
        y: 34,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          once: true
        }
      });
    });

    /* Manifesto Authority Stats Stagger */
    const statCards = gsap.utils.toArray('.stat-card');
    if (statCards.length) {
      gsap.from(statCards, {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.stats-grid',
          start: 'top 86%',
          once: true
        }
      });
    }

    /* Services 8-Item Editorial List Stagger */
    const serviceRows = gsap.utils.toArray('.service-row');
    if (serviceRows.length) {
      gsap.from(serviceRows, {
        y: 22,
        opacity: 0,
        duration: 0.65,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.service-list',
          start: 'top 84%',
          once: true
        }
      });
    }

    /* Selected Projects Cards Reveal & Subtle Asymmetric Parallax */
    const projectCards = gsap.utils.toArray('.project-card');
    projectCards.forEach((card, index) => {
      gsap.from(card, {
        y: 42,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        clearProps: 'opacity',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          once: true
        }
      });

      // Subtle depth offset on desktop for even cards
      if (window.innerWidth > 920 && index % 2 === 1) {
        gsap.to(card, {
          y: -28,
          ease: 'none',
          scrollTrigger: {
            trigger: '.projects__grid',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8
          }
        });
      }
    });

    /* Working Principles 4-Card Stagger */
    const principleCards = gsap.utils.toArray('.principle-card');
    if (principleCards.length) {
      gsap.from(principleCards, {
        y: 30,
        opacity: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.principles__grid',
          start: 'top 85%',
          once: true
        }
      });
    }

    /* Footer Giant Wordmark Editorial Reveal */
    const wordmark = document.querySelector('.footer-wordmark__text');
    if (wordmark) {
      gsap.from(wordmark, {
        yPercent: 40,
        opacity: 0,
        duration: 1.05,
        ease: 'power4.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.footer-wordmark',
          start: 'top 95%',
          once: true
        }
      });
    }
  }

  window.addEventListener('load', initSmoothScrollAndAnimations);
})();
