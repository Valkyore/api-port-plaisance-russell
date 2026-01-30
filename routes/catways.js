const express = require('express');
const Catway = require('../models/Catway');
const auth = require('../middlewares/auth');

const router = express.Router();


// Liste
// Liste
router.get('/', auth, async (req, res) => {
  const Catway = require('../models/Catway');
  const Reservation = require('../models/Reservation');

  const catways = await Catway.find().sort({ catwayNumber: 1 }).lean();

  for (let catway of catways) {
    const count = await Reservation.countDocuments({ catwayNumber: catway.catwayNumber });
    catway.reservationsCount = count;
  }

  res.render('catways', { catways, success: false, catwayId: null, errorMsg: null });
});


// Création
router.get('/new', auth, (req, res) => {
  res.render('catways-new');
});

router.post('/', auth, async (req, res) => {
  await Catway.create(req.body);
  res.redirect('/catways');
});

// Suppression
router.post('/:id/delete', auth, async (req, res) => {
  await Catway.findByIdAndDelete(req.params.id);
  res.redirect('/catways');
});

module.exports = router;
