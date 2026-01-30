const express = require('express');
const Reservation = require('../models/Reservation');
const auth = require('../middlewares/auth');

const router = express.Router();

// Liste
router.get('/', auth, async (req, res) => {
  const reservations = await Reservation.find();
  res.render('reservations/index', { reservations });
});

// Création
router.get('/new', auth, (req, res) => {
  res.render('reservations/new');
});

router.post('/', auth, async (req, res) => {
  await Reservation.create(req.body);
  res.redirect('/reservations');
});

// Suppression
router.post('/:id/delete', auth, async (req, res) => {
  await Reservation.findByIdAndDelete(req.params.id);
  res.redirect('/reservations');
});

module.exports = router;
