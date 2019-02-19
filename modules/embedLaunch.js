'use strict';

module.exports = {
    embed: (dateFormat, request, msg, Discord, bot) => {

        function isset(data) {
            return !(data === undefined || data === null || data === 'null')
        }

        request('https://spacelaunchnow.me/3.2.0/launch/upcoming/', {json: true}, (err, res, body) => {
            if (err) {
                msg.channel.send(err);
            }

            if (body.detail === 'Not found.') {
                console.log('No API response');
                msg.channel.send('ERROR: No API response');

            } else {

                let list = [];

                for (let i = 0; i < 5; i++) {

                    let name;
                    let launchServiceProvider;
                    let padId;
                    let padLocation;
                    let dateWindowStartFormat;
                    let mission;
                    let orbit;
                    let dateWindowEndFormat;
                    let slug;

                    if (isset(body.results[i].name)) {
                        name = body.results[i].name;
                    } else {
                        name = '*undefined*';
                    }

                    if (isset(body.results[i].rocket)) {
                        if (isset(body.results[i].rocket.configuration)) {
                            if (isset(body.results[i].rocket.configuration.launch_service_provider)) {
                                launchServiceProvider = body.results[i].rocket.configuration.launch_service_provider;
                            } else {
                                launchServiceProvider = '*undefined*';
                            }
                        } else {
                            launchServiceProvider = '*undefined*';
                        }
                    } else {
                        launchServiceProvider = '*undefined*';
                    }

                    if (isset(body.results[i].pad)) {
                        if (isset(body.results[i].pad.id)) {
                            padId = body.results[i].pad.id;
                        } else {
                            padId = '*undefined*';
                        }

                        if (isset(body.results[i].pad.location.name)) {
                            padLocation = body.results[i].pad.location.name;
                        } else {
                            padLocation = '*undefined*';
                        }
                    } else {
                        padId = '*undefined*';
                        padLocation = '*undefined*';
                    }

                    if (isset(body.results[i].mission)) {
                        if (isset(body.results[i].mission.name)) {
                            mission = 'Mission : ' + body.results[i].mission.name + '\n';
                        } else {
                            mission = 'Mission : ' + '*undefined*' + '\n';
                        }

                        if (isset(body.results[i].mission.orbit)) {
                            orbit = 'Orbit : ' + body.results[i].mission.orbit + '\n \n';
                        } else {
                            orbit = 'Orbit : ' + '*undefined*' + '\n \n';
                        }
                    } else {
                        mission = 'Mission : ' + '*undefined*' + '\n';
                        orbit = 'Orbit : ' + '*undefined*' + '\n \n';
                    }

                    if (isset(body.results[i].window_start)) {
                        dateWindowStartFormat = dateFormat(new Date(body.results[i].window_start), 'dd-mm-yyyy hh:MM TT');
                    } else {
                        dateWindowStartFormat = '*undefined*';
                    }

                    if (isset(body.results[i].window_end)) {
                        dateWindowEndFormat = dateFormat(new Date(body.results[i].window_end), 'dd-mm-yyyy hh:MM TT');
                    } else {
                        dateWindowEndFormat = '*undefined*';
                    }

                    if (isset(body.results[i].slug)) {
                        slug = body.results[i].slug;
                    } else {
                        slug = '*undefined*';
                    }

                    list.push('**__' + name + '__ \n ' + launchServiceProvider + '** \n' +
                        'Pad ' + padId + ' at ' + padLocation + '\n' +
                        mission + orbit +
                        'Window start : ' + dateWindowStartFormat + '\n' +
                        'Window end : ' + dateWindowEndFormat + '\n' +
                        slug + '\n \n');
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
            }
        })
    }
};