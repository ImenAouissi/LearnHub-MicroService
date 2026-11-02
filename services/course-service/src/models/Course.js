const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General', trim: true },
    ownerId: { type: Number, required: true }, // id du formateur (il vit dans le user-service)
    ownerName: { type: String, default: '' }, // copie du nom : on n'appelle pas le user-service à chaque affichage
    chapters: [chapterSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
