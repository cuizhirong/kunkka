module.exports = {
  // name: 'project',
  path: 'keystone/project.js',
  test: {
    getProjectList: {
      path: '/api/v1/projects',
      input: {
        query: {
          page: 2
        }
      },
      output: {
        'projects': [
          {
            'is_domain': false,
            'description': '123',
            'links': {
              'self': 'http://lb.0.example242.ustack.in:5000/v3/projects/2205da28eb1e4e7aa4c1d20a0750c17c'
            },
            'enabled': true,
            'id': '2205da28eb1e4e7aa4c1d20a0750c17c',
            'parent_id': null,
            'domain_id': 'default',
            'name': 'cuizhirong'
          },
          {
            'is_domain': false,
            'description': '',
            'links': {
              'self': 'http://lb.0.example242.ustack.in:5000/v3/projects/2b8990b7c7ff470483e0569f4892862a'
            },
            'enabled': true,
            'id': '2b8990b7c7ff470483e0569f4892862a',
            'parent_id': null,
            'domain_id': 'default',
            'name': 'changyiqun'
          }
        ],
        'projects_links': [
        ]
      }
    }
  }
};
