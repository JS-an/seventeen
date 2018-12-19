var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var mongoose = require('mongoose')
var usersRouter = require('./routes/users')
var adminRouter = require('./routes/admin')
var history = require('connect-history-api-fallback')

var app = express()

// view engine setup
var url = process.env.NODE_ENV === 'production' ? 'mongodb://webUser:13750014932@127.0.0.1:27017/robot' : 'mongodb://127.0.0.1:27017/robot'
mongoose.connect(url, {useNewUrlParser: true, autoIndex: false}, function (err) {
  if (err) {
    console.log(err)
  } else {
    console.log('connect success')
  }
})
app.set('views', path.relative(__dirname, './views/dist'))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(history())

// 前端
app.use(express.static(app.get('views')))

app.use('/api/users', usersRouter)
app.use('/', adminRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500).json({msg: err})
  res.render('views')
})

module.exports = app
