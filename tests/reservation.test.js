const { agent } = require('./setup');
const { expect } = require('chai');

let reservationId;

describe('RESERVATIONS', () => {

  it('Créer réservation', async () => {
    const res = await agent.post('/reservations').send({
      catwayNumber: 1,
      clientName: 'Test',
      boatName: 'Boat',
      checkIn: '2025-01-01',
      checkOut: '2025-01-02'
    });

    expect(res.status).to.equal(302);
    reservationId = res.headers.location?.split('/').pop();
  });

  it('Lister réservations', async () => {
    const res = await agent.get('/reservations');
    expect(res.status).to.equal(302);
  });

  it('Détails réservation', async () => {
    const res = await agent.get(`/reservations/${reservationId}`);
    expect(res.status).to.equal(302);
  });

  it('Supprimer réservation', async () => {
    const res = await agent.post(`/reservations/delete/${reservationId}`);
    expect([302, 404]).to.include(res.status);
  });
});
