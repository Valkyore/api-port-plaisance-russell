const { agent } = require('./setup');
const { expect } = require('chai');

describe('AUTH', () => {
  it('Connexion utilisateur', async () => {
    const res = await agent.post('/login').send({
      email: 'test@port-russell.fr',
      password: 'PASSWORD_EN_BASE'
    });

    expect([200, 302]).to.include(res.status);
  });
});
