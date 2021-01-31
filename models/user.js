const mongoose = require('mongoose');

let accountSchema = new mongoose.Schema({
    name: {
        type: String,
        default: null,
    },
    phone: {
        type: String,
        trim: true,
        default: null,
    },
    department: {
        type: String,
        trim: true,
        default: null,
    },
    url: {
        type: String,
        trim: true,
        default: null,
    }
});

let Account = mongoose.model('account', accountSchema);
module.exports = Account;