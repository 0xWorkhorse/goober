/**
 * OBS handoff screen — the one-time "add the overlay to your scene" walk-through.
 *
 * Two-column layout: left side has the URL with a one-click copy button + 3
 * numbered steps; right side mocks up an OBS Studio window with the URL
 * already pasted. The mock animates a typing caret in the URL field so it
 * feels like a guided walkthrough.
 */

import { el, escapeHtml } from './chrome.js';

export function renderObsHandoff(root, ctx) {
  root.innerHTML = '';
  const channelId = ctx.me?.channelId || 'demo';
  const overlayUrl = `${location.origin}/overlay/?channelId=${encodeURIComponent(channelId)}`;

  const wrap = el('div', 'dash-single');
  wrap.style.cssText = 'display:grid;grid-template-columns:1.1fr 1fr;gap:36px;padding:36px 44px;';

  // Left
  const leftCol = el('div');
  leftCol.style.cssText = 'display:flex;flex-direction:column;gap:22px;';
  const head = el('div');
  head.innerHTML = `
    <span class="banner-strip">one-time setup</span>
    <h2 style="font-family:var(--font-hand);font-weight:700;font-size:42px;margin:8px 0 0">Add the overlay to OBS.</h2>
    <p style="font-family:var(--font-marker);font-size:16px;color:var(--ink-2);margin:6px 0 0">
      One click here, one paste in OBS. We'll wait.
    </p>
  `;
  leftCol.appendChild(head);

  // URL + copy
  const urlBox = el('div', 'obs-url');
  urlBox.innerHTML = `<code id="brm-overlay-url">${escapeHtml(overlayUrl)}</code>`;
  const copyBtn = el('button', 'btn primary lg');
  copyBtn.style.boxShadow = 'none';
  copyBtn.textContent = '📋 Copy URL';
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(overlayUrl); copyBtn.textContent = '✓ Copied!'; }
    catch { copyBtn.textContent = '✓ Copied!'; }
    setTimeout(() => { copyBtn.textContent = '📋 Copy URL'; }, 2200);
  });
  urlBox.appendChild(copyBtn);
  leftCol.appendChild(urlBox);

  // Steps
  const steps = el('div');
  steps.style.cssText = 'display:grid;gap:24px;margin-top:8px;';
  const STEPS = [
    ['In OBS, right-click your scene → Add → Browser Source', 'name it "BossRaid" or whatever feels right'],
    ['Paste the URL into the URL field', "width 1920, height 1080. don't touch the rest"],
    ["That's it. We'll detect it within 5 seconds.", '● connection appears in the topbar above ↑'],
  ];
  STEPS.forEach(([head, sub], i) => {
    const s = el('div', 'obs-step');
    s.innerHTML = `
      <span class="num">${i + 1}</span>
      <p class="head">${escapeHtml(head)}</p>
      <p class="sub">${sub}</p>
    `;
    steps.appendChild(s);
  });
  leftCol.appendChild(steps);

  // Bottom controls
  const ctrl = el('div');
  ctrl.style.cssText = 'display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:8px;';
  const continueBtn = el('button', 'btn primary lg');
  continueBtn.textContent = 'Done — take me to the panel →';
  continueBtn.addEventListener('click', () => { ctx.obsAcknowledged = true; ctx.rerender(); });
  const skipBtn = el('button', 'btn ghost');
  skipBtn.textContent = 'skip — I\'ll do this later';
  skipBtn.addEventListener('click', () => { ctx.obsAcknowledged = true; ctx.rerender(); });
  ctrl.append(continueBtn, skipBtn);
  leftCol.appendChild(ctrl);

  // Right — OBS preview
  const right = el('div', 'obs-preview');
  right.innerHTML = `
    <div class="titlebar">
      <span class="led" style="background:#e35d4e"></span>
      <span class="led" style="background:#e8b347"></span>
      <span class="led" style="background:#3fa86a"></span>
      <span style="margin-left:12px">OBS Studio — 30.1.2</span>
    </div>
    <div class="body">
      <div class="scene-row" style="background:#1f1d18">📺 Scene · Just Chatting</div>
      <div class="scene-row">┣ 🎥 Webcam</div>
      <div class="scene-row">┣ 🎮 Game Capture</div>
      <div class="scene-row added">
        ┣ 🌐 Browser Source · BossRaid
        <div style="position:absolute;right:-90px;top:50%;transform:translateY(-50%) rotate(-2deg);background:var(--accent);color:var(--paper);padding:4px 10px;border-radius:6px;font-family:var(--font-marker);font-size:13px;border:2.4px solid var(--paper)">← here!</div>
      </div>
      <div class="urlbox">
        <div style="margin-bottom:6px">URL:</div>
        <div class="urlval">${escapeHtml(overlayUrl)}<span style="animation:brm-blip 0.8s infinite">▌</span></div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <span style="background:#26241f;padding:4px 8px;border-radius:4px">W: 1920</span>
          <span style="background:#26241f;padding:4px 8px;border-radius:4px">H: 1080</span>
        </div>
      </div>
    </div>
    <div class="footer">● connected · streaming overlay</div>
  `;

  wrap.append(leftCol, right);
  root.appendChild(wrap);
}
