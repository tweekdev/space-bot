'use strict';

const config = require('../config.json');
const dateFormat = require('dateformat');
const colors = require('colors');

module.exports = {
    log: (bot, data, type, logDiscord) => {
        if (logDiscord) {
            bot.channels.get(config.discord.channels.log).send('`' + dateFormat(Date(), 'dd-mm-yyyy hh:MM:ss TT') + '` - *' + data + '*');
        }

        if (type === 'info') {
            console.log(colors.blue(Date().toUpperCase() + ' : ' + data.toUpperCase()))
        } else if (type === 'success') {
            console.log(colors.green(Date().toUpperCase() + ' : ' + data.toUpperCase()))
        } else if (type === 'error') {
            console.log(colors.red(Date().toUpperCase() + ' : ' + data.toUpperCase()))
        } else if (type === 'warning') {
            console.log(colors.yellow(Date().toUpperCase() + ' : ' + data.toUpperCase()))
        } else {
            console.log(Date().toUpperCase() + ' : ' + data.toUpperCase())
        }
    }
};