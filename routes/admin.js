var express = require('express')
var router = express.Router()

/* GET home page. */
router.use('*', (req, res, next) => {
  let app = req.app
  res.sendFile('/', { root: app.get('views') })
})

module.exports = router
