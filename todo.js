// ============================================================
// Yapılacaklar (To-Do) Uygulaması
// Özellikler: görev ekle, tamamla, sil, filtrele, tarayıcıda sakla
// ============================================================

const STORAGE_KEY = 'todo-items';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const listEl = document.getElementById('todo-list');
const emptyEl = document.getElementById('todo-empty');
const countEl = document.getElementById('todo-count');
const clearBtn = document.getElementById('clear-done');
const filterBtns = document.querySelectorAll('.filter-btn');

let todos = load();
let filter = 'all';   // 'all' | 'active' | 'done'

// ---------- Kaydetme / yükleme ----------
function load() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); } catch (e) { /* önemli değil */ }
}

// ---------- Görev işlemleri ----------
function addTodo(text) {
    todos.unshift({ id: Date.now(), text, done: false });
    save();
    render();
}

function toggleTodo(id) {
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    save();
    render();
}

function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
}

// ---------- Ekrana çizme ----------
function render() {
    const visible = todos.filter((t) =>
        filter === 'all' ? true : filter === 'active' ? !t.done : t.done
    );

    listEl.innerHTML = '';

    visible.forEach((t) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (t.done ? ' done' : '');

        const check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = t.done;
        check.setAttribute('aria-label', `"${t.text}" görevini tamamla`);
        check.addEventListener('change', () => toggleTodo(t.id));

        const text = document.createElement('span');
        text.className = 'text';
        text.textContent = t.text;            // textContent: kullanıcı yazısı güvenle eklenir

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'todo-del';
        del.textContent = 'Sil';
        del.setAttribute('aria-label', `"${t.text}" görevini sil`);
        del.addEventListener('click', () => deleteTodo(t.id));

        li.append(check, text, del);
        listEl.appendChild(li);
    });

    // Boş durum mesajı
    if (visible.length === 0) {
        emptyEl.classList.remove('hidden');
        emptyEl.textContent =
            todos.length === 0 ? 'Henüz görev yok. Yukarıdan ilk görevini ekle.'
            : filter === 'done' ? 'Tamamlanmış görev yok.'
            : 'Bekleyen görev kalmadı. Harika iş.';
    } else {
        emptyEl.classList.add('hidden');
    }

    const left = todos.filter((t) => !t.done).length;
    countEl.textContent = `${left} görev kaldı`;
    clearBtn.classList.toggle('hidden', !todos.some((t) => t.done));
}

// ---------- Olaylar ----------
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTodo(text);
    input.value = '';
    input.focus();
});

filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        filter = btn.dataset.filter;
        filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        render();
    });
});

clearBtn.addEventListener('click', () => {
    todos = todos.filter((t) => !t.done);
    save();
    render();
});

render();
