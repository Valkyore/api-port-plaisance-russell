const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const catwayCtrl = require('../controllers/catwayController');
const reservationCtrl = require('../controllers/ReservationController');

// Catways
router.get('/catways', auth, catwayCtrl.getAll);
router.get('/catways/:id', auth, catwayCtrl.getById);
router.post('/catways', auth, catwayCtrl.createCatway);
router.put('/catways/:id', auth, catwayCtrl.update);
router.patch('/catways/:id', auth, catwayCtrl.patchState); // Seulement state
router.delete('/catways/:id', auth, catwayCtrl.delete);

// Reservations (sous-ressource)
router.get('/catways/:id/reservations', auth, reservationCtrl.getAllForCatway);
router.get('/catways/:id/reservations/:idReservation', auth, reservationCtrl.getById);
router.post('/catways/:id/reservations', auth, reservationCtrl.create);
router.delete('/catways/:id/reservations/:idReservation', auth, reservationCtrl.delete);

module.exports = router;