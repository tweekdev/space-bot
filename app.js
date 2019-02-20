'use strict';

const mongoose = require('mongoose');
const Discord = require('discord.js');
const config = require('./config');
const log = require('./modules/log');

const embedLaunch = require('./modules/embedLaunch');
const launchInfoModule = require('./modules/launchInfo');
const help = require('./modules/help');

const dateFormat = require('dateformat');

const express = require('express');
const LaunchInfoLog = require('./models/launchInfoLogModel');
const gamePresence = require('./models/gamePresenceModel');

const cors = require('cors');
const request = require('request');
const app = express();
app.use(cors());


const bot = new Discord.Client();

const tag = '!';

bot.on('ready', function () {

    mongoose.connect(config.db.mongoUri, {useNewUrlParser: true,})
        .then(() => {
            log.sendLog(bot, 'DB SpaceBot connexion established');

            gamePresence.find().sort({_id: -1}).limit(1).then(data => {
                    if (data) {
                        bot.user.setActivity(data[0].game, {type: data[0].type})
                            .then(
                                presence => {
                                    log.sendLog(bot, `Activity set to ${presence.game ? presence.game.name : 'none'}`)
                                }
                            )
                            .catch(console.error);
                    }
                }
            );

        })
        .catch(err => {
            log.sendLog(bot, 'DB SpaceBot connexion was not established : ' + err);
        });

    setInterval(() => {
        uptime();
    }, 1000);

    setImmediate(() => {
        LaunchInfoLog.find().then(launchInfo => {
            launchInfoModule.launchInfoLog(request, LaunchInfoLog, launchInfo, Discord, bot);
        })
    });

    setInterval(() => {

        LaunchInfoLog.find().then(launchInfo => {
            launchInfoModule.launchInfoLog(request, LaunchInfoLog, launchInfo, Discord, bot);
        })

    }, 3600000)
    /* 3600000 */
});

bot.on('message', msg => {
    /*console.log(msg);*/
    if (msg.author.id === '539008508218310678') return;
    if (!msg.guild) return;


    if (msg.content.toLowerCase().startsWith('<@539008508218310678>')) {
        let messageSay = msg.content.split(':');
        console.log(messageSay);

        switch (messageSay[1].trim()) {
            case 'say':
                bot.channels.get(messageSay[2].trim()).send(messageSay[3].trim()).then(() => {
                    log.sendLog(bot, msg.author.name + " request to send `" + messageSay[3].trim() + '` in `' + messageSay[2].trim() + '` channel ID')
                });
                break;

            case 'gamePresence':
                const game = messageSay[2].trim();
                let type;
                if (isset(messageSay[3])) {
                    type = messageSay[3].trim().toUpperCase();
                } else {
                    type = 'PLAYING'
                }

                if (type !== 'PLAYING' && type !== 'WATCHING' && type !== 'STREAMING' && type !== 'LISTENING') {
                    msg.reply('Type reference is not valid, activity can\'t be set. Please use Playing, Watching, Streaming, Listening or nothing')

                } else {

                    bot.user.setActivity(game, {type: type})
                        .then(
                            presence => {
                                const gamePresenceLog = new gamePresence({
                                    game,
                                    type
                                });

                                gamePresenceLog.save().then(() => {

                                    if (presence.game.type === 0) {
                                        type = 'PLAYING'
                                    }
                                    if (presence.game.type === 1) {
                                        type = 'STREAMING'
                                    }
                                    if (presence.game.type === 2) {
                                        type = 'LISTENING'
                                    }
                                    if (presence.game.type === 3) {
                                        type = 'WATCHING'
                                    }
                                    msg.reply(`Activity set to ${presence.game ? presence.game.name : 'none'} with ${type} type`);
                                    log.sendLog(bot, `Activity set to ${presence.game ? presence.game.name : 'none'} with ${type} type`);
                                })
                            }
                        )
                        .catch(console.error);
                }
        }
    }


    switch (msg.content.toLowerCase()) {
        case 'tag':
            msg.channel.send('The command tag is `' + tag + '`');
            break;

        case tag + 'help':
            help.sendEmbed(bot, Discord, msg, tag);
            break;

        case tag + 'reload':
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

        case tag + 'ping':
            msg.reply('pong !');
            break;

        case tag + 'uptime':
            msg.channel.send(uptime());
            break;

        case 'ah!':
            const emojiAh = bot.emojis.find(emoji => emoji.name === "ah");
            msg.channel.send(`${emojiAh} ah!`);
            break;

        case tag + 'js':
            if (msg.member.roles.has('539445519957753866')) {
                msg.member.removeRole('539445519957753866').then(msg.reply('The role has been remove'));
            } else {
                msg.member.addRole('539445519957753866').then(msg.reply('The role has been added'));
            }
            break;

        case tag + 'launchInfo':
            if (msg.member.roles.has('541881113229000704')) {
                msg.member.removeRole('541881113229000704').then(msg.reply('The role has been remove'));
            } else {
                msg.member.addRole('541881113229000704').then(msg.reply('The role has been added'));
            }
            break;

        case tag + 'launch':
            embedLaunch.embed(dateFormat, request, msg, Discord, bot);
            break;
    }
});


bot.on('guildMemberAdd', user => {
    bot.channels.get('401045672964390932').send(user + ' has arrived on the server');
    log.sendLog(bot, user + ' has arrived on the server')
});

bot.on('guildMemberRemove', user => {
    bot.channels.get('401045672964390932').send(user + ' has been left the server');
    log.sendLog(bot, user + ' has been left the server')
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
    log.sendLog(bot, 'Connected');
});