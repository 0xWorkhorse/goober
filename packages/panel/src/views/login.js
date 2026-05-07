/** Pre-auth landing — single big "Connect Twitch" button. */
export function renderLogin(root) {
  root.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'login-wrap';
  wrap.innerHTML = `
    <div class="login-card">
      <div class="logo">👹</div>
      <h1>BossRaid</h1>
      <p>Build a goofy monster. Fight your chat. Try not to die.</p>
      <a href="/auth/start"><button class="btn primary giant">Connect Twitch</button></a>
    </div>
  `;
  root.appendChild(wrap);
}
