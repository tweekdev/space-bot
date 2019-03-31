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
const gamePresence = require('./modules/gamePresence');
const purge = require('./modules/purge');

const LaunchInfoLog = require('./models/launchInfoLogModel');
const gamePresenceSchema = require('./models/gamePresenceModel');

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

            if (messageSay[1].trim() === 'say') {
                bot.channels.get(messageSay[2].trim()).send(messageSay[3].trim()).then( () => {
                    msg.channel.send('Your request has been successfully sending');
                    logger.log(bot, `Say request has been sending with success`, 'success', true)
                });
            } else if (messageSay[1].trim() === "gamePresence") {
                gamePresence.gamePresence(bot, gamePresenceSchema, logger, messageSay[2], messageSay[3], msg);

            } else if (messageSay[1].trim() === 'sendApod') {
                apod.sendApod(config, request, Discord, bot, logger);
            } else if (messageSay[1].trim() === 'watchLaunch') {
                LaunchInfoLog.find().then(launchInfo => {
                    launchInfoModule.launchInfoLog(request, LaunchInfoLog, launchInfo, Discord, bot).then( () => {
                        msg.channel.send('Launch information has been watch successfully')
                    });
                });
            } else if (messageSay[1].trim() === 'purge') {
                purge.purge(bot, msg, logger, messageSay[2], config)

            } else if (msg.content.toLowerCase() === 'prefix') {
                msg.channel.send('The command prefix is `' + prefix + '`');
                logger.log(bot, `*Prefix* has been successfully sending`, 'success', true);
            } else if (msg.content.toLowerCase() === prefix + 'help') {
                help.sendEmbed(bot, Discord, msg, prefix);
                logger.log(bot, `*Help* has been successfully sending`, 'success', true);
            } else if (msg.content.toLowerCase() === prefix + 'reload') {
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
            } else if (msg.content.toLowerCase() === prefix + 'reloadForce') {
                exec('pm2 reload app');
            } else if (msg.content.toLowerCase() === prefix + 'uptime') {
                msg.channel.send(uptime.sendUptime());
                logger.log(bot, `*Uptime* request has been successfully send`, 'success', true);
            } else if (msg.content.toLowerCase() === prefix + 'ah!') {
                const emojiAh = bot.emojis.find(emoji => emoji.name === "ah");
                msg.channel.send(`${emojiAh} ah!`);
                logger.log(bot, `*AH!* request has been successfully send`, 'success', true);
            } else if (msg.content.toLowerCase() === prefix + 'launch-info') {
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
            } else if (msg.content.toLowerCase() === prefix + 'launch') {
                embedLaunch.embed(dateFormat, request, msg, Discord, bot);
            } else {
                msg.channel.send('Sorry, I don\'t understand your request');
                logger.log(bot, `${msg.author.username} - Bad request`, 'error', true);
            }

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
