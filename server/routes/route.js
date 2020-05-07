module.exports = app => {
    const express = require('express')
    const router = express.Router({
        mergeParams: true
    })
    const User = require('../models/User')
    //引入签名模块
    const jwt = require('jsonwebtoken')
    const assert = require('http-assert')
    //引入中间件
    const resource = require('../middle/resource')
    const auth = require('../middle/auth')
    //注册接口
    router.post('/', async (req, res) => {
        assert(req.body.psw1 === req.body.psw2, 422, '两次密码不一致')
        const accountLocal = await User.findOne({ account: req.body.account })
        assert(!accountLocal, 502, "用户已存在")
        const model = {}
        model.account = req.body.account;
        model.psw = req.body.psw1
        await req.Model.create(model)
        res.send(model)
    })

    //查看个人信息
    router.get('/', auth(), async (req, res) => {
        console.log("user", req.user.account)
        // const model = await req.Model.findOne({ account: req.user.account })
        res.send(req.user.account)
    })

    //查看用户是否存在
    app.get('/:account', async (req, res) => {
        const user = req.params.account
        const accountLocal = await User.findOne({ account: user })
        if (accountLocal) {
            res.send(accountLocal)
        } else {
            res.send('')
        }
    })

    //登录接口
    app.post('/login', async (req, res) => {
        const { account, psw } = req.body
        //根据用户名找用户
        const user = await User.findOne({ account }).select('+psw')
        assert(user, 422, '用户不存在')
        //校验密码

        const isValid = require('bcrypt').compareSync(psw, user.psw)
        assert(isValid, 422, '用户名或密码错误')
        //签名返回token
        const token = jwt.sign({
            _id: user._id,
            id: user._id,
            username: user.account
        }, app.get('secret'))
        res.send({ token })
        // res.send('ok')
    })

    app.use('/api/:resource', resource(), router)

    //错误处理函数，全局
    app.use(async (err, req, res, next) => {
        res.status(err.statusCode || 500).send({
            message: err.message
        })
    })

}

