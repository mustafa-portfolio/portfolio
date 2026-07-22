// Sayfa yenilendiğinde pozisyonu zorlamadan yumuşakça en üste kaydırır
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('beforeunload', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('load', () => {
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
});

// Sayfa yüklenir yüklenmez temayı uygula
const savedTheme = localStorage.getItem('theme');
const body = document.body;
const html = document.documentElement;

if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    html.classList.add('dark-mode');
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Gece Modu Yönetimi
    const themeToggle = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('theme-moon');
    const sunIcon = document.getElementById('theme-sun');

    if (savedTheme === 'dark') {
        if (moonIcon) moonIcon.classList.add('hidden');
        if (sunIcon) sunIcon.classList.remove('hidden');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            html.classList.toggle('dark-mode');
            
            const isDarkMode = body.classList.contains('dark-mode');
            
            if (isDarkMode) {
                localStorage.setItem('theme', 'dark');
                if (moonIcon) moonIcon.classList.add('hidden');
                if (sunIcon) sunIcon.classList.remove('hidden');
            } else {
                localStorage.setItem('theme', 'light');
                if (sunIcon) sunIcon.classList.add('hidden');
                if (moonIcon) moonIcon.classList.remove('hidden');
            }
        });
    }

    // 2. Projeler Buton Tıklaması Ve Scroll İle Yumuşak Görünme/Kapanma
    const toggleProjelerBtn = document.getElementById('toggle-projeler-btn');
    const projelerSection = document.getElementById('projeler');

    // Düğmeye Tıklama: Anında aç ve yumuşakça oraya kaydır
    if (toggleProjelerBtn && projelerSection) {
        toggleProjelerBtn.addEventListener('click', () => {
            projelerSection.classList.add('visible');
            toggleProjelerBtn.textContent = 'Projeler Aşağıda 👇';

            setTimeout(() => {
                projelerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        });
    }

    // SCROLL DİNLEYİCİSİ: Yavaşça Belirme (Fade In) ve Soluklaşarak Yok Olma (Fade Out)
    window.addEventListener('scroll', () => {
        if (!projelerSection) return;

        const scrollPos = window.scrollY;

        // Aşağı kaydırıldığında projeleri yumuşakça göster
        if (scrollPos > 80) {
            projelerSection.classList.add('visible');
        } 
        // Sayfa en üste çıktığında soluklaşarak kaybolsun
        else if (scrollPos < 30) {
            projelerSection.classList.remove('visible');
            if (toggleProjelerBtn) {
                toggleProjelerBtn.textContent = 'Projelerimi İncele 🚀';
            }
        }
    });
});
// Projelerimi İncele Butonuna Tıklayınca Başa Dönmeyi Engelle ve Aşağı Kaydır
document.addEventListener('DOMContentLoaded', () => {
    const projelerBtn = document.getElementById('toggle-projeler-btn');
    const projelerSection = document.getElementById('projeler');

    if (projelerBtn && projelerSection) {
        projelerBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Sayfanın en başa fırlamasını ENGELER
            projelerSection.scrollIntoView({ behavior: 'smooth' }); // Yumuşakça aşağı kaydırır
        });
    }
});