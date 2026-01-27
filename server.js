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

app.get('/debug-dashboard', (req, res) => {
  console.log('Render dashboard appelé depuis /debug-dashboard');
  res.render('dashboard');
});

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



  app.get('/create-test-user', async (req, res) => {
  try {
    const User = require('./models/User');
    const user = new User({
      name: 'Test Capitaine',
      email: 'test@port-russell.fr',
      password: '123456'   // ← mot de passe clair pour test
    });
    await user.save();
    res.send('Utilisateur test créé ! Email: test@port-russell.fr / MP: 123456');
  } catch (err) {
    res.send('Erreur : ' + err.message);
  }
});

// Routes simples pour tester
app.get('/', (req, res) => {
  res.render('home', { connected: mongoConnected });
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// route de récupération des réservations
app.get('/reservations', async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');
    const reservations = await Reservation.find().lean();
    console.log('Nombre de réservations trouvées :', reservations.length);
    res.render('reservations', { reservations });
  } catch (err) {
    console.error('Erreur lecture reservations :', err);
    res.render('reservations', { reservations: [] });
  }
});

// route formulaire création de nouvelles reservations
app.get('/reservations/new', (req, res) => {
  res.render('reservations-new');
});


// route POST pour formulaire d'ajout de reservation
app.post('/reservations', async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');

    const newReservation = new Reservation({
      catwayNumber: req.body.catwayNumber,
      clientName: req.body.clientName,
      boatName: req.body.boatName,
      checkIn: new Date(req.body.checkIn),
      checkOut: new Date(req.body.checkOut)
    });

    await newReservation.save();

    console.log('Nouvelle réservation créée :', newReservation._id);
    res.redirect('/reservations');  // retour à la liste
  } catch (err) {
    console.error('Erreur création réservation :', err.message);
    res.status(500).send('Erreur lors de la création : ' + err.message);
  }
});

// route de récupération de la listes des catways
app.get('/catways', async (req, res) => {
  try {
    const Catway = require('./models/Catway');  
    const catways = await Catway.find().lean(); 
    console.log('Catways trouvés :', catways);
    console.log('Nombre de catways trouvés :', catways.length); // ← ajout de ce log pour débug
    res.render('catways', { catways });
  } catch (err) {
    console.error('Erreur lecture catways :', err);
    res.render('catways', { catways: [] });
  }
});

// Pour tester login (placeholder)
app.post('/login', (req, res) => {
  console.log('Tentative de connexion :', req.body);
  res.redirect('/dashboard'); // simulation
});

// Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré → http://localhost:${PORT}`);
});