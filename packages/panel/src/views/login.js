/** Pre-auth landing page. Click → /auth/start (PKCE flow). */
export function renderLogin(root) {
  root.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'login-page';
  wrap.innerHTML = `
    <div class="login-card card">
      <div class="logo">👹</div>
      <h1>BossRaid</h1>
      <p class="tag">Build a goofy monster. Fight your chat. Try not to die.</p>
      <a href="/auth/start"><button class="primary" style="width:100%">Connect Twitch</button></a>
    </div>
  `;
  root.appendChild(wrap);
}
