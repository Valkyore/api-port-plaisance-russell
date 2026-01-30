const auth = require('../middlewares/auth');

router.get('/dashboard', auth, (req, res) => {
  res.render('dashboard');
});
