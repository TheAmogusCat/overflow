const { SlashCommandBuilder, EmbedBuilder} = require('discord.js')
const { addItem } = require('../../utils/db.js')
const {getCryptoPrice} = require("../../utils/getCryptoCurrency");

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
                .addNumberOption(option =>
                    option
                        .setName('maximum-reward')
                        .setDescription('Maximum reward')
                        .setNameLocalizations({
                            ru: 'максимальная-награда'
                        })
                        .setDescriptionLocalizations({
                            ru: 'Максимальная награда'
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
            const embed = new EmbedBuilder()
                .setTitle('Видеокарта создана')
                .setColor("Green")

            await interaction.reply({ embeds: [embed], ephemeral: true })

            let max = interaction.options.getNumber('maximum-reward')
            let price = {
                btc: await getCryptoPrice("btc"),
                rvn: await getCryptoPrice("rvn"),
                etc: await getCryptoPrice("etc"),
            }
            console.log(price)
            let reward = {
                btc: max / price['btc'],
                rvn: (max / 100 * 53.2258065) / price['rvn'],
                etc: (max / 100 * 22.5806452) / price['etc']
            }
            let item = {
                id: 1,
                name: interaction.options.getString('name'),
                reward: reward,
                type: 'videocard'
            }

            await addItem(item)
        }
    }
}