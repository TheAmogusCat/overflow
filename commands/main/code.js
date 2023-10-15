const { SlashCommandBuilder, EmbedBuilder} = require('discord.js')
const { createHash } = require('crypto')
const { adminRole } = require('../../json/config.json')
const { addCode } = require('../../json.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('code')
        .setDescription('Сгенерировать код для верификации')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('Никнейм того для кого преднозначен код')),
    async execute(interaction) {
        if (interaction.member.roles.cache.find(a => a.id === adminRole) === undefined) {
            await interaction.reply({
                content: 'Вы не можете создавать коды для одноразовой верификации',
                ephemeral: true
            })
            return
        }
        let code = createHash('sha256').update(new Date().toString() + 'насос').digest('hex')

        await addCode(code, interaction.options.getString('user'))

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle('Одноразовый код для верификации: ' + code)

        await interaction.reply({ embeds: [embed], ephemeral: true })
    }
}