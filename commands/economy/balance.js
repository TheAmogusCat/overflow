const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const {getUser, addUser, editUser} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Show your balance')
        .setNameLocalizations(
            {
                ru: 'баланс',
                'es-ES': 'balance'
            }
        )
        .setDescriptionLocalizations(
            {
                ru: 'Узнать собственный баланс',
                'es-ES': 'Descubre tu saldo'
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