// ============================================================
// Yapılacaklar (To-Do) Uygulaması
// Özellikler: görev ekle, düzenle, tamamla, sil, filtrele, LocalStorage kalıcılığı
// ============================================================

const STORAGE_KEY = 'todo-items';

// İlk ziyarette boş sayfa yerine hoş bir başlangıç içeriği
const DEFAULT_TODOS = [
    { id: 1, text: 'Mustafa Köse portfolyo projelerini incele', done: true },
    { id: 2, text: 'Vibe Pomodoro uygulamasını dene ve odaklan', done: false },
    { id: 3, text: 'Hava Durumu uygulamasından Ankara durumuna bak', done: false }
];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const listEl = document.getElementById('todo-list');
    const emptyEl = document.getElementById('todo-empty');
    const countEl = document.getElementById('todo-count');
    const clearBtn = document.getElementById('clear-done');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (!form || !input || !listEl) return;

    let todos = load();
    let filter = 'all'; // 'all' | 'active' | 'done'
    let editingId = null;

    // ---------- 1. LocalStorage İşlemleri ----------
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw === null) {
                // İlk defa geliyorsa varsayılan görevleri kaydet
                saveToStorage(DEFAULT_TODOS);
                return [...DEFAULT_TODOS];
            }
            const data = JSON.parse(raw);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.warn('LocalStorage okunamadı:', e);
            return [...DEFAULT_TODOS];
        }
    }

    function saveToStorage(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage yazılamadı:', e);
            if (window.showToast) {
                window.showToast('Görevler tarayıcı hafızasına kaydedilemedi (Gizli mod açık olabilir).', 'warning');
            }
        }
    }

    function save() {
        saveToStorage(todos);
    }

    // ---------- 2. Görev CRUD İşlemleri ----------
    function addTodo(text) {
        const trimmed = text.trim();
        if (!trimmed) return;

        const newTodo = {
            id: Date.now(),
            text: trimmed,
            done: false
        };
        todos.unshift(newTodo);
        save();
        render();
        if (window.showToast) window.showToast('Yeni görev eklendi!', 'success', 2000);
    }

    function toggleTodo(id) {
        let isDoneNow = false;
        todos = todos.map((t) => {
            if (t.id === id) {
                isDoneNow = !t.done;
                return { ...t, done: isDoneNow };
            }
            return t;
        });
        save();
        render();
        if (isDoneNow && window.showToast) {
            window.showToast('Harika! Görev tamamlandı.', 'success', 1800);
        }
    }

    function deleteTodo(id) {
        todos = todos.filter((t) => t.id !== id);
        save();
        render();
        if (window.showToast) window.showToast('Görev silindi.', 'info', 1800);
    }

    function updateTodoText(id, newText) {
        const trimmed = newText.trim();
        if (!trimmed) {
            deleteTodo(id);
            return;
        }
        todos = todos.map((t) => (t.id === id ? { ...t, text: trimmed } : t));
        editingId = null;
        save();
        render();
        if (window.showToast) window.showToast('Görev güncellendi.', 'success', 1800);
    }

    // ---------- 3. Arayüz Çizimi ----------
    function render() {
        const visible = todos.filter((t) =>
            filter === 'all' ? true : filter === 'active' ? !t.done : t.done
        );

        listEl.innerHTML = '';

        visible.forEach((t) => {
            const li = document.createElement('li');
            li.className = 'todo-item' + (t.done ? ' done' : '');

            // Checkbox
            const check = document.createElement('input');
            check.type = 'checkbox';
            check.checked = t.done;
            check.setAttribute('aria-label', `"${t.text}" görevini tamamla`);
            check.addEventListener('change', () => toggleTodo(t.id));

            // Eğer şu an bu görev düzenleniyorsa
            if (editingId === t.id) {
                const editInput = document.createElement('input');
                editInput.type = 'text';
                editInput.className = 'edit-input';
                editInput.value = t.text;
                editInput.maxLength = 120;

                const finishEdit = () => updateTodoText(t.id, editInput.value);

                editInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') finishEdit();
                    if (e.key === 'Escape') {
                        editingId = null;
                        render();
                    }
                });
                editInput.addEventListener('blur', finishEdit);

                li.append(check, editInput);
                listEl.appendChild(li);
                setTimeout(() => editInput.focus(), 10);
                return;
            }

            // Metin alanı
            const textSpan = document.createElement('span');
            textSpan.className = 'text';
            textSpan.textContent = t.text;
            textSpan.title = 'Düzenlemek için çift tıklayın';
            textSpan.addEventListener('dblclick', () => {
                editingId = t.id;
                render();
            });

            // Buton grubu (Düzenle ve Sil)
            const actionsGroup = document.createElement('div');
            actionsGroup.className = 'todo-actions-group';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'todo-edit-btn';
            editBtn.textContent = 'Düzenle';
            editBtn.setAttribute('aria-label', `"${t.text}" görevini düzenle`);
            editBtn.addEventListener('click', () => {
                editingId = t.id;
                render();
            });

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'todo-del';
            delBtn.textContent = 'Sil';
            delBtn.setAttribute('aria-label', `"${t.text}" görevini sil`);
            delBtn.addEventListener('click', () => deleteTodo(t.id));

            actionsGroup.append(editBtn, delBtn);
            li.append(check, textSpan, actionsGroup);
            listEl.appendChild(li);
        });

        // Boş durum mesajı
        if (visible.length === 0) {
            emptyEl.classList.remove('hidden');
            emptyEl.textContent =
                todos.length === 0
                    ? 'Henüz görev yok. Yukarıdaki kutudan ilk görevini ekle!'
                    : filter === 'done'
                    ? 'Tamamlanmış bir görev bulunmuyor.'
                    : 'Harika iş! Bekleyen hiçbir görev kalmadı.';
        } else {
            emptyEl.classList.add('hidden');
        }

        // Kalan görev sayacı
        const leftCount = todos.filter((t) => !t.done).length;
        countEl.textContent = `${leftCount} görev kaldı`;

        // Tamamlananları temizle butonu görünürlüğü
        const hasDone = todos.some((t) => t.done);
        clearBtn.classList.toggle('hidden', !hasDone);
    }

    // ---------- 4. Form ve Buton Olayları ----------
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
        const doneCount = todos.filter((t) => t.done).length;
        if (doneCount === 0) return;
        todos = todos.filter((t) => !t.done);
        save();
        render();
        if (window.showToast) {
            window.showToast(`${doneCount} tamamlanmış görev temizlendi.`, 'info');
        }
    });

    // İlk çizim
    render();
});
