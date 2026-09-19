// ============================================================
// Kod Görüntüleyici
// Sitedeki gerçek dosyaları okuyup gösterir; böylece burada gördüğün kod
// her zaman çalışan kodla aynıdır (ayrıca kopyalanmış bir sürüm tutulmaz).
// Not: Dosya okuma (fetch) siteyi bir sunucudan (ör. GitHub Pages) açınca çalışır.
// Dosyayı çift tıklayıp doğrudan açarsan tarayıcı buna izin vermez.
// ============================================================

const GITHUB_URL = 'https://github.com/mustafa-portfolio';

const PROJECTS = {
    hava: {
        label: 'Hava Durumu',
        demo: 'havadurumu.html',
        text: 'Open-Meteo API ile canlı hava durumu, şehir arama önerileri ve 5 günlük tahmin.',
        files: [
            { name: 'havadurumu.html', path: 'havadurumu.html' },
            { name: 'weather.js', path: 'weather.js' }
        ]
    },
    todo: {
        label: 'Yapılacaklar',
        demo: 'gorevler.html',
        text: 'Görev ekleme, tamamlama, silme, filtreleme ve tarayıcıda saklama (localStorage).',
        files: [
            { name: 'gorevler.html', path: 'gorevler.html' },
            { name: 'todo.js', path: 'todo.js' }
        ]
    },
    site: {
        label: 'Bu Site',
        demo: 'index.html',
        text: 'Gece modu, mobil menü ve iletişim formu içeren çok sayfalı kişisel site.',
        files: [
            { name: 'index.html', path: 'index.html' },
            { name: 'style.css', path: 'style.css' },
            { name: 'script.js', path: 'script.js' }
        ]
    }
};

const projectButtons = document.getElementById('project-buttons');
const tabsEl = document.getElementById('code-tabs');
const codeEl = document.getElementById('code-content');
const copyBtn = document.getElementById('copy-btn');
const descEl = document.getElementById('project-desc');
const demoLink = document.getElementById('demo-link');
const noteEl = document.getElementById('code-note');

let currentProject = 'hava';
let currentFile = 0;
let currentText = '';
const cache = {};

// Proje seçme butonlarını oluştur
Object.entries(PROJECTS).forEach(([key, p]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.label;
    b.dataset.key = key;
    b.addEventListener('click', () => selectProject(key));
    projectButtons.appendChild(b);
});

function selectProject(key) {
    currentProject = key;
    currentFile = 0;
    history.replaceState(null, '', `#${key}`);

    const p = PROJECTS[key];
    descEl.textContent = p.text;
    demoLink.href = p.demo;

    projectButtons.querySelectorAll('button').forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.key === key))
    );

    // Dosya sekmelerini yeniden oluştur
    tabsEl.innerHTML = '';
    p.files.forEach((f, i) => {
        const t = document.createElement('button');
        t.type = 'button';
        t.className = 'tab-btn';
        t.setAttribute('role', 'tab');
        t.textContent = f.name;
        t.addEventListener('click', () => selectFile(i));
        tabsEl.appendChild(t);
    });

    selectFile(0);
}

async function selectFile(i) {
    currentFile = i;
    tabsEl.querySelectorAll('.tab-btn').forEach((t, idx) =>
        t.setAttribute('aria-selected', String(idx === i))
    );

    const file = PROJECTS[currentProject].files[i];
    noteEl.textContent = '';
    codeEl.textContent = 'Yükleniyor...';

    try {
        if (!cache[file.path]) {
            const res = await fetch(file.path);
            if (!res.ok) throw new Error('Dosya okunamadı');
            cache[file.path] = await res.text();
        }
        currentText = cache[file.path];
        codeEl.textContent = currentText;
        noteEl.textContent = `${file.name} · ${currentText.split('\n').length} satır`;
    } catch (err) {
        currentText = '';
        codeEl.textContent = '// Dosya okunamadı.';
        noteEl.innerHTML = '';
        noteEl.append(
            'Kodları burada görmek için siteyi GitHub Pages gibi bir sunucudan aç. ',
            Object.assign(document.createElement('a'), {
                href: GITHUB_URL, target: '_blank', rel: 'noopener', textContent: 'Ya da GitHub profilime göz at.'
            })
        );
    }
}

// Kopyala butonu
copyBtn.addEventListener('click', async () => {
    if (!currentText) return;
    try {
        await navigator.clipboard.writeText(currentText);
        copyBtn.textContent = 'Kopyalandı';
    } catch (e) {
        copyBtn.textContent = 'Kopyalanamadı';
    }
    setTimeout(() => { copyBtn.textContent = 'Kodu kopyala'; }, 2000);
});

// Adres çubuğundaki #todo gibi bir değerle doğrudan proje açılabilsin
const fromHash = location.hash.replace('#', '');
selectProject(PROJECTS[fromHash] ? fromHash : 'hava');
