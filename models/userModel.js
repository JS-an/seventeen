var mongoose = require('mongoose')
var moment = require('moment')
var sign = require('../common/sign')

var userSchema = new mongoose.Schema({
  account: {
    type: String
  },
  password: {
    type: String
  },
  nickName: {
    type: String,
    default: ''
  },
  role: {
    type: Number,
    default: 0
  },
  createTime: {
    type: String,
    default: moment().format('YYYY-MM-DD HH:mm:ss')
  },
  token: {
    type: String,
    default: ''
  },
  show: {
    type: Boolean,
    default: false
  },
  github: {
    type: String,
    default: ''
  },
  web: {
    type: String,
    default: ''
  },
  information: {
    type: String,
    default: ''
  },
  head: {
    type: String,
    default: '/static/icon/up.png'
  }
},
{
  versionKey: false
})

userSchema.pre('save', function (next) {
  if (this.isNew) {
    this.createTime = moment().format('YYYY-MM-DD HH:mm:ss')
    this.password = sign.md5(this.password)
  }
  next()
})

userSchema.statics = {
  // 所有用户
  getUserList () {
    return new Promise((resolve, reject) => {
      this.find({}).exec((err, doc) => {
        if (err) {
          reject(err)
        } else {
          resolve(doc)
        }
      })
    })
  },
  // 根据账户寻找
  getUserByAccount (account) {
    return new Promise((resolve, reject) => {
      this.findOne({ account }).exec((err, doc) => {
        if (err) {
          reject(err)
        } else {
          if (doc) {
            resolve(doc)
          } else {
            resolve(false)
          }
        }
      })
    })
  },
  // 得到友链信息
  getLinks () {
    return new Promise((resolve, reject) => {
      this.find({show: true}, {_id: 0, nickName: 1, github: 1, web: 1, account: 1, information: 1, head: 1}).exec((err, doc) => {
        if (err) {
          reject(err)
        } else {
          resolve(doc)
        }
      })
    })
  }
}

userSchema.index({ account: 1 }, { unique: true, sparse: true })

var userModel = mongoose.model('user', userSchema)

module.exports = userModel
