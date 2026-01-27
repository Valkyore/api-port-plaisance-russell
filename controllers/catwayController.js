const Catway = require('../models/Catway');
const { body, validationResult } = require('express-validator');

exports.createCatway = [
  body('catwayNumber').isNumeric(),
  body('type').isIn(['long', 'short']),
  body('catwayState').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const catway = new Catway(req.body);
      await catway.save();
      res.status(201).json(catway);
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  }
];