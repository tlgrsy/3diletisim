/**
 * 3D İletişim Hizmetleri — GSAP 3.12+ Motion, Preloader & Smooth Scroll Engine
 * - Official SVG Barcode Equalizer Preloader (~1.5s on homepage / fast curtain on subpages)
 * - GSAP 3.12+ gsap.context() & gsap.matchMedia()
 * - Zero stuck opacity: 0 elements (once: true, immediateRender: false, clearProps)
 */

(function () {
  'use strict';

  const PRELOADER_SESSION_KEY = '3d_iletisim_preloader_seen';

  /* ------------------------------------------------------------------------
     1. CUSTOM LOGO LOADER ANIMATION (24 SPECTRUM BARS EQUALIZER + CURTAIN)
     ------------------------------------------------------------------------ */
  function initLogoPreloader(onCompleteCallback) {
    const preloader = document.getElementById('site-preloader');
    if (!preloader) {
      if (typeof onCompleteCallback === 'function') onCompleteCallback();
      return;
    }

    const hasGsap = typeof window.gsap !== 'undefined';

    const finishPreloader = () => {
      preloader.classList.add('is-done');
      preloader.style.display = 'none';
      preloader.style.visibility = 'hidden';
      preloader.style.pointerEvents = 'none';
      preloader.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('is-preloading');
      if (typeof onCompleteCallback === 'function') onCompleteCallback();
    };

    if (!hasGsap) {
      finishPreloader();
      return;
    }

    const gsap = window.gsap;
    const path = window.location.pathname || '';
    const isHomePage = path === '/' || path.endsWith('/index.html') || path === '';

    // Failsafe so the curtain can never remain stuck
    const failsafeTimer = window.setTimeout(finishPreloader, 3000);

    const bars = preloader.querySelectorAll('.logo-bar');
    const wordmark = preloader.querySelector('.logo-wordmark');
    const caption = preloader.querySelector('.site-preloader__caption');

    // Full equalizer animation on homepage (~1.45s) and crisp animated equalizer on subpages (~0.95s)
    const barDuration = isHomePage ? 0.44 : 0.28;
    const barStagger = isHomePage ? 0.03 : 0.018;
    const wordmarkDuration = isHomePage ? 0.34 : 0.24;
    const holdDelay = isHomePage ? '+=0.16' : '+=0.08';
    const curtainDuration = isHomePage ? 0.56 : 0.44;

    const tl = gsap.timeline({
      onComplete: () => {
        window.clearTimeout(failsafeTimer);
        try {
          window.sessionStorage.setItem(PRELOADER_SESSION_KEY, '1');
        } catch (_) {}
        finishPreloader();
      }
    });

    gsap.set(bars, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(wordmark, { opacity: 0, y: 12 });
    if (caption) gsap.set(caption, { opacity: 0, y: 8 });

    tl.to(bars, {
      scaleY: 1,
      duration: barDuration,
      stagger: barStagger,
      ease: 'power3.out'
    })
      .to(
        wordmark,
        {
          opacity: 1,
          y: 0,
          duration: wordmarkDuration,
          ease: 'power2.out'
        },
        '-=0.2'
      )
      .to(
        caption || {},
        {
          opacity: 1,
          y: 0,
          duration: 0.24,
          ease: 'power2.out'
        },
        '-=0.18'
      )
      .to(
        preloader,
        {
          yPercent: -100,
          duration: curtainDuration,
          ease: 'expo.inOut'
        },
        holdDelay
      );
  }

  /* ------------------------------------------------------------------------
     2. LENIS SMOOTH SCROLL + GSAP CONTEXT / MATCHMEDIA ENGINE
     ------------------------------------------------------------------------ */
  function initMotionEngine() {
    const hasLenis = typeof window.Lenis !== 'undefined';
    const hasGsap = typeof window.gsap !== 'undefined';
    const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

    if (hasLenis) {
      const lenis = new window.Lenis({
        duration: 1.05,
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

    const mm = gsap.matchMedia();

    mm.add('all', () => {
      const ctx = gsap.context(() => {
        if (document.querySelector('.hero')) {
          const heroTl = gsap.timeline({
            defaults: { ease: 'power3.out', duration: 0.78, clearProps: 'transform,opacity' }
          });

          heroTl
            .from('.hero__eyebrow', { y: 14, opacity: 0, duration: 0.45 })
            .from('.hero__title', { y: 26, opacity: 0 }, '-=0.28')
            .from('.hero__subgrid', { y: 20, opacity: 0, duration: 0.65 }, '-=0.42')
            .from('.hero-slider', { y: 24, opacity: 0, duration: 0.72 }, '-=0.42');
        } else if (document.querySelector('.page-hero')) {
          const pageHeroTl = gsap.timeline({
            defaults: { ease: 'power3.out', duration: 0.72, clearProps: 'transform,opacity' }
          });

          pageHeroTl
            .from('.page-hero .breadcrumb', { y: 12, opacity: 0, duration: 0.4 })
            .from('.page-hero__title', { y: 24, opacity: 0 }, '-=0.24')
            .from('.page-hero__subgrid', { y: 18, opacity: 0, duration: 0.6 }, '-=0.35');
        }

        if (!hasScrollTrigger) return;

        gsap.utils.toArray('[data-reveal="fade-up"]').forEach((el) => {
          gsap.from(el, {
            y: 26,
            opacity: 0,
            duration: 0.72,
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

        const staggerGroups = [
          { items: '.stat-card', trigger: '.stats-grid', stagger: 0.1 },
          { items: '.service-row', trigger: '.service-list', stagger: 0.045 },
          { items: '.principle-card', trigger: '.principles__grid', stagger: 0.08 }
        ];

        staggerGroups.forEach(({ items, trigger, stagger }) => {
          const els = gsap.utils.toArray(items);
          const trigEl = document.querySelector(trigger);
          if (!els.length || !trigEl) return;

          gsap.from(els, {
            y: 22,
            opacity: 0,
            duration: 0.68,
            stagger,
            ease: 'power3.out',
            immediateRender: false,
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: trigEl,
              start: 'top 90%',
              once: true
            }
          });
        });

        gsap.utils.toArray('.project-card').forEach((card) => {
          gsap.from(card, {
            y: 28,
            opacity: 0,
            duration: 0.76,
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

        const wordmark = document.querySelector('.footer-wordmark__text');
        if (wordmark) {
          gsap.from(wordmark, {
            yPercent: 24,
            opacity: 0,
            duration: 0.85,
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
      });

      return () => ctx.revert();
    });

    /* Desktop-only smooth scrub image parallax */
    mm.add('(min-width: 921px)', () => {
      if (!hasScrollTrigger) return;

      const ctx = gsap.context(() => {
        gsap.utils.toArray('.has-image > img').forEach((img) => {
          if (img.closest('.hero-slider') || img.id === 'service-preview-img') return;
          gsap.fromTo(
            img,
            { yPercent: -4, scale: 1.07 },
            {
              yPercent: 4,
              scale: 1.07,
              ease: 'none',
              scrollTrigger: {
                trigger: img.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6
              }
            }
          );
        });
      });

      return () => ctx.revert();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (hasScrollTrigger) window.ScrollTrigger.refresh();
      });
    }
  }

  function boot() {
    initLogoPreloader(() => {
      initMotionEngine();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
