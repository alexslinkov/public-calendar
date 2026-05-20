// Ключ для хранения в localStorage
const STORAGE_KEY = 'calendar_events';

// Загрузка событий из localStorage
function loadEvents() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    // Начальные демо-события
    return [
        {
            id: Date.now(),
            title: "Вебинар по маркетингу",
            date: "2026-05-25",
            location: "Онлайн (Zoom)",
            contacts: "info@company.com",
            link: "https://example.com/register/1"
        },
        {
            id: Date.now() + 1,
            title: "Конференция стартапов",
            date: "2026-05-28",
            location: "Москва, Крокус Экспо",
            contacts: "+7 999 123-45-67",
            link: "https://example.com/register/2"
        }
    ];
}

// Сохранение событий в localStorage
function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    renderEventsList();
    syncToPublicCalendar();
}

// Отображение списка событий в админке
function renderEventsList() {
    const events = loadEvents();
    const container = document.getElementById('eventsList');
    
    if (events.length === 0) {
        container.innerHTML = '<p style="color:#999;">Нет событий. Добавьте первое!</p>';
        return;
    }
    
    container.innerHTML = '';
    events.sort((a, b) => a.date.localeCompare(b.date));
    
    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-item';
        eventDiv.innerHTML = `
            <div class="event-info">
                <div class="event-title">${escapeHtml(event.title)}</div>
                <div class="event-date">📅 ${event.date} | 📍 ${escapeHtml(event.location)}</div>
            </div>
            <button class="small-delete" onclick="deleteEvent(${event.id})">✖ Удалить</button>
        `;
        container.appendChild(eventDiv);
    });
}

// Добавление нового события
function addEvent(eventData) {
    const events = loadEvents();
    const newEvent = {
        id: Date.now(),
        ...eventData
    };
    events.push(newEvent);
    saveEvents(events);
    return newEvent;
}

// Удаление события
function deleteEvent(id) {
    if (confirm('Удалить событие?')) {
        const events = loadEvents();
        const filtered = events.filter(e => e.id !== id);
        saveEvents(filtered);
    }
}

// Синхронизация с публичным календарем
function syncToPublicCalendar() {
    // Сохраняем те же события в localStorage для index.html
    // Они и так там лежат, так как localStorage общий для всех страниц
    console.log('События синхронизированы');
}

// Обработка формы
document.getElementById('eventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const eventData = {
        title: document.getElementById('title').value,
        date: document.getElementById('date').value,
        location: document.getElementById('location').value || 'Не указано',
        contacts: document.getElementById('contacts').value || 'Нет контактов',
        link: document.getElementById('link').value || '#'
    };
    
    if (!eventData.title || !eventData.date) {
        alert('Заполните название и дату!');
        return;
    }
    
    addEvent(eventData);
    
    // Показываем сообщение об успехе
    const msg = document.getElementById('successMsg');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 2000);
    
    // Очищаем форму
    clearForm();
});

function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('date').value = '';
    document.getElementById('location').value = '';
    document.getElementById('contacts').value = '';
    document.getElementById('link').value = '';
}

// Экспорт в JSON-файл (бэкап)
function exportToFile() {
    const events = loadEvents();
    const dataStr = JSON.stringify(events, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar_backup_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Импорт из файла
function importFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedEvents = JSON.parse(event.target.result);
                if (Array.isArray(importedEvents)) {
                    saveEvents(importedEvents);
                    alert('Импорт успешен!');
                } else {
                    alert('Неверный формат файла');
                }
            } catch (err) {
                alert('Ошибка чтения файла');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Защита от XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Инициализация
renderEventsList();