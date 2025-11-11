const mongoose = require('mongoose')

const RecentlyOpenedSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users',required : true},
    NameId: { type: mongoose.Schema.Types.ObjectId, ref: 'files',required : true},
    name: { type: String, required: true},
    path: String,
    fileType: String,
    lastOpened: { type: Date, default: Date.now}

});

module.exports = mongoose.model('RecentlyOpened', RecentlyOpenedSchema)