// ══════════════════════════════════════════
//  CORE — Custom Cursor
//  Shared across all pages.
//  Usage: import { initCursor } from '/core/cursor.js';
//         initCursor();
// ══════════════════════════════════════════

export function initCursor() {
  const dot  = document.getElementById('cur')   ?? createCursorEl('cur',   'position:fixed;width:6px;height:6px;background:#fff;border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);mix-blend-mode:difference;transition:transform .15s;');
  const ring = document.getElementById('cur-r') ?? createCursorEl('cur-r', 'position:fixed;width:28px;height:28px;border:1px solid rgba(255,255,255,.2);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:all .18s ease-out;');

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animRing() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  // Expand ring on clickable elements
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [data-nav], [data-cursor="pointer"]')) {
      ring.style.width  = '44px';
      ring.style.height = '44px';
      ring.style.borderColor = 'rgba(255,255,255,.45)';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, [data-nav], [data-cursor="pointer"]')) {
      ring.style.width  = '28px';
      ring.style.height = '28px';
      ring.style.borderColor = 'rgba(255,255,255,.2)';
    }
  });
}

function createCursorEl(id, css) {
  const el = document.createElement('div');
  el.id = id;
  el.style.cssText = css;
  document.body.appendChild(el);
  return el;
}
