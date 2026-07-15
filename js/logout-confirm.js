(function () {
  'use strict';

  if (window.__stacklyLogoutConfirmLoaded) return;
  window.__stacklyLogoutConfirmLoaded = true;

  var style = document.createElement('style');
  style.textContent = [
    '.logout-modal-overlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.62);backdrop-filter:blur(7px);opacity:0;visibility:hidden;transition:.25s}',
    '.logout-modal-overlay.show{opacity:1;visibility:visible}',
    '.logout-modal{width:min(100%,410px);padding:34px 30px;border:1px solid rgba(245,158,11,.22);border-radius:22px;background:#fff;text-align:center;box-shadow:0 30px 90px rgba(15,23,42,.3);transform:translateY(15px) scale(.97);transition:.25s}',
    '.logout-modal-overlay.show .logout-modal{transform:none}',
    '.logout-modal-icon{display:grid;place-items:center;width:68px;height:68px;margin:0 auto 18px;border-radius:20px;background:linear-gradient(135deg,#fff7ed,#ffedd5);color:#f59e0b;font-size:26px}',
    '.logout-modal h2{margin:0 0 9px;color:#0f172a;font:700 22px Poppins,sans-serif}',
    '.logout-modal p{margin:0;color:#64748b;font:400 13px/1.65 Inter,sans-serif}',
    '.logout-modal-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:25px}',
    '.logout-modal-actions button{min-height:46px;border-radius:10px;font:600 13px Inter,sans-serif;cursor:pointer;transition:.2s}',
    '.logout-cancel{border:1px solid #cbd5e1;background:#fff;color:#334155}',
    '.logout-cancel:hover{border-color:#94a3b8;background:#f8fafc}',
    '.logout-confirm{border:1px solid #f59e0b;background:#f59e0b;color:#fff}',
    '.logout-confirm:hover{border-color:#d97706;background:#d97706;box-shadow:0 9px 22px rgba(245,158,11,.25)}'
  ].join('');
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'logout-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'logoutModalTitle');
  overlay.innerHTML = '<div class="logout-modal"><div class="logout-modal-icon"><i class="fas fa-right-from-bracket"></i></div><h2 id="logoutModalTitle">Confirm Logout</h2><p>Are you sure you want to sign out of your Stackly dashboard?</p><div class="logout-modal-actions"><button type="button" class="logout-cancel">Cancel</button><button type="button" class="logout-confirm">Yes, Logout</button></div></div>';
  document.body.appendChild(overlay);

  var cancelBtn = overlay.querySelector('.logout-cancel');
  var confirmBtn = overlay.querySelector('.logout-confirm');
  var lastTrigger = null;

  function closeModal() {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('.logout').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      lastTrigger = link;
      overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { cancelBtn.focus(); }, 50);
    });
  });

  cancelBtn.addEventListener('click', closeModal);
  confirmBtn.addEventListener('click', function () {
    try {
      sessionStorage.removeItem('stacklyUserEmail');
      sessionStorage.removeItem('stacklyUserName');
      sessionStorage.removeItem('stacklyUserRole');
    } catch (storageError) {}
    window.location.href = 'login.html';
  });
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && overlay.classList.contains('show')) closeModal();
  });
})();
