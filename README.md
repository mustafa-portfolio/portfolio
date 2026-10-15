# 🌐 Muhammed Mustafa Köse — Kişisel Web Sitesi & Portfolyo

[![Live Demo](https://img.shields.io/badge/Demo-Canl%C4%B1%20Yav%C4%B1n-blue?style=for-the-badge&logo=githubpages&logoColor=white)](https://mustafa-portfolio.github.io/portfolio/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![Dark Mode](https://img.shields.io/badge/Tema-Dark%20Aesthetic-zinc?style=for-the-badge)](https://mustafa-portfolio.github.io/portfolio/)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript&logoColor=black)](https://mustafa-portfolio.github.io/portfolio/)

Muhammed Mustafa Köse'nin kişisel web sitesi ve mikro-araç portfolyosu. Saf web teknolojileriyle, sıfır derleme aracı bağımlılığıyla, yüksek performanslı ve modern karanlık estetik (**Dark Aesthetic**) standartlarına tam uyumlu olarak geliştirilmiştir.

🔗 **Canlı Yayın Adresi:** [mustafa-portfolio.github.io/portfolio/](https://mustafa-portfolio.github.io/portfolio/)

---

## ✨ Öne Çıkan Özellikler

- 🌙 **Varsayılan Dark Mode:** Beyaz çakma (*flicker*) yapmayan, anında devreye giren karanlık tema (`#09090b` arka plan, `#18181b` kartlar, `#27272a` kenarlıklar).
- 🪟 **Cam Efekti (Glassmorphism):** `backdrop-filter: blur(12px)` ile derinlik hissi veren şık kartlar.
- 🔔 **Toast Bildirim Sistemi:** Tüm sayfalarda çalışan küresel, animasyonlu geri bildirim motoru (`window.showToast()`).
- 📱 **%100 Responsive:** Masaüstü, tablet ve en dar mobil ekranlara (<540px) kadar kusursuz uyum.
- 📂 **GitHub Pages Uyumlu:** Alt dizinde (`/portfolio/`) 404 vermeyen tam göreli bağlantı mimarisi.

---

## 🚀 Sayfalar ve Araçlar

| Sayfa | Dosya | Açıklama |
|---|---|---|
| **Ana Sayfa** | [`index.html`](file:///Users/mustafakose/.gemini/antigravity/scratch/portfolio/index.html) | Hero alanı, interaktif kod editörü simülasyonu, beceriler, projeler vitrini, yol haritası. |
| **Hakkımda** | [`hakkimda.html`](file:///Users/mustafakose/.gemini/antigravity/scratch/portfolio/hakkimda.html) | Eğitim bilgileri, ilgi alanları, spor, zihin ve sosyal aktiviteler. |
| **Özgeçmiş** | [`cv.html`](file:///Users/mustafakose/.gemini/antigravity/scratch/portfolio/cv.html) | PDF ve Word formatında indirilebilir, tek tıkla doğrudan yazdırılabilir (`window.print`). |
| **Vibe Pomodoro** | [vibe-pomodoro](https://github.com/mustafa-portfolio/vibe-pomodoro) | Pomodoro zamanlayıcı, Web Audio API ile doğal ton sentezleme ve LocalStorage odak takibi. |
| **Hava Durumu** | [`havadurumu.html`](file:///Users/mustafakose/.gemini/antigravity/scratch/portfolio/havadurumu.html) | Ücretsiz Open-Meteo API entegrasyonu, Ankara ve popüler şehirler, konum algılama, 5 günlük tahmin. |
| **Yapılacaklar** | [`gorevler.html`](file:///Users/mustafakose/.gemini/antigravity/scratch/portfolio/gorevler.html) | LocalStorage kalıcılığı, inline görev düzenleme (çift tık / buton), filtreleme, temizleme. |
| **Proje Kodları** | [`kodlar.html`](file:///Users/mustafakose/.gemini/antigravity/scratch/portfolio/kodlar.html) | Sitedeki projelerin gerçek kaynak kodlarını inceleme, dosya sekmeleri ve panoya kopyalama. |
| **İletişim** | [`iletisim.html`](file:///Users/mustafakose/.gemini/antigravity/scratch/portfolio/iletisim.html) | Formspree altyapısı, bot koruması (honeypot) ve ağ kesintisinde doğrudan `mailto:` alternatifi. |
| **404 Sayfası** | [`404.html`](file:///Users/mustafakose/.gemini/antigravity/scratch/portfolio/404.html) | GitHub Pages için özel hata sayfası. |

---

## 🛠️ Teknoloji Yığını

- **HTML5:** Anlamsal etiketler, ARIA rolleri ve erişilebilirlik (*skip-link*).
- **CSS3:** Temiz CSS Değişkenleri, Flexbox, Grid, Glassmorphic filtreler, yumuşak geçişler (`transition: all 0.2s ease`).
- **Vanilla JavaScript (ES6+):** Sıfır kütüphane bağımlılığı; modüler, temiz ve hatasız mimari.
- **Dış API:** [Open-Meteo](https://open-meteo.com/) (API anahtarsız, ücretsiz Geocoding ve Hava Durumu).
- **Tipografi:** Google Fonts (`Inter`, `Manrope`, `Fira Code`).

---

## 📦 Kurulum ve Yerel Çalıştırma

Projede derleme adımı (*build step*) veya paket yöneticisi bağımlılığı yoktur:

```bash
# Depoyu klonlayın
git clone https://github.com/mustafa-portfolio/portfolio.git
cd portfolio

# Python 3 ile yerel sunucu başlatın
python3 -m http.server 8000
```

Tarayıcınızdan `http://localhost:8000` adresini açarak test edebilirsiniz.

---

## 📜 Lisans

Bu proje [MIT Lisansı](LICENSE) altında açık kaynak olarak sunulmaktadır.
