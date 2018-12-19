var crypto = require('crypto')
var jwt = require('jsonwebtoken')
var config = require('../config')

// 加密密码
module.exports.md5 = (data) => {
  return crypto.createHash('md5').update(data).digest('hex')
}

// 生成Token
module.exports.signToken = (payload) => {
  return jwt.sign(payload, config.secret, { expiresIn: 604800 })
}

// 验证Token并返回payload
module.exports.verifyToken = (token) => {
  let accountMsg
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      accountMsg = 'overdueToken'
      console.log(err)
    } else {
      accountMsg = decoded
    }
  })
  return accountMsg
}
