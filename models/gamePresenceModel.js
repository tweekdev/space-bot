const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gamePresenceSchema = new Schema({
    game: String,
    type: String,
});

const gamePresence = mongoose.model('gamePresence', gamePresenceSchema, 'GAME_PRESENCE_COLLECTION');
module.exports = gamePresence;