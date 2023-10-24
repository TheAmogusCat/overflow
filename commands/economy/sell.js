const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const {getUser, addItemToMarket, getMarketInfo} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell item')
        .setNameLocalizations({
            ru: 'продать'
        })
        .setDescriptionLocalizations({
            ru: 'Продать предмет'
        })
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('Description')
                .setNameLocalizations({
                    ru: 'описание'
                })
                .setDescriptionLocalizations({
                    ru: 'Описание'
                })
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('number')
                .setDescription('Number of item in inventory')
                .setNameLocalizations({
                    ru: 'номер'
                })
                .setDescriptionLocalizations({
                    ru: 'Номер предмета в инвентаре'
                })
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('price')
                .setDescription('Price')
                .setNameLocalizations({
                    ru: 'цена'
                })
                .setDescriptionLocalizations({
                    ru: 'Цена'
                })
                .setRequired(true)),
    async execute(interaction) {
        let user = await getUser(interaction.user.id)
        let item = user.inventory[interaction.options.getInteger('number') - 1]

        if (item === undefined) {
            const embed = new EmbedBuilder()
                .setTitle('Предмет не найден!')
                .setColor("Red")

            await interaction.reply({ embeds: [embed], ephemeral: true })
            return
        }

        await addItemToMarket(item, interaction.user, interaction.options.getString('description'), interaction.options.getInteger('price'))

        const embed = new EmbedBuilder()
            .setTitle(`Вы выставили предмет ${item.name} по цене ${interaction.options.getInteger('price')} Flow Coin!`)
            .setColor("Green")

        await interaction.reply({ embeds: [embed], ephemeral: true })

        let info = await getMarketInfo()

        let channel = await interaction.guild.channels.fetch(info.channelId)
        let message = await channel.messages.fetch(info.messageId)

        let messageEmbed = message.embeds[0]
        if (messageEmbed.data.fields === undefined)
            messageEmbed.data.fields = []
        messageEmbed.data.fields.push({ name: item.name, value: `<@${interaction.user.id}>` + '\n' + interaction.options.getString('description') + '\n*' + interaction.options.getInteger('price') + ' Flow Coin*', inline: true })
        message.components[0]['components'][0]['data']['options'].push({ label: item.name + `  ${interaction.options.getInteger('price')} Flow Coin`, value: `${messageEmbed.data.fields.length}`, description: interaction.options.getString('description')})
        await message.edit({ embeds: [messageEmbed], components: message.components })
    }
}