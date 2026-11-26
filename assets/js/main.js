/**
 * 3D İletişim Hizmetleri — Core Interactive UI Logic
 * Vanilla JS | Multilingual-ready (TR default, EN-ready architecture)
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. I18N ARCHITECTURE HOOK (TR Active / EN Ready)
     ------------------------------------------------------------------------ */
  window.AgencyI18n = {
    currentLocale: document.documentElement.lang || 'tr',
    supportedLocales: ['tr', 'en'],
    getDictionaryKeys: function () {
      const nodes = document.querySelectorAll('[data-i18n]');
      return Array.from(nodes).map((el) => el.getAttribute('data-i18n'));
    }
  };

  /* ------------------------------------------------------------------------
     2. STICKY HEADER & MOBILE DRAWER
     ------------------------------------------------------------------------ */
  function initHeader() {
    const header = document.querySelector('.site-header');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-drawer');

    if (header) {
      const onScroll = () => {
        if (window.scrollY > 24) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (toggleBtn && drawer) {
      const setDrawerState = (open) => {
        toggleBtn.setAttribute('aria-expanded', String(open));
        drawer.classList.toggle('is-open', open);
        drawer.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';

        if (window.agencyLenis) {
          if (open) {
            window.agencyLenis.stop();
          } else {
            window.agencyLenis.start();
          }
        }
      };

      toggleBtn.addEventListener('click', () => {
        const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
        setDrawerState(!isOpen);
      });

      drawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setDrawerState(false));
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
          setDrawerState(false);
          toggleBtn.focus();
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     3. HERO DRAGGABLE SHOWCASE SLIDER (IMG-01 & IMG-02)
     ------------------------------------------------------------------------ */
  function initHeroSlider() {
    const slider = document.getElementById('hero-slider');
    if (!slider) return;

    const viewport = slider.querySelector('.hero-slider__viewport');
    const track = slider.querySelector('.hero-slider__track');
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const prevBtn = slider.querySelector('[data-slider-prev]');
    const nextBtn = slider.querySelector('[data-slider-next]');
    const counterEl = slider.querySelector('[data-slider-current]');
    const progressBars = Array.from(slider.querySelectorAll('.hero-slider__bar'));

    if (!viewport || !track || slides.length === 0) return;

    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    const totalSlides = slides.length;

    const formatIndex = (num) => String(num + 1).padStart(2, '0');

    const updateSlider = (index) => {
      currentIndex = (index + totalSlides) % totalSlides;
      const offsetPercent = -currentIndex * 100;
      track.style.transform = `translate3d(${offsetPercent}%, 0, 0)`;

      if (counterEl) {
        counterEl.textContent = formatIndex(currentIndex);
      }

      progressBars.forEach((bar, i) => {
        bar.classList.toggle('is-active', i === currentIndex);
        bar.setAttribute('aria-selected', String(i === currentIndex));
      });

      slides.forEach((slide, i) => {
        slide.setAttribute('aria-hidden', String(i !== currentIndex));
      });
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => updateSlider(currentIndex - 1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => updateSlider(currentIndex + 1));
    }

    progressBars.forEach((bar, idx) => {
      bar.addEventListener('click', () => updateSlider(idx));
    });

    // Pointer / Touch Drag Interaction
    const getClientX = (e) => (e.type.includes('mouse') ? e.pageX : e.touches[0].clientX);

    const onDragStart = (e) => {
      isDragging = true;
      startX = getClientX(e);
      prevTranslate = -currentIndex * viewport.offsetWidth;
      currentTranslate = prevTranslate;
      viewport.classList.add('is-dragging');
    };

    const onDragMove = (e) => {
      if (!isDragging) return;
      const currentX = getClientX(e);
      const delta = currentX - startX;
      currentTranslate = prevTranslate + delta;
      track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
    };

    const onDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      viewport.classList.remove('is-dragging');

      const movedBy = currentTranslate - prevTranslate;
      const threshold = Math.min(viewport.offsetWidth * 0.16, 110);

      if (movedBy < -threshold) {
        updateSlider(currentIndex + 1);
      } else if (movedBy > threshold) {
        updateSlider(currentIndex - 1);
      } else {
        updateSlider(currentIndex);
      }
    };

    viewport.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    viewport.addEventListener('touchstart', onDragStart, { passive: true });
    viewport.addEventListener('touchmove', onDragMove, { passive: true });
    viewport.addEventListener('touchend', onDragEnd);

    // Keyboard navigation when slider is focused
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        updateSlider(currentIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        updateSlider(currentIndex - 1);
      }
    });

    updateSlider(0);
  }

  /* ------------------------------------------------------------------------
     4. INTERACTIVE 8-ITEM SERVICES LIST & [IMG-05] PREVIEW BOX
     ------------------------------------------------------------------------ */
  function initServicesList() {
    const rows = Array.from(document.querySelectorAll('.service-row'));
    const previewBox = document.getElementById('service-preview-box');
    const previewImg = document.getElementById('service-preview-img');
    const previewCode = document.getElementById('service-preview-code');
    const previewName = document.getElementById('service-preview-name');
    const previewNote = document.getElementById('service-preview-note');
    const previewSlotDesc = document.getElementById('service-preview-slot-desc');

    if (rows.length === 0 || !previewBox) return;

    const activateRow = (row) => {
      rows.forEach((r) => r.classList.remove('is-active'));
      row.classList.add('is-active');

      const num = row.dataset.serviceNum || '01';
      const title = row.dataset.serviceTitle || '';
      const note = row.dataset.serviceNote || '';
      const visualNote = row.dataset.serviceVisual || '';
      const imgSrc = row.dataset.serviceImg || '';

      if (previewImg && imgSrc && previewImg.getAttribute('src') !== imgSrc) {
        previewImg.style.opacity = '0.35';
        window.setTimeout(() => {
          previewImg.setAttribute('src', imgSrc);
          previewImg.setAttribute('alt', `${title} — 3D İletişim Hizmetleri`);
          previewImg.style.opacity = '1';
        }, 110);
      }

      if (previewCode) previewCode.textContent = `HİZMET ${num} / 08`;
      if (previewName) previewName.textContent = title;
      if (previewNote) previewNote.textContent = note;
      if (previewSlotDesc && visualNote) previewSlotDesc.textContent = visualNote;

      // Subtle micro-pulse on preview frame
      previewBox.style.transform = 'scale(0.985)';
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          previewBox.style.transform = 'scale(1)';
        }, 90);
      });
    };

    rows.forEach((row) => {
      row.addEventListener('mouseenter', () => activateRow(row));
      row.addEventListener('focus', () => activateRow(row));
      row.addEventListener('click', () => activateRow(row));
    });
  }

  /* ------------------------------------------------------------------------
     5. CUSTOM ORANGE "İNCELE" CURSOR FOR SELECTED PROJECTS
     ------------------------------------------------------------------------ */
  function initProjectCursor() {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const cursor = document.getElementById('project-cursor');
    const cards = document.querySelectorAll('.project-card__link');
    if (!cursor || cards.length === 0) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let isActive = false;

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      window.requestAnimationFrame(animateCursor);
    };

    window.requestAnimationFrame(animateCursor);

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        isActive = true;
        document.body.classList.add('has-project-cursor');
        cursor.classList.add('is-visible');
      });

      card.addEventListener('mouseleave', () => {
        isActive = false;
        document.body.classList.remove('has-project-cursor');
        cursor.classList.remove('is-visible');
      });
    });

    window.addEventListener('scroll', () => {
      if (isActive && !document.querySelector('.project-card__link:hover')) {
        isActive = false;
        document.body.classList.remove('has-project-cursor');
        cursor.classList.remove('is-visible');
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     6. GEO & SEO FAQ ACCORDION
     ------------------------------------------------------------------------ */
  function initFaqAccordion() {
    const items = Array.from(document.querySelectorAll('.faq-item'));
    if (items.length === 0) return;

    items.forEach((item) => {
      const trigger = item.querySelector('.faq-item__trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close sibling items for clean editorial focus
        items.forEach((sibling) => {
          sibling.classList.remove('is-open');
          const sibTrigger = sibling.querySelector('.faq-item__trigger');
          if (sibTrigger) sibTrigger.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     7. PROJECTS LIVE CATEGORY FILTER (projeler.html)
     ------------------------------------------------------------------------ */
  function initProjectFilters() {
    const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
    const projectCards = Array.from(document.querySelectorAll('.project-card[data-category]'));
    const countEl = document.getElementById('projects-visible-count');

    if (filterButtons.length === 0 || projectCards.length === 0) return;

    const applyFilter = (category) => {
      let visibleCount = 0;

      projectCards.forEach((card) => {
        const matches = category === 'all' || card.dataset.category === category;
        card.classList.toggle('is-hidden', !matches);
        if (matches) visibleCount += 1;
      });

      if (countEl) {
        countEl.textContent = String(visibleCount);
      }

      if (typeof window.ScrollTrigger !== 'undefined') {
        window.ScrollTrigger.refresh();
      }
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        applyFilter(btn.dataset.filter || 'all');
      });
    });
  }

  /* ------------------------------------------------------------------------
     8. ONE-CLICK COPY EMAIL (iletisim.html)
     ------------------------------------------------------------------------ */
  function initCopyEmail() {
    const copyBtns = document.querySelectorAll('[data-copy-email]');
    if (!copyBtns.length) return;

    copyBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const email = btn.getAttribute('data-copy-email') || 'info@3diletisim.com';
        const originalText = btn.textContent;

        try {
          await navigator.clipboard.writeText(email);
        } catch (_) {
          const tempInput = document.createElement('input');
          tempInput.value = email;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        btn.classList.add('is-copied');
        btn.textContent = 'Kopyalandı ✓';

        window.setTimeout(() => {
          btn.classList.remove('is-copied');
          btn.textContent = originalText;
        }, 2200);
      });
    });
  }

  /* ------------------------------------------------------------------------
     9. INTERACTIVE CONTACT FORM (iletisim.html)
     ------------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById('agency-contact-form');
    const statusBox = document.getElementById('contact-form-status');
    if (!form || !statusBox) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = form.querySelector('#contact-name')?.value.trim() || '';
      const email = form.querySelector('#contact-email')?.value.trim() || '';

      if (!fullName || !email) {
        statusBox.textContent = 'Lütfen ad soyad ve e-posta alanlarını eksiksiz doldurunuz.';
        statusBox.classList.add('is-visible');
        return;
      }

      const selectedServices = Array.from(form.querySelectorAll('input[name="services"]:checked')).map(
        (input) => input.value
      );

      const serviceText = selectedServices.length
        ? ` Seçilen alanlar: ${selectedServices.join(', ')}.`
        : '';

      statusBox.textContent = `Teşekkürler ${fullName}! Mesajınız 3D İletişim ekibine ulaştı.${serviceText} En kısa sürede kahve eşliğinde tanışmak üzere dönüş yapacağız.`;
      statusBox.classList.add('is-visible');
      form.reset();
    });
  }

  /* ------------------------------------------------------------------------
     10. READING PROGRESS BAR (blog-detay.html)
     ------------------------------------------------------------------------ */
  function initReadingProgress() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      bar.style.width = `${percent}%`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  /* ------------------------------------------------------------------------
     11. BOOTSTRAP
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initHeroSlider();
    initServicesList();
    initProjectCursor();
    initFaqAccordion();
    initProjectFilters();
    initCopyEmail();
    initContactForm();
    initReadingProgress();
  });
})();
