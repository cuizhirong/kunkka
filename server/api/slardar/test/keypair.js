module.exports = {
  // name: 'keypair',
  path: 'nova/keypair.js',
  test: {
    getKeypairList: {
      path: '/api/v1/:projectId/keypairs/detail',
      input: {},
      output: {
        'keypairs': [
          {
            'public_key': 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDDzV3jCTJjI8wthLjLWLHH1Xo29WRTyWxGtqaqGTsMK5gPtRnTOZCNAYWbm4jgCh2GSTrZ3gm+czIsxGk6h2PfloghTYEcSdQbqI/nEcOE9kaXI7aNS0WBMpsyekk+M+vLTS91PTAcIFZU6A0LNebUCb3aq0Ry/qd0fMHs0NasLDig+YgpTIMgZ6LhtKSYQ4/RheBgL2am7Oznw+bY9xLUsAGoxMg9DC9FvE8mJMMASE6cpg5FTtQS36IA9FzgUs8AnjweVvFZ/TClhHw74C/KD2CKbgDe9TnOVlk4qIz4qifjtB2AeWz4RazKfmpXdXAqbjmWg/Amqq7jalF0lJg9 Generated-by-Nova',
            'name': 'longpeng-keypair',
            'fingerprint': '80:17:20:6b:fb:88:85:47:35:0d:ee:41:70:49:68:35'
          }
        ]
      }
    }
  }
};
