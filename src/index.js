const express = require('express');
const chalk = require('chalk');

const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

const app = express();

app.use(express.static(publicPath));

app.engine('ejs', ejs.renderFile);

app.use(express.static(publicPath));

const appListen = () => new Promise((res) => {
  app.listen(PORT, () => {
    console.log(chalk.greenBright(`Express successfully started on port ${PORT}`));
    res();
  });
});

appListen()
  .then(() => {
    console.log(chalk.greenBright('Application started.'));
  })
  .catch((e) => {
    console.log(chalk.redBright('Application failed to start.'), e);
  });


