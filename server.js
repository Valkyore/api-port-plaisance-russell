require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

console.log('Chemin absolu du dossier views :', path.join(__dirname, 'views'));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connexion MongoDB
let mongoConnected = false;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/port_russell')
  .then(() => {
    mongoConnected = true;
    console.log('MongoDB connecté');
  })
  .catch(err => {
    console.error('Erreur MongoDB :', err.message);
  });

// Debug dashboard
app.get('/debug-dashboard', (req, res) => {
  console.log('Render dashboard appelé depuis /debug-dashboard');
  res.render('dashboard');
});

// Création utilisateur test (temporaire)
app.get('/create-test-user', async (req, res) => {
  try {
    const User = require('./models/User');
    const user = new User({
      name: 'Test Capitaine',
      email: 'test@port-russell.fr',
      password: '123456'
    });
    await user.save();
    res.send('Utilisateur test créé ! Email: test@port-russell.fr / MP: 123456');
  } catch (err) {
    res.send('Erreur : ' + err.message);
  }
});

// Page d'accueil
app.get('/', (req, res) => {
  res.render('home', { connected: mongoConnected });
});

// Dashboard (simulation connexion pour l'instant)
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// ───────────────────────────────
// ROUTES RÉSERVATIONS
// ───────────────────────────────

// Liste des réservations + gestion message succès/erreur
app.get('/reservations', async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');
    const reservations = await Reservation.find().lean();

    const success = req.query.success === 'true';
    const reservationId = req.query.id;
    const errorMsg = req.query.error;

    res.render('reservations', {
      reservations,
      success,
      reservationId,
      errorMsg
    });
  } catch (err) {
    console.error('Erreur lecture reservations :', err);
    res.render('reservations', { 
      reservations: [], 
      errorMsg: err.message 
    });
  }

  // Détails d'une réservation
app.get('/reservations/:id', async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');
    const reservation = await Reservation.findById(req.params.id).lean();

    if (!reservation) {
      return res.status(404).render('error', { message: 'Réservation non trouvée' });
    }

    res.render('reservation-details', { reservation });
  } catch (err) {
    console.error('Erreur détails réservation :', err);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});
});

// Formulaire création nouvelle réservation
app.get('/reservations/new', (req, res) => {
  res.render('reservations-new');
});

// Traitement POST création réservation + redirection avec message
app.post('/reservations', async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');

    const newReservation = new Reservation({
      catwayNumber: Number(req.body.catwayNumber),
      clientName: req.body.clientName.trim(),
      boatName: req.body.boatName.trim(),
      checkIn: new Date(req.body.checkIn),
      checkOut: new Date(req.body.checkOut)
    });

    await newReservation.save();

    console.log(`Réservation créée – ID: ${newReservation._id}`);
    res.redirect(`/reservations?success=true&id=${newReservation._id}`);
  } catch (err) {
    console.error('Erreur création réservation :', err.message);
    const errorMessage = err.message || 'Erreur inconnue lors de la sauvegarde';
    res.redirect(`/reservations?success=false&error=${encodeURIComponent(errorMessage)}`);
  }
});

// ───────────────────────────────
// ROUTES CATWAYS
// ───────────────────────────────

app.get('/catways', async (req, res) => {
  try {
    const Catway = require('./models/Catway');
    const catways = await Catway.find().lean();
    console.log('Nombre de catways trouvés :', catways.length);
    res.render('catways', { catways });
  } catch (err) {
    console.error('Erreur lecture catways :', err);
    res.render('catways', { catways: [] });
  }
});

// Simulation login
app.post('/login', (req, res) => {
  console.log('Tentative de connexion :', req.body);
  res.redirect('/dashboard'); // À remplacer par vraie auth plus tard
});

// Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré → http://localhost:${PORT}`);
});