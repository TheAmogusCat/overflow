const { SlashCommandBuilder, StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder} = require('discord.js')
const {getUser, editUser} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mining')
        .setDescription('Mining')
        .setNameLocalizations({
            ru: 'майнинг'
        })
        .setDescriptionLocalizations({
            ru: 'Майнинг'
        })
        .addSubcommand(start =>
            start
                .setName('start')
                .setDescription('Start mining')
                .setNameLocalizations({
                    ru: 'начать'
                })
                .setDescriptionLocalizations({
                    ru: 'Начать майнинг'
                }))
        .addSubcommand(stop =>
            stop
                .setName('stop')
                .setDescription('Stop mining')
                .setNameLocalizations({
                    ru: 'остановить'
                })
                .setDescriptionLocalizations({
                    ru: 'Остановить майнинг'
                }))
        .addSubcommand(show =>
            show
                .setName('show')
                .setDescription('Show')
                .setNameLocalizations({
                    ru: 'показать'
                })
                .setDescriptionLocalizations({
                    ru: 'Показать активные устройства'
                })),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'start') {
            let user = await getUser(interaction.user.id)
            let videocards = user.inventory.filter(a => a.type === 'videocard')

            if (videocards.length === 0) {
                let embed = new EmbedBuilder()
                    .setTitle('У вас нет доступных устройств! :(')
                    .setColor("Red")

                await interaction.reply({ embeds: [embed], ephemeral: true })
                return
            }

            if (videocards.length > 1) {
                let selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('mining_start')

                videocards.forEach(videocard => {
                    selectMenu.addOptions(new StringSelectMenuOptionBuilder()
                        .setValue(videocard.name)
                        .setDescription(videocard.reward + ' USDT в.reward'))
                })

                let row = new ActionRowBuilder().addComponents(selectMenu)

                let embed = new EmbedBuilder()
                    .setTitle('Выберите видеокарту')
                    .setColor("Green")

                await interaction.reply({embeds: [embed], components: [row], ephemeral: true})
                return
            }

            let videocard = videocards[0]

            if (user.mining === undefined)
                user.mining = []

            user.mining.push({videocard: videocard, timestamp: new Date()})

            user.inventory.splice(user.inventory.indexOf(videocard), 1)

            await editUser(user.member, user)

            let embed = new EmbedBuilder()
                .setTitle(`Вы начали майнинг на устройстве ${videocard.name}! :)
Прибыль устройства составляет: ${videocard.reward} USDT в день!
Проверить баланс крипто кошелька можно с помощью команды /crypto balance`)
                .setColor("Green")

            await interaction.reply({embeds: [embed], ephemeral: true})
        }
        else if (interaction.options.getSubcommand() === 'stop') {
            let user = await getUser(interaction.user.id)

            if (user.mining === undefined || user.mining.length === 0) {
                let embed = new EmbedBuilder()
                    .setTitle('У вас нет активных устройств! :(')
                    .setColor("Red")

                await interaction.reply({ embeds: [embed], ephemeral: true })
                return
            }
            else if (user.mining.length > 1) {
                let selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('mining_stop')

                user.mining.forEach(videocard => {
                    selectMenu.addOptions(new StringSelectMenuOptionBuilder()
                        .setValue(videocard.name)
                        .setDescription(videocard.reward + ' USDT в день'))
                })

                let row = new ActionRowBuilder().addComponents(selectMenu)

                let embed = new EmbedBuilder()
                    .setTitle('Выберите устройство')
                    .setColor("LuminousVividPink")

                await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
                return
            }

            let videocard = user.mining[0]

            user.mining.splice(0, 1)

            if (user.crypto === undefined) {
                user.crypto = {
                    USDT: 0.0
                }
            }
            if (videocard.last_check === undefined) {
                videocard.last_check = videocard.timestamp
            }

            let reward = parseFloat((new Date() - videocard.last_check) / 1000 / 60 / 60 / 24)

            user.crypto.USDT = user.crypto.USDT + reward

            await editUser(interaction.user.id, user)

            let embed = new EmbedBuilder()
                .setTitle(`Вы завершили майнинг на устройстве ${videocard.videocard.name}!
Ваша общая прибыль составила: ${(videocard.videocard.reward * (new Date() - videocard.timestamp) / 1000 / 60 / 60 / 24).toFixed(3)} USDT!
Баланс крипто кошелька можно узнать с помощью команды /crypto balance!`)
                .setColor("Green")

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
        else if (interaction.options.getSubcommand() === 'show') {
            let user = await getUser(interaction.user.id)

            if (user.mining === undefined || user.mining.length === 0) {
                let embed = new EmbedBuilder()
                    .setTitle('У вас нет активных устройств! :(')
                    .setColor("Red")

                await interaction.reply({ embeds: [embed], ephemeral: true })
                return
            }

            let embed = new EmbedBuilder()
                .setTitle('Активные устройства')
                .setColor("Green")

            user.mining.forEach(videocard => {
                if (videocard.last_check === undefined)
                    videocard.last_check = videocard.timestamp
                videocard.last_check = (new Date() - videocard.last_check) / 1000 / 60 < 5 ? videocard.last_check : new Date()
                console.log((new Date() - videocard.last_check) / 1000 / 60)
                console.log((videocard.last_check - videocard.timestamp) / 1000 / 60)
                embed.addFields({
                    name: videocard.videocard.name,
                    value: `Общий заработок: ${(videocard.videocard.reward * (new Date() - videocard.last_check) / 1000 / 60 / 60 / 24).toFixed(3)}`
                })
            })

            await editUser(interaction.user.id, user)

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
    }
}