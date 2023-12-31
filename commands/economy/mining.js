const { SlashCommandBuilder, StringSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder} = require('discord.js')
const {getUser, editUser} = require("../../utils/db");
const {getCryptoPrice} = require("../../utils/getCryptoCurrency");

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
                })
                .addStringOption(crypto =>
                    crypto
                        .setName('crypto')
                        .setDescription('Crypto')
                        .setNameLocalizations({
                            ru: 'криптовалюта'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Криптовалюта для майнинга'
                        })
                        .addChoices(
                            { name: 'Bitcoin', value: 'btc' },
                            { name: 'Ravencoin', value: 'rvn' },
                            { name: 'Etherium classic', value: 'etc' }
                        )
                        .setRequired(true)))
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
        // TODO: Сделать асик
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
                    .setPlaceholder('Выберите устройство для майнинга')

                let meow = []

                videocards.forEach(videocard => {
                    console.log(videocard)
                    if (meow.find(a => a === videocard.name) === undefined) {
                        meow.push(videocard.name)
                        selectMenu.addOptions(new StringSelectMenuOptionBuilder()
                            .setLabel(videocard.name)
                            .setValue(videocard.name)
                            .setDescription(videocard.reward[interaction.options.getString('crypto')] + ' ' + interaction.options.getString('crypto').toUpperCase() + ' в день'))
                    }
                })

                let row = new ActionRowBuilder().addComponents(selectMenu)

                await interaction.reply({ components: [row], ephemeral: true})
                return
            }

            let videocard = videocards[0]

            if (user.mining === undefined)
                user.mining = []

            user.mining.push({videocard: videocard, crypto: interaction.options.getString('crypto'), timestamp: new Date()})

            user.inventory.splice(user.inventory.indexOf(videocard), 1)

            await editUser(user.member, user)

            let reward = videocard.reward[interaction.options.getString('crypto')]
            let usdtReward = videocard.reward[interaction.options.getString('crypto')] * await getCryptoPrice(interaction.options.getString('crypto'))

            let embed = new EmbedBuilder()
                .setTitle(`Вы начали майнинг на устройстве ${videocard.name}! :)
Прибыль устройства составляет: ${reward.toFixed(5)} ${interaction.options.getString('crypto').toUpperCase()} или ${usdtReward.toFixed(3)} USDT в день!
Проверить баланс крипто кошелька можно с помощью команды /крипто кошелёк`)
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
                    .setPlaceholder('Выберите устройство')

                let videocards = []

                user.mining.forEach(videocard => {
                    if (videocards.find(a => a === videocard.videocard.name)) {
                        let counter = 0
                        videocards.forEach(card => {
                            if (card === videocard.videocard.name)
                                counter++
                        })
                        videocards.push(videocard.videocard.name)
                        videocard.videocard.name = videocard.videocard.name + ' (' + counter + ')'
                    }
                    else
                        videocards.push(videocard.videocard.name)

                    console.log(videocard.videocard.name)

                    selectMenu.addOptions(new StringSelectMenuOptionBuilder()
                        .setLabel(videocard.videocard.name)
                        .setValue(videocard.videocard.name)
                        .setDescription(videocard.videocard.reward[videocard.crypto] + ' ' + videocard.crypto + ' в день'))
                })

                let row = new ActionRowBuilder().addComponents(selectMenu)

                await interaction.reply({ components: [row], ephemeral: true })
                return
            }

            let videocard = user.mining[0]

            user.mining.splice(0, 1)
            user.inventory.push(videocard)

            if (user.crypto === undefined)
                user.crypto = {
                    USDT: 0.0
                }

            if (videocard.last_check === undefined)
                videocard.last_check = videocard.timestamp

            console.log(videocard.videocard.reward[videocard.crypto])
            console.log((new Date() - videocard.last_check) / 1000 / 60 / 60 / 24)

            let reward = videocard.videocard.reward[videocard.crypto] * ((new Date() - videocard.last_check) / 1000 / 60 / 60 / 24)

            user.crypto.USDT = user.crypto.USDT + reward

            await editUser(interaction.user.id, user)

            let embed = new EmbedBuilder()
                .setTitle(`Вы завершили майнинг на устройстве ${videocard.videocard.name}!
Ваша общая прибыль составила: ${(videocard.videocard.reward * (new Date() - videocard.timestamp) / 1000 / 60 / 60 / 24).toFixed(3)} USDT!
Баланс крипто кошелька можно узнать с помощью команды /крипто кошелёк!`)
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

                console.log(videocard)

                if ((new Date() - videocard.last_check) / 1000 / 60 > 5) {
                    videocard.last_check = new Date()

                    let reward = parseFloat((new Date() - videocard.last_check) / 1000 / 60 / 60 / 24)

                    user.crypto.USDT = user.crypto.USDT + reward
                }

                embed.addFields({
                    name: videocard.videocard.name,
                    value: `Общий заработок: ${(videocard.videocard.reward[videocard.crypto] * ((new Date() - videocard.timestamp) / 1000 / 60 / 60 / 24)).toFixed(5)} ${videocard.crypto.toUpperCase()}`
                })
            })

            await editUser(interaction.user.id, user)

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
    }
}