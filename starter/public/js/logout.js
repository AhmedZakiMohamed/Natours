const logoutBtn = document.querySelector('.nav__el--logout');

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    const res = await fetch('/logout');
    if (res.ok) location.reload(); // اعمل reload بعد ما يسجل الخروج
  });
}
