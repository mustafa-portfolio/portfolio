// ============================================================
// Hava Durumu Uygulaması
// Veri kaynağı: Open-Meteo (ücretsiz, API anahtarı gerektirmez)
//   - Şehir arama : geocoding-api.open-meteo.com
//   - Hava durumu : api.open-meteo.com
// ============================================================

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const geoBtn = document.getElementById('geo-btn');
const suggestionsList = document.getElementById('suggestions-list');
const resultBox = document.getElementById('weather-result');

// Varsayılan şehir: Ankara
const DEFAULT_CITY = { name: 'Ankara', country_code: 'TR', latitude: 39.9334, longitude: 32.8597 };

// Hava durumu kodları (WMO) -> Türkçe açıklama + emoji
function describeWeather(code, isDay = 1) {
    if (code === 0) return { text: 'Açık', icon: isDay ? '☀️' : '🌙' };
    if (code === 1) return { text: 'Çoğunlukla açık', icon: isDay ? '🌤️' : '🌙' };
    if (code === 2) return { text: 'Parçalı bulutlu', icon: '⛅' };
    if (code === 3) return { text: 'Kapalı', icon: '☁️' };
    if (code === 45 || code === 48) return { text: 'Sisli', icon: '🌫️' };
    if (code >= 51 && code <= 57) return { text: 'Çiseleme', icon: '🌦️' };
    if (code >= 61 && code <= 67) return { text: 'Yağmurlu', icon: '🌧️' };
    if (code >= 71 && code <= 77) return { text: 'Karlı', icon: '❄️' };
    if (code >= 80 && code <= 82) return { text: 'Sağanak yağış', icon: '🌧️' };
    if (code === 85 || code === 86) return { text: 'Kar sağanağı', icon: '🌨️' };
    if (code >= 95) return { text: 'Gök gürültülü fırtına', icon: '⛈️' };
    return { text: 'Bilinmiyor', icon: '❔' };
}

// Ekrana güvenli mesaj yaz (yükleniyor / hata)
function showMessage(text, isError = false) {
    resultBox.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'weather-msg' + (isError ? ' err' : '');
    p.textContent = text;
    resultBox.appendChild(p);
}

// Küçük yardımcı: tek satırda element oluştur
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

// ---------- 1. Şehir önerileri ----------
let debounceTimer;
let activeIndex = -1;

function hideSuggestions() {
    suggestionsList.classList.add('hidden');
    cityInput.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
}

async function fetchSuggestions(query) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=tr&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Arama başarısız');
    const data = await res.json();
    return data.results || [];
}

function renderSuggestions(cities) {
    suggestionsList.innerHTML = '';
    if (cities.length === 0) { hideSuggestions(); return; }

    cities.forEach((city) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        const admin = city.admin1 ? ` (${city.admin1})` : '';
        const country = city.country ? `, ${city.country}` : '';
        li.textContent = `${city.name}${admin}${country}`;   // textContent: güvenli
        li.addEventListener('click', () => chooseCity(city));
        suggestionsList.appendChild(li);
    });
    suggestionsList.classList.remove('hidden');
    cityInput.setAttribute('aria-expanded', 'true');
}

cityInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = cityInput.value.trim();
    if (query.length < 2) { hideSuggestions(); return; }

    // Her tuşta değil, yazmayı bıraktıktan 300 ms sonra ara (gereksiz istek olmasın)
    debounceTimer = setTimeout(async () => {
        try {
            renderSuggestions(await fetchSuggestions(query));
        } catch (err) {
            console.error('Öneri alınamadı:', err);
        }
    }, 300);
});

// Klavye: ok tuşları ile seç, Enter ile onayla, Esc ile kapat
cityInput.addEventListener('keydown', (e) => {
    const items = [...suggestionsList.querySelectorAll('li')];
    const open = !suggestionsList.classList.contains('hidden') && items.length > 0;

    if (e.key === 'ArrowDown' && open) {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
    } else if (e.key === 'ArrowUp' && open) {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (open && activeIndex >= 0) items[activeIndex].click();
        else searchByName();
        return;
    } else if (e.key === 'Escape') {
        hideSuggestions();
        return;
    } else {
        return;
    }
    items.forEach((li, i) => li.classList.toggle('active', i === activeIndex));
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) hideSuggestions();
});

function chooseCity(city) {
    cityInput.value = city.name;
    hideSuggestions();
    getWeather(city);
}

// "Ara" butonu veya Enter: yazılan ada göre ilk sonucu getir
async function searchByName() {
    const query = cityInput.value.trim();
    if (!query) { showMessage('Lütfen bir şehir adı yaz.', true); return; }

    showMessage('Şehir aranıyor...');
    try {
        const results = await fetchSuggestions(query);
        if (results.length === 0) {
            showMessage(`"${query}" bulunamadı. Yazımı kontrol edip tekrar dene.`, true);
            return;
        }
        chooseCity(results[0]);
    } catch (err) {
        console.error(err);
        showMessage('Bağlantı hatası. İnternetini kontrol edip tekrar dene.', true);
    }
}

searchBtn.addEventListener('click', searchByName);

// ---------- 2. Konumumu kullan ----------
geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        showMessage('Tarayıcın konum özelliğini desteklemiyor.', true);
        return;
    }
    showMessage('Konum alınıyor...');
    navigator.geolocation.getCurrentPosition(
        (pos) => getWeather({
            name: 'Konumum',
            country_code: '',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        }),
        () => showMessage('Konum izni verilmedi. İstersen şehri elle arayabilirsin.', true),
        { timeout: 10000 }
    );
});

// ---------- 3. Hava durumunu getir ----------
async function getWeather(city) {
    showMessage('Hava durumu yükleniyor...');

    const params = new URLSearchParams({
        latitude: city.latitude,
        longitude: city.longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        timezone: 'auto',
        forecast_days: 5
    });

    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!res.ok) throw new Error('Hava durumu alınamadı');
        const data = await res.json();
        renderWeather(city, data);

        try { localStorage.setItem('lastCity', JSON.stringify(city)); } catch (e) { /* önemli değil */ }
    } catch (err) {
        console.error(err);
        showMessage('Hava durumu şu an alınamıyor. Biraz sonra tekrar dene.', true);
    }
}

function renderWeather(city, data) {
    const c = data.current;
    const now = describeWeather(c.weather_code, c.is_day);
    const country = city.country_code ? `, ${String(city.country_code).toUpperCase()}` : '';

    resultBox.innerHTML = '';

    // Üst kısım: ikon, şehir, sıcaklık, açıklama
    const top = el('div', 'weather-now');
    top.append(
        el('div', 'weather-icon', now.icon),
        el('div', 'weather-city', `${city.name}${country}`),
        el('div', 'weather-temp', `${Math.round(c.temperature_2m)}°C`),
        el('div', 'weather-desc', now.text)
    );

    // Detaylar: hissedilen, nem, rüzgar (hepsi API'den gelen gerçek veri)
    const details = el('div', 'weather-details');
    [
        ['Hissedilen', `${Math.round(c.apparent_temperature)}°C`],
        ['Nem', `%${Math.round(c.relative_humidity_2m)}`],
        ['Rüzgar', `${Math.round(c.wind_speed_10m)} km/s`]
    ].forEach(([label, value]) => {
        const box = document.createElement('div');
        box.append(el('span', '', label), el('strong', '', value));
        details.appendChild(box);
    });

    // 5 günlük tahmin
    const forecast = el('div', 'forecast');
    data.daily.time.forEach((dateStr, i) => {
        const day = el('div', 'day');
        const name = new Date(dateStr + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'short' });
        day.append(
            el('div', 'd-name', i === 0 ? 'Bugün' : name),
            el('div', 'd-icon', describeWeather(data.daily.weather_code[i]).icon),
            el('div', 'd-max', `${Math.round(data.daily.temperature_2m_max[i])}°`),
            el('div', 'd-min', `${Math.round(data.daily.temperature_2m_min[i])}°`)
        );
        forecast.appendChild(day);
    });

    resultBox.append(top, details, forecast);
}

// ---------- 4. Sayfa açılışı ----------
// Daha önce baktığın şehir varsa onu, yoksa Ankara'yı göster
let startCity = DEFAULT_CITY;
try {
    const saved = JSON.parse(localStorage.getItem('lastCity'));
    if (saved && saved.latitude && saved.longitude) startCity = saved;
} catch (e) { /* kayıt yoksa varsayılan */ }

cityInput.value = startCity.name === 'Konumum' ? '' : startCity.name;
getWeather(startCity);
