const { SlashCommandBuilder, EmbedBuilder} = require('discord.js')
const { addItem } = require('../../utils/db.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create')
        .setNameLocalizations({
            ru: 'создать'
        })
        .setDescriptionLocalizations({
                ru: 'Создать'
        })
        .addSubcommand(subcommand =>
            subcommand
                .setName('item')
                .setDescription('Create an item')
                .setNameLocalizations({
                    ru: 'предмет'
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
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('videocard')
                .setDescription('Create an video card')
                .setNameLocalizations({
                    ru: 'видеокарту'
                })
                .setDescriptionLocalizations({
                    ru: 'Создать видеокарту'
                })
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name')
                        .setNameLocalizations({
                            ru: 'название'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Название видеокарты'
                        })
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('hash-rate')
                        .setDescription('Hash-rate in Mh/s')
                        .setNameLocalizations({
                            ru: 'хеш-рейт'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Хеш-рейт в Mh/s'
                        })
                        .setRequired(true))),
    async execute(interaction) {
        // TODO: Изменить хеш рейт на минимальную и максимальную прибыль с расчётом сколько будет заработок на каждой криптовалюте
        // TODO: Сделать список криптовалют
        // TODO: Сделать типы предметам
        if (interaction.options.getSubcommand() === 'item') {
            let item = {
                id: 1,
                name: interaction.options.getString('name'),
                description: interaction.options.getString('description'),
                type: 'item'
            }

            await addItem(item)

            const embed = new EmbedBuilder()
                .setTitle('Предмет создан')
                .setColor("Green")

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
        else {
            let item = {
                id: 1,
                name: interaction.options.getString('name'),
                hash_rate: interaction.options.getInteger('hash-rate'),
                type: 'videocard'
            }

            await addItem(item)

            const embed = new EmbedBuilder()
                .setTitle('Видеокарта создана')
                .setColor("Green")

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
    }
}