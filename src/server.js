// src/server.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
const fastify = require('fastify')({ logger: true });
const path = require('path');
require('dotenv').config();

// Плагины
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '../public'),
  prefix: '/'
});

// Шаблонизатор - ВАЖНО: правильная регистрация
fastify.register(require('point-of-view'), {
  engine: {
    ejs: require('ejs')
  },
  root: path.join(__dirname, 'templates'),
  viewExt: 'html'
});

// Инициализация базы данных
const { initDatabase } = require('./database/models');
initDatabase().catch(console.error);

// Маршруты
fastify.register(require('./routes/reminders'));
fastify.register(require('./routes/web'));

// Главная страница
fastify.get('/', async (request, reply) => {
  return reply.view('index', {
    chat_id: process.env.ADMIN_CHAT_ID || ''
  });
});

// Запуск сервера
const start = async () => {
  try {
    await fastify.listen({ 
      port: process.env.PORT || 3000, 
      host: '0.0.0.0' 
    });
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();