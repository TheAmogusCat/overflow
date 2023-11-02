const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const {getUser, addUser} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Inventory')
        .setNameLocalizations({
            ru: 'инвентарь'
        })
        .setDescriptionLocalizations({
            ru: 'Инвентарь'
        }),
    async execute(interaction) {
        let user = await getUser(interaction.user.id)

        if (!user) {
            user = {
                member: interaction.user.id,
                balance: 50,
                experience: 1,
                inventory: []
            }
            await addUser(user)
        }

        let embed = new EmbedBuilder()
            .setTitle('Инвентарь')
            .setColor("Green")

        // TODO: Сделать страницы

        if (user.inventory.length === 0)
            embed.addFields({ name: 'Ваш инвентарь пуст!', value: ' ' })

        user.inventory.forEach(item => {
            if (item.type === 'item')
                embed.addFields({name: user.inventory.indexOf(item) + 1 + '. ' + item.name, value: item.description, inline: true})
            else
                embed.addFields({name: user.inventory.indexOf(item) + 1 + '. ' + item.name, value: `${item.reward} USDT в день`, inline: true})
        })

        await interaction.reply({ embeds: [embed], ephemeral: true })
    }
}