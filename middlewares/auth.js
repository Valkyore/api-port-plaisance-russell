const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.redirect('/');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'cle_tres_longue_et_secrète'
    );

    req.user = decoded; // { id: ... }
    next();
  } catch (err) {
    res.clearCookie('jwt');
    return res.redirect('/');
  }
};

module.exports = auth;
