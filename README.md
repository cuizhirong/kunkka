# Halo
Halo is a NodeJS based OpenStack Dashboard. It provides a web dashboad to do interaction between OpenStack services including Nova, Keystone, Swift and so on.


## Uage

1. Get your code ready:
```
git clone git@git.ustack.com:ustack/halo.git --recursive
```

2. Install all the dependencies, and uskin's dependencies
```
npm install
sudo npm install pm2 -g
cd static/uskin
npm install
```

3. Back to the project root directory, generate `config.yml` file
```
cp ./config.yml.sample ./config.yml
```
and then customize your own yml file

4. We provide `pre-commit` hook to check code style before committing, run the command below (optional):
```
./scripts/csc.sh
```

5. Build project and run the node server
```
npm run build
npm start
```
6. Done


## Code Standard

### Commit message formatter

The commit message should contains at least three parts.

1. The summary of the commit. It should be followed by an empty row.
2. The detail information of the commit. (It is optional.)
3. The commit type: (BF|NF|RF|OT|BugFix|NewFeature|ReFactor|Other)
4. The commit's JIRA issue ID.

The maximum characters for each row should be less than 72.

This is an example:
```
Ensure setuptools is somewhat recent
 
Due to bugs in older setuptools version parsing
we need to set a relatively new version of setuptools
so that parsing works better (and/or correctly).

This seems especially important on 2.6 which due to
a busted setuptools (and associated pkg_resources) seems
to be matching against incorrect versions.

Type: BF
Jira: DEVOPS-453
Change-Id: Ib859c7df955edef0f38c5673bd21a4767c781e4a
```

For more information, please visit: http://confluence.ustack.com/pages/viewpage.action?pageId=8753522
