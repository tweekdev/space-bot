'use strict';

module.exports = {
    sendEmbed: (bot, Discord, msg, prefix) => {
        const help = new Discord.RichEmbed()
            .setTitle(`:warning: Help for bot command`)
            .setAuthor(bot.user.username, bot.user.avatarURL)
            .setColor(0x20fc20)
            .setThumbnail("https://thumbs.gfycat.com/UnripeAdoredGrayreefshark-max-1mb.gif")

            .addField('Prefix', 'Send prefix info')
            .addField(prefix + 'help', 'Reply help for bot command')
            .addField(prefix + 'reload', 'Reload API connexion')
            .addField(prefix + 'uptime', 'Send uptime connexion')
            .addField('ah!', 'No word for this shit')
            .addField(prefix + 'launch-info', 'Add or remove launchInfo role')
            .addField(prefix + 'launch', 'Send 5 last programmed launch')
            .addField('@Space Bot : say : { channel id } : { your message }', 'Send message to specify channel')
            .addField('@Space Bot : gamePresence : { Your game } : { Type (Playing, Watching, Streaming, Listening) }', 'Change the game presence status')

            .setTimestamp()
            .addBlankField(true)
            .setFooter("For any problem, contact *Aïna#9471*");


        msg.reply(help).then( () => {

        })
    }
};