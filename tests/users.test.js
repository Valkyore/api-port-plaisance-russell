const { agent } = require('./setup');
const { expect } = require('chai');

let userId;

describe('USERS', () => {

  it('Créer utilisateur', async () => {
    const res = await agent.post('/users').send({
      name: 'User Test',
      email: `user_${Date.now()}@test.fr`,
      password: '123456'
    });

    expect(res.status).to.equal(302);
    userId = res.headers.location?.split('/').pop();
  });

  it('Supprimer utilisateur', async () => {
    const res = await agent.post(`/users/delete/${userId}`);
    expect([302, 404]).to.include(res.status);
  });
});
