module.exports = {
  // name: 'auth',
  path: 'keystone/auth.js',
  test: {
    authentication: {
      path: '/auth/login',
      method: 'post',
      tasks: [
        {
          noError: true,
          input: {
            body: {
              username: 'aUserInTest',
              password: 'errorPass'
            }
          },
          output: 'Error password!',
          status: 500
        }, {
          noError: true,
          input: {
            body: {
              username: 'aUserInTest',
              password: 'pass-123'
            }
          },
          output: {
            success: 'login sucess'
          }
        }, {
          noError: true,
          input: {
            body: {
              username: 'aUserInTest',
              password: 'pass-123'
            },
            cookies: {
              'user-id-test-123': {
                project: 'project-002',
                region: 'RegionOne'
              }
            }
          },
          output: {
            success: 'login sucess'
          },
          processedRequest: {
            'cookies': {
              'user-id-test-123': {
                'project': 'project-002',
                'region': 'RegionOne'
              }
            },
            'session': {
              'cookie': {
                'expires': new Date('2016-04-23T05:14:21.664Z')
              },
              'user': {
                'regionId': 'RegionOne',
                'projectId': 'project-002',
                'userId': 'user-id-test-123',
                'token': 'project-token-project-002-123',
                'username': 'aUserInTest',
                'projects': [
                  {
                    'name': 'project1',
                    'id': 'project-001'
                  },
                  {
                    'name': 'project2',
                    'id': 'project-002'
                  }
                ],
                'isAdmin': true
              },
              'endpoint': {
                'glance': {
                  'RegionOne': 'http://23.253.248.171:9292'
                }
              }
            },
            'body': {
              'username': 'aUserInTest',
              'password': 'pass-123'
            }
          }
        }
      ]
    },
    swtichRegion: {
      path: '/auth/switch_region',
      method: 'put',
      tasks: [
        {
          noError: true,
          input: {
            body: {
              region: 'RegionTwo'
            }
          },
          output: {
            success: 'switch region successfully'
          },
          status: 200
        }
      ]
    },
    swtichProject: {
      path: '/auth/switch_project',
      method: 'put',
      tasks: [
        {
          noError: true,
          input: {
            body: {
              projectId: 'project-002'
            }
          },
          output: {
            success: 'switch project successfully'
          }
        }
      ]
    },
    logout: {
      path: '/auth/logout',
      method: 'get',
      tasks: [
        {
          noError: true,
          input: {
            body: {
            }
          },
          output: undefined
        }
      ]
    }
  }
};
