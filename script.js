// ============================================================
// Genel site scripti (tüm sayfalarda çalışır)
// 1. Gece / gündüz teması
// 2. Mobil menü
// 3. Alt bilgideki yıl
// 4. İletişim formu (Formspree)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;

    // ---------- 1. TEMA ----------
    // Sayfa açılırken tema, <head> içindeki küçük script tarafından zaten uygulandı
    // (ekranın beyaz çakmasını önlemek için). Burada sadece butonu bağlıyoruz.
    const themeToggle = document.getElementById('theme-toggle');

    function syncThemeButton() {
        if (!themeToggle) return;
        const dark = root.classList.contains('dark-mode');
        themeToggle.setAttribute('aria-pressed', String(dark));
        themeToggle.setAttribute('aria-label', dark ? 'Gündüz temasına geç' : 'Gece temasına geç');
        themeToggle.title = dark ? 'Gündüz temasına geç' : 'Gece temasına geç';
    }

    if (themeToggle) {
        syncThemeButton();
        themeToggle.addEventListener('click', () => {
            root.classList.toggle('dark-mode');
            try {
                localStorage.setItem('theme', root.classList.contains('dark-mode') ? 'dark' : 'light');
            } catch (e) { /* tarayıcı depolamaya izin vermiyorsa sorun değil */ }
            syncThemeButton();
        });
    }

    // ---------- 2. MOBİL MENÜ ----------
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        const closeMenu = () => {
            navMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Menüyü aç');
        };

        navToggle.addEventListener('click', () => {
            const open = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(open));
            navToggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
        });

        // Bir bağlantıya tıklayınca veya Esc'ye basınca menü kapansın
        navMenu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    }

    // ---------- 3. YIL ----------
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ---------- 4. İLETİŞİM FORMU ----------
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');

    if (form && statusEl) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            const btnText = btn.querySelector('span');
            const oldText = btnText.textContent;

            btn.disabled = true;
            btnText.textContent = 'Gönderiliyor...';
            statusEl.className = 'form-status';
            statusEl.textContent = '';

            try {
                const res = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });

                if (res.ok) {
                    form.reset();
                    statusEl.className = 'form-status ok';
                    statusEl.textContent = 'Mesajın gönderildi. En kısa sürede dönüş yapacağım.';
                } else {
                    throw new Error('Sunucu hatası');
                }
            } catch (err) {
                statusEl.className = 'form-status err';
                statusEl.textContent = 'Mesaj gönderilemedi. Bir süre sonra tekrar dene veya doğrudan e-posta at.';
            } finally {
                btn.disabled = false;
                btnText.textContent = oldText;
            }
        });
    }
});
