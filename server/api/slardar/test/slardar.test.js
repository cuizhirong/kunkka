const test = require('ava');

const agent = require('../../../../tests/server_tests/agent');

const testData = {
  projectId: '1f3a2befce114130a121632782adec42',
  serverId: '19c4b6fa-e86c-45dc-a181-1d5725d79017',
  floatingipId: '8ff355d9-d729-4085-91b9-e909056734f6',
  networkId: '19732456-8465-4710-bf6a-421f61c7e5c3',
  portId: '35a06c07-aefa-4a70-b8d1-97930456bdad',
  routerId: '4231f557-5b10-43f8-8403-10ba1c4a3669',
  securityId: 'f309da25-5210-4c5d-8984-a5f4daf39b3f',
  subnetId: '068205d2-44cd-493d-a42d-bd99851d5376',
  volumeId: 'e54e9124-fe6a-4a69-ae36-9d58fa836a87',
  imageId: '40143163-5709-4b96-9a85-0fc79acaa58e'
};

test.before('login as admin', t => {
  return agent.post('/auth/login')
    .send({username: 'admin', password: 'da2d728652d52ec8b09ca1be'});
});

test.before('setup test data', t => {
  return agent.put('/auth/switch_project')
    .send({projectId: testData.projectId});
});

test('Nova: get instance list', t => {
  return agent.get(`/api/v1/${testData.projectId}/servers/detail`)
    .set('REGION', 'RegionOne')
    .then(res => {
      t.is(res.status, 200);
    });
});


test('Nova: get flavors list', t => {
  return agent.get(`/api/v1/${testData.projectId}/flavors/detail`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Nova: get instance detail', t => {
  return agent.get(`/api/v1/${testData.projectId}/servers/${testData.serverId}`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Nova: get VNCConsole', t => {
  return agent.get(`/api/v1/${testData.projectId}/servers/${testData.serverId}/vnc`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 302);
    });
});

test('Nova: get overview', t => {
  return agent.get(`/api/v1/${testData.projectId}/overview`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Nova: get quota', t => {
  return agent.get(`/api/v1/${testData.projectId}/quota/${testData.projectId}`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test.todo('Nova: put quota');

test('Nova: get keypairs', t => {
  return agent.get(`/api/v1/${testData.projectId}/keypairs/detail`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Nova: get host list', t => {
  return agent.get(`/api/v1/${testData.projectId}/os-hypervisors/detail`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Nova: get HostCSV', t => {
  return agent.get(`/api/v1/${testData.projectId}/os-hypervisors/csv`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Neutron: get floatingip list', t => {
  return agent.get(`/api/v1/${testData.projectId}/floatingips`)
    .set('REGION', 'RegionOne')
    .then(res => {
      t.is(res.status, 200);
    });
});


test('Neutron: get floating ip detail', t => {
  return agent.get(`/api/v1/${testData.projectId}/floatingips/${testData.floatingipId}`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Neutron: get network list', t => {
  return agent.get(`/api/v1/networks?tenant_id=${testData.projectId}`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Neutron: get network detail', t => {
  return agent.get(`/api/v1/networks/${testData.networkId}`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Neutron: get port list', t => {
  return agent.get(`/api/v1/${testData.projectId}/ports`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Neutron: get port detail', t => {
  return agent.get(`/api/v1/${testData.projectId}/ports/${testData.portId}`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Neutron: get router list', t => {
  return agent.get(`/api/v1/routers`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Neutron: get router detail', t => {
  return agent.get(`/api/v1/routers/${testData.routerId}`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Neutron: get security', t => {
  return agent.get(`/api/v1/${testData.projectId}/security`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Neutron: get security detail', t => {
  return agent.get(`/api/v1/${testData.projectId}/security/${testData.securityId}`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Neutron: get subnet list', t => {
  return agent.get(`/api/v1/${testData.projectId}/subnets`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Neutron: get subnet detail', t => {
  return agent.get(`/api/v1/${testData.projectId}/subnets/${testData.subnetId}`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

// keystone

test('Keystone: get project list', t => {
  return agent.get(`/api/v1/projects`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

// heat

test('Heat: get stack list', t => {
  return agent.get(`/api/v1/${testData.projectId}/stacks`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

// glance

test('Glance: get image list', t => {
  return agent.get(`/api/v1/images`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Glance: get image detail', t => {
  return agent.get(`/api/v1/images/${testData.imageId}`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Glance: get instance snapshot', t => {
  return agent.get(`/api/v1/instanceSnapshots`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test.todo('Glance: get instance snapshot detail');

test.todo('Glance: update image');


//cinder

test('Cinder: get volume list', t => {
  return agent.get(`/api/v1/${testData.projectId}/volumes/detail`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Cinder: get volume detail', t => {
  return agent.get(`/api/v1/${testData.projectId}/volumes/${testData.volumeId}`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test('Cinder: get snapshot list', t => {
  return agent.get(`/api/v1/${testData.projectId}/snapshots/detail`)
    .set('REGION', 'RegionOne')
    .then((res) => {
      t.is(res.status, 200);
    });
});

test.todo('Cinder: get snapshot detail');
