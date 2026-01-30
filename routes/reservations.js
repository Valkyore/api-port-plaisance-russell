const express = require('express');
const Reservation = require('../models/Reservation');
const Catway = require('../models/Catway');
const auth = require('../middlewares/auth');

const router = express.Router();

// Liste
router.get('/', auth, async (req, res) => {
  const reservations = await Reservation.find();
  res.render('reservations', { reservations });
});

// Formulaire création
router.get('/new', auth, (req, res) => {
  res.render('reservations-new');
});

// Création AVEC vérification du catway
router.post('/', auth, async (req, res) => {
  try {
    const { catwayNumber } = req.body;

    const catway = await Catway.findOne({ catwayNumber });

    if (!catway) {
      return res.render('reservations', {
        reservations: await Reservation.find(),
        errorMsg: `Le catway n°${catwayNumber} n'existe pas.`,
        success: false
      });
    }

    await Reservation.create(req.body);
    res.redirect('/reservations');

  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Suppression
router.post('/:id/delete', auth, async (req, res) => {
  await Reservation.findByIdAndDelete(req.params.id);
  res.redirect('/reservations');
});

module.exports = router;

