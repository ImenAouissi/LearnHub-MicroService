module.exports = {
  port: process.env.PORT || 3003,
  databaseUrl: process.env.DATABASE_URL,
  rabbitUrl: process.env.RABBITMQ_URL,
  courseServiceUrl: process.env.COURSE_SERVICE_URL,
  jwtSecret: process.env.JWT_SECRET,
};
