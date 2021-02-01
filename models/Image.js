const mongoose = require('mongoose');

let imageSchema = new mongoose.Schema({
    processedImagePath: {
        type: String,
        default: null,
    },
    unProcessedImagePath: {
        type: String,
        default: null,
    },
});

let Image = mongoose.model('image', imageSchema);
module.exports = Image;