'use strict';

let second = 0;
let minute = 0;
let hour = 0;
let day = 0;

module.exports = {
    countUptime: () => {
        second++;
        if (second === 60) {
            minute++;
            second = 0;
        }
        if (minute === 60) {
            hour++;
            minute = 0
        }

        if (hour === 24) {
            day++;
            hour = 0
        }
    },
    sendUptime: () => {
        return (`I'm connected since ${day} days, ${hour} hours, ${minute}, minutes and ${second} seconds.`)
    },
    resetUptime: () => {
        second = 0;
        minute = 0;
        hour = 0;
        day = 0;
    }
};