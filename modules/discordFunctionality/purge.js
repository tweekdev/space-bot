'use strict';

module.exports = {
    purge: (bot, msg, logger, messageSay2, config) => {
        if (msg.author.id === config.discord.ownerId) {
            if (messageSay2 !== undefined && messageSay2 !== '') {
                msg.channel.bulkDelete(parseInt(messageSay2.trim()) + 1).then(() => {

                    msg.channel.send(`${parseInt(messageSay2.trim())} message(s) was deleted - this message has been delete in 5 seconds`).then(message => {

                        logger.log(bot, `${parseInt(messageSay2.trim())} message(s) was deleted in ${msg.channel.name}`, 'info', true);
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
    }
};