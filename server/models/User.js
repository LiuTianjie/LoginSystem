const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    account: { type: String },
    psw: {
        type: String,
        select: false,
        set(val) {
            return require('bcrypt').hashSync(val, 10)
        },
    }
})
module.exports = mongoose.model('User', schema)