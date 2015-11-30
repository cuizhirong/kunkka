/**
 * Internal dependencies
 */
var version = require('package.json').version;
/*,
   config = require('config'),
   oauth = require('./oauth');
   */

module.exports = function(app) {


    app.get('/version', function(request, response) {
        response.json({
            version: version
        });
    });

    var auth = require('api/auth');
    auth(app);

    // if (config.isEnabled('oauth')) {
    //     oauth(app);
    // }

    return app;
};