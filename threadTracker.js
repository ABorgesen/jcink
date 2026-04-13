(function () {
  'use strict';

  function makeBanner(text, bg) {
    const banner = document.createElement('div');
    banner.textContent = text;
    banner.style.position = 'fixed';
    banner.style.bottom = '12px';
    banner.style.right = '12px';
    banner.style.zIndex = '999999';
    banner.style.padding = '10px 14px';
    banner.style.background = bg;
    banner.style.color = '#fff';
    banner.style.fontSize = '12px';
    banner.style.fontWeight = '700';
    banner.style.borderRadius = '8px';
    banner.style.boxShadow = '0 4px 12px rgba(0,0,0,.25)';
    document.body.appendChild(banner);
  }

  try {
    makeBanner('threadTracker.js loaded', '#198754');
  } catch (err) {
    console.error(err);
  }
})();
