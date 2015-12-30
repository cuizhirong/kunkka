describe('drivers/keystone', function() {
  var config = require('config')('remote');
  var rewire = require('rewire');
  //use rewire to mock the require and override the private variable request in keystone module
  var keystone = rewire('keystone');
  var request = require('superagent');
  var mock = require('superagent-mocker')(request);
  keystone.__set__('request', request);

  beforeEach(function() {
    mock.clearRoutes();
  })

  it ('unscopedAuth', function(done) {
    mock.post(config.keystone + '/v3/auth/tokens', function(req) {
      return {
        username: req.body.auth.identity.password.user.name,
        password: req.body.auth.identity.password.user.password
      }
    });
    keystone.unscopedAuth('foo', 'bar', function(err, response) {
      expect(response.username).toEqual('foo');
      expect(response.password).toEqual('bar');
      done();
    });
  });

  it ('scopedAuth', function(done) {
    mock.clearRoutes();
    mock.post(config.keystone + '/v3/auth/tokens', function(req) {
      return {
        projectId: req.body.auth.scope.project.id,
        token: req.body.auth.identity.token.id
      }
    });
    keystone.scopedAuth('foof', 'barb', function(err, response) {
      expect(response.projectId).toEqual('foof');
      expect(response.token).toEqual('barb');
      done();
    });
  });

  it ('getUserProjects', function(done) {
    mock.get(config.keystone + '/v3/users/:id/projects', function(req) {
      return {
        userId: req.params.id,
        token: req.headers['x-auth-token']
      }
    });
    keystone.getUserProjects('foo', 'barrrr', function(err, response) {
      expect(response.token).toEqual('barrrr');
      expect(response.userId).toEqual('foo');
      done();
    });
  });
});
