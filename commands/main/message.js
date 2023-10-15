const { ActionRowBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('message')
        .setDescription('Send message about verification'),
    async execute(interaction) {
        const application = new ButtonBuilder()
            .setCustomId('application')
            .setLabel('Подать заявку')
            .setStyle(ButtonStyle.Success)

        const button = new ButtonBuilder()
            .setCustomId('code')
            .setLabel('Пройти с кодом')
            .setStyle(ButtonStyle.Success)

        const row = new ActionRowBuilder()
            .addComponents(application, button)

        await interaction.channel.send({
            content: 'Подать заявку на верификацию можно кнопкой ниже',
            components: [row]
        })

        await interaction.reply({ content: 'Мяу :)', ephemeral: true })
    }
}