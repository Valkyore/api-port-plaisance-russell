const request = require('supertest');
const app = require('../server');

const agent = request.agent(app);

module.exports = { agent };
