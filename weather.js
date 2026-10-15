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

// Popüler Türk şehirleri koordinat haritası (Hızlı butonlar için)
const POPULAR_CITIES = {
    'Ankara': { name: 'Ankara', country_code: 'TR', latitude: 39.9334, longitude: 32.8597 },
    'İstanbul': { name: 'İstanbul', country_code: 'TR', latitude: 41.0082, longitude: 28.9784 },
    'İzmir': { name: 'İzmir', country_code: 'TR', latitude: 38.4192, longitude: 27.1287 },
    'Bursa': { name: 'Bursa', country_code: 'TR', latitude: 40.1885, longitude: 29.0610 },
    'Antalya': { name: 'Antalya', country_code: 'TR', latitude: 36.8969, longitude: 30.7133 },
    'Trabzon': { name: 'Trabzon', country_code: 'TR', latitude: 41.0015, longitude: 39.7178 }
};

// Hava durumu kodları (WMO) -> Türkçe açıklama + emoji
function describeWeather(code, isDay = 1) {
    const c = Number(code);
    if (c === 0) return { text: 'Açık', icon: isDay ? '☀️' : '🌙' };
    if (c === 1) return { text: 'Çoğunlukla açık', icon: isDay ? '🌤️' : '🌙' };
    if (c === 2) return { text: 'Parçalı bulutlu', icon: '⛅' };
    if (c === 3) return { text: 'Kapalı', icon: '☁️' };
    if (c === 45 || c === 48) return { text: 'Sisli', icon: '🌫️' };
    if (c >= 51 && c <= 57) return { text: 'Çiseleme', icon: '🌦️' };
    if (c >= 61 && c <= 67) return { text: 'Yağmurlu', icon: '🌧️' };
    if (c >= 71 && c <= 77) return { text: 'Karlı', icon: '❄️' };
    if (c >= 80 && c <= 82) return { text: 'Sağanak yağış', icon: '🌧️' };
    if (c === 85 || c === 86) return { text: 'Kar sağanağı', icon: '🌨️' };
    if (c >= 95) return { text: 'Gök gürültülü fırtına', icon: '⛈️' };
    return { text: 'Belirsiz', icon: '⛅' };
}

// Ekrana durum mesajı bas
function showMessage(text, isError = false) {
    if (!resultBox) return;
    resultBox.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'weather-msg' + (isError ? ' err' : '');
    p.textContent = text;
    resultBox.appendChild(p);
}

// DOM element oluşturma yardımcısı
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
}

// ---------- 1. Şehir Önerileri (Autocomplete) ----------
let debounceTimer;
let activeIndex = -1;

function hideSuggestions() {
    if (!suggestionsList || !cityInput) return;
    suggestionsList.classList.add('hidden');
    cityInput.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
}

async function fetchSuggestions(query) {
    try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=tr&format=json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Arama servisine ulaşılamadı');
        const data = await res.json();
        return data.results || [];
    } catch (err) {
        console.warn('Geocoding hatası:', err);
        return [];
    }
}

function renderSuggestions(cities) {
    if (!suggestionsList || !cityInput) return;
    suggestionsList.innerHTML = '';
    if (!cities || cities.length === 0) {
        hideSuggestions();
        return;
    }

    cities.forEach((city) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        const admin = city.admin1 ? ` (${city.admin1})` : '';
        const country = city.country ? `, ${city.country}` : '';
        li.textContent = `${city.name}${admin}${country}`;
        li.addEventListener('click', () => chooseCity(city));
        suggestionsList.appendChild(li);
    });
    suggestionsList.classList.remove('hidden');
    cityInput.setAttribute('aria-expanded', 'true');
}

if (cityInput) {
    cityInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = cityInput.value.trim();
        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const results = await fetchSuggestions(query);
                renderSuggestions(results);
            } catch (err) {
                console.error('Öneri hatası:', err);
            }
        }, 300);
    });

    cityInput.addEventListener('keydown', (e) => {
        if (!suggestionsList) return;
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
            if (open && activeIndex >= 0 && items[activeIndex]) {
                items[activeIndex].click();
            } else {
                searchByName();
            }
            return;
        } else if (e.key === 'Escape') {
            hideSuggestions();
            return;
        } else {
            return;
        }
        items.forEach((li, i) => li.classList.toggle('active', i === activeIndex));
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
        hideSuggestions();
    }
});

function chooseCity(city) {
    if (cityInput) cityInput.value = city.name;
    hideSuggestions();
    updateActiveQuickCity(city.name);
    getWeather(city);
}

// "Ara" butonu veya Enter: yazılan ada göre arama yap
async function searchByName() {
    if (!cityInput) return;
    const query = cityInput.value.trim();
    if (!query) {
        showMessage('Lütfen bir şehir adı yazın.', true);
        if (window.showToast) window.showToast('Lütfen aranacak şehir adını girin.', 'warning');
        return;
    }

    // Önceden tanımlı popüler şehir ise doğrudan koordinatından çek
    const matchedPop = Object.values(POPULAR_CITIES).find(
        (c) => c.name.toLowerCase() === query.toLowerCase()
    );
    if (matchedPop) {
        chooseCity(matchedPop);
        return;
    }

    showMessage('Şehir aranıyor...');
    try {
        const results = await fetchSuggestions(query);
        if (!results || results.length === 0) {
            showMessage(`"${query}" bulunamadı. Lütfen yazımı kontrol edip tekrar deneyin.`, true);
            if (window.showToast) window.showToast(`"${query}" bulunamadı.`, 'error');
            return;
        }
        chooseCity(results[0]);
    } catch (err) {
        console.error(err);
        showMessage('Bağlantı hatası. İnternet bağlantınızı kontrol edin.', true);
        if (window.showToast) window.showToast('Hava durumu araması başarısız oldu.', 'error');
    }
}

if (searchBtn) {
    searchBtn.addEventListener('click', searchByName);
}

// ---------- 2. Konumumu Kullan (Geolocation) ----------
if (geoBtn) {
    geoBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            showMessage('Tarayıcınız konum özelliğini desteklemiyor.', true);
            if (window.showToast) window.showToast('Tarayıcınız konum özelliğini desteklemiyor.', 'warning');
            return;
        }
        showMessage('Mevcut konumunuz alınıyor...');
        if (window.showToast) window.showToast('Konumunuz tespit ediliyor...', 'info', 2000);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const geoCity = {
                    name: 'Mevcut Konumum',
                    country_code: '',
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
                if (cityInput) cityInput.value = '';
                updateActiveQuickCity(null);
                getWeather(geoCity);
                if (window.showToast) window.showToast('Konumunuz başarıyla alındı!', 'success');
            },
            (err) => {
                console.warn('Konum hatası:', err);
                showMessage('Konum izni verilmedi veya zaman aşımına uğradı. Şehri arama kutusundan seçebilirsiniz.', true);
                if (window.showToast) window.showToast('Konum erişimi reddedildi veya zaman aşımına uğradı.', 'warning');
            },
            { timeout: 10000, enableHighAccuracy: false }
        );
    });
}

// ---------- 3. Hava Durumu Verisi Çekme ----------
async function getWeather(city) {
    showMessage('Hava durumu yükleniyor...');

    const params = new URLSearchParams({
        latitude: String(city.latitude),
        longitude: String(city.longitude),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        timezone: 'auto',
        forecast_days: '5'
    });

    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!res.ok) throw new Error('Hava durumu sunucusundan yanıt alınamadı: ' + res.status);
        const data = await res.json();

        if (!data || !data.current) {
            throw new Error('Eksik hava durumu verisi');
        }

        renderWeather(city, data);

        try {
            localStorage.setItem('lastCity', JSON.stringify(city));
        } catch (e) { /* localStorage engelli ise sorun değil */ }
    } catch (err) {
        console.error('Hava durumu verisi çekilemedi:', err);
        showMessage('Hava durumu bilgisi şu an alınamıyor. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.', true);
        if (window.showToast) window.showToast('Hava durumu verisi alınamadı.', 'error');
    }
}

function renderWeather(city, data) {
    if (!resultBox) return;
    const c = data.current || {};
    const nowDesc = describeWeather(c.weather_code, c.is_day !== undefined ? c.is_day : 1);
    const country = city.country_code ? `, ${String(city.country_code).toUpperCase()}` : '';

    resultBox.innerHTML = '';

    // Üst kart: İkon, Şehir, Sıcaklık, Açıklama
    const top = el('div', 'weather-now');
    const tempVal = c.temperature_2m !== undefined && c.temperature_2m !== null ? `${Math.round(c.temperature_2m)}°C` : '—';
    top.append(
        el('div', 'weather-icon', nowDesc.icon),
        el('div', 'weather-city', `${city.name}${country}`),
        el('div', 'weather-temp', tempVal),
        el('div', 'weather-desc', nowDesc.text)
    );

    // Detay kartları (Hissedilen, Nem, Rüzgar)
    const details = el('div', 'weather-details');
    const feelsVal = c.apparent_temperature !== undefined && c.apparent_temperature !== null ? `${Math.round(c.apparent_temperature)}°C` : '—';
    const humidityVal = c.relative_humidity_2m !== undefined && c.relative_humidity_2m !== null ? `%${Math.round(c.relative_humidity_2m)}` : '—';
    const windVal = c.wind_speed_10m !== undefined && c.wind_speed_10m !== null ? `${Math.round(c.wind_speed_10m)} km/s` : '—';

    [
        ['Hissedilen', feelsVal],
        ['Nem', humidityVal],
        ['Rüzgar', windVal]
    ].forEach(([label, value]) => {
        const box = document.createElement('div');
        box.append(el('span', '', label), el('strong', '', value));
        details.appendChild(box);
    });

    // 5 Günlük Tahmin
    const forecast = el('div', 'forecast');
    if (data.daily && Array.isArray(data.daily.time)) {
        data.daily.time.forEach((dateStr, i) => {
            const day = el('div', 'day');
            let dayName = 'Bugün';
            if (i > 0) {
                try {
                    dayName = new Date(dateStr + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'short' });
                } catch (e) {
                    dayName = `Gün ${i + 1}`;
                }
            }

            const code = data.daily.weather_code ? data.daily.weather_code[i] : 0;
            const maxVal = data.daily.temperature_2m_max && data.daily.temperature_2m_max[i] !== undefined
                ? `${Math.round(data.daily.temperature_2m_max[i])}°` : '—';
            const minVal = data.daily.temperature_2m_min && data.daily.temperature_2m_min[i] !== undefined
                ? `${Math.round(data.daily.temperature_2m_min[i])}°` : '—';

            day.append(
                el('div', 'd-name', dayName),
                el('div', 'd-icon', describeWeather(code, 1).icon),
                el('div', 'd-max', maxVal),
                el('div', 'd-min', minVal)
            );
            forecast.appendChild(day);
        });
    }

    resultBox.append(top, details, forecast);
}

// Hızlı butonları aktifleştirme yardımcısı
function updateActiveQuickCity(cityName) {
    document.querySelectorAll('.quick-city-chip').forEach((chip) => {
        const isActive = chip.dataset.city && cityName && chip.dataset.city.toLowerCase() === cityName.toLowerCase();
        chip.classList.toggle('active', !!isActive);
    });
}

function initQuickCityChips() {
    const container = document.querySelector('.quick-cities');
    if (!container) return;

    container.addEventListener('click', (e) => {
        const chip = e.target.closest('.quick-city-chip');
        if (!chip) return;
        const cityName = chip.dataset.city;
        const targetCity = POPULAR_CITIES[cityName] || {
            name: cityName,
            country_code: 'TR',
            latitude: parseFloat(chip.dataset.lat),
            longitude: parseFloat(chip.dataset.lon)
        };
        chooseCity(targetCity);
    });
}

// ---------- 4. Sayfa Açılışı ----------
document.addEventListener('DOMContentLoaded', () => {
    initQuickCityChips();

    let startCity = DEFAULT_CITY;
    try {
        const saved = JSON.parse(localStorage.getItem('lastCity'));
        if (saved && typeof saved.latitude === 'number' && typeof saved.longitude === 'number') {
            startCity = saved;
        }
    } catch (e) {
        startCity = DEFAULT_CITY;
    }

    if (cityInput && startCity.name !== 'Mevcut Konumum') {
        cityInput.value = startCity.name;
    }
    updateActiveQuickCity(startCity.name);
    getWeather(startCity);
});
