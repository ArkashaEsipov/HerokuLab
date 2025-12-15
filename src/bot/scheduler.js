// src/bot/scheduler.js - ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ
const cron = require('node-cron');
const { query } = require('../database/connection');
const moment = require('moment');
require('dotenv').config();

async function sendReminders() {
  console.log('\n=== Checking for due reminders ===');
  console.log('Local time:', new Date().toString());
  
  try {
    // Получаем текущее время в UTC
    const nowUTC = new Date().toISOString();
    console.log('UTC time:', nowUTC);
    
    // ВАЖНО: PostgreSQL хранит время в UTC, сравниваем как текст
    // scheduled_time уже в UTC в БД, так как мы сохраняли toISOString()
    const result = await query(
      `SELECT * FROM reminders 
       WHERE scheduled_time <= $1::timestamptz 
       AND sent = false 
       ORDER BY scheduled_time`,
      [nowUTC]
    );
    
    console.log(`Found ${result.rows.length} reminders to send`);
    
    // Логи для отладки
    if (result.rows.length > 0) {
      result.rows.forEach(rem => {
        console.log(`ID ${rem.id}: "${rem.message}" at ${rem.scheduled_time}`);
      });
    } else {
      // Покажем ближайшие напоминания для отладки
      const upcoming = await query(
        `SELECT * FROM reminders 
         WHERE sent = false 
         ORDER BY scheduled_time LIMIT 3`
      );
      if (upcoming.rows.length > 0) {
        console.log('Upcoming reminders:');
        upcoming.rows.forEach(rem => {
          const timeLeft = new Date(rem.scheduled_time) - new Date();
          const minutesLeft = Math.floor(timeLeft / 60000);
          console.log(`  - ID ${rem.id}: in ${minutesLeft} min (${rem.scheduled_time})`);
        });
      }
    }
    
    // Отправка напоминаний
    for (const reminder of result.rows) {
      try {
        console.log(`Sending to ${reminder.chat_id}: "${reminder.message}"`);
        
        // Убедитесь, что chat_id - число, а не строка "ВАШ_CHAT_ID"
        const chatId = parseInt(reminder.chat_id) || reminder.chat_id;
        
        const fetch = require('node-fetch');
        const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🔔 Напоминание: ${reminder.message}`,
            parse_mode: 'HTML'
          })
        });
        
        const data = await response.json();
        
        if (data.ok) {
          await query('UPDATE reminders SET sent = true WHERE id = $1', [reminder.id]);
          console.log(`✅ Sent reminder ${reminder.id}`);
        } else {
          console.error(`❌ Telegram error:`, data.description);
        }
      } catch (error) {
        console.error(`❌ Network error:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

// Тестовая функция для проверки времени
async function testTime() {
  const test = await query('SELECT NOW() as db_time');
  console.log('Database time:', test.rows[0].db_time);
  console.log('Server time:', new Date().toISOString());
}

// Запуск
console.log('🚀 Scheduler started (UTC time checking)...');
testTime();

// Запускаем каждую минуту
cron.schedule('* * * * *', sendReminders);

// Первая проверка через 5 секунд
setTimeout(sendReminders, 5000);