const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const {getUser, addUser, editUser} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market_settings')
        .setDescription('Market Settings')
        .setNameLocalizations(
            {
                ru: 'настройки_магазина',
                'es-ES': 'configuración_del_mercado'
            }
        )
        .setDescriptionLocalizations(
            {
                ru: 'Настройки магазина',
                'es-ES': 'Configuración del mercado'
            }
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add_item')
                .setDescription('Add item')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name')
                )
                .addIntegerOption(option =>
                    option.setName('cost')
                        .setDescription('Cost')
                )),
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