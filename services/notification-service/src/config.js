module.exports = {
  port: process.env.PORT || 3004,
  mongoUrl: process.env.MONGO_URL,
  rabbitUrl: process.env.RABBITMQ_URL,
  jwtSecret: process.env.JWT_SECRET,
};
