'use strict';

module.exports = {
    gamePresence : (bot, gamePresenceSchema, logger, messageSay2, messageSay3, msg) => {
        const game = messageSay2.trim();
        let type;
        if (messageSay3 !== undefined) {
            type = messageSay3.trim().toUpperCase();
        } else {
            type = 'PLAYING'
        }

        if (type !== 'PLAYING' && type !== 'WATCHING' && type !== 'STREAMING' && type !== 'LISTENING') {
            msg.reply('Type reference is not valid, activity can\'t be set. Please use Playing, Watching, Streaming, Listening or nothing');
            logger.log(bot, `Bad type request`, 'error', true)

        } else {
            bot.user.setActivity(game, {type: type})
                .then(
                    presence => {
                        const gamePresenceLog = new gamePresenceSchema({
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
    }
};