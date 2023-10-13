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

        const row = new ActionRowBuilder()
            .addComponents(application)

        await interaction.reply({
            content: 'Мяу :)',
            components: [row]
        })
    }
}