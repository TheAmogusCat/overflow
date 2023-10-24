const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js')
const { getItems, clearMarket, addItemToMarket, addMarketInfo, editMarketInfo} = require('../../utils/db')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('Market')
        .setNameLocalizations({
            ru: 'магазин'
        })
        .setDescriptionLocalizations({
            ru: 'Магазин'
        }),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Магазин')
            .setColor("LuminousVividPink")

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('buy')
            .setPlaceholder('Выберите товар')

        if ((await getItems()).length > 0) {
            if ((await getItems())[0]['messageId'] !== undefined) {
                const embed = new EmbedBuilder()
                    .setTitle('Сообщение магазина уже создано!')
                    .setColor("Red")

                await interaction.reply({ embeds: [embed], ephemeral: true })
                return
            }
            else {
                let items = await getItems()

                await clearMarket()

                await addMarketInfo({ channelId: '', messageId: '' })

                items.forEach(item => {
                    embed.addFields({
                        name: item.item.name,
                        value: `<@${item.author.id}>` + '\n' + item.description + '\n*' + item.price + ' Flow Coin*',
                        inline: true
                    })

                    selectMenu.addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(item.item.name + `  ${item.price} Flow Coin`)
                            .setDescription(item.description)
                            .setValue(`${items.indexOf(item) + 1}`)
                    )

                    addItemToMarket(item.item, item.author, item.description, item.price)
                })

                const meow = new EmbedBuilder()
                    .setTitle('Сообщение отправлено!')
                    .setColor("Green")

                const row = new ActionRowBuilder().addComponents(selectMenu)

                await interaction.reply({ embeds: [meow], ephemeral: true })

                let message = await interaction.channel.send({ embeds: [embed], components: [row] })

                await editMarketInfo('', { id: 0, channelId: message.channelId, messageId: message.id })
                return
            }
        }

        const meow = new EmbedBuilder()
            .setTitle('Сообщение отправлено!')
            .setColor("Green")

        await interaction.reply({ embeds: [meow], ephemeral: true })

        const row = new ActionRowBuilder().addComponents(selectMenu)

        let message = await interaction.channel.send({ embeds: [embed] })

        await addMarketInfo({ id: 0, channelId: message.channelId, messageId: message.id })
    }
}