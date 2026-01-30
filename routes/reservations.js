const express = require('express');
const Reservation = require('../models/Reservation');
const Catway = require('../models/Catway');
const auth = require('../middlewares/auth');

const router = express.Router();

// Liste des réservations avec tri
router.get('/', auth, async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'catwayNumber'; // tri par défaut
    let sortOption = {};

    if (sortBy === 'catwayNumber') sortOption = { catwayNumber: 1 };
    else if (sortBy === 'checkIn') sortOption = { checkIn: 1 };
    else if (sortBy === 'checkOut') sortOption = { checkOut: 1 };

    const reservations = await Reservation.find().sort(sortOption).lean();

    const success = req.query.success === 'true';
    const reservationId = req.query.id;
    const errorMsg = req.query.error;

    res.render('reservations', { 
      reservations, 
      success, 
      reservationId, 
      errorMsg, 
      sortBy 
    });
  } catch (err) {
    console.error('Erreur lecture reservations :', err);
    res.render('reservations', { 
      reservations: [], 
      success: false,
      reservationId: null,
      errorMsg: err.message,
      sortBy: 'catwayNumber' 
    });
  }
});

// Formulaire création
router.get('/new', auth, (req, res) => {
  res.render('reservations-new');
});

// Création avec vérification du catway
router.post('/', auth, async (req, res) => {
  try {
    const { catwayNumber } = req.body;
    const catway = await Catway.findOne({ catwayNumber });

    if (!catway) {
      return res.render('reservations', {
        reservations: await Reservation.find().lean(),
        errorMsg: `Le catway n°${catwayNumber} n'existe pas.`,
        success: false,
        sortBy: 'catwayNumber'
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
