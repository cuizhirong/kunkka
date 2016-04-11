# Halo
Halo is a NodeJS based OpenStack Dashboard. It provides a web dashboad to do interaction between OpenStack services including Nova, Keystone, Swift and so on.

Online Demo: http://10.255.0.77:5000/


## Uage

### Get Started

Get your code ready:
```
git clone git@git.ustack.com:ustack/halo.git --recursive
```

Install all the dependencies
```
npm install
sudo npm install pm2 -g
```

Under the *configs* directory, generate the config file
```
cp ./configs/server.js.sample ./configs/server.js
```
and then customize your own js file

We provide `pre-commit` hook to check code style before committing, run the command below (optional):
```
./scripts/csc.sh
```

Build project and run the node server
```
npm run build
npm start
```

Start websocket server
```
npm run message
```

### Production Mode
Under the production mode, you need to run the build script to generate the static files:
```
npm run build
```
And then, start the server:
```
npm start
```

### Development Mode
If you want to develop under the development mode, you can run the dev script:
```
npm run dev
```
After running, as you save the changes of your code, it will build the code automatically.

By default, the above script will generate the `zh-CN` minified files, which means the web page only serve the Chinese version. However, if you want to specify the specific language, add the parameter like:
```
npm run dev --lang=zh-CN
```
or specify env variable `language`:
```
export language=en
npm run dev
```
Currently, we only support two languages: `en` and `zh-CN`.

Besides, we can also compile specific application as you want by:
```
npm run dev --app=dashboard // dasboard or admin
```

###i18n
In the client side, in order to optimise the size of output files, we need to collect all the languages files, and transpile all of them to a specific language file `lang.json` under the `i18n/client` directory.

While developing, you may need to update the language config file all the time.
Thus, once updated the file, you have to re-transpile the file:
```
npm run transpile --lang=zh-CN
```
Sorry to tell you that we don't provide any watcher tools to execute above script automatically.

### PM2
The node process is hosted by PM2, which means if you want to checkout the logs or do some other stuffs, you need to play with `PM2`:

1. Delete the PM2 process by specifying the id:
```
pm2 delete id
```

2. Checkout the PM2 log:
```
pm2 logs
```

More information:
```
pm2 -h
```


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
