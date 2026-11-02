const Notification = require('./models/Notification');
const { subscribe } = require('./messaging');

// Ce service ne répond à AUCUNE requête d'un autre service : il écoute seulement des événements.
async function startConsumers() {
  // US11 - Confirmation après une inscription
  await subscribe('notification-service.enrollment-created', 'enrollment.created', async ({ userId, courseTitle }) => {
    const message = `Inscription confirmée au cours : ${courseTitle}`;
    await Notification.create({ userId, type: 'inscription', message });
    console.log(`[NOTIFICATION] utilisateur ${userId} : ${message}`);
  });

  // US05 - Prévenir un étudiant dont le cours a été supprimé
  await subscribe('notification-service.enrollment-cancelled', 'enrollment.cancelled', async ({ userId, courseTitle }) => {
    const message = `Le cours "${courseTitle}" a été supprimé par son formateur`;
    await Notification.create({ userId, type: 'cours_supprime', message });
    console.log(`[NOTIFICATION] utilisateur ${userId} : ${message}`);
  });
}

module.exports = { startConsumers };
