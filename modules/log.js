'use strict';

const dateFormat = require('dateformat');

module.exports = {
    sendLog: (bot, data) => {
        let date = new Date();
        bot.channels.get('418703288486199307').send('`' + dateFormat(date, 'dd-mm-yyyy hh:MM:ss TT') + '` - *' + data + '*');
    }
};