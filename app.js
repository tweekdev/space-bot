'use strict';

const mongoose = require('mongoose');
const Discord = require('discord.js');
const config = require('./config');
const embedLaunch = require('./modules/embedLaunch');
const launchInfoModule = require('./modules/launchInfo');

const dateFormat = require('dateformat');

const express = require('express');
const LaunchInfoLog = require('./models/launchInfoLogModel');
const cors = require('cors');
const request = require('request');
const app = express();
app.use(cors());


const bot = new Discord.Client();


bot.on('ready', function () {

    mongoose.connect(config.db.mongoUri, {useNewUrlParser: true,})
        .then(() => {
            console.log('DB SpaceBot connexion established')
        })
        .catch(err => {
            console.log('DB SpaceBot connexion was not established : ' + err)
        });

    bot.user.setActivity('Tyé moche Sh0t`', {type: 'PLAYING'})
        .then(
            presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`)
        )
        .catch(console.error);

    setInterval(() => {
        uptime();
    }, 1000);

    setInterval(() => {

        LaunchInfoLog.find().then(launchInfo => {
            launchInfoModule.launchInfoLog(request, LaunchInfoLog, launchInfo, Discord, bot);
        })
            .catch(console.error);

    }, 3600000)
    /* 3600000 */
});

bot.on('message', msg => {
    if (msg.author.id === '539008508218310678') return;
    if (!msg.guild) return;

    switch (msg.content) {

        case 'reload':
            if (msg.author.id === '275641123576479745') {
                msg.channel.send('Ok, i\'m reload');
                bot.destroy().then(() => {
                    second = 0;
                    minute = 0;
                    hour = 0;
                    day = 0;
                    bot.login(config.discord.token).then(() => {
                        console.log('Connected');
                        msg.channel.send('I\'m back !');
                    });
                });
            } else {
                commandRefused(msg, 'reload');
            }
            break;

        case 'ping':
            msg.reply('pong !');
            break;

        case 'uptime':
            msg.channel.send(uptime());
            break;

        case 'ah!':
            const emojiAh = bot.emojis.find(emoji => emoji.name === "ah");
            msg.channel.send(`${emojiAh} ah!`);
            break;

        case '!%js':
            msg.member.addRole('539445864306049034').then(msg.reply('The role has been added'));
            break;

        case 'launch':
           embedLaunch.embed(dateFormat, request, msg, Discord, bot);
    }
});


bot.on('guildMemberAdd', user => {
    bot.channels.get('401045672964390932').send(user + ' has arrived on the server')
});

bot.on('guildMemberRemove', user => {
    bot.channels.get('401045672964390932').send(user + ' has been left the server')
});


let second = 0;
let minute = 0;
let hour = 0;
let day = 0;

function uptime() {
    second++;
    if (second === 60) {
        minute++;
        second = 0;
    }
    if (minute === 60) {
        hour++;
        minute = 0
    }

    if (hour === 60) {
        day++;
        hour = 0
    }
    return ('I\'m connected since ' + day + ' days, ' + hour + ' hours, ' + minute + ' minutes and ' + second + ' seconds.')
}

function commandRefused(msg, command) {
    msg.channel.send('Command not authorized');
    bot.channels.get('401045672964390932').send('`' + msg.author.tag + '` try to use `' + command + '` command.')
}

function isset(data) {
    return !(data === undefined || data === null || data === 'null')
}

bot.login(config.discord.token).then(() => {
    console.log('Connected');
    bot.channels.get('401045672964390932').send('Hey guys, I\'m connected');
});