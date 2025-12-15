const { query } = require('./connection');

async function initDatabase() {
  // Создаем таблицу, если её нет
  await query(`
    CREATE TABLE IF NOT EXISTS reminders (
      id SERIAL PRIMARY KEY,
      chat_id VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
      sent BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  
  console.log('Database initialized');
}

module.exports = { initDatabase };