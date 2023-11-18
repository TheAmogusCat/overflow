const config = require('./json/config.json')
const {ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, StringSelectMenuInteraction } = require('discord.js')
const json = require('./json')
const {getMarketItem, getUser, editUser, getMarketInfo, deleteItem, addUser, buyShopItem, getShopItem, getShopInfo,
    getCollectionName
} = require("./utils/db");
const {getCryptoPrice} = require("./utils/getCryptoCurrency");


module.exports = {
    async selectMenu(interaction = new StringSelectMenuInteraction()) {
        if (interaction.customId === 'application') {
            let message
            let channel = interaction.guild.channels.fetch(config.applicationChannel)
            const accept = new ButtonBuilder()
                .setCustomId('acceptApplication')
                .setLabel('Принять')
                .setStyle(ButtonStyle.Success)

            const deny = new ButtonBuilder()
                .setCustomId('denyApplication')
                .setLabel('Отклонить')
                .setStyle(ButtonStyle.Danger)

            const createTicket = new ButtonBuilder()
                .setCustomId('createTicket')
                .setLabel('Создать тикет')
                .setStyle(ButtonStyle.Primary)

            const buttons = new ActionRowBuilder().addComponents(accept, deny, createTicket)

            let fields = await json.getApplication(interaction.member.id)
            fields = fields['fields']
            let avatar = 'https://cdn.discordapp.com/avatars/' + interaction.member.user.id + '/' + interaction.member.user.avatar

            let values = ''

            interaction.values.forEach(e => {
                switch (e) {
                    case 'bars':
                        values += 'Барсик '
                        break
                    case 'grivus':
                        values += 'Гривус24 '
                        break
                    case 'usman':
                        values += 'Усман '
                        break
                    case 'pupsen':
                        values += 'Пупсень '
                        break
                    case 'matordev':
                        values += 'Матордев '
                        break
                    case 'mahjong':
                        values += 'Mahjong '
                        break
                    case 'maodzidun':
                        values += 'Маодзидун '
                        break
                    case 'none':
                        values += 'Никого '
                        break
                }
            })

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({name: interaction.member.displayName, iconURL: avatar})
                .addFields(
                    {name: 'Откуда вы узнали о сервере?', value: fields['server']},
                    {name: 'Напишите всех своих врагов', value: fields['friends']},
                    {name: 'Учавстовали ли вы в рейдах или крашах?', value: fields['raid']},
                    {name: 'Ознакомились с правилами?', value: fields['rules']},
                    {name: 'Знаете ли вы кого нибудь из этого списка?', value: values}
                )

            message = await channel.send({
                embeds: [embed],
                components: [buttons]
            })

            let application = await json.getApplication(interaction.member.id)
            application['messageId'] = message.id
            application['doYouKnowAnyoneFromList'] = interaction.values

            await json.editApplication(interaction.member.id, application)

            await interaction.update({
                content: 'Ваша заявка отправлена на рассмотрение',
                components: [],
                ephemeral: true
            })
        }
        else if (interaction.customId === 'buy') {
            let id = parseInt(interaction.values[0])
            if (id === 0)
                id += 1

            let item = await getMarketItem(id)

            let user = await getUser(interaction.user.id)

            if (!user) {
                user = {
                    member: interaction.user.id,
                    balance: 50,
                    experience: 0,
                    inventory: []
                }
                await addUser(user)
            }

            if (user.balance < item.price) {
                const embed = new EmbedBuilder()
                    .setTitle('У вас недостаточно средств!')
                    .setColor("Red")

                await interaction.reply({ embeds: [embed], ephemeral: true })
                return
            }

            user.inventory.push(item.item)
            user.balance -= item.price
            await editUser(interaction.user.id, user)

            let author = await getUser(item.author.id)

            author.inventory.splice(author.inventory.indexOf(item.item), 1)
            author.balance += item.price
            await editUser(item.author.id, author)

            await deleteItem(item.id)

            let info = await getMarketInfo()

            let message = await interaction.channel.messages.fetch(info.messageId)

            message.embeds[0]['data']['fields'].splice(message.embeds[0]['data']['fields'].indexOf(message.embeds[0]['data']['fields'].find(a => a.value === `<@${item.author.id}>}` + '\n' + item.description + '\n*' + `${item.price} Flow Coin` + '*')), 1)
            message.components[0].components[0].data.options.splice(message.components[0].components[0].data.options.indexOf(message.components[0].components[0].data.options.find(a => a.value === interaction.values[0])), 1)

            if (message.components[0].components[0].data.options.length === 0)
                await message.edit({ embeds: message.embeds, components: [] })
            else
                await message.edit({ embeds: message.embeds, components: message.components })

            const embed = new EmbedBuilder()
                .setTitle('Вы приобрели товар ' + item.item.name + ' за ' + item.price + ' Flow Coin! :)')
                .setColor("Green")

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
        else if (interaction.customId === 'shopBuy') {
            let id = parseInt(interaction.values[0])

            let collectionName = await getCollectionName(interaction.message.id)

            let item = await getShopItem(id, collectionName)

            let user = await getUser(interaction.user.id)

            if (!user) {
                user = {
                    member: interaction.user.id,
                    balance: 50,
                    experience: 0,
                    inventory: []
                }
                await addUser(user)
            }

            if (user.balance < item.price) {
                const embed = new EmbedBuilder()
                    .setTitle('У вас недостаточно средств!')
                    .setColor("Red")

                await interaction.reply({ embeds: [embed], ephemeral: true })
                return
            }

            console.log(item)

            if (item.count === 0) {
                const embed = new EmbedBuilder()
                    .setTitle('Данный товар закончился!')
                    .setColor("Red")

                await interaction.reply({ embeds: [embed], ephemeral: true })
                return
            }

            user.inventory.push(item.item)
            user.balance -= item.price
            await editUser(interaction.user.id, user)

            let author = await getUser('963360526958727219')

            author.balance += item.price
            await editUser('963360526958727219', author)

            await buyShopItem(item)

            let message = interaction.message

            let embeds = message.embeds[0]['data']['fields'][id - 1]

            embeds.value = embeds.value.split('Доступно: *')[0] + 'Доступно: *' + (parseInt(embeds.value.split('Доступно: *')[1]) - 1).toString() + '*'

            await message.edit({ embeds: message.embeds, components: message.components })

            const embed = new EmbedBuilder()
                .setTitle('Вы приобрели товар ' + item.item.name + ' за ' + item.price + ' Flow Coin! :)')
                .setColor("Green")

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
        else if (interaction.customId === 'mining_start') {
            let videocardName = interaction.values[0]
            let user = await getUser(interaction.user.id)
            let videocard = user.inventory.find(a => a.name === videocardName)
            let crypto = interaction.message.components[0].components[0].data.options[0].description.split(' ')[1].toLowerCase()

            if (user.mining === undefined)
                user.mining = []

            user.mining.push({videocard: videocard, crypto: crypto, timestamp: new Date()})

            user.inventory.splice(user.inventory.indexOf(videocard), 1)

            await editUser(user.member, user)

            let reward = videocard.reward[crypto]
            let usdtReward = videocard.reward[crypto] * await getCryptoPrice(crypto)
            console.log(videocard.reward, await getCryptoPrice(crypto))

            let embed = new EmbedBuilder()
                .setTitle(`Вы начали майнинг на устройстве ${videocard.name}! :)
Прибыль устройства составляет: ${reward} ${crypto.toUpperCase()} или ${usdtReward} USDT в день!
Проверить баланс крипто кошелька можно с помощью команды /крипто кошелёк`)
                .setColor("Green")

            await interaction.reply({embeds: [embed], ephemeral: true})
        }
        else if (interaction.customId === 'mining_stop') {
            let user = await getUser(interaction.user.id)

            let videocard = interaction.values[0]

            if (videocard.indexOf('(') !== -1) {
                let counter = 0
                let index = parseInt(videocard.split('(')[1].split(')')[0])
                user.mining.forEach(card => {
                    if (card.videocard.name === videocard.split(' (')[0]) {
                        counter++
                        if (counter === index) {
                            videocard = card
                            return
                        }
                    }
                })
            }
            else
                videocard = user.mining.find(a => a.videocard.name === videocard)

            user.mining.splice(user.mining.indexOf(videocard), 1)
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
    }
}