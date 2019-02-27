const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const launchInfoLogSchema = new Schema({
    idLaunch: Number,
    enterprise: String,
    mission: String,
    orbit: String,
    windowStart: String,
    windowEnd: String,
});

const LaunchInfoLog = mongoose.model('LaunchInfoLog', launchInfoLogSchema, 'LAUNCH_INFO_LOG_COLLECTION');
module.exports = LaunchInfoLog;