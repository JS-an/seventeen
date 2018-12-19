var User = require('../models/userModel')
var sign = require('../common/sign')
var fs = require('fs')
var path = require('path')
var multer = require('multer')

// 注册
module.exports.register = (req, res, next) => {
  User.getUserByAccount(req.body.account)
    .then((doc) => {
      if (doc) {
        throw new Error('账户已存在')
      } else {
        let data = new User(req.body)
        data.save((err) => {
          if (err) {
            console.log(err)
          }
          res.send(true)
        })
      }
    })
    .catch((err) => {
      res.send(err.message)
    })
}

// 登录
module.exports.signIn = (req, res, next) => {
  let data = req.body
  User.getUserByAccount(data.account)
    .then((doc) => {
      return signInAccount(doc, data)
    })
    .then(({doc, token}) => {
      let {account, role, head} = doc
      res.cookie('token', token, { httpOnly: true, maxAge: 604800000 })
      res.json({account, role, head})
    })
    .catch((err) => {
      res.send(err.message)
    })
}

// 退出账号
module.exports.exit = (req, res, next) => {
  User.getUserByAccount(req.body.account)
    .then((doc) => {
      res.clearCookie('token', { httpOnly: true })
      doc.token = ''
      doc.save()
      res.send('退出成功')
    })
    .catch((err) => {
      console.log(err)
    })
}

// 个人信息
// 得到用户信息
module.exports.getUser = (req, res, next) => {
  User.getUserByAccount(req.query.account)
    .then((doc) => {
      let {account, github, web, nickName, information} = doc
      res.json({account, github, web, nickName, information})
    })
    .catch((err) => {
      console.log(err)
    })
}

// 更新头像且更改文件名

module.exports.updateHead = [
  multer({storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/images/head'))
    },
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`)
    }
  })}).single('file'),
  (req, res, next) => {
    let data = JSON.parse(req.body.account)
    fs.rename(path.join(__dirname, `../public/images/head/${req.file.originalname}`), path.join(__dirname, `../public/images/head/${data}.jpg`), (err) => {
      if (err) {
        console.log(err)
      }
      console.log('1')
    })
    User.getUserByAccount(data)
      .then((doc) => {
        doc.head = `http://159.138.26.196/api/users/images/head/${data}.jpg`
        doc.save()
        console.log('2')
        res.end()
      })
  }
]

// 更新用户信息
module.exports.updateUser = (req, res, next) => {
  let data = req.body
  User.getUserByAccount(data.account)
    .then((doc) => {
      doc.github = data.github
      doc.web = data.web
      doc.nickName = data.nickName
      doc.information = data.information
      doc.save()
      res.send('修改成功')
    })
    .catch((err) => {
      console.log(err)
    })
}

// 修改用户密码
module.exports.updatePassword = (req, res, next) => {
  User.getUserByAccount(req.body.account)
    .then((doc) => {
      if (doc.password === sign.md5(req.body.oldpsw)) {
        doc.password = sign.md5(req.body.newpsw)
        doc.save()
        res.end()
      } else {
        res.send(1)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

// 管理信息
// 得到用户列表
module.exports.getUserList = (req, res, next) => {
  User.getUserList()
    .then(doc => {
      res.json(doc)
    })
    .catch(err => {
      console.log(err)
    })
}

// 更新用户全部信息
module.exports.updateUserAll = (req, res, next) => {
  let {user, newAccount} = req.body
  User.getUserByAccount(user.account) // 因为有可能改用户名，所以不能是更改后上传上来的用户名
    .then(doc => {
      Object.assign(doc, user)
      doc.account = newAccount
      doc.save()
      res.end()
    })
}

// 状态信息
// get判断是否登录
module.exports.isSignIn = (req, res, next) => {
  let accountMsg = isRole(req)
  if (accountMsg) {
    // 更新token
    User.getUserByAccount(accountMsg.account)
      .then((doc) => {
        let {account, role, head} = doc
        let newToken = sign.signToken({account, role, head})
        res.cookie('token', newToken, { httpOnly: true, maxAge: 604800000 })
        doc.token = newToken
        doc.save()
        res.json(accountMsg)
      })
      .catch(err => {
        console.log(err)
      })
  } else {
    res.end()
  }
}

// token是否正确
module.exports.isToken = (req, res, next) => {
  let accountMsg = isRole(req)
  if (accountMsg.role === 0 || accountMsg.role === 1) {
    next()
  } else {
    res.send(accountMsg)
  }
}

// 是否为管理员
module.exports.isAdmin = (req, res, next) => {
  let accountMsg = isRole(req)
  if (accountMsg.role === 1) {
    console.log('你是管理员')
    next()
  } else {
    console.log('你不是管理员')
    res.send('你不是管理员')
  }
}

// 判断token与管理员等级
function isRole (req) {
  let token = req.cookies.token
  if (token) {
    let accountMsg = sign.verifyToken(token)
    if (accountMsg === 'overdueToken') {
      console.log('token已过期,要跳转')
      return false
    } else {
      console.log('token正确,角色等级为' + accountMsg.role)
      return accountMsg
    }
  } else {
    console.log('用户未登录,要跳转')
    return false
  }
}

// 账户密码检测并返回doc and Token
function signInAccount (doc, data) {
  if (doc.password === sign.md5(data.password)) {
    let {account, role, head} = doc
    let token = sign.signToken({account, role, head})
    doc.token = token
    doc.save()
    return {doc, token}
  } else {
    throw new Error('密码错误')
  }
}

// Links
// 得到友链
module.exports.getLinks = (req, res, next) => {
  User.getLinks()
    .then((doc) => {
      res.json(doc)
    })
    .catch((err) => {
      console.log(err)
    })
}

// 是否展示链接
module.exports.isShow = (req, res, next) => {
  User.getUserByAccount(req.body.account)
    .then((doc) => {
      doc.show = !doc.show
      doc.save()
      res.end()
    })
    .catch((err) => {
      console.log(err)
    })
}
