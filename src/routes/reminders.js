async function remindersRoutes(fastify, options) {
  const { query } = require('../database/connection');
  
  // Получить все напоминания
  fastify.get('/api/reminders', async (request, reply) => {
    try {
      const result = await query(
        'SELECT * FROM reminders ORDER BY scheduled_time DESC'
      );
      return result.rows;
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  
  // Создать новое напоминание
  fastify.post('/api/reminders', async (request, reply) => {
    let { chat_id, message, scheduled_time } = request.body;
    chat_id = parseInt(chat_id) || chat_id;

    try {
      const result = await query(
        `INSERT INTO reminders (chat_id, message, scheduled_time) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [chat_id, message, scheduled_time]
      );
      return result.rows[0];
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  
  // Обновить напоминание
  fastify.put('/api/reminders/:id', async (request, reply) => {
    const { id } = request.params;
    const { message, scheduled_time } = request.body;
    
    try {
      const result = await query(
        `UPDATE reminders 
         SET message = $1, scheduled_time = $2 
         WHERE id = $3 
         RETURNING *`,
        [message, scheduled_time, id]
      );
      return result.rows[0] || { error: 'Reminder not found' };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
  
  // Удалить напоминание
  fastify.delete('/api/reminders/:id', async (request, reply) => {
    const { id } = request.params;
    
    try {
      await query('DELETE FROM reminders WHERE id = $1', [id]);
      return { success: true };
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });
}

module.exports = remindersRoutes;