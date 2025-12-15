// src/routes/web.js
async function webRoutes(fastify, options) {
  // Простой тестовый маршрут для проверки
  fastify.get('/web-test', async (request, reply) => {
    return { message: 'Web routes are working!' };
  });
  
  // Маршрут для проверки подключения к БД
  fastify.get('/health', async (request, reply) => {
    try {
      const { query } = require('../database/connection');
      await query('SELECT 1');
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      return { status: 'error', database: 'disconnected', error: error.message };
    }
  });
}

module.exports = webRoutes;