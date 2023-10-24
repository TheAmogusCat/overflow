const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const {getUser} = require("../../utils/db");

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

        let embed = new EmbedBuilder()
            .setTitle('Инвентарь')
            .setColor("Green")

        user.inventory.forEach(item => {
            console.log(item)
            if (item.type === 'item')
                embed.addFields({name: user.inventory.indexOf(item) + 1 + '. ' + item.name, value: item.description, inline: true})
            else
                embed.addFields({name: user.inventory.indexOf(item) + 1 + '. ' + item.name, value: `${item.hash_rate} Mh/s`, inline: true})
        })

        await interaction.reply({ embeds: [embed], ephemeral: true })
    }
}