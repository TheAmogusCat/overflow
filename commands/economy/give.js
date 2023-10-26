const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const {getUser, addUser, editUser, getItem} = require('../../utils/db')
const {adminRole} = require('../../json/config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give')
        .setNameLocalizations(
            {
                ru: 'выдать',
                'es-ES': 'dar'
            }
        )
        .setDescriptionLocalizations(
            {
                ru: 'Выдать',
                'es-ES': 'Dar'
            }
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('money')
                .setDescription('Give money to user')
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
                        ))
                .setNameLocalizations({
                    ru: 'деньги'
                })
                .setDescriptionLocalizations({
                        ru: 'Выдать деньги пользователю'
                }))
        .addSubcommand(subcommand =>
            subcommand
                .setName('item')
                .setDescription('Give item to user')
                .setNameLocalizations({
                    ru: 'предмет'
                })
                .setDescriptionLocalizations({
                    ru: 'Выдать предмет пользователю'
                })
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of an item')
                        .setNameLocalizations({
                            ru: 'название'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Название предмета'
                        }))
                .addIntegerOption(option =>
                    option
                        .setName('id')
                        .setDescription('Id of an item')
                        .setNameLocalizations({
                            ru: 'айди'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Айди предмета'
                        }))
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User')
                        .setNameLocalizations({
                            ru: 'пользователь'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Пользователь'
                        }))),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'money') {
            if (interaction.member.roles.cache.find(a => a.id === adminRole) === undefined) {
                const embed = new EmbedBuilder()
                    .setTitle('NEVER GONNA GIVE YOU UP, NEVER GONNA LET YOU DOWN')
                    .setColor("LuminousVividPink")
                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                })
                return
            }
            if (!await getUser(interaction.options.getUser('user').id)) {
                await addUser({
                    member: interaction.options.getUser('user').id,
                    balance: 50,
                    experience: 1,
                    inventory: []
                })
            }

            let user = await getUser(interaction.options.getUser('user').id)

            user.balance += interaction.options.getInteger('amount')

            await editUser(user.member, user)

            let embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle(`Вы выдали ${interaction.options.getInteger('amount')} Flow Coin пользователю ${interaction.options.getUser('user').globalName}`)

            await interaction.reply({embeds: [embed], ephemeral: true})
        }
        else {
            if (interaction.options.getUser('user')) {
                if (!await getUser(interaction.options.getUser('user').id)) {
                    await addUser({
                        member: interaction.options.getUser('user').id,
                        balance: 50,
                        experience: 1,
                        inventory: []
                    })
                }
            }

            let item

            if (interaction.options.getString('name'))
                item = await getItem(1, interaction.options.getString('name'))
            else if (interaction.options.getInteger('id'))
                item = await getItem(interaction.options.getInteger('id'))
            else {
                const embed = new EmbedBuilder()
                    .setTitle('Вам необходимо ввести хотябы 1 параметр предмета')
                    .setColor("Red")
                await interaction.reply({embeds: [embed], ephemeral: true})
                return
            }

            if (!item) {
                const embed = new EmbedBuilder()
                    .setTitle('Данный предмет не найден!')
                    .setColor("Red")
                await interaction.reply({ embeds: [embed], ephemeral: true })
                return
            }

            if (!interaction.options.getUser('user')) {
                let user = await getUser(interaction.user.id)
                if (!user) {
                    user = {
                        member: interaction.user.id,
                        balance: 50,
                        experience: 1,
                        inventory: []
                    }
                    await addUser(user)
                }
                user.inventory.push(item)
                await editUser(interaction.user.id, user)
                const embed = new EmbedBuilder()
                    .setTitle(`Вы выдали себе предмет ${item.name} !`)
                    .setColor("Green")
                await interaction.reply({ embeds: [embed], ephemeral: true })
            }
            else {
                let user = await getUser(interaction.options.getUser('user').id)
                if (!user) {
                    user = {
                        member: interaction.options.getUser('user').id,
                        balance: 50,
                        experience: 1,
                        inventory: []
                    }
                    await addUser(user)
                }
                user.inventory.push(item)
                await editUser(user.member, user)
                const embed = new EmbedBuilder()
                    .setTitle(`Вы выдали предмет ${item.name} пользователю ${interaction.options.getUser('user').globalName}!`)
                    .setColor("Green")
                await interaction.reply({ embeds: [embed], ephemeral: true })
            }
        }
    }
}