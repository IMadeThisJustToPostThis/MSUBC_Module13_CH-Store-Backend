const router = require('express').Router();
const apiRoutes = require('./api');

// route the routes with the api endpoint, pulling from the index file in api
router.use('/api', apiRoutes);

// any route that isn't specified returns a blank page with an "error" text
router.use((req, res) => {
  res.send("<h1>Wrong Route!</h1>")
});

module.exports = router;