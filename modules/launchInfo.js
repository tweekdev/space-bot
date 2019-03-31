'use strict';

const dateFormat = require('dateformat');
const logger = require('./log');
const config = require('../config.json');
const colors = require('colors');

module.exports = {
    launchInfoLog: (request, LaunchInfoLog, launchInfo, Discord, bot, msg) => {

        function isset(data) {
            return !(data === undefined || data === null || data === 'null')
        }


        request('https://spacelaunchnow.me/3.2.0/launch/upcoming/', {json: true}, (err, res, body) => {

            logger.log(bot, `Space launch api request`, 'info', true);

            if (body.detail === 'Not found.') {
                logger.log(bot, 'No space launch API response', 'error', true);

            } else {

                logger.log(bot, `Space launch api response`, 'success', true);

                if (launchInfo[0] !== undefined && body.results[0].id !== launchInfo[0].idLaunch) {
                    LaunchInfoLog.findOneAndDelete({_id: launchInfo[0]._id})
                        .then(() => {
                            logger.log(bot, 'DB info, we have delete a launch information because the launch has gone', 'info', true);
                        });

                } else {

                    let list = [];

                    for (let i = 0; i < 5; i++) {

                        let name;
                        let launchServiceProvider;
                        let padId;
                        let padLocation;
                        let mission;
                        let orbit;
                        let dateWindowStartFormat;
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
                                mission = 'Mission : ' + body.results[i].mission.name;
                            } else {
                                mission = 'Mission : ' + '*undefined*' + '\n';
                            }

                            if (isset(body.results[i].mission.orbit)) {
                                orbit = 'Orbit : ' + body.results[i].mission.orbit;
                            } else {
                                orbit = 'Orbit : ' + '*undefined*';
                            }
                        } else {
                            mission = 'Mission : ' + '*undefined*';
                            orbit = 'Orbit : ' + '*undefined*';
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

                        if (new Date(body.results[i].net) < new Date(Date.now() + 24 * 60 * 60 * 1000)) {
                            LaunchInfoLog.findOne({idLaunch: body.results[i].id}).then(launchInfoLog => {
                                if (!launchInfoLog) {
                                    let dateWindowStartFormat = dateFormat(new Date(body.results[i].window_start), 'dd-mm-yyyy hh:MM TT');
                                    let dateWindowEndFormat = dateFormat(new Date(body.results[i].window_end), 'dd-mm-yyyy hh:MM TT');

                                    list.push('**__' + name + '__ \n ' + launchServiceProvider + '** \n' +
                                        'Pad ' + padId + ' at ' + padLocation + '\n' +
                                        mission + orbit +
                                        'Window start : ' + dateWindowStartFormat + '\n' +
                                        'Window end : ' + dateWindowEndFormat + '\n' +
                                        slug + '\n \n');

                                    const launchInfoEmbed = new Discord.RichEmbed()
                                        .setTitle(`:warning: LAUNCH INCOMING`)
                                        .setAuthor(bot.user.username, bot.user.avatarURL)
                                        .setColor(0x00AE86)
                                        .setDescription(list)
                                        .setImage("https://blogs.nasa.gov/Rocketology/wp-content/uploads/sites/251/2015/09/NASA-Space-Launch-System-SLS-ascends-through-clouds.jpg")
                                        .setTimestamp()
                                        .addBlankField(true)
                                        .setFooter("Info from Space Launch Now", "https://daszojo4xmsc6.cloudfront.net/static/home/img/launcher.png");

                                    const idLaunch = body.results[i].id;
                                    const enterprise = launchServiceProvider;
                                    const windowStart = dateWindowStartFormat;
                                    const windowEnd = dateWindowEndFormat;

                                    let embedMission = mission + '\n';
                                    let embedOrbit = orbit + '\n \n';

                                    const launchInfo = new LaunchInfoLog({
                                        idLaunch,
                                        enterprise,
                                        embedMission,
                                        embedOrbit,
                                        windowStart,
                                        windowEnd
                                    });

                                    logger.log(bot, JSON.stringify(launchInfo), 'info', false);

                                    launchInfo.save().then(() => {
                                        bot.channels.get(config.discord.channels.infoLaunch).send(`<@&${config.discord.roles.launchInformation}>`)
                                            .then(() => {
                                                bot.channels.get(config.discord.channels.infoLaunch).send(launchInfoEmbed).then(() => {
                                                    logger.log(bot, `Discord embed launch reminder was sending (${name}, ${mission}, ${orbit})`, 'success', true)
                                                });
                                            });
                                    }).catch(err => {
                                        logger.log(bot, err, 'error', false)
                                    });
                                } else {
                                    logger.log(bot, `Launch already save ${JSON.stringify(launchInfoLog)}`, 'info', false)
                                }
                            });
                        } else {
                            logger.log(bot, `Takeoff is not expected within 24 hours (${name}, ${mission}, ${orbit})`, '', false)
                        }
                    }
                }
            }
        });
    }
};