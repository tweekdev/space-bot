'use strict';

let second=0, minute=0, hour=0, day=0;

module.exports = {
    countUptime: () => {
        setInterval( () => {
            second++;
            second > 60 ? (minute++, second=0) : minute > 60 ? (hour++, minute=0) : hour > 24 ? (day++, hour=0) : hour;
        }, 1000);
    },
    sendUptime: () => {
        return `I'm connected since ${day} days, ${hour} hours, ${minute}, minutes and ${second} seconds.`
    },
    logUptime: () => {
        return `UPTIME => ${day} days, ${hour} hours, ${minute}, minutes, ${second} seconds.`
    },
    resetUptime: () => {
        second = 0;
        minute = 0;
        hour = 0;
        day = 0;
    }
};