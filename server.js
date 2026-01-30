require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const usersRoutes = require('./routes/users');
const catwaysRoutes = require('./routes/catways');
const reservationsRoutes = require('./routes/reservations');
console.log('Chemin absolu du dossier views :', path.join(__dirname, 'views'));

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(require('cookie-parser')());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/users', usersRoutes);
app.use('/catways', catwaysRoutes);
app.use('/reservations', reservationsRoutes);

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

  // ───────────────────────────────
// MIDDLEWARE AUTH
// ───────────────────────────────
const auth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.redirect('/');

  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET || 'cle_tres_longue_et_secrète'
    );
    next();
  } catch (err) {
    res.clearCookie('jwt');
    res.redirect('/');
  }
};

// ───────────────────────────────
// PAGES DE BASE
// ───────────────────────────────

app.get('/debug-dashboard', (req, res) => {
  console.log('Render dashboard appelé depuis /debug-dashboard');
  res.render('dashboard');
});

app.get('/', (req, res) => {
  res.render('home', { connected: mongoConnected, error: null });
});

app.get('/dashboard',auth, (req, res) => {
  res.render('dashboard');
});

// ───────────────────────────────
// CRÉATION UTILISATEUR TEST
// ───────────────────────────────
app.get('/create-test-user', async (req, res) => {
  try {
    const User = require('./models/User');

    // Supprime l’ancien si existe
    await User.deleteOne({ email: 'test@port-russell.fr' });

    // Crée le nouveau (le mot de passe sera hashé automatiquement)
    const user = new User({
      name: 'Test Capitaine',
      email: 'test@port-russell.fr',
      password: '123456' 
    });

    await user.save();

    res.send('Utilisateur test recréé avec succès ! <br>Email: test@port-russell.fr <br>Mot de passe: 123456');
  } catch (err) {
    res.send('Erreur : ' + err.message);
  }
});

// ───────────────────────────────
// LOGIN
// ───────────────────────────────
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentative de connexion :', { email, password });

    const User = require('./models/User');
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Utilisateur non trouvé');
      return res.render('home', { connected: mongoConnected, error: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Mot de passe correct ?', isMatch);

    if (!isMatch) {
      return res.render('home', { connected: mongoConnected, error: 'Email ou mot de passe incorrect' });
    }

    // Génère le token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'cle_tres_longue_et_secrète', { expiresIn: '1d' });

    // Stocke dans cookie
    res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    console.log('Connexion réussie, redirection vers dashboard');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Erreur login :', err.message);
    res.render('home', { connected: mongoConnected, error: 'Erreur serveur' });
  }
});

// ───────────────────────────────
// GESTION COMPTE UTILISATEUR (ajout et suppression)
// ───────────────────────────────

// Formulaire d'ajout d'un nouvel utilisateur
app.get('/users/new', (req, res) => {
  res.render('users-new',{ error: null });
});

// POST - Créer un nouvel utilisateur
app.post('/users', async (req, res) => {
  try {
    const User = require('./models/User');

    const { name, email, password } = req.body;

    // Vérification simple (email unique déjà géré par unique: true dans le schéma)
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('users-new', { error: 'Cet email est déjà utilisé' });
    }

    const user = new User({ name, email, password });
    await user.save();

    // Génère le token JWT pour connecter immédiatement le nouvel utilisateur
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'cle_tres_longue_et_secrète', { expiresIn: '1d' });

    // Stocke le token dans un cookie sécurisé
    res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

    res.redirect('/dashboard?success=true&message=Utilisateur créé avec succès');
  } catch (err) {
    console.error('Erreur création utilisateur :', err.message);
    res.render('users-new', { error: 'Erreur lors de la création : ' + err.message });
  }
});

// Suppression d'un utilisateur (par ID)
app.delete('/users/:id', async (req, res) => {
  try {
    const User = require('./models/User');
    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ───────────────────────────────
// ROUTES RÉSERVATIONS (sous-ressource de catway + anciennes routes conservées)
// ───────────────────────────────

// Ancienne route (conservée pour compatibilité)
app.get('/reservations',auth, async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');
    const reservations = await Reservation.find().lean();

    const success = req.query.success === 'true';
    const reservationId = req.query.id;
    const errorMsg = req.query.error;

    res.render('reservations', { reservations, success, reservationId, errorMsg });
  } catch (err) {
    console.error('Erreur lecture reservations :', err);
    res.render('reservations', { reservations: [], errorMsg: err.message });
  }
});

// NOUVEAU : Lister les réservations d'un catway spécifique
app.get('/catways/:id/reservations',auth, async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');
    const reservations = await Reservation.find({ catwayNumber: req.params.id }).lean();
    res.render('reservations', { reservations, catwayId: req.params.id });
  } catch (err) {
    res.render('reservations', { reservations: [], errorMsg: err.message });
  }
});

// Ancienne route création (conservée)
app.get('/reservations/new',auth, (req, res) => {
  res.render('reservations-new');
});

// Ancienne route POST (conservée)
app.post('/reservations',auth, async (req, res) => {
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
    res.redirect(`/reservations?success=true&id=${newReservation._id}`);
  } catch (err) {
    res.redirect(`/reservations?success=false&error=${encodeURIComponent(err.message || 'Erreur inconnue')}`);
  }
});

// NOUVEAU : Créer une réservation pour un catway spécifique
app.post('/catways/:id/reservations',auth, async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');
    const newReservation = new Reservation({
      catwayNumber: Number(req.params.id),
      clientName: req.body.clientName.trim(),
      boatName: req.body.boatName.trim(),
      checkIn: new Date(req.body.checkIn),
      checkOut: new Date(req.body.checkOut)
    });

    await newReservation.save();
    res.redirect(`/catways/${req.params.id}/reservations?success=true`);
  } catch (err) {
    res.redirect(`/catways/${req.params.id}/reservations?error=${encodeURIComponent(err.message)}`);
  }
});

// Formulaire édition (conservé)
app.get('/reservations/:id/edit',auth, async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');
    const reservation = await Reservation.findById(req.params.id).lean();

    if (!reservation) {
      return res.status(404).render('error', { message: 'Réservation non trouvée' });
    }

    res.render('reservations-edit', { reservation });
  } catch (err) {
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Mise à jour (conservée)
app.put('/reservations/:id',auth, async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');
    const updated = await Reservation.findByIdAndUpdate(
      req.params.id,
      {
        catwayNumber: Number(req.body.catwayNumber),
        clientName: req.body.clientName.trim(),
        boatName: req.body.boatName.trim(),
        checkIn: new Date(req.body.checkIn),
        checkOut: new Date(req.body.checkOut)
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).render('error', { message: 'Réservation non trouvée' });
    }

    res.redirect(`/reservations?success=true&message=Réservation modifiée avec succès`);
  } catch (err) {
    res.redirect(`/reservations?success=false&error=${encodeURIComponent(err.message || 'Erreur inconnue')}`);
  }
});

// Détails d'une réservation (conservé)
app.get('/reservations/:id',auth, async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');
    const Catway = require('./models/Catway');

    const reservation = await Reservation.findById(req.params.id).lean();

    if (!reservation) {
      return res.status(404).render('error', { message: 'Réservation non trouvée' });
    }

    const catway = await Catway.findOne({ catwayNumber: reservation.catwayNumber }).lean();

    res.render('reservation-details', { reservation, catway });
  } catch (err) {
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

app.delete('/reservations/:id',auth, async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');
    const deleted = await Reservation.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }

    res.json({ success: true, message: 'Réservation supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// NOUVEAU : Supprimer une réservation via sous-ressource
app.delete('/catways/:id/reservations/:idResa',auth, async (req, res) => {
  try {
    const Reservation = require('./models/Reservation');
    const deleted = await Reservation.findOneAndDelete({
      _id: req.params.idResa,
      catwayNumber: req.params.id
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
    }

    res.json({ success: true, message: 'Réservation supprimée' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ───────────────────────────────
// ROUTES CATWAYS
// ───────────────────────────────

app.get('/catways',auth, async (req, res) => {
  try {
    const Catway = require('./models/Catway');
    const Reservation = require('./models/Reservation');

    // Récupère tous les catways triés par catwayNumber croissant
    const catways = await Catway.find().sort({ catwayNumber: 1 }).lean();

    // Ajoute le nombre de réservations pour chaque catway
    for (let catway of catways) {
      const count = await Reservation.countDocuments({ catwayNumber: catway.catwayNumber });
      catway.reservationsCount = count;
    }

    // Variables pour les messages de succès/erreur
    const success = req.query.success === 'true';
    const catwayId = req.query.id;
    const errorMsg = req.query.error;

    res.render('catways', { 
      catways, 
      success, 
      catwayId, 
      errorMsg 
    });
  } catch (err) {
    console.error('Erreur lecture catways :', err);
    res.render('catways', { 
      catways: [], 
      errorMsg: err.message 
    });
  }
});

app.get('/catways/new',auth, (req, res) => {
  res.render('catways-new');
});

app.post('/catways',auth, async (req, res) => {
  try {
    const Catway = require('./models/Catway');
    const newCatway = new Catway({
      catwayNumber: Number(req.body.catwayNumber),
      type: req.body.type,
      catwayState: req.body.catwayState.trim()
    });

    await newCatway.save();
    res.redirect(`/catways?success=true&id=${newCatway._id}`);
  } catch (err) {
    res.redirect(`/catways?success=false&error=${encodeURIComponent(err.message || 'Erreur inconnue')}`);
  }
});

app.get('/catways/:id/edit',auth, async (req, res) => {
  try {
    const Catway = require('./models/Catway');
    const catway = await Catway.findById(req.params.id).lean();

    if (!catway) {
      return res.status(404).render('error', { message: 'Catway non trouvé' });
    }

    res.render('catways-edit', { catway });
  } catch (err) {
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

app.get('/catways/:id',auth, async (req, res) => {
  try {
    const Catway = require('./models/Catway');
    const Reservation = require('./models/Reservation');

    const catway = await Catway.findById(req.params.id).lean();

    if (!catway) {
      return res.status(404).render('error', { message: 'Catway non trouvé' });
    }

    // Récupère toutes les réservations associées à ce catway
    const reservations = await Reservation.find({ catwayNumber: catway.catwayNumber }).lean();

    res.render('catway-details', { 
      catway,
      reservations
    });
  } catch (err) {
    console.error('Erreur détails catway :', err);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

app.delete('/catways/:id',auth, async (req, res) => {
  try {
    const Catway = require('./models/Catway');
    const deleted = await Catway.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Catway non trouvé' });
    }

    res.json({ success: true, message: 'Catway supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/catways/:id',auth, async (req, res) => {
  try {
    const Catway = require('./models/Catway');
    const updated = await Catway.findByIdAndUpdate(
      req.params.id,
      {
        catwayNumber: Number(req.body.catwayNumber),
        type: req.body.type,
        catwayState: req.body.catwayState.trim()
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).render('error', { message: 'Catway non trouvé' });
    }

    res.redirect(`/catways?success=true&message=Catway modifié avec succès`);
  } catch (err) {
    res.redirect(`/catways?success=false&error=${encodeURIComponent(err.message || 'Erreur inconnue')}`);
  }
});

// PATCH /catways/:id (bonus – modification partielle, ex: seulement l'état)
app.patch('/catways/:id',auth, async (req, res) => {
  try {
    const Catway = require('./models/Catway');
    const updated = await Catway.findByIdAndUpdate(
      req.params.id,
      { catwayState: req.body.catwayState },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).render('error', { message: 'Catway non trouvé' });
    }

    res.redirect(`/catways?success=true&message=État modifié`);
  } catch (err) {
    res.redirect(`/catways?error=${encodeURIComponent(err.message)}`);
  }
});

// Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré → http://localhost:${PORT}`);
});