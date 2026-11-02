module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  urls: {
    user: process.env.USER_SERVICE_URL,
    course: process.env.COURSE_SERVICE_URL,
    enrollment: process.env.ENROLLMENT_SERVICE_URL,
    notification: process.env.NOTIFICATION_SERVICE_URL,
  },
};
