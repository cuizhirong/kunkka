describe('drivers/nova', function() {
  var config = require('config')('remote');
  var rewire = require('rewire');
  //use rewire to mock the require and override the private variable request in nova module
  var nova = rewire('nova');
  var request = require('superagent');
  var mock = require('superagent-mocker')(request);
  nova.__set__('request', request);

  beforeEach(function() {
    mock.clearRoutes();
  })

  it ('listServer', function(done) {
    mock.get(config.nova + '/v2.1/:id/servers/detail', function(req) {
      return {
        projectId: req.params.id,
        token: req.headers['x-auth-token']
      }
    });
    nova.listServer('foo', 'bar', function(err, response) {
      expect(response.projectId).toEqual('foo');
      expect(response.token).toEqual('bar');
      done();
    });
  });
});
