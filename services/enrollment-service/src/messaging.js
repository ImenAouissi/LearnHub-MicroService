const amqp = require('amqplib');
const { rabbitUrl } = require('./config');

const EXCHANGE = 'learnhub.events'; // le "centre de tri" des messages
let channel = null;

// Se connecte à RabbitMQ, avec plusieurs essais (RabbitMQ peut démarrer après le service)
async function connectRabbit(retries = 20) {
  for (let i = 1; i <= retries; i++) {
    try {
      const connection = await amqp.connect(rabbitUrl);
      connection.on('close', () => { channel = null; console.error('Connexion RabbitMQ perdue'); });
      connection.on('error', () => {});
      channel = await connection.createChannel();
      channel.on('error', (err) => console.error('Erreur du canal RabbitMQ', err.message));
      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
      console.log('RabbitMQ connecté');
      return;
    } catch {
      console.log(`RabbitMQ pas encore prêt (${i}/${retries}), nouvel essai dans 3 s`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  throw new Error('RabbitMQ injoignable');
}

// Envoie un événement. Si RabbitMQ est absent, on le note mais on ne fait pas échouer la requête.
function publish(routingKey, payload) {
  if (!channel) {
    console.warn(`Événement ${routingKey} perdu : RabbitMQ non connecté`);
    return false;
  }
  try {
    channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log(`[événement envoyé] ${routingKey}`, payload);
    return true;
  } catch (err) {
    console.warn(`Événement ${routingKey} perdu : ${err.message}`);
    return false;
  }
}

// Écoute un type d'événement dans une file qui appartient à ce service
async function subscribe(queue, routingKey, handler) {
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, EXCHANGE, routingKey);
  channel.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      await handler(JSON.parse(msg.content.toString()));
      channel.ack(msg); // "bien reçu et traité" : RabbitMQ peut effacer le message
    } catch (err) {
      console.error(`Erreur de traitement de ${routingKey}`, err);
      channel.nack(msg, false, false); // message abandonné (voir l'exercice sur la file d'erreurs)
    }
  });
}

module.exports = { connectRabbit, publish, subscribe };
