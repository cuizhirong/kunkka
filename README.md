# Halo
Halo is a NodeJS based OpenStack Dashboard. It provides a web dashboad to do interaction between OpenStack services including Nova, Keystone, Swift and so on.

## Usage

### Get Started

Get your code ready:
```
git clone git@github.com:unitedstack/halo.git --recursive
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

### i18n
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

### Scripts

#### build the front-end code, i18n and configs
```
npm run build
```

#### run the node instance using pm2
```
npm start
```

#### restart the current node instance
```
npm restart
```

#### run the test
```
npm test
```

#### run the JavaScript eslint check
```
npm run eslint
```

#### run front-end dev mode
```
npm run dev
```

#### install uskin sub module
```
npm run prepublish
```

#### generate i18n files
```
npm run transpile
```

#### assemble all projects to halo based on kunkka/config.json or whatever/config.json
```
npm run assemble
```

#### update the latest code for each project in halo
```
npm run pull
```

#### merge the configs from each project to halo/configs/server.json
```
npm run merge
```

#### fetch all projects's newest tag and write into kunkka/config.json or whatever/config.json
You need to copy halo/token.json.sample to halo/token.json and insert your owner gitlab token
```
npm run release
```

### tag all projects if project has new commits. Then push new tags to remote
```
npm run tags
```

### add eslint hook to all projects
```
npm run add_eslint
```

## Code Convention

Before development, please read over Halo [Code Convention](./CODE_CONVENTION.md).

## Contribution

Halo welcome every friend who wants to contribute the code, please read over [CONTRIBUTING](./CONTRIBUTING.md) first.

## Change Log

Please visit [Change Log](./CHANGELOG.md).
