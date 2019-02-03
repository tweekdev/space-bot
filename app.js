'use strict';

const Discord = require('discord.js');
const config = require('./config');

const dateFormat = require('dateformat');

const express = require('express');
const cors = require('cors');
const request = require('request');
const app = express();
app.use(cors());


const bot = new Discord.Client();


bot.on('ready', function () {
    bot.user.setActivity('T\'es moche Sh0t`', {type: 'STREAMING'})
        .then(
            presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`)
)
.catch(console.error);

    setInterval(() => {
        uptime();
}, 1000);
});

bot.on('message', msg => {
    if (msg.author.id !== '539008508218310678') {

    switch (msg.content) {
        case 'reload':
            if (msg.author.id === '275641123576479745') {
                msg.channel.send('Ok, i\'m reload');
                bot.destroy().then(() => {
                    second = 0;
                minute = 0;
                hour = 0;
                bot.login(config.discord.token).then(() => {
                    console.log('Connected');
                msg.channel.send('I\'m back !');
            });
            });
            } else {
                commandRefused(msg, 'reload');
            }
            break;

        case 'ping':
            msg.reply('pong !');
            break;

        case 'uptime':
            msg.channel.send(uptime());
            break;

        case 'ah!':
            const emojiAh = bot.emojis.find(emoji => emoji.name === "ah");
            msg.channel.send(`${emojiAh} ah!`);
            break;

        case '!%js':
            msg.member.addRole('539445864306049034').then(msg.reply('The role has been added'));
            break;

        case 'launch':
            request('https://spacelaunchnow.me/3.2.0/launch/upcoming/', {json: true}, (err, res, body) => {
                if (err) {
                    msg.channel.send(err);
                }
                let list= [];

            for (let i = 0; i < 5; i++) {
                let dateWindowStartFormat = dateFormat(new Date(body.results[i].window_start), 'dd-mm-yyyy hh:MM TT');
                let dateWindowEndFormat = dateFormat(new Date(body.results[i].window_end), 'dd-mm-yyyy hh:MM TT');

                list.push( '**__' + body.results[i].name + '__ \n ' + body.results[i].rocket.configuration.launch_service_provider + '** \n' +
                    'Pad ' + body.results[i].pad.id + ' at ' + body.results[i].pad.location.name + '\n' +
                    'Mission : ' + body.results[i].mission.name + '\n' +
                    'Orbit : ' + body.results[i].mission.orbit + '\n \n' +
                    'Window start : ' + dateWindowStartFormat + '\n' +
                    'Window end : ' + dateWindowEndFormat + '\n' +
                    body.results[i].slug + '\n \n');
            }

            const embed = new Discord.RichEmbed()
                .setTitle(`*${body.count} planned launch*`)
                .setAuthor(bot.user.username, bot.user.avatarURL)
                .setColor(0x00AE86)
                .setDescription(list)
                .setImage("https://blogs.nasa.gov/Rocketology/wp-content/uploads/sites/251/2015/09/NASA-Space-Launch-System-SLS-ascends-through-clouds.jpg")
                .setTimestamp()
                .addBlankField(true)
                .setFooter("Info from Space Launch Now", "https://daszojo4xmsc6.cloudfront.net/static/home/img/launcher.png");

            msg.channel.send({embed});
    })
}
}
});


bot.on('guildMemberAdd', user => {
    bot.channels.get('401045672964390932').send(user + ' has arrived on the server')
});

bot.on('guildMemberRemove', user => {
    bot.channels.get('401045672964390932').send(user + ' has been left the server')
});


let second = 0;
let minute = 0;
let hour = 0;

function uptime() {
    second++;
    if (second === 60) {
        minute++;
        second = 0;
    }
    if (minute === 60) {
        hour++;
        minute = 0
    }
    return ('I\'m connected since ' + hour + ' hours, ' + minute + ' minutes and ' + second + ' seconds.')
}

function commandRefused(msg, command) {
    msg.channel.send('Command not authorized');
    bot.channels.get('401045672964390932').send('`' + msg.author.tag + '` try to use `' + command + '` command.')
}

bot.login(config.discord.token).then(() => {
    console.log('Connected');
bot.channels.get('401045672964390932').send('Hey guys, I\'m connected');
});