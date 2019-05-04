'use strict';

const mongoose = require('mongoose');
const Discord = require('discord.js');
const config = require('./config');
const express = require('express');
const request = require('request');
const cron = require('node-cron');

const logger = require('./modules/log');
const launchInfoModule = require('./modules/spaceFunctionality/launchInfo');
const apod = require('./modules/spaceFunctionality/apod');
const uptime = require('./modules/uptime');
const discordMessage = require('./modules/discordFunctionality/discordMessage');

const LaunchInfoLog = require('./models/launchInfoLogModel');
const gamePresenceSchema = require('./models/gamePresenceModel');

const cors = require('cors');
const app = express();
app.use(cors());

const bot = new Discord.Client();

const prefix = config.discord.prefix;

bot.on('ready', () => {

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
        apod.sendApod(config, request, Discord, bot, logger);
    })

});

bot.on('message', msg => {
    if (msg.author.id === config.discord.botId) return;
    if (!msg.guild) return;

    discordMessage.onMessage(bot, msg, prefix);
});


bot.on('guildMemberAdd', user => {
    bot.channels.get(config.discord.channels.welcome).send(user + ' has arrived on the server');
    logger.log(bot, `${user} has arrived on the server`, 'info', true)
});

bot.on('guildMemberRemove', user => {
    bot.channels.get(config.discord.channels.welcome).send(user + ' has left the server');
    logger.log(bot, `${user} has left the server`, 'info', true)
});


bot.login(config.discord.token).then(() => {
    uptime.countUptime();
    logger.log(bot, `Connected on ${bot.user.username}`, 'info', true);

    mongoose.connect(config.db.mongoUri, {useNewUrlParser: true,})
        .then(() => {
            logger.log(bot, `SpaceBot database connexion has been established`, 'info', true);

            gamePresenceSchema.find().sort({_id: -1}).limit(1).then(data => {
                    if (data) {
                        bot.user.setActivity(data[0].game, {type: data[0].type})
                            .then(presence => {
                                    logger.log(bot, `Activity set to \`${presence.game ? presence.game.name : 'nothing'}\` `, 'info', true);
                                }
                            )
                            .catch(err => {
                                logger.log(bot, `Activity can't be set ${JSON.stringify(err)}`, 'error', true)
                            });
                    }
                }
            );
        })
        .catch(err => {
            logger.log(bot, `SpaceBot database connexion has not been established ${JSON.stringify(err)}`, 'error', true)
        });
});
