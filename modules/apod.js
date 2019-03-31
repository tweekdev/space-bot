'use strict';

module.exports = {
    sendApod: (config, request, Discord, bot, logger) => {
        try {
            request(`https://api.nasa.gov/planetary/apod?api_key=${config.nasa.apiKey}`, {json: true}, (err, res, body) => {
                if (!body.error) {
                    let explanationApod;
                    if (body.explanation.length >= 1000) {
                        explanationApod = body.explanation.substring(0, 1000) + ' [...]';
                    } else {
                        explanationApod = body.explanation;
                    }

                    let media;
                    let video;
                    if (body.media_type === 'video') {
                        let url = body.url.split('/');
                        video = `https://www.youtube.com/watch?v=${url[4]}`;
                        media = 'http://www.laboiteverte.fr/wp-content/uploads/2015/09/nasa-logo-1280x1059.png';

                    } else {
                        media = body.url;
                    }

                    const apod = new Discord.RichEmbed()
                        .setTitle('New NASA apod incoming')
                        .setAuthor(bot.user.username, bot.user.avatarURL)
                        .setColor(0x73ff60)
                        .setDescription(body.date)
                        .setImage(media)
                        .setTimestamp()
                        .addField(body.title, explanationApod)
                        .addField('Original information', 'https://apod.nasa.gov/apod/astropix.html')
                        .setFooter('Astronomy picture of the day : APOD', 'http://www.laboiteverte.fr/wp-content/uploads/2015/09/nasa-logo-1280x1059.png');

                    bot.channels.get(config.discord.channels.nasaApod).send(`<@&${config.discord.roles.apod}>`).then(
                        bot.channels.get(config.discord.channels.nasaApod).send(apod).then(() => {
                            if (video !== undefined) {
                                bot.channels.get(config.discord.channels.nasaApod).send(video).then(() => {
                                    logger.log(bot, 'Send new Apod', 'success');
                                });
                            } else {
                                logger.log(bot, 'Send new Apod', 'success');
                            }
                        })
                    );
                } else {
                    logger.log(bot, 'No response Apod API', 'error')
                }
            });
        } catch (err) {
            logger.log(bot, {"error": err}, 'error')
        }
    }
};