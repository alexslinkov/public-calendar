// Ключ для localStorage
const STORAGE_KEY = 'calendar_events';

let events = [];
let currentDate = new Date();
currentDate.setMonth(4); // май 2026

let currentEvent = null;

// Загрузка событий из localStorage
function loadEvents() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        events = JSON.parse(stored);
    } else {
        events = [
            {
                id: Date.now(),
                title: "Вебинар по маркетингу",
                date: "2026-05-25",
                location: "Онлайн (Zoom)",
                contacts: "info@company.com",
                link: "https://example.com/register/1",
                imageData: null
            },
            {
                id: Date.now() + 1,
                title: "Конференция стартапов",
                date: "2026-05-28",
                location: "Москва, Крокус Экспо",
                contacts: "+7 999 123-45-67",
                link: "https://example.com/register/2",
                imageData: null
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
    renderCalendar();
    
    // После загрузки событий проверяем URL
    handleEventIdFromURL();
}

// Генерация .ics файла
function generateICS(event) {
    const date = new Date(event.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStamp = `${year}${month}${day}`;
    
    const escapeICS = (str) => {
        if (!str) return '';
        return str.replace(/[\\,;]/g, '\\$&').replace(/\n/g, '\\n');
    };
    
    const summary = escapeICS(event.title);
    const location = escapeICS(event.location || 'Не указано');
    const description = `Мероприятие: ${summary}\nМесто: ${location}\nКонтакты: ${event.contacts || 'Нет'}\nРегистрация: ${event.link !== '#' ? event.link : 'Не требуется'}`;
    
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Calendar App//RU',
        'BEGIN:VEVENT',
        `UID:${event.id}@calendar-app`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${dateStamp}`,
        `DTEND;VALUE=DATE:${dateStamp}`,
        `SUMMARY:${summary}`,
        `LOCATION:${location}`,
        `DESCRIPTION:${escapeICS(description)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
}

function downloadICS(event) {
    const icsContent = generateICS(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-zа-яё0-9]/gi, '_')}_${event.date}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ Файл скачан! Импортируйте его в ваш календарь.');
}

function shareEvent(event) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?event=${event.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('🔗 Ссылка на событие скопирована! Отправьте её кому угодно.');
    }).catch(() => {
        prompt('Скопируйте ссылку вручную:', shareUrl);
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Обработка параметра event=id в URL
function handleEventIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event');
    
    if (eventId && events.length > 0) {
        const event = events.find(e => e.id == eventId);
        if (event) {
            // Небольшая задержка для полного рендера календаря
            setTimeout(() => showEventDetails(event), 500);
        } else {
            console.log('Событие не найдено:', eventId);
            showToast('❌ Событие не найдено');
        }
        
        // Убираем параметр из URL, чтобы не мешал
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }
}

function isHoliday(year, month, day) {
    const holidays = [
        "2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08",
        "2026-02-23", "2026-03-08", "2026-05-01", "2026-05-09", "2026-06-12", "2026-11-04"
    ];
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return holidays.includes(dateStr);
}

function updateTitle() {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    document.getElementById('monthYearTitle').textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    calendar.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.textContent = day;
        dayHeader.style.fontWeight = 'bold';
        dayHeader.style.textAlign = 'center';
        dayHeader.style.padding = '10px';
        calendar.appendChild(dayHeader);
    });
    
    const firstDay = new Date(year, month, 1);
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const lastDate = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = (today.getFullYear() === year && today.getMonth() === month);
    
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendar.appendChild(emptyCell);
    }
    
    for (let date = 1; date <= lastDate; date++) {
        const dayCell = document.createElement('div');
        let className = 'calendar-day';
        
        const dayOfWeek = new Date(year, month, date).getDay();
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
        
        if (isWeekend) className += ' weekend';
        if (isHoliday(year, month, date)) className += ' holiday';
        if (isCurrentMonth && today.getDate() === date) className += ' today';
        
        dayCell.className = className;
        
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(date).padStart(2,'0')}`;
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date;
        dayCell.appendChild(dayNumber);
        
        const dayEvents = events.filter(e => e.date === dateStr);
        dayEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event';
            
            if (event.imageData && event.imageData !== '') {
                const img = document.createElement('img');
                img.src = event.imageData;
                img.className = 'event-thumb';
                img.onerror = () => img.style.display = 'none';
                eventEl.appendChild(img);
            }
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'event-title';
            titleSpan.textContent = event.title;
            eventEl.appendChild(titleSpan);
            
            eventEl.onclick = (e) => {
                e.stopPropagation();
                showEventDetails(event);
            };
            dayCell.appendChild(eventEl);
        });
        
        calendar.appendChild(dayCell);
    }
    
    updateTitle();
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function showEventDetails(event) {
    currentEvent = event;
    
    const modalImage = document.getElementById('eventImage');
    if (modalImage) {
        if (event.imageData && event.imageData !== '') {
            modalImage.src = event.imageData;
            modalImage.style.display = 'block';
        } else {
            modalImage.style.display = 'none';
        }
    }
    
    document.getElementById('eventTitle').textContent = event.title;
    document.getElementById('eventDate').textContent = event.date;
    document.getElementById('eventLocation').textContent = event.location;
    document.getElementById('eventContacts').textContent = event.contacts;
    
    const linkElement = document.getElementById('eventLink');
    if (event.link && event.link !== '#' && event.link !== '') {
        linkElement.href = event.link;
        linkElement.textContent = 'Перейти к регистрации';
        linkElement.style.pointerEvents = 'auto';
        linkElement.style.color = '#4CAF50';
    } else {
        linkElement.href = '#';
        linkElement.textContent = 'Не указана';
        linkElement.style.pointerEvents = 'none';
        linkElement.style.color = '#999';
    }
    
    document.getElementById('eventModal').style.display = 'block';
}

// Закрытие модального окна
const closeBtn = document.querySelector('.close');
if (closeBtn) closeBtn.onclick = () => document.getElementById('eventModal').style.display = 'none';

window.onclick = (event) => { 
    if (event.target == document.getElementById('eventModal')) 
        document.getElementById('eventModal').style.display = 'none'; 
}

// Навигация
const prevBtn = document.getElementById('prevMonthBtn');
const nextBtn = document.getElementById('nextMonthBtn');
if (prevBtn) prevBtn.onclick = () => changeMonth(-1);
if (nextBtn) nextBtn.onclick = () => changeMonth(1);

// Кнопки скачивания и шаринга
const downloadBtn = document.getElementById('downloadIcsBtn');
const shareBtn = document.getElementById('shareEventBtn');
if (downloadBtn) downloadBtn.onclick = () => currentEvent && downloadICS(currentEvent);
if (shareBtn) shareBtn.onclick = () => currentEvent && shareEvent(currentEvent);

// Запуск
loadEvents();

// Слушаем изменения в localStorage
window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) loadEvents();
});