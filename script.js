// ---------- Tema değiştirici ----------
// Site varsayılan olarak koyu (dark) temayla açılır.
// Kullanıcı açık temayı seçerse <html> elementine "light-mode" sınıfı eklenir
// ve tercih localStorage'da saklanır (bkz. her sayfanın <head> içindeki flash-önleyici script).
(function () {
  const toggleBtn = document.getElementById('theme-toggle');
  const moonIcon = document.getElementById('theme-moon');
  const sunIcon = document.getElementById('theme-sun');

  if (!toggleBtn) return;

  function syncIcons() {
    const isLight = document.documentElement.classList.contains('light-mode');
    moonIcon.classList.toggle('hidden', isLight);
    sunIcon.classList.toggle('hidden', !isLight);
  }

  syncIcons();

  toggleBtn.addEventListener('click', function () {
    document.documentElement.classList.toggle('light-mode');
    const isLight = document.documentElement.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    syncIcons();
  });
})();

// ---------- İletişim formu ----------
// Not: Bu form şu an bir backend'e bağlı değil, sadece istemci tarafında
// doğrulama ve kullanıcıya geri bildirim gösteriyor. Gerçek gönderim için
// Formspree, EmailJS gibi bir servise ya da kendi API'ne bağlaman gerekir.
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      status.textContent = 'Lütfen tüm alanları doldur.';
      status.style.color = 'var(--coral)';
      return;
    }

    // Şimdilik gerçek bir gönderim yapmıyoruz — bir servise bağlanınca burası güncellenecek.
    status.textContent = `Teşekkürler ${name}, mesajın alındı. En kısa sürede dönüş yapacağım.`;
    status.style.color = 'var(--mint)';
    form.reset();
  });
})();
