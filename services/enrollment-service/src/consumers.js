const { pool } = require('./db/postgres');
const { publish, subscribe } = require('./messaging');

// Ce service ÉCOUTE les événements des autres services.
async function startConsumers() {
  // Quand le course-service annonce "un cours a été supprimé",
  // on supprime les inscriptions correspondantes et on prévient chaque étudiant concerné.
  await subscribe('enrollment-service.course-deleted', 'course.deleted', async ({ courseId, title }) => {
    const { rows } = await pool.query('DELETE FROM enrollments WHERE course_id = $1 RETURNING user_id', [courseId]);
    rows.forEach((r) => publish('enrollment.cancelled', { userId: r.user_id, courseTitle: title }));
  });
}

module.exports = { startConsumers };
