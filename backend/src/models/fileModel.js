const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    fileType: {
        type: String,
        required: true,
        enum: ['document', 'image', 'video', 'audio', 'spreadsheet', 'earmark']
    },
    size: {
        type: Number,           
        required: true
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        default: null
    },
    url: {
        type: String,
        required: true
    },
    shareLink: {
        type: String,
        default: null
    },
    isPublic: {
        type: Boolean,
        default: false
    },

    deleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
