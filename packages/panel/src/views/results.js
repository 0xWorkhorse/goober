/** Brief results screen between fights. Step 11 expands this with MVP list. */
export function renderResults(root, { state, lastResults }) {
  root.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'card';
  const r = lastResults || {};
  const isVictory = !!r.victory;
  card.innerHTML = `
    <h1 class="banner ${isVictory ? 'victory' : 'defeat'}">${isVictory ? 'Chat wins!' : 'Boss wins!'}</h1>
    <p>Fight duration: <b>${Math.round((r.durationMs || 0) / 100) / 10}s</b> · Total chat damage: <b>${r.totalDamage || 0}</b></p>
    ${r.mvpChatters?.length ? `
      <h2>Top damage</h2>
      <ol>${r.mvpChatters.map((c) => `<li><b>${escapeHtml(c.login)}</b> — ${c.damageDealt} damage</li>`).join('')}</ol>
    ` : ''}
    <p class="stat-name">Hold tight — ${state.phase === 'results' ? 'transitioning…' : 'next phase ready.'}</p>
  `;
  root.appendChild(card);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
