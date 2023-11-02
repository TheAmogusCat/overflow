const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const {getUser, editUser} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Crypto')
        .setNameLocalizations({
            ru: 'крипто'
        })
        .setDescriptionLocalizations({
            ru: 'Криптовалюта'
        })
        .addSubcommand(wallet =>
            wallet
                .setName('wallet')
                .setDescription('Crypto wallet')
                .setNameLocalizations({
                    ru: 'кошелёк'
                })
                .setDescriptionLocalizations({
                    ru: 'Крипто кошелёк'
                })),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'wallet') {
            let user = await getUser(interaction.user.id)
            if (user.crypto === undefined) {
                user.crypto = {
                    USDT: 0
                }
                await editUser(interaction.user.id, user)
            }

            let embed = new EmbedBuilder()
                .setTitle('Крипто-кошелёк')
                .setColor("Green")

            for (let key in user.crypto) {
                let item = user.crypto[key]
                embed.addFields({ name: key, value: item.toFixed(3).toString(), inline: true })
            }

            await interaction.reply({ embeds: [embed], ephemeral: true })
            //TODO: Сделать /crypto change
        }
    }
}