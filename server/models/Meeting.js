const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    host:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    code: {
        type: String,
        required: true,
        unique: true,
        maxLength: 9,
    },
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;