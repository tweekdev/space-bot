const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const apodSchema = new Schema({
    copyright: String,
    explanation: String,
    hdurl: String,
    media_type: String,
    title: String,
    url: String,
});

const apod = mongoose.model('apod', apodSchema, 'APOD_COLLECTION');
module.exports = apod;