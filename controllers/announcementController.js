const Announcement = require('../models/Announcement');

// Public: annonces approuvées et dans la période valide
const getAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const query = {
      approved: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: null },
      ]
    };
    const announcements = await Announcement.find(query)
      .populate('seller', 'name sellerInfo')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vendeur: ses propres annonces
const getMyAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ seller: req.user._id })
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vendeur: créer une annonce
const createAnnouncement = async (req, res) => {
  try {
    const { title, subtitle, image, link, badge, badgeColor, cta, startDate, endDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Le titre est requis' });

    const announcement = await Announcement.create({
      seller: req.user._id,
      title, subtitle, image, link, badge,
      badgeColor: badgeColor || '#f59e0b',
      cta: cta || "Voir l'offre",
      startDate: startDate || null,
      endDate: endDate || null,
      approved: false,
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vendeur: modifier son annonce (remet en attente d'approbation)
const updateAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findOne({ _id: req.params.id, seller: req.user._id });
    if (!ann) return res.status(404).json({ message: 'Annonce introuvable' });

    const { title, subtitle, image, link, badge, badgeColor, cta, startDate, endDate } = req.body;
    Object.assign(ann, {
      title: title ?? ann.title,
      subtitle: subtitle ?? ann.subtitle,
      image: image ?? ann.image,
      link: link ?? ann.link,
      badge: badge ?? ann.badge,
      badgeColor: badgeColor ?? ann.badgeColor,
      cta: cta ?? ann.cta,
      startDate: startDate !== undefined ? startDate : ann.startDate,
      endDate: endDate !== undefined ? endDate : ann.endDate,
      approved: false, // remettre en attente après modification
    });
    await ann.save();
    res.json(ann);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vendeur: supprimer son annonce
const deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!ann) return res.status(404).json({ message: 'Annonce introuvable' });
    res.json({ message: 'Annonce supprimee' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: toutes les annonces
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('seller', 'name sellerInfo')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: approuver ou rejeter
const approveAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: 'Annonce introuvable' });
    ann.approved = req.body.approved;
    await ann.save();
    res.json(ann);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: supprimer n'importe quelle annonce
const adminDeleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Annonce supprimee' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAnnouncements, getMyAnnouncements, createAnnouncement,
  updateAnnouncement, deleteAnnouncement,
  getAllAnnouncements, approveAnnouncement, adminDeleteAnnouncement,
};
