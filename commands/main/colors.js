const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Colors for embed'),
    async execute(interaction) {
        let colors = ['Aqua', 'Blue', 'Blurple', 'DarkAqua', 'DarkBlue',
            'DarkButNotBlack', 'DarkerGrey', 'DarkGold', 'DarkGreen', 'DarkGrey',
            'DarkNavy', 'DarkOrange', 'DarkPurple', 'DarkRed', 'DarkVividPink',
            'Default', 'Fuchsia', 'Gold', 'Grey', 'Greyple', 'LightGrey',
            'LuminousVividPink', 'Navy', 'NotQuiteBlack', 'Orange', 'Purple',
            'Random', 'Red', 'White', 'Yellow']

        let embed

        colors.forEach(color => {
            embed = new EmbedBuilder()
                .setTitle(color)
                .setColor(color)

            interaction.channel.send({ embeds: [embed] })

        })

        await interaction.reply({ content: 'готово' })
    }
}