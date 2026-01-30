const express = require('express');
const User = require('../models/User');
const auth = require('../middlewares/auth');

const router = express.Router();

// Formulaire
router.get('/new', auth, (req, res) => {
  res.render('users/new');
});

// Création
router.post('/', auth, async (req, res) => {
  const { name, email, password } = req.body;

  await User.create({ name, email, password });
  res.redirect('/dashboard');
});

router.post('/:id/delete', auth, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/dashboard');
});

router.get('/', auth, async (req, res) => {
  const users = await User.find();
  res.render('users/index', { users });
});

router.post('/:id/delete', auth, async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.redirect('/users');
  }

  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
