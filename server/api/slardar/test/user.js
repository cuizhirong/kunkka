module.exports = {
  // name: 'user',
  path: 'keystone/user.js',
  test: {
    getUserList: {
      path: '/api/v1/users',
      input: {
        query: {
          limit: 2,
          page: 2
        }
      },
      output: {
        'users': [
          {
            'name': 'admin',
            'links': {
              'self': 'http://lb.0.example242.ustack.in:5000/v3/users/31aa9fca5b4f41409fdea43687d0f08b'
            },
            'domain_id': 'default',
            'enabled': true,
            'email': 'admin@unitedstack.com',
            'id': '31aa9fca5b4f41409fdea43687d0f08b'
          }
        ],
        'users_links': [
          {
            'href': '/api/v1/users?page=1&limit=2',
            'rel': 'prev'
          }
        ]
      }
    }
  }
};
