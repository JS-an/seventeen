var mongoose = require('mongoose')
var moment = require('moment')

var articleSchema = new mongoose.Schema({
  title: String,
  cover: String,
  main: String,
  createTime: {type: String, default: moment().format('YYYY-MM-DD HH:mm:ss')},
  updateTime: {type: String, default: moment().format('YYYY-MM-DD HH:mm:ss')}
}, {
  versionKey: false
})

// 中间件
articleSchema.pre('save', function (next) {
  if (this.isNew) {
    this.createTime = moment().format('YYYY-MM-DD HH:mm:ss')
  }
  this.updateTime = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

// 静态方法
articleSchema.statics = {
  modify (id, title, cover, main) {
    this.findOne({_id: id}, function (err, doc) {
      if (err) console.log(err)
      doc.title = title
      doc.cover = cover
      doc.main = main
      doc.save()
    })
  }
}

var articleModel = mongoose.model('article', articleSchema)

module.exports = articleModel
