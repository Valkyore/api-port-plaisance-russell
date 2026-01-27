const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('Catways', () => {
  it('should list all catways on /api/catways GET', (done) => {
    chai.request(server)
      .get('/api/catways')
      .set('Authorization', 'Bearer votre_token_test') // Générez un token test
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        done();
      });
  });
  // Ajoutez pour chaque fonctionnalité (9 au total).
});