const { courseServiceUrl } = require('./config');

// Le "téléphone" vers le course-service : un appel HTTP SYNCHRONE.
// Si le course-service ne répond pas, on renvoie une erreur claire (503) au lieu de planter.
async function call(path) {
  let res;
  try {
    res = await fetch(courseServiceUrl + path, { signal: AbortSignal.timeout(3000) });
  } catch {
    const err = new Error('Le service des cours est momentanément indisponible');
    err.status = 503;
    throw err;
  }
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = new Error('Erreur du service des cours');
    err.status = 502;
    throw err;
  }
  return res.json();
}

module.exports = {
  getCourse: (id) => call(`/internal/courses/${id}`),
  getCourses: (ids) => call(`/internal/courses/batch?ids=${ids.join(',')}`),
};
