'use strict';

const Discord = require('discord.js');
const config = require('./config');


const express = require('express');
const cors = require('cors');
const request = require('request');
const https = require('https');
const app = express();
app.use(cors());



const bot = new Discord.Client();


bot.on('ready', function () {
    console.log("Je suis connecté !");
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
                msg.channel.send('ah!');
                break;

            case 'setA':
                console.log('coucou');
                let activity = msg.content.split(' ');
                console.log(activity);
                msg.channel.send(activity[1]);
                break;

            case '@Space Bot#3186':
                msg.channel.send('TG');
                break;

            case 'launch':
               request('https://spacelaunchnow.me/3.2.0/launch/upcoming/', {json: true}, (err, res, body) => {
                   if (err) { msg.channel.send(err); }
                   /*msg.channel.send({embed: {
                           color: 3447003,
                           author: {
                               name: bot.user.username,
                               icon_url: bot.user.avatarURL
                           },
                           title: `*${body.count} launch incomming*`,
                           fields: [{
                               name: "Next launch",
                               value: "body.results.name"
                           }],
                           timestamp: new Date(),
                           footer: {
                               icon_url: bot.user.avatarURL,
                               text: "© Example"
                           }
                       }
                   });*/

                   const embed = new Discord.RichEmbed()
                       .setTitle(`*${body.count} launch incomming*`)
                       .setAuthor(bot.user.username, bot.user.avatarURL)
                       .setColor(0x00AE86)
                       .setDescription("This is the main body of text, it can hold 2048 characters.")
                       .setFooter("This is the footer text, it can hold 2048 characters", "http://i.imgur.com/w1vhFSR.png")
                       .setImage("http://i.imgur.com/yVpymuV.png")
                       .setThumbnail("https://www.expressyourselfdesigns.co.uk/ebay/LegoSpace/Logo.jpg")
                       /*
                        * Takes a Date object, defaults to current date.
                        */
                       .setTimestamp()
                       .addField("This is a field title, it can hold 256 characters",
                           "This is a field value, it can hold 1024 characters.")
                       /*
                        * Inline fields may not display as inline if the thumbnail and/or image is too big.
                        */
                       .addField("Inline Field", "They can also be inline.", true)
                       /*
                        * Blank field, useful to create some space.
                        */
                       .addBlankField(true)
                       .addField("Inline Field 3", "You can have a maximum of 25 fields.", true);

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