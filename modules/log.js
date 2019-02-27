'use strict';

const config = require('../config.json');
const dateFormat = require('dateformat');

module.exports = {
    sendLog: (bot, data) => {
        let date = new Date();
        bot.channels.get(config.discord.channels.log).send('`' + dateFormat(date, 'dd-mm-yyyy hh:MM:ss TT') + '` - *' + data + '*');
    }
};