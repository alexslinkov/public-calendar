// Ключ для хранения в localStorage
const STORAGE_KEY = 'calendar_events';

// ID события, которое редактируем
let editingEventId = null;
let currentEditImageData = null;

// ДЕМО-СОБЫТИЯ С КАРТИНКАМИ (base64 встроенные)
const DEMO_EVENTS = [
    {
        id: 1001,
        title: "🎨 Выставка современного искусства",
        date: "2026-06-10",
        location: "Манеж, Санкт-Петербург",
        contacts: "art@culture.ru",
        link: "https://example.com/art-exhibition",
        imageData: "https://picsum.photos/id/106/200/150"
    },
    {
        id: 1002,
        title: "💡 IT-конференция TechDays 2026",
        date: "2026-06-15",
        location: "Крокус Экспо, Москва",
        contacts: "info@techdays.ru",
        link: "https://example.com/techdays",
        imageData: "https://picsum.photos/id/0/200/150"
    },
    {
        id: 1003,
        title: "🌱 Эко-фестиваль «Зелёная планета»",
        date: "2026-06-20",
        location: "Парк Горького, Москва",
        contacts: "eco@greenplanet.ru",
        link: "https://example.com/eco-fest",
        imageData: "https://picsum.photos/id/96/200/150"
    },
    {
        id: 1004,
        title: "📚 Книжная ярмарка Non/fiction",
        date: "2026-06-25",
        location: "Дом книги, Санкт-Петербург",
        contacts: "books@nonfiction.ru",
        link: "https://example.com/bookfair",
        imageData: "https://picsum.photos/id/20/200/150"
    },
    {
        id: 1005,
        title: "🎸 Рок-концерт «Лето на крыше»",
        date: "2026-07-05",
        location: "Крыша ДК Горбунова, Москва",
        contacts: "tickets@rockfest.ru",
        link: "https://example.com/rockconcert",
        imageData: "https://picsum.photos/id/29/200/150"
    },
    {
        id: 1006,
        title: "🚀 Стартап-питчинг Seed Forum",
        date: "2026-07-12",
        location: "Иннополис, Казань",
        contacts: "startups@seedforum.ru",
        link: "https://example.com/seedforum",
        imageData: "https://picsum.photos/id/91/200/150"
    },
    {
        id: 1007,
        title: "🍷 Фестиваль вина и гастрономии",
        date: "2026-07-18",
        location: "Массандра, Крым",
        contacts: "wine@festival.ru",
        link: "https://example.com/winefest",
        imageData: "https://picsum.photos/id/97/200/150"
    },
    {
        id: 1008,
        title: "🏃 Марафон «Здоровые города»",
        date: "2026-07-25",
        location: "Воробьёвы горы, Москва",
        contacts: "run@marathon.ru",
        link: "https://example.com/marathon",
        imageData: "https://picsum.photos/id/129/200/150"
    }
];

// Загрузка событий из localStorage
function loadEvents() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    // Если нет сохранённых — сохраняем демо-события
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_EVENTS));
    return [...DEMO_EVENTS];
}

// Сохранение событий в localStorage
function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    renderEventsList();
}

// Отображение списка событий в админке (с кнопками редактирования)
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
                ${event.imageData ? `<div class="event-date">🖼️ С картинкой</div>` : ''}
            </div>
            <div style="display: flex; gap: 5px;">
                <button class="small-delete edit-btn" onclick="openEditModal(${event.id})" style="background: #2196F3;">✏️ Редактировать</button>
                <button class="small-delete" onclick="deleteEvent(${event.id})">✖ Удалить</button>
            </div>
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

// Редактирование события
function openEditModal(id) {
    const events = loadEvents();
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    editingEventId = id;
    currentEditImageData = event.imageData || null;
    
    document.getElementById('editTitle').value = event.title;
    document.getElementById('editDate').value = event.date;
    document.getElementById('editLocation').value = event.location || '';
    document.getElementById('editContacts').value = event.contacts || '';
    document.getElementById('editLink').value = event.link || '';
    
    // Показываем текущую картинку
    const previewDiv = document.getElementById('editImagePreview');
    const previewImg = document.getElementById('editPreviewImg');
    if (event.imageData) {
        previewImg.src = event.imageData;
        previewDiv.style.display = 'block';
    } else {
        previewDiv.style.display = 'none';
    }
    
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingEventId = null;
    currentEditImageData = null;
    document.getElementById('editImageFile').value = '';
}

function updateEvent(id, updatedData) {
    const events = loadEvents();
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
        events[index] = { ...events[index], ...updatedData };
        saveEvents(events);
    }
}

// Конвертация файла в base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Переменная для хранения base64 текущей картинки (для новой)
let currentImageData = null;

// Обработка выбора файла (для нового события)
document.getElementById('imageFile')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 1 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 1 МБ');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение (JPG, PNG, GIF)');
        return;
    }
    
    try {
        const base64 = await fileToBase64(file);
        currentImageData = base64;
        
        const previewImg = document.getElementById('previewImg');
        previewImg.src = base64;
        document.getElementById('imagePreview').style.display = 'block';
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить картинку');
    }
});

// Обработка выбора файла (для редактирования)
document.getElementById('editImageFile')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 1 * 1024 * 1024) {
        alert('Файл слишком большой. Максимум 1 МБ');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение (JPG, PNG, GIF)');
        return;
    }
    
    try {
        const base64 = await fileToBase64(file);
        currentEditImageData = base64;
        
        const previewImg = document.getElementById('editPreviewImg');
        previewImg.src = base64;
        document.getElementById('editImagePreview').style.display = 'block';
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить картинку');
    }
});

// Обработка формы (новое событие)
document.getElementById('eventForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const eventData = {
        title: document.getElementById('title').value,
        date: document.getElementById('date').value,
        location: document.getElementById('location').value || 'Не указано',
        contacts: document.getElementById('contacts').value || 'Нет контактов',
        link: document.getElementById('link').value || '#',
        imageData: currentImageData || null
    };
    
    if (!eventData.title || !eventData.date) {
        alert('Заполните название и дату!');
        return;
    }
    
    addEvent(eventData);
    
    const msg = document.getElementById('successMsg');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 2000);
    
    clearForm();
});

// Обработка формы (редактирование)
document.getElementById('editForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!editingEventId) return;
    
    const updatedData = {
        title: document.getElementById('editTitle').value,
        date: document.getElementById('editDate').value,
        location: document.getElementById('editLocation').value || 'Не указано',
        contacts: document.getElementById('editContacts').value || 'Нет контактов',
        link: document.getElementById('editLink').value || '#',
        imageData: currentEditImageData || null
    };
    
    if (!updatedData.title || !updatedData.date) {
        alert('Заполните название и дату!');
        return;
    }
    
    updateEvent(editingEventId, updatedData);
    closeEditModal();
    
    const msg = document.getElementById('successMsg');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 2000);
});

function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('date').value = '';
    document.getElementById('location').value = '';
    document.getElementById('contacts').value = '';
    document.getElementById('link').value = '';
    document.getElementById('imageFile').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    currentImageData = null;
}

// Экспорт в JSON-файл
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

// Закрытие модального окна редактирования по крестику
document.querySelector('.close-edit')?.addEventListener('click', closeEditModal);
window.addEventListener('click', (event) => {
    const modal = document.getElementById('editModal');
    if (event.target === modal) closeEditModal();
});

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