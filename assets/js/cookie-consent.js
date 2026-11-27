/**
 * 3D İletişim Hizmetleri — KVKK Uyumlu Çerez Tercihleri Yönetimi
 * Handles Cookie Consent Banner & Interactive Preferences Modal
 */

(function () {
  'use strict';

  const STORAGE_KEY = '3d_iletisim_cookie_prefs_v1';

  function getSavedPrefs() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function savePrefs(prefs) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          necessary: true,
          analytics: Boolean(prefs.analytics),
          marketing: Boolean(prefs.marketing),
          updatedAt: new Date().toISOString()
        })
      );
    } catch (_) {}
  }

  function injectCookieUI() {
    if (document.getElementById('cookie-modal-backdrop')) return;

    const markup = `
      <aside id="cookie-banner" class="cookie-banner" role="dialog" aria-label="Çerez Bildirimi">
        <p class="cookie-banner__title">Çerez Kullanımı ve Gizlilik</p>
        <p class="cookie-banner__text">
          Web sitemizde deneyiminizi iyileştirmek ve site trafiğini analiz etmek için zorunlu ve isteğe bağlı çerezler kullanıyoruz. Detaylı bilgi için
          <a href="/cerez-politikasi">Çerez Politikamızı</a> inceleyebilirsiniz.
        </p>
        <div class="cookie-banner__actions">
          <button type="button" class="cookie-btn cookie-btn--primary" data-cookie-accept-all>Tümünü Kabul Et</button>
          <button type="button" class="cookie-btn cookie-btn--ghost" data-cookie-reject-optional>Yalnızca Zorunlu</button>
          <button type="button" class="cookie-btn cookie-btn--ghost" data-open-cookie-modal>Tercihleri Yönet</button>
        </div>
      </aside>

      <div id="cookie-modal-backdrop" class="cookie-modal-backdrop" aria-hidden="true">
        <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
          <div class="cookie-modal__head">
            <h2 id="cookie-modal-title" class="cookie-modal__title">Çerez Tercihleri</h2>
            <button type="button" class="cookie-modal__close" data-cookie-close aria-label="Pencereyi kapat">&times;</button>
          </div>
          <p class="cookie-modal__desc">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hangi çerez kategorilerine izin vereceğinizi aşağıdan yönetebilirsiniz.
          </p>

          <div class="cookie-pref-list">
            <div class="cookie-pref-item">
              <div>
                <p class="cookie-pref-item__title">Zorunlu Çerezler</p>
                <p class="cookie-pref-item__desc">Web sitesinin temel işlevleri, güvenlik ve gezinme için gereklidir; devre dışı bırakılamaz.</p>
              </div>
              <label class="cookie-switch" aria-label="Zorunlu çerezler her zaman aktif">
                <input type="checkbox" checked disabled>
                <span class="cookie-switch__slider"></span>
              </label>
            </div>

            <div class="cookie-pref-item">
              <div>
                <p class="cookie-pref-item__title">Performans ve Analitik Çerezleri</p>
                <p class="cookie-pref-item__desc">Ziyaretçi trafiğini anonim olarak ölçerek sayfa hızını ve içerik kalitesini geliştirmemize yardımcı olur.</p>
              </div>
              <label class="cookie-switch" aria-label="Performans ve analitik çerezleri">
                <input type="checkbox" id="cookie-toggle-analytics">
                <span class="cookie-switch__slider"></span>
              </label>
            </div>

            <div class="cookie-pref-item">
              <div>
                <p class="cookie-pref-item__title">İşlevsel ve Pazarlama Çerezleri</p>
                <p class="cookie-pref-item__desc">İletişim ve kampanya tercihlerinizi hatırlayarak size daha ilgili içerikler sunulmasını sağlar.</p>
              </div>
              <label class="cookie-switch" aria-label="İşlevsel ve pazarlama çerezleri">
                <input type="checkbox" id="cookie-toggle-marketing">
                <span class="cookie-switch__slider"></span>
              </label>
            </div>
          </div>

          <div class="cookie-modal__actions">
            <button type="button" class="cookie-btn cookie-btn--ghost" data-cookie-reject-optional>Yalnızca Zorunlu</button>
            <button type="button" class="cookie-btn cookie-btn--ghost" data-cookie-save>Tercihleri Kaydet</button>
            <button type="button" class="cookie-btn cookie-btn--primary" data-cookie-accept-all>Tümünü Kabul Et</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', markup);
  }

  function initCookieConsent() {
    injectCookieUI();

    const banner = document.getElementById('cookie-banner');
    const backdrop = document.getElementById('cookie-modal-backdrop');
    const analyticsToggle = document.getElementById('cookie-toggle-analytics');
    const marketingToggle = document.getElementById('cookie-toggle-marketing');

    const syncToggles = () => {
      const saved = getSavedPrefs();
      if (analyticsToggle) analyticsToggle.checked = saved ? Boolean(saved.analytics) : true;
      if (marketingToggle) marketingToggle.checked = saved ? Boolean(saved.marketing) : false;
    };

    const openModal = () => {
      syncToggles();
      if (backdrop) {
        backdrop.classList.add('is-open');
        backdrop.setAttribute('aria-hidden', 'false');
      }
      if (banner) banner.classList.remove('is-visible');
    };

    const closeModal = () => {
      if (backdrop) {
        backdrop.classList.remove('is-open');
        backdrop.setAttribute('aria-hidden', 'true');
      }
    };

    window.openCookiePreferences = openModal;

    // Show initial banner only if no preference saved yet
    if (!getSavedPrefs() && banner) {
      window.setTimeout(() => {
        if (!getSavedPrefs()) banner.classList.add('is-visible');
      }, 1700);
    }

    document.addEventListener('click', (e) => {
      const openBtn = e.target.closest('[data-open-cookie-modal]');
      if (openBtn) {
        e.preventDefault();
        openModal();
        return;
      }

      if (e.target.closest('[data-cookie-close]') || e.target === backdrop) {
        closeModal();
        return;
      }

      if (e.target.closest('[data-cookie-accept-all]')) {
        savePrefs({ analytics: true, marketing: true });
        if (banner) banner.classList.remove('is-visible');
        closeModal();
        return;
      }

      if (e.target.closest('[data-cookie-reject-optional]')) {
        savePrefs({ analytics: false, marketing: false });
        if (banner) banner.classList.remove('is-visible');
        closeModal();
        return;
      }

      if (e.target.closest('[data-cookie-save]')) {
        savePrefs({
          analytics: analyticsToggle ? analyticsToggle.checked : false,
          marketing: marketingToggle ? marketingToggle.checked : false
        });
        if (banner) banner.classList.remove('is-visible');
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop && backdrop.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    initCookieConsent();
  }
})();
