const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js')
const { adminRole } = require('../../json/config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Отправить ембед')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('Текст')
                .setRequired(true)
                .setNameLocalizations({
                    ru: 'текст'
                }))
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('Описание')
                .setNameLocalizations({
                    ru: 'описание'
                }))
        .addStringOption(option =>
            option
                .setName('color')
                .setDescription('Цвет')
                .setNameLocalizations({
                        ru: 'цвет'
                }))
        .addBooleanOption(option =>
            option
                .setName('ephemeral')
                .setDescription('Только ты увидишь сообщение')
                .setNameLocalizations({
                        ru: 'невидимое'
                })),
    async execute(interaction) {
        if (interaction.member.roles.cache.find(a => a.id === adminRole) === undefined) {
            await interaction.reply({
                content: 'Вы не можете создавать коды для одноразовой верификации',
                ephemeral: true
            })
            return
        }

        let text = interaction.options.getString('text')
        let description = interaction.options.getString('description')
        let color = interaction.options.getString('color')
        let ephemeral = interaction.options.getBoolean('ephemeral')
        ephemeral = ephemeral ? ephemeral : false

        let colors = ['Aqua', 'Blue', 'Blurple', 'DarkAqua', 'DarkBlue',
            'DarkButNotBlack', 'DarkerGrey', 'DarkGold', 'DarkGreen', 'DarkGrey',
            'DarkNavy', 'DarkOrange', 'DarkPurple', 'DarkRed', 'DarkVividPink',
            'Default', 'Fuchsia', 'Gold', 'Grey', 'Greyple', 'LightGrey',
            'LuminousVividPink', 'Navy', 'NotQuiteBlack', 'Orange', 'Purple',
            'Random', 'Red', 'White', 'Yellow']

        color = colors.includes(color) ? color : 'Default'

        let embed

        if (description)
            embed = new EmbedBuilder()
                .setTitle(text)
                .setDescription(description)
                .setColor(color)
        else
            embed = new EmbedBuilder()
                .setTitle(text)
                .setColor(color)
                .addFields(
                    { name: 'Появились вопросы?', value: 'Создайте тикет и в ближайшее время вам ответит администрация.' }
                )
                /*.addFields([
                    { name: 'Основные правила', value: ' ' },
                    { name: '1.1', value: 'Запрещено использование ненормативной лексики.\nНаказание: Мут на 1 час' },
                    { name: '1.2', value: 'Запрещено оскорбление других пользователей \nНаказание: Мут на 2 часа' },

                    { name: '1.3', value: 'Запрещена дискриминация участников на основе расы, национальности, пола, религии, возраста, инвалидности, рода занятий или сексуальной ориентации \nНаказание: Бан на неделю или навсегда' },
                    { name: '1.4', value: 'Запрещено цитирование личной переписки без согласия обеих сторон \nНаказание: Мут на 1 час' },
                    { name: '1.5', value: 'Запрещено распространение чьей-либо персональной информации \nНаказание: Мут на 1 час или бан на 1 день' },
                    { name: 'Текстовые каналы', value: ' ' },
                    { name: '2.1', value: 'Запрещён спам, флуд и прочее засорение чата \nНаказание: Мут на 1 час' },
                    { name: '2.2', value: 'Запрещён капс в многократном количестве \nНаказание: Мут на 1 час' },
                    { name: '2.3', value: 'Запрещается публикация 18+ контента в не предназначеных каналах \nНаказание: Мут на 1 час' },
                    { name: 'Голосовые каналы', value: ' ' },
                    { name: '3.1', value: 'Запрещается воспроизводить оглушающие звуки намеренно. \nНаказание: Мут на 15 минут' },
                    { name: '3.2', value: 'Запрещена демонстрация 18+ контента \nНаказание: Мут на 15 минут' }
                ])*/

        let button = new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Создать тикет')
            .setStyle(ButtonStyle.Primary)

        let row = new ActionRowBuilder().addComponents(button)

        if (!ephemeral) {
            await interaction.channel.send({ embeds: [embed], components: [row] })
            await interaction.reply({ content: 'Сообщение отправлено', ephemeral: true })
        }
        else
            await interaction.reply({ embeds: [embed], ephemeral: ephemeral })
    }
}