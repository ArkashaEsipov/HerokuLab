document.addEventListener('DOMContentLoaded', function() {
  const API_URL = '/api/reminders';
  let reminders = [];
  
  // Загрузка напоминаний
  async function loadReminders() {
    try {
      const response = await fetch(API_URL);
      reminders = await response.json();
      renderReminders();
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  }
  
  // Отображение напоминаний
  function renderReminders() {
    const container = document.getElementById('remindersList');
    container.innerHTML = '';
    
    reminders.forEach(reminder => {
      const div = document.createElement('div');
      div.className = 'reminder-item';
      div.innerHTML = `
        <div>
          <strong>${reminder.message}</strong>
          <div>Время: ${new Date(reminder.scheduled_time).toLocaleString()}</div>
          <div>Статус: ${reminder.sent ? '✅ Отправлено' : '⏳ Ожидание'}</div>
        </div>
        <button onclick="deleteReminder(${reminder.id})">🗑️ Удалить</button>
      `;
      container.appendChild(div);
    });
  }
  
  // Добавление напоминания
  document.getElementById('reminderForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
      chat_id: document.getElementById('chatId').value === "{{chat_id}}" ? 777020416 : document.getElementById('chatId').value,
      message: document.getElementById('message').value,
      scheduled_time: new Date(document.getElementById('datetime').value).toISOString()
    };
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Напоминание добавлено!');
        loadReminders();
        e.target.reset();
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  });
  
  // Удаление напоминания (глобальная функция для кнопок)
  window.deleteReminder = async function(id) {
    if (confirm('Удалить напоминание?')) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadReminders();
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };
  
  // Автоматическое обновление каждые 10 секунд
  loadReminders();
  setInterval(loadReminders, 30000);
});