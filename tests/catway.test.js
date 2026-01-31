const { agent } = require('./setup');
const { expect } = require('chai');

let catwayId;

describe('CATWAYS', () => {

  it('Créer catway', async () => {
    const res = await agent.post('/catways').send({
      catwayNumber: 999,
      type: 'long',
      catwayState: 'bon'
    });

    expect(res.status).to.equal(302);
    catwayId = res.headers.location?.split('/').pop();
  });

  it('Lister catways', async () => {
    const res = await agent.get('/catways');
    expect(res.status).to.equal(302);
  });

  it('Détails catway', async () => {
    const res = await agent.get(`/catways/${catwayId}`);
    expect(res.status).to.equal(302);
  });

  it('Modifier état catway', async () => {
    const res = await agent.post(`/catways/${catwayId}`).send({
      catwayState: 'mauvais'
    });
    expect(res.status).to.equal(302);
  });

  it('Supprimer catway', async () => {
    const res = await agent.post(`/catways/delete/${catwayId}`);
    expect([302, 404]).to.include(res.status);
  });
});
