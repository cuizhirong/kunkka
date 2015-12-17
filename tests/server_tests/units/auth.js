describe('login module: server/api/auth.js', function() {
  var app = require('../../../index'),
    config = require('config'),
    supertest = require('supertest'),
    agent = supertest.agent(app);
  it('admin login should success', function (done) {
    agent.post('/auth/login')
      .send({
        username: 'admin',
        password: 'ustack'
      })
      .end(function (err, res) {
        expect(err).toBeNull();
        expect(res.status).toEqual(200);
        done();
      });
  });
});
