// ============================================================
// Genel site scripti (tüm sayfalarda çalışır)
// 1. Toast Bildirim Sistemi (RULES.md standardı)
// 2. Gece / gündüz teması (Varsayılan Dark Mode)
// 3. Mobil menü ve erişilebilirlik
// 4. Alt bilgideki dinamik yıl
// 5. İletişim formu (Formspree + doğrudan mailto alternatifi)
// ============================================================

// ---------- 1. GLOBAL TOAST BİLDİRİM SİSTEMİ ----------
window.showToast = function(message, type = 'info', duration = 3500) {
    try {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');

        const iconMap = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };

        const iconEl = document.createElement('span');
        iconEl.className = 'toast-icon';
        iconEl.textContent = iconMap[type] || 'ℹ';

        const msgEl = document.createElement('span');
        msgEl.className = 'toast-msg';
        msgEl.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.type = 'button';
        closeBtn.setAttribute('aria-label', 'Bildirimi kapat');
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => removeToast(toast));

        toast.append(iconEl, msgEl, closeBtn);
        container.appendChild(toast);

        function removeToast(el) {
            if (!el || el.classList.contains('toast-hide')) return;
            el.classList.add('toast-hide');
            setTimeout(() => {
                if (el && el.parentNode) el.parentNode.removeChild(el);
            }, 250);
        }

        if (duration > 0) {
            setTimeout(() => removeToast(toast), duration);
        }
        return toast;
    } catch (e) {
        console.warn('Toast gösterilemedi:', e);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;

    // ---------- 2. TEMA YÖNETİMİ ----------
    // RULES.md gereği varsayılan tema DARK MODE'dur.
    const themeToggle = document.getElementById('theme-toggle');

    function syncThemeButton() {
        if (!themeToggle) return;
        const isDark = root.classList.contains('dark-mode');
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? 'Gündüz temasına geç' : 'Gece temasına geç');
        themeToggle.title = isDark ? 'Gündüz temasına geç' : 'Gece temasına geç';
    }

    if (themeToggle) {
        syncThemeButton();
        themeToggle.addEventListener('click', () => {
            const isDarkNow = root.classList.toggle('dark-mode');
            try {
                localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');
            } catch (e) { /* storage hatası önemsiz */ }
            syncThemeButton();
            window.showToast(isDarkNow ? 'Karanlık tema aktif edildi' : 'Aydınlık tema aktif edildi', 'info', 1800);
        });
    }

    // ---------- 3. MOBİL MENÜ ----------
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        const closeMenu = () => {
            navMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Menüyü aç');
        };

        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
            navToggle.setAttribute('aria-label', isOpen ? 'Menüyü kapat' : 'Menüyü aç');
        });

        navMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) closeMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // ---------- 4. ALT BİLGİ DİNAMİK YILI ----------
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ---------- 5. İLETİŞİM FORMU ----------
    const form = document.getElementById('contact-form');
    const statusEl = document.getElementById('form-status');

    if (form && statusEl) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = form.querySelector('button[type="submit"]');
            const btnText = btn ? (btn.querySelector('span') || btn) : null;
            const oldText = btnText ? btnText.textContent : 'Gönder';

            const nameInput = form.querySelector('#name') || form.querySelector('input[name="name"]');
            const emailInput = form.querySelector('#email') || form.querySelector('input[name="email"]');
            const msgInput = form.querySelector('#message') || form.querySelector('textarea[name="message"]');

            const nameVal = nameInput ? nameInput.value.trim() : '';
            const emailVal = emailInput ? emailInput.value.trim() : '';
            const msgVal = msgInput ? msgInput.value.trim() : '';

            if (!nameVal || !emailVal || !msgVal) {
                statusEl.className = 'form-status err';
                statusEl.textContent = 'Lütfen tüm alanları doldurun.';
                window.showToast('Lütfen tüm zorunlu alanları doldurun.', 'warning');
                return;
            }

            if (btn) btn.disabled = true;
            if (btnText) btnText.textContent = 'Gönderiliyor...';
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
                    statusEl.textContent = 'Mesajın başarıyla iletildi. En kısa sürede dönüş yapacağım.';
                    window.showToast('Mesajınız başarıyla gönderildi!', 'success');
                } else {
                    throw new Error('Sunucu hatası: ' + res.status);
                }
            } catch (err) {
                console.warn('Form gönderim hatası:', err);
                const mailSubject = encodeURIComponent(`Portfolyo Mesajı: ${nameVal}`);
                const mailBody = encodeURIComponent(`Ad Soyad: ${nameVal}\nE-posta: ${emailVal}\n\nMesaj:\n${msgVal}`);
                const mailtoUrl = `mailto:mmustafakose53@gmail.com?subject=${mailSubject}&body=${mailBody}`;

                statusEl.className = 'form-status err';
                statusEl.innerHTML = `Bağlantı nedeniyle mesaj gönderilemedi. <a href="${mailtoUrl}" class="link-btn" style="text-decoration:underline;">Buraya tıklayarak doğrudan e-posta uygulamanızla gönderin</a>.`;
                window.showToast('Mesaj gönderilemedi, doğrudan e-posta gönderebilirsiniz.', 'error');
            } finally {
                if (btn) btn.disabled = false;
                if (btnText) btnText.textContent = oldText;
            }
        });
    }
});
