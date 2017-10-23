const items = [
  {
    'project': 'spectre',
    'name': 'dashboard',
    'branch': {
      'dev': 'master',
      'production': '4.0.4'
    },
    'git': 'git@github.com:unitedstack/spectre.git',
    'directory': 'client/applications'
  },
  {
    'project': 'luna',
    'name': 'login',
    'branch': {
      'dev': 'master',
      'production': '4.0.1'
    },
    'git': 'git@github.com:unitedstack/luna.git',
    'directory': 'client/applications'
  },
  {
    'project': 'medusa',
    'name': 'admin',
    'branch': {
      'dev': 'master',
      'production': '4.0.4'
    },
    'git': 'git@github.com:unitedstack/medusa.git',
    'directory': 'client/applications'
  },
  {
    'project': 'lion',
    'name': 'register',
    'branch': {
      'dev': 'master',
      'production': '4.0.0'
    },
    'git': 'git@github.com:unitedstack/lion.git',
    'directory': 'client/applications'
  },
  {
    'project': 'huskar',
    'name': 'huskar',
    'branch': {
      'dev': 'master',
      'production': '4.0.0'
    },
    'git': 'git@github.com:unitedstack/huskar.git',
    'directory': 'server/drivers'
  },
  {
    'project': 'slardar',
    'name': 'slardar',
    'branch': {
      'dev': 'master',
      'production': '4.0.2'
    },
    'git': 'git@github.com:unitedstack/slardar.git',
    'directory': 'server/api'
  },
  {
    'project': 'tusk',
    'name': 'tusk',
    'branch': {
      'dev': 'master',
      'production': '4.0.1'
    },
    'git': 'git@github.com:unitedstack/tusk.git',
    'directory': 'server/api'
  },
  {
    'project': 'meepo',
    'name': 'meepo',
    'branch': {
      'dev': 'master',
      'production': '4.0.0'
    },
    'git': 'git@github.com:unitedstack/meepo.git',
    'directory': 'server/drivers'
  },
  {
    'project': 'brewmaster',
    'name': 'brewmaster',
    'branch': {
      'dev': 'master',
      'production': '4.0.1'
    },
    'git': 'git@github.com:unitedstack/brewmaster.git',
    'directory': 'server/api'
  },
  {
    'name': 'invoker',
    'git': 'git@github.com:unitedstack/invoker.git',
    'directory': 'server/api'
  },
  {
    'name': 'tiny',
    'git': 'git@github.com:unitedstack/tiny.git',
    'directory': 'server/api'
  },
  {
    'name': 'ticket',
    'git': 'git@github.com:unitedstack/doom.git',
    'directory': 'client/applications'
  },
  {
    'name': 'bill',
    'git': 'git@github.com:unitedstack/viper.git',
    'directory': 'client/applications'
  }
];

const cp = require('child_process');
const path = require('path');
/////

cp.execSync('rm -rf ~/subitems');

const itemFatherDir = path.join('~/subitems');
for(let i = 0; i < items.length; i++) {

  let item = items[i];
  let itemDir = path.join(itemFatherDir, item.name);
  //console.log(itemDir);
  //console.log(cp.spawnSync('rm',['.gitignore'] , {cwd: itemDir}));
  console.log(`CLONEING ${item.name}...`);
  cp.execSync(`git clone ${item.git} ${itemDir}`);

  cp.execSync(`cd ${itemDir} && git tag -d \`git tag -l\` && git filter-branch --prune-empty --tree-filter 'mkdir -p ${item.directory}/${item.name} && git ls-tree --name-only $GIT_COMMIT | xargs -I files mv files ${item.directory}/${item.name}/'` );
  cp.execSync(`cd ${__dirname}`);
  cp.execSync(`git remote add ${item.name} ${itemDir}`);
  cp.execSync(`git fetch ${item.name}`);
  cp.execSync(`git merge ${item.name}/master -m 'merge project ${item.directory}/${item.name}'`);
  cp.execSync(`git remote rm ${item.name}`);
}
