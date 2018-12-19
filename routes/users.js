var Article = require('../controllers/article')
var User = require('../controllers/user')
var express = require('express')
var router = express.Router()
var path = require('path')

/* GET users listing. */

// 判断是否登录
router.get('/', User.isSignIn)

// 文章(article)
router.get('/article', Article.getArticleList)
router.get('/article/:id', Article.getArticle)
router.post('/article/add', User.isAdmin, Article.addArticle)
router.post('/article/del', User.isAdmin, Article.delArticle)
router.post('/article/modify', User.isAdmin, Article.modifyArticle)

// 用户(user)
router.post('/user/register', User.register)
router.post('/user/signin', User.signIn)
router.post('/user/exit', User.exit)
router.get('/user/account', User.getUser)
router.post('/user/updateUser', User.isToken, User.updateUser)
router.post('/user/updateHead', User.isToken, ...User.updateHead)
router.post('/user/updatePassword', User.isToken, User.updatePassword)
// 管理用户
router.get('/user/userList', User.isAdmin, User.getUserList)
router.post('/user/updateUserAll', User.isAdmin, User.updateUserAll)

// 友链(links)
router.get('/links/getLinks', User.getLinks)
router.post('/links/show', User.isToken, User.isShow)

// 图片
router.get('/images/head/:id', (req, res, next) => {
  res.sendFile('/' + req.params.id, {root: path.join(__dirname, '../public/images/head')})
})

module.exports = router
