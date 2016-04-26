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
    swtichPorject: {
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
          output: {
            success: 'logout sucess'
          }
        }
      ]
    }
  }
};
