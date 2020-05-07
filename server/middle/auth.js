module.exports = options => {
    const jwt = require('jsonwebtoken')
    const oUser = require('../models/User')
    const assert = require('http-assert')
    return async (req, res, next) => {
        const token = String(req.headers.authorization || '').split(' ').pop()
        assert(token, 401, '登录已过期')
        try {
            const { id } = jwt.verify(token, req.app.get('secret'))
            // console.log(id)
            assert(id, 401, '账户存在问题！')
            req.user = await oUser.findById(id)
            assert(req.user._id, 401, "登录已过期")
        } catch (error) {
            return res.status(401).send({ message: '登录已过期' })
        }
        // console.log(req.user)
        await next()
    }


}