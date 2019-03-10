'use strict';

const mongoose = require('mongoose');
const Discord = require('discord.js');
const config = require('./config');
const dateFormat = require('dateformat');
const express = require('express');
const request = require('request');
const { exec } = require('child_process');

const log = require('./modules/log');
const embedLaunch = require('./modules/embedLaunch');
const launchInfoModule = require('./modules/launchInfo');
const help = require('./modules/help');
const apod = require('./modules/apod');
const uptime = require('./modules/uptime');

const LaunchInfoLog = require('./models/launchInfoLogModel');
const gamePresence = require('./models/gamePresenceModel');

const cors = require('cors');
const app = express();
app.use(cors());


const bot = new Discord.Client();

const prefix = config.discord.prefix;

bot.on('ready', () => {
    setInterval(() => {
        uptime.countUptime();
    }, 1000);

    setImmediate( () => {
        LaunchInfoLog.find().then(launchInfo => {
            launchInfoModule.launchInfoLog(request, LaunchInfoLog, launchInfo, Discord, bot);
        })
    });

    setInterval(() => {

        LaunchInfoLog.find().then(launchInfo => {
            launchInfoModule.launchInfoLog(request, LaunchInfoLog, launchInfo, Discord, bot);
        })

    }, 3600000);
    /* 3600000 */

    setInterval(() => {
        if (new Date().getHours() === 9) {
            if (new Date().getMinutes() === 0) {
                apod.sendApod(config, request, Discord, bot, log);
            }
        }
    }, 60000);

});

bot.on('message', msg => {
    if (msg.author.id === config.discord.botId) return;
    if (!msg.guild) return;


    if (msg.content.toLowerCase().startsWith(`<@${config.discord.botId}> :`)) {
        let messageSay = msg.content.split(':');

        switch (messageSay[1].trim()) {
            case 'say':
                bot.channels.get(messageSay[2].trim()).send(messageSay[3].trim()).then(() => {
                    log.sendLog(bot, `${msg.author.name} request to send ${messageSay[3].trim()} in ${messageSay[2].trim()} channel ID`)
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
                                    msg.channel.send(`Activity set to ${presence.game ? presence.game.name : 'none'} with ${type} type`);
                                    log.sendLog(bot, `Activity set to ${presence.game ? presence.game.name : 'none'} with ${type} type`);
                                })
                            }
                        )
                        .catch(console.error);
                }
                break;

            case 'sendApod':
                apod.sendApod(config, request, Discord, bot, log);

                break;

            case 'purge':
                if (msg.author.id === config.discord.ownerId) {
                    if (isset(messageSay[2]) && messageSay[2] !== '') {
                        msg.channel.bulkDelete(parseInt(messageSay[2].trim()) + 1).then( () => {
                            msg.channel.send(`${parseInt(messageSay[2].trim())} message(s) was deleted - this message has been delete in 5 seconds`).then( message => {
                                let secondsDeleted = 4;
                                let countDown = setInterval( () => {
                                    message.edit(`${parseInt(messageSay[2].trim())} message(s) was deleted - this message has been delete in ${secondsDeleted} seconds`).then( () => {
                                        secondsDeleted--;
                                        if (secondsDeleted < 0) {
                                            clearInterval(countDown);
                                            msg.channel.bulkDelete(1).catch( err => {
                                                msg.channel.send(err.message);
                                            });
                                        }
                                    })
                                }, 1000);
                            })
                        }).catch( err => {
                            msg.channel.send(err.message)
                        });
                    } else {
                        msg.reply(`Bad request => \`@bot : purge : <amount>\``);
                    }
                } else {
                    msg.reply('Sorry, you don\'t have permission')
                }

                break;

            case 'temp':
                exec('\'/opt/vc/bin/vcgencmd measure_temp', (stdout) => {
                   msg.channel.send(stdout);
                });

                break;

            default:
                msg.reply(`Sorry, I didn't understand your request. Use \` ${prefix}help \` to know commands`);

                break;
        }
    }


    switch (msg.content.toLowerCase()) {
        case 'prefix':
            msg.channel.send('The command prefix is `' + prefix + '`');

            break;

        case prefix + 'help':
            help.sendEmbed(bot, Discord, msg, prefix);

            break;

        case prefix + 'reload':
            if (msg.author.id === config.discord.ownerId) {
                msg.channel.send('Ok, i\'m reload');
                bot.destroy().then(() => {
                    uptime.resetUptime();
                    bot.login(config.discord.token).then(() => {
                        console.log('Connected');
                        msg.channel.send('I\'m back !');
                    });
                });
            } else {
                commandRefused(msg, 'reload');
            }

            break;

        case prefix + 'uptime':
            msg.channel.send(uptime.sendUptime());

            break;

        case 'ah!':
            const emojiAh = bot.emojis.find(emoji => emoji.name === "ah");
            msg.channel.send(`${emojiAh} ah!`);

            break;

        case prefix + 'launch-info':
            if (msg.member.roles.has(config.discord.roles.launchInformation)) {
                msg.member.removeRole(config.discord.roles.launchInformation).then(msg.reply('The role has been remove'));
            } else {
                msg.member.addRole(config.discord.roles.launchInformation).then(msg.reply('The role has been added'));
            }

            break;

        case prefix + 'launch':
            embedLaunch.embed(dateFormat, request, msg, Discord, bot);

            break;
    }
});


bot.on('guildMemberAdd', user => {
    bot.channels.get(config.discord.channels.welcome).send(user + ' has arrived on the server');
    log.sendLog(bot, user + ' has arrived on the server')
});

bot.on('guildMemberRemove', user => {
    bot.channels.get(config.discord.channels.welcome).send(user + ' has left the server');
    log.sendLog(bot, user + ' has left the server')
});


function commandRefused(msg, command) {
    msg.channel.send('Command not authorized');
    log.sendLog(bot, '`' + msg.author.tag + '` try to use `' + command + '` command.');
}

function isset(data) {
    return !(data === undefined || data === null || data === 'null')
}

bot.login(config.discord.token).then(() => {
    console.log(`Connected on ${bot.user.username}`);
    log.sendLog(bot, 'Connected');

    mongoose.connect(config.db.mongoUri, {useNewUrlParser: true,})
        .then(() => {
            log.sendLog(bot, 'DB SpaceBot connexion established');

            gamePresence.find().sort({_id: -1}).limit(1).then(data => {
                    if (data) {
                        bot.user.setActivity(data[0].game, {type: data[0].type})
                            .then(
                                presence => {
                                    log.sendLog(bot, `Activity set to \`${presence.game ? presence.game.name : 'none'}\``);
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
});