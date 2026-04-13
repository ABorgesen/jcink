(function () {
  'use strict';

  const TRACKED_CHARACTERS = [
    'lucian gaunt',
    'thea macmillan',
    'octavia montague',
    'bartemius crouch jr',
    'bartemius crouch jr.',
    'barty crouch jr',
    'barty crouch jr.'
  ];

  const CAUGHT_UP_LABEL = 'Caught Up';

  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .replace(/[“”"'`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isTrackedCharacter(name) {
    const n = normalize(name);
    return TRACKED_CHARACTERS.some(char => normalize(char) === n);
  }

  function injectStyles() {
    if (document.getElementById('caught-up-thread-styles')) return;

    const style = document.createElement('style');
    style.id = 'caught-up-thread-styles';
    style.textContent = `
      .caught-up-label {
        display: inline-block;
        margin-left: 8px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .08em;
        opacity: .7;
        vertical-align: middle;
      }
    `;
    document.head.appendChild(style);
  }

  function getPostBodies() {
    const selectors = [
      '.postcolor',
      '.post_body',
      '.post-body',
      '.entry-content',
      '.c_post',
      '.post'
    ];

    const found = [];
    const seen = new Set();

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!seen.has(el)) {
          seen.add(el);
          found.push(el);
        }
      });
    });

    return found;
  }

  function getLinesFromBreaks(container) {
    const html = container.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n');

    const temp = document.createElement('div');
    temp.innerHTML = html;

    return temp.textContent
      .split('\n')
      .map(line => line.replace(/\u00a0/g, ' ').trim())
      .filter(Boolean);
  }

  function markCaughtUpInPost(container) {
    const links = Array.from(container.querySelectorAll('a[href*="showtopic="]'));
    if (!links.length) return;

    links.forEach(link => {
      if (link.dataset.caughtUpProcessed === 'true') return;
      link.dataset.caughtUpProcessed = 'true';

      const lineText = (link.parentElement?.textContent || '').replace(/\u00a0/g, ' ').trim();

      if (/tracker code/i.test(lineText)) return;

      const lastPostLine = findLastPostLine(link, container);
      if (!lastPostLine) return;

      const match = lastPostLine.match(/Last Post:\s*(.+?)\s*-\s*(.+)$/i);
      if (!match) return;

      const lastPoster = match[1].trim();
      if (!isTrackedCharacter(lastPoster)) return;

      replaceArrowBeforeLink(link);
      appendCaughtUpLabel(link);
    });
  }

  function findLastPostLine(link, container) {
    let node = link.parentElement;
    let safety = 0;

    while (node && node !== container && safety < 8) {
      const text = (node.textContent || '').replace(/\u00a0/g, ' ');
      const match = text.match(/Last Post:\s*.+?\s*-\s*.+/i);
      if (match) return match[0].trim();
      node = node.nextElementSibling || node.parentElement;
      safety++;
    }

    const lines = getLinesFromBreaks(container);
    const linkText = normalize(link.textContent);

    for (let i = 0; i < lines.length; i++) {
      if (normalize(lines[i]).includes(linkText)) {
        for (let j = i + 1; j <= i + 4 && j < lines.length; j++) {
          if (/^Last Post:/i.test(lines[j])) return lines[j];
        }
      }
    }

    return '';
  }

  function replaceArrowBeforeLink(link) {
    const parent = link.parentNode;
    if (!parent) return;

    const previous = link.previousSibling;

    if (previous && previous.nodeType === Node.TEXT_NODE) {
      previous.textContent = previous.textContent.replace(/➤/g, '✓');
      return;
    }

    if (parent.firstChild && parent.firstChild.nodeType === Node.TEXT_NODE) {
      parent.firstChild.textContent = parent.firstChild.textContent.replace(/➤/g, '✓');
    }
  }

  function appendCaughtUpLabel(link) {
    const existing = link.parentNode.querySelector('.caught-up-label');
    if (existing) return;

    const span = document.createElement('span');
    span.className = 'caught-up-label';
    span.textContent = CAUGHT_UP_LABEL;
    link.insertAdjacentElement('afterend', span);
  }

  function run() {
    injectStyles();
    const posts = getPostBodies();
    posts.forEach(markCaughtUpInPost);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  window.addEventListener('load', run);
})();
