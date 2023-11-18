const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')
const { getShopItems, clearShop, addShopInfo, addItemToShop, editShopInfo, getItem, getShopInfo, getShopItemByItem,
    editShopItem
} = require('../../utils/db')
const adminRole = require('../../json/config.json').adminRole

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Shop')
        .setNameLocalizations({
            ru: 'магазин'
        })
        .setDescriptionLocalizations({
            ru: 'Магазин'
        })
        .addSubcommand(subcommand =>
            subcommand
                .setName('message')
                .setDescription('Send a shop message')
                .setNameLocalizations({
                    ru: 'сообщение'
                })
                .setDescriptionLocalizations({
                    ru: 'Отправить сообщение магазина'
                }))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add item to shop')
                .setNameLocalizations({
                    ru: 'добавить'
                })
                .setDescriptionLocalizations({
                    ru: 'Добавить предмет в магазин'
                })
                .addStringOption(name =>
                    name
                        .setName('name')
                        .setDescription('Name of an item')
                        .setNameLocalizations({
                            ru: 'название'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Название предмета'
                        })
                        .setRequired(true))
                .addIntegerOption(number =>
                    number
                        .setName('number')
                        .setDescription('Number of items')
                        .setNameLocalizations({
                            ru: 'количество'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Количество предметов'
                        })
                        .setMinValue(0)
                        .setRequired(true))
                .addIntegerOption(price =>
                    price
                        .setName('price')
                        .setDescription('Price')
                        .setNameLocalizations({
                            ru: 'цена'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Цена предмета'
                        })
                        .setMinValue(0)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('replenish')
                .setDescription('Replenish')
                .setNameLocalizations({
                    ru: 'пополнить'
                })
                .setDescriptionLocalizations({
                    ru: 'Пополнить'
                })
                .addStringOption(name =>
                    name
                        .setName('name')
                        .setDescription('Name of an item')
                        .setNameLocalizations({
                            ru: 'название'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Название товара'
                        })
                        .setRequired(true))
                .addIntegerOption(number =>
                    number
                        .setName('number')
                        .setDescription('Number of items')
                        .setNameLocalizations({
                            ru: 'количество'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Количество товара'
                        })
                        .setMinValue(1)
                        .setRequired(true))
                .addIntegerOption(price =>
                    price
                        .setName('price')
                        .setDescription('Price')
                        .setNameLocalizations({
                            ru: 'цена'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Новая цена товара'
                        })
                        .setMinValue(0))
        ),
    async execute(interaction) {
        if (interaction.member.roles.cache.find(a => a.id === adminRole) === undefined) {
            const embed = new EmbedBuilder()
                .setTitle('NEVER GONNA GIVE YOU UP, NEVER GONNA LET YOU DOWN')
                .setColor("LuminousVividPink")
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            })
            return
        }
        if (interaction.options.getSubcommand() === 'message') {
            const orangeEmbed = new EmbedBuilder()
                .setTitle('Магазин электроники')
                .setColor("Orange")

            const whiteEmbed = new EmbedBuilder()
                .setTitle('Продуктовый магазин')
                .setColor("White")

            const greenEmbed = new EmbedBuilder()
                .setTitle('Зоомагазин')
                .setColor("Green")

            if ((await getShopItems('greenShop').length > 0)) {
                if ((await getShopItems('greenShop'))[0]['messageId'] !== undefined) {
                    const embed = new EmbedBuilder()
                        .setTitle('Сообщение магазина уже создано!')
                        .setColor("Red")

                    await interaction.reply({embeds: [embed], ephemeral: true})
                    return
                }
            }

            const meow = new EmbedBuilder()
                .setTitle('Сообщение отправлено!')
                .setColor("Green")

            await interaction.reply({embeds: [meow], ephemeral: true})

            let orangeMessage = await interaction.channel.send({embeds: [orangeEmbed]})
            let whiteMessage = await interaction.channel.send({embeds: [whiteEmbed]})
            let greenMessage = await interaction.channel.send({embeds: [greenEmbed]})

            await addShopInfo({id: 0, channelId: interaction.channel.id, messageId: orangeMessage.id}, 'orangeShop')
            await addShopInfo({id: 0, channelId: interaction.channel.id, messageId: whiteMessage.id}, 'whiteShop')
            await addShopInfo({id: 0, channelId: interaction.channel.id, messageId: greenMessage.id}, 'greenShop')
        }
        else if (interaction.options.getSubcommand() === 'add') {
            let item
            if (interaction.options.getString('name'))
                item = await getItem(1, interaction.options.getString('name'))
            else {
                const embed = new EmbedBuilder()
                    .setTitle('Необходимо указать хотя бы один параметр предмета')
                    .setColor("Red")

                await interaction.reply({embeds: [embed], ephemeral: true})
                return
            }

            if (!item) {
                const embed = new EmbedBuilder()
                    .setTitle('Предмет не найден!')
                    .setColor("Red")

                await interaction.reply({ embeds: [embed], ephemeral: true })
                return
            }

            let description = ['item', 'pet_supplies', 'pet'].includes(item.type) ? item.description : item.reward.btc.toString() + ' BTC в день'
            let shopItem = {
                id: 1,
                item: item,
                description: description,
                count: interaction.options.getInteger('number'),
                price: interaction.options.getInteger('price')
            }
            await addItemToShop(shopItem)

            const embed = new EmbedBuilder()
                .setTitle(`Вы добавили в магазин предмет ${item.name} по цене ${interaction.options.getInteger('price')} Flow Coin!`)
                .setColor("Green")

            await interaction.reply({ embeds: [embed], ephemeral: true })

            let messageType

            if (item.type === 'videocard')
                messageType = 'orangeMessage'
            else if (item.type === 'item')
                messageType = 'whiteMessage'
            else if (['pet', 'pet_supplies'].entries(item.type))
                messageType = 'greenMessage'

            let info = await getShopInfo(messageType.split('Message')[0] + 'Shop')

            let channel = await interaction.guild.channels.fetch(info.channelId)
            let message = await channel.messages.fetch(info.messageId)

            let messageEmbed = message.embeds[0]
            if (messageEmbed.data.fields === undefined)
                messageEmbed.data.fields = []
            messageEmbed.data.fields.push({ name: item.name, value: description + '\n*' + interaction.options.getInteger('price') + ' Flow Coin*\n' + 'Доступно: *' + interaction.options.getInteger('number') + '*', inline: true })
            if (message.components[0] === undefined) {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('shopBuy')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(item.name + `  ${interaction.options.getInteger('price')} Flow Coin`)
                            .setValue(`${messageEmbed.data.fields.length}`)
                            .setDescription(description.slice(0, 100))
                    )

                const row = new ActionRowBuilder().addComponents(selectMenu)

                await message.edit({ embeds: [messageEmbed], components: [row] })
                return
            }
            message.components[0]['components'][0]['data']['options'].push({ label: item.name + `  ${interaction.options.getInteger('price')} Flow Coin`, value: `${messageEmbed.data.fields.length}`, description: description.slice(0, 100) })
            await message.edit({ embeds: [messageEmbed], components: message.components })
        }
        else if (interaction.options.getSubcommand() === 'replenish') {
            let item = await getItem(1, interaction.options.getString('name'))
            console.log(item)
            let shopItem = await getShopItemByItem(item)

            shopItem.count += interaction.options.getInteger('number')

            if (interaction.options.getInteger('price'))
                shopItem.price = interaction.options.getInteger('price')

            await editShopItem(item, shopItem)

            let messageType

            if (item.type === 'videocard')
                messageType = 'orangeMessage'
            else if (item.type === 'item')
                messageType = 'whiteMessage'
            else if (['pet', 'pet_supplies'].entries(item.type))
                messageType = 'greenMessage'

            let info = await getShopInfo(messageType.split('Message')[0] + 'Shop')

            let channel = await interaction.guild.channels.fetch(info.channelId)
            let message = await channel.messages.fetch(info.messageId)

            let embeds = message.embeds[0]['data']['fields'][shopItem.id - 1]
            embeds.value = embeds.value.split('Доступно: *')[0] + 'Доступно: *' + shopItem.count.toString() + '*'

            await message.edit({ embeds: message.embeds, components: message.components })

            const embed = new EmbedBuilder()
                .setTitle(`Товар ${item.name} успешно пополнен!`)
                .setColor("Green")

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
    }
}