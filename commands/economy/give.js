const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const {getUser, addUser, editUser} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give money to user')
        .setNameLocalizations(
            {
                ru: 'выдать',
                'es-ES': 'dar'
            }
        )
        .setDescriptionLocalizations(
            {
                ru: 'Выдать деньги пользователю',
                'es-ES': 'Dar dinero al miembro'
            }
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User')
                .setRequired(true)
                .setNameLocalizations(
                    {
                        ru: 'пользователь',
                        'es-ES': 'usuaria'
                    }
                )
                .setDescriptionLocalizations(
                    {
                        ru: 'Пользователь',
                        'es-ES': 'Usaria'
                    }
                ))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount')
                .setRequired(true)
                .setNameLocalizations(
                    {
                        ru: 'количество',
                        'es-ES': 'cantidad'
                    }
                )
                .setDescriptionLocalizations(
                    {
                        ru: 'Количество',
                        'es-ES': 'Cantidad'
                    }
                )),
    async execute(interaction) {
        if (!await getUser(interaction.options.getUser('user').id)) {
            await addUser({
                member: interaction.options.getUser('user').id,
                balance: '0',
                experience: '0',
                inventory: []
            })
        }

        let user = await getUser(interaction.options.getUser('user').id)

        user.balance += interaction.options.getInteger('amount')

        await editUser(user.member, user)

        let embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle(`Вы выдали ${interaction.options.getInteger('amount')} Flow пользователю ${interaction.options.getUser('user').globalName}`)

        await interaction.reply({ embeds: [embed], ephemeral: true })
    }
}