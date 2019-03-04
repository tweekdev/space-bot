
module.exports = {
    sendApod: (config, request, Discord, bot, log) => {
        request(`https://api.nasa.gov/planetary/apod?api_key=${config.nasa.apiKey}`, {json: true}, (err, res, body) => {

            let explanationApod;
            if (body.explanation.length >= 1000) {
                explanationApod = body.explanation.substring(0, 1000) + ' [...]';
            } else {
                explanationApod = body.explanation;
            }

            const apod = new Discord.RichEmbed()
                .setTitle('New NASA apod incoming')
                .setAuthor(bot.user.username, bot.user.avatarURL)
                .setColor(0x73ff60)
                .setDescription(body.date)
                .setImage(body.url)
                .setTimestamp()
                .addField(body.title, explanationApod)
                .addField('Original information', 'https://apod.nasa.gov/apod/astropix.html')
                .setFooter('Astronomy picture of the day : APOD', 'http://www.laboiteverte.fr/wp-content/uploads/2015/09/nasa-logo-1280x1059.png');

            bot.channels.get(config.discord.channels.nasaApod).send(`<@&${config.discord.roles.apod}>`).then(
                bot.channels.get(config.discord.channels.nasaApod).send(apod).then( () => {
                    log.sendLog(bot, 'Send new Apod');
                })
            );
        });
    }
};