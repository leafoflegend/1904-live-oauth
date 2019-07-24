const express = require('express');
const chalk = require('chalk');
const path = require('path');
const ejs = require('ejs');
const dotenv = require('dotenv');
const axios = require('axios');
const session = require('express-session');
const createSequelizeStore = require('connect-session-sequelize');
const { models, db } = require('./db/index.js');

const SequelizeStore = createSequelizeStore(session.Store);
const { User, Session } = models;

dotenv.config();

const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'terrible secret',
  maxAge: 3 * 60 * 60 * 1000,
  resave: false,
  saveUninitialized: false,
  name: 'SID',
  store: new SequelizeStore({
    db,
    table: 'session',
    extendDefaultFields: (defaults, session) => ({
      data: defaults.data,
      expires: defaults.expires,
      userId: session.userId,
    }),
  }),
}));
app.use(express.static(publicPath));

app.engine('ejs', ejs.renderFile);

app.use(express.static(publicPath));

app.get('/', async (req, res) => {
  if (req.session.userId) {
    const { githubToken } = await User.findByPk(req.session.userId);

    const { data: githubResponse } = await axios.get('https://api.github.com/user', {
      headers: {
        authorization: `token ${githubToken}`,
      },
    });

    res.render(path.join(publicPath, './index.ejs'), {
      user: {
        name: githubResponse.login,
        data: githubResponse,
      },
    });
  } else {
    res.render(path.join(publicPath, './index.ejs'), { user: {} });
  }
});

app.get('/login', (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GH_CLIENT_ID}`);
});

app.get('/github', async (req, res) => {
  const { code } = req.query;

  try {
    const { data: { access_token } } = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GH_CLIENT_ID,
      client_secret: process.env.GH_CLIENT_SECRET,
      code,
    }, {
      headers: {
        accept: 'application/json',
      },
    });

    const user = await User.findOrCreate({
      where: {
        githubToken: access_token,
      },
    });

    req.session.userId = user[0].id;

    res.redirect('/');
  } catch (e) {
    console.log(chalk.redBright('Error communicating with GitHub.'), e);
    res.send(`Error communicating with GitHub. Error: ${e.message}`);
  }
});

app.get('/logout', async (req, res) => {
  const user = await User.findByPk(req.session.userId);
  await user.destroy();
  req.session.destroy(err => {
    if (err) res.sendStatus(500);
    else res.redirect('/');
  });
});

const appListen = () => new Promise(res => {
  app.listen(PORT, () => {
    console.log(chalk.greenBright(`Express successfully started on port ${PORT}`));
    res();
  });
});

db.sync()
  .then(() => {
    console.log(chalk.greenBright('DB Seeded successfully.'));
    return appListen();
  })
  .then(() => {
    console.log(chalk.greenBright('Application started.'));
  })
  .catch((e) => {
    console.log(chalk.redBright('Application failed to start.'), e);
  });


