module.exports = app => {
    const mongoose = require('mongoose')
    mongoose.connect('mongodb://127.0.0.1:27017/vue-login', {
        useNewUrlParser: true
    });
    let db = mongoose.connection;
    //通过数据库连接句柄，监听mongoose数据库成功的事件
    db.on('open', function (err) {
        if (err) {
            console.log('数据库连接失败');
            throw err;
        }
        console.log('数据库连接成功')
    })
};

