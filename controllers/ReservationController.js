// controllers/reservationController.js
// Version minimale pour que les tests démarrent

const getAllForCatway = (req, res) => {
  res.status(200).json({ message: 'Liste des réservations pour ce catway (placeholder)' });
};

const getById = (req, res) => {
  res.status(200).json({ message: 'Détail d\'une réservation (placeholder)' });
};

const create = (req, res) => {
  res.status(201).json({ message: 'Réservation créée (placeholder)' });
};

const deleteReservation = (req, res) => {
  res.status(200).json({ message: 'Réservation supprimée (placeholder)' });
};

module.exports = {
  getAllForCatway,
  getById,
  create,
  delete: deleteReservation  // 'delete' est un mot clé, on l'exporte comme ça
};