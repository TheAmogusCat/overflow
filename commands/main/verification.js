const { SlashCommandBuilder, EmbedBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('верификация')
        .setDescription('Отправить сообщение о верификации'),
    async execute(interaction) {
        await interaction.reply({ content: 'Сообщение отправлено! :)', ephemeral: true })

        let embed = new EmbedBuilder()
            .setTitle('Нажмите на галочку чтобы пройти верификацию')
            .setColor("Green")

        let message = await interaction.channel.send({ embeds: [embed] })

        await message.react('✅')
    }
}