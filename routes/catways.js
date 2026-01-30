const express = require('express');
const Catway = require('../models/Catway');
const auth = require('../middlewares/auth');

const router = express.Router();


// Liste
router.get('/', auth, async (req, res) => {
  const catways = await Catway.find().sort({ catwayNumber: 1 });
  res.render('catways', { catways });
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
