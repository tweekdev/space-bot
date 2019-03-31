'use strict';

const mongoose = require('mongoose');
const Discord = require('discord.js');
const config = require('./config');
const dateFormat = require('dateformat');
const express = require('express');
const request = require('request');
const cron = require('node-cron');
const { exec } = require('child_process');

const logger = require('./modules/log');
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

    setImmediate(() => {
        LaunchInfoLog.find().then(launchInfo => {
            launchInfoModule.launchInfoLog(request, LaunchInfoLog, launchInfo, Discord, bot);
        })
    });

    cron.schedule('0 * * * *', () => {
        LaunchInfoLog.find().then(launchInfo => {
            launchInfoModule.launchInfoLog(request, LaunchInfoLog, launchInfo, Discord, bot);
        })
    });

    cron.schedule('0 9 * * *', () => {
        apod.sendApod(config, request, Discord, bot, log);
    })

});

bot.on('message', msg => {
    if (msg.author.id === config.discord.botId) return;
    if (!msg.guild) return;

    if (msg.content.toLowerCase().startsWith(`<@${config.discord.botId}> :`) || msg.content.toLowerCase().startsWith(prefix)) {

        logger.log(bot, `${msg.author.username} request ${msg.content}`, 'info', true);

        if (msg.content.toLowerCase().startsWith(`<@${config.discord.botId}> :`)) {
            let messageSay = msg.content.split(':');

            switch (messageSay[1].trim()) {
                case 'say':
                    bot.channels.get(messageSay[2].trim()).send(messageSay[3].trim()).then( () => {
                        msg.channel.send('Your request has been successfully sending');
                        logger.log(bot, `Say request has been sending with success`, 'success', true)
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
                        logger.log(bot, `Bad type request`, 'error', true)

                    } else {
                        bot.user.setActivity(game, {type: type})
                            .then(
                                presence => {
                                    const gamePresenceLog = new gamePresence({
                                        game,
                                        type
                                    });

                                    gamePresenceLog.save()
                                        .then(() => {
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
                                            logger.log(bot, `Activity set to ${presence.game ? presence.game.name : 'none'} with ${type} type`, 'success', true)
                                        })
                                }
                            )
                            .catch(err => {
                                logger.log(bot, `Request error : ${err}`, 'error', true)
                            });
                    }
                    break;

                case 'sendApod':
                    apod.sendApod(config, request, Discord, bot, logger);

                    break;

                case 'watchLaunch':
                    LaunchInfoLog.find().then(launchInfo => {
                        launchInfoModule.launchInfoLog(request, LaunchInfoLog, launchInfo, Discord, bot).then( () => {
                            msg.channel.send('Launch information has been watch successfully')
                        });
                    });

                    break;

                case 'purge':
                    if (msg.author.id === config.discord.ownerId) {
                        if (isset(messageSay[2]) && messageSay[2] !== '') {
                            msg.channel.bulkDelete(parseInt(messageSay[2].trim()) + 1).then(() => {

                                msg.channel.send(`${parseInt(messageSay[2].trim())} message(s) was deleted - this message has been delete in 5 seconds`).then(message => {

                                    logger.log(bot, `${parseInt(messageSay[2].trim())} message(s) was deleted in ${msg.channel.name}`, 'info', true);
                                    setTimeout(() => {
                                        msg.channel.bulkDelete(1).catch(err => {
                                            msg.channel.send(err.message);
                                        });
                                    }, 5000);
                                })
                            }).catch(err => {
                                msg.channel.send(err.message);
                                logger.log(bot, `An error has occurred : ${err}`, 'error', true)
                            });
                        } else {
                            msg.reply(`Bad request => \`@bot : purge : <amount>\``);
                            logger.log(bot, `purge bad request`, 'info', true)
                        }
                    } else {
                        msg.reply('Sorry, you don\'t have permission');
                        logger.log(bot, `${msg.author.username} don't have this request permission`, 'warning', true)
                    }

                    break;

                default:
                    msg.channel.send('Sorry, I don\'t understand your request');
                    logger.log(bot, `${msg.author.username} - Bad request`, 'error', true);

                    break;
            }
        }


        switch (msg.content.toLowerCase()) {
            case 'prefix':
                msg.channel.send('The command prefix is `' + prefix + '`');
                logger.log(bot, `*Prefix* has been successfully sending`, 'success', true);

                break;

            case prefix + 'help':
                help.sendEmbed(bot, Discord, msg, prefix);
                logger.log(bot, `*Help* has been successfully sending`, 'success', true);

                break;

            case prefix + 'reload':
                if (msg.author.id === config.discord.ownerId) {
                    msg.channel.send('Ok, i\'m reload');
                    logger.log(bot, `*Reload* engage`, 'success', true);
                    bot.destroy().then(() => {
                        uptime.resetUptime();
                        bot.login(config.discord.token).then(() => {
                            logger.log(bot, `*Reloading* has been successfully done`, 'success', true);
                            msg.channel.send('I\'m back !');
                        });
                    });
                } else {
                    logger.log(bot, `${msg.author.username} don't have this request permission`, 'warning', true)
                }

                break;

            case prefix + 'uptime':
                msg.channel.send(uptime.sendUptime());
                logger.log(bot, `*Uptime* request has been successfully send`, 'success', true);

                break;

            case 'ah!':
                const emojiAh = bot.emojis.find(emoji => emoji.name === "ah");
                msg.channel.send(`${emojiAh} ah!`);
                logger.log(bot, `*AH!* request has been successfully send`, 'success', true);

                break;

            case prefix + 'launch-info':
                let role = msg.guild.roles.get(config.discord.roles.launchInformation);

                if (msg.member.roles.has(config.discord.roles.launchInformation)) {
                    msg.member.removeRole(config.discord.roles.launchInformation).then(() => {
                        msg.reply(`${msg.author.username}, The role has been successfully removed`);
                        logger.log(bot, `*${role.name}* role has been successfully removed`, 'success', true)
                    });
                } else {
                    msg.member.addRole(config.discord.roles.launchInformation).then( () => {
                        msg.reply(`${msg.author.username}, The role has been successfully added`);
                        logger.log(bot, `*${role.name}* role has been successfully added`, 'success', true)
                    });
                }

                break;

            case prefix + 'launch':
                embedLaunch.embed(dateFormat, request, msg, Discord, bot);

                break;

            default:
                msg.channel.send('Sorry, I don\'t understand your request');
                logger.log(bot, `${msg.author.username} - Bad request`, 'error', true);

                break;
        }
    }
});


bot.on('guildMemberAdd', user => {
    bot.channels.get(config.discord.channels.welcome).send(user + ' has arrived on the server');
    logger.log(bot, `${user} has arrived on the server`, 'info', true)
});

bot.on('guildMemberRemove', user => {
    bot.channels.get(config.discord.channels.welcome).send(user + ' has left the server');
    logger.log(bot, `${user} has left the server`, 'info', true)
});

function isset(data) {
    return !(data === undefined || data === null || data === 'null')
}

bot.login(config.discord.token).then(() => {
    logger.log(bot, `Connected on ${bot.user.username}`, 'info', true);

    mongoose.connect(config.db.mongoUri, {useNewUrlParser: true,})
        .then(() => {
            logger.log(bot, `SpaceBot database connexion has been established`, 'info', true);

            gamePresence.find().sort({_id: -1}).limit(1).then(data => {
                    if (data) {
                        bot.user.setActivity(data[0].game, {type: data[0].type})
                            .then(presence => {
                                    logger.log(bot, `Activity set to \`${presence.game ? presence.game.name : 'none'}\``, 'info', true);
                                }
                            )
                            .catch( err => {
                                logger.log(bot, `Activity can't be set ${ {"err": err} }`, 'error', true)
                            });
                    }
                }
            );

        })
        .catch(err => {
            logger.log(bot, `SpaceBot database connexion has been established ${ {"err": err} }`, 'error', true)
        });
});
