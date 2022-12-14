//TODO:
// make more comments explaining stuff
// change route return variables to more appropriate names based on the response
// add readme
// make video
// push to heroku and github
const express = require('express');
const sequelize = require('./config/connection');
const routes = require('./routes');
// import sequelize connection

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

// sync sequelize models to the database, then turn on the server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });
});

