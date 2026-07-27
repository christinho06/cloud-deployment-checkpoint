const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true, default: '' },
  image: { type: String, default: '' },
  link: { type: String, default: '' },
  badge: { type: String, default: '' },
  badgeColor: { type: String, default: '#f59e0b' },
  cta: { type: String, default: 'Voir l\'offre' },
  approved: { type: Boolean, default: false },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
