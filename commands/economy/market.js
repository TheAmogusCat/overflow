const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const {getUser, addUser, editUser} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('Market')
        .setNameLocalizations(
            {
                ru: 'магазин',
                'es-ES': 'mercado'
            }
        )
        .setDescriptionLocalizations(
            {
                ru: 'Магазин',
                'es-ES': 'Mercado'
            }
        ),
    async execute(interaction) {
        if (!await getUser(interaction.member.id)) {
            await addUser({
                member: interaction.member.id,
                balance: '0',
                experience: '0',
                inventory: []
            })
        }

        let user = await getUser(interaction.member.id)

        let embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle(`Твой баланс: ${user.balance} Flow`)

        await interaction.reply({ embeds: [embed], ephemeral: true })
    }
}