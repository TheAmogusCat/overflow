const { SlashCommandBuilder } = require('discord.js')
const { addItem } = require('../../utils/db.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create_item')
        .setDescription('Create an item')
        .setNameLocalizations({
            ru: 'создать_предмет'
        })
        .setDescriptionLocalizations({
                ru: 'Создать предмет'
        })
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Name of an item')
                .setRequired(true)
                .setNameLocalizations({
                    ru: 'название'
                })
                .setDescriptionLocalizations({
                    ru: 'Название предмета'
                }))
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('Description of an item')
                .setRequired(true)
                .setNameLocalizations({
                    ru: 'описание'
                })
                .setDescriptionLocalizations({
                        ru: 'Описание предмета'
                }))
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of an item')
                .setRequired(true)
                .addChoices(
                    { name: 'Предмет', value: 'item' },
                    { name: 'Видеокарта', value: 'video_card' }
                )
                .setNameLocalizations({
                    ru: 'тип'
                })
                .setDescriptionLocalizations({
                    ru: 'Тип предмета'
                })),
    async execute(interaction) {
        let item = {
            name: interaction.options.getString('name'),
            description: interaction.options.getString('description'),
            type: interaction.options.getString('type')
        }

        await addItem(item)

        await interaction.reply({ content: 'Предмет добавлен в ваш инвентарь', ephemeral: true })
    }
}