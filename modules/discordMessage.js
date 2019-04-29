'use strict';

const request = require('request');
const Discord = require('discord.js');
const {exec} = require('child_process');

const dateFormat = require('dateformat');
const config = require('../config');

const gamePresence = require('./gamePresence');
const logger = require('./log');
const apod = require('./apod');
const launchInfoModule = require('./launchInfo');
const help = require('./help');
const uptime = require('./uptime');
const embedLaunch = require('./embedLaunch');

const LaunchInfoLog = require('../models/launchInfoLogModel');
const gamePresenceSchema = require('../models/gamePresenceModel');

module.exports = {
    onMessage: (bot, msg, prefix) => {
        if (msg.content.toLowerCase().startsWith(`<@${config.discord.botId}> :`)) {
            logger.log(bot, `${msg.author.username} request ${msg.content}`, 'info', true);

            let messageSay = msg.content.split(':');

            switch (messageSay[1].trim()) {
                case 'say':
                    bot.channels.get(messageSay[2].trim()).send(messageSay[3].trim()).then(() => {
                        msg.channel.send('Your request has been successfully sending');
                        logger.log(bot, `Say request has been sending with success`, 'success', true)
                    });
                    break;

                case 'gamePresence':
                    gamePresence.gamePresence(bot, gamePresenceSchema, logger, messageSay[2], messageSay[3], msg);
                    break;

                case 'sendApod':
                    apod.sendApod(config, request, Discord, bot, logger, msg);
                    break;

                case 'watchLaunch':
                    LaunchInfoLog.find().then(launchInfo => {
                        launchInfoModule.launchInfoLog(request, LaunchInfoLog, launchInfo, Discord, bot).then(() => {
                            msg.channel.send('Launch information has been watch successfully')
                        });
                    });
                    break;

                default:
                    msg.channel.send('Sorry, I don\'t understand your request');
                    logger.log(bot, `${msg.author.username} - Bad request - ${msg.content}`, 'error', true);
                    break;
            }
        }


        if (msg.content.toLowerCase().startsWith(prefix)) {
            logger.log(bot, `${msg.author.username} request ${msg.content}`, 'info', true);

            switch (msg.content.toLowerCase()) {
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
                        msg.channel.reply('Sorry, you don\'t have the permission');
                        logger.log(bot, `${msg.author.username} don't have request permission`, 'warning', true)
                    }
                    break;

                case prefix + 'forcereload':
                    exec('pm2 reload app');
                    break;

                case prefix + 'uptime':
                    msg.channel.send(uptime.sendUptime());
                    logger.log(bot, `*Uptime* request has been successfully send`, 'success', true);
                    break;

                case prefix + 'ah':
                    const emojiAh = bot.emojis.find(emoji => emoji.name === "ah");
                    msg.channel.send(`${emojiAh} ah!`).then( () => {
                        logger.log(bot, `*AH!* request has been successfully send`, 'success', true)
                    })
                    break;

                case prefix + 'launch-info':
                    let roleLaunchInfo = msg.guild.roles.get(config.discord.roles.launchInformation);

                    if (msg.member.roles.has(config.discord.roles.launchInformation)) {
                        msg.member.removeRole(config.discord.roles.launchInformation).then(() => {
                            msg.reply(`${msg.author.username}, The role has been successfully removed`).then( () => {
                                logger.log(bot, `*${roleLaunchInfo.name}* role has been successfully removed`, 'success', true)
                            })
                        });
                    } else {
                        msg.member.addRole(config.discord.roles.launchInformation).then(() => {
                            msg.reply(`${msg.author.username}, The role has been successfully added`).then( () => {
                                logger.log(bot, `*${roleLaunchInfo.name}* role has been successfully added`, 'success', true)
                            })
                        });
                    }
                    break;

                case prefix + 'apod':
                    let roleApod = msg.guild.roles.get(config.discord.roles.apod);

                    if (msg.member.roles.has(config.discord.roles.apod)) {
                        msg.member.removeRole(msg.guild.roles.get(config.discord.roles.apod)).then( () => {
                            msg.reply(`${msg.author.username}, The role has been successfully removed`).then( () => {
                                logger.log(bot, `*${roleApod.name}* role has been successfully removed`, 'success', true)
                            })
                        })
                    } else {
                        msg.member.addRole(config.discord.roles.apod).then(() => {
                            msg.reply(`${msg.author.username}, The role has been successfully added`).then( () => {
                                logger.log(bot, `*${roleApod.name}* role has been successfully added`, 'success', true)
                            })
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
    }
};