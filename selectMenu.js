const config = require('./json/config.json')
const {ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, StringSelectMenuInteraction } = require('discord.js')
const json = require('./json')
const {getMarketItem, getUser, editUser, getMarketInfo, deleteItem} = require("./utils/db");


module.exports = {
    async selectMenu(interaction = new StringSelectMenuInteraction()) {
        if (interaction.customId === 'application') {
            let message
            let channel = interaction.guild.channels.fetch(config.applicationChannel)
            const accept = new ButtonBuilder()
                .setCustomId('acceptApplication')
                .setLabel('Принять')
                .setStyle(ButtonStyle.Success)

            const deny = new ButtonBuilder()
                .setCustomId('denyApplication')
                .setLabel('Отклонить')
                .setStyle(ButtonStyle.Danger)

            const createTicket = new ButtonBuilder()
                .setCustomId('createTicket')
                .setLabel('Создать тикет')
                .setStyle(ButtonStyle.Primary)

            const buttons = new ActionRowBuilder().addComponents(accept, deny, createTicket)

            let fields = await json.getApplication(interaction.member.id)
            fields = fields['fields']
            let avatar = 'https://cdn.discordapp.com/avatars/' + interaction.member.user.id + '/' + interaction.member.user.avatar

            let values = ''

            interaction.values.forEach(e => {
                switch (e) {
                    case 'bars':
                        values += 'Барсик '
                        break
                    case 'grivus':
                        values += 'Гривус24 '
                        break
                    case 'usman':
                        values += 'Усман '
                        break
                    case 'pupsen':
                        values += 'Пупсень '
                        break
                    case 'matordev':
                        values += 'Матордев '
                        break
                    case 'mahjong':
                        values += 'Mahjong '
                        break
                    case 'maodzidun':
                        values += 'Маодзидун '
                        break
                    case 'none':
                        values += 'Никого '
                        break
                }
            })

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({name: interaction.member.displayName, iconURL: avatar})
                .addFields(
                    {name: 'Откуда вы узнали о сервере?', value: fields['server']},
                    {name: 'Напишите всех своих врагов', value: fields['friends']},
                    {name: 'Учавстовали ли вы в рейдах или крашах?', value: fields['raid']},
                    {name: 'Ознакомились с правилами?', value: fields['rules']},
                    {name: 'Знаете ли вы кого нибудь из этого списка?', value: values}
                )

            message = await channel.send({
                embeds: [embed],
                components: [buttons]
            })

            let application = await json.getApplication(interaction.member.id)
            application['messageId'] = message.id
            application['doYouKnowAnyoneFromList'] = interaction.values

            await json.editApplication(interaction.member.id, application)

            await interaction.update({
                content: 'Ваша заявка отправлена на рассмотрение',
                components: [],
                ephemeral: true
            })
        }
        else if (interaction.customId === 'buy') {
            console.log(interaction.values)
            let id = parseInt(interaction.values[0])
            if (id === 0)
                id += 1
            console.log(id)
            let item = await getMarketItem(id)
            console.log(item)

            let user = await getUser(interaction.user.id)

            if (user.balance < item.price) {
                const embed = new EmbedBuilder()
                    .setTitle('У вас недостаточно средств!')
                    .setColor("Red")

                await interaction.reply({ embeds: [embed], ephemeral: true })
                return
            }

            user.inventory.push(item.item)
            user.balance -= item.price
            await editUser(interaction.user.id, user)

            let author = await getUser(item.author.id)
            console.log(author.inventory)
            author.inventory.splice(author.inventory.indexOf(item.item), 1)
            author.balance += item.price
            await editUser(item.author.id, author)

            await deleteItem(item.id)

            let info = await getMarketInfo()

            let message = await interaction.channel.messages.fetch(info.messageId)

            message.embeds[0]['data']['fields'].splice(message.embeds[0]['data']['fields'].indexOf(message.embeds[0]['data']['fields'].find(a => a.value === `<@${item.author.id}>}` + '\n' + item.description + '\n*' + `${item.price} Flow Coin` + '*')), 1)
            message.components[0].components[0].data.options.splice(message.components[0].components[0].data.options.indexOf(message.components[0].components[0].data.options.find(a => a.value === interaction.values[0])), 1)

            console.log(message.components[0].components[0].data.options)
            if (message.components[0].components[0].data.options.length === 0)
                await message.edit({ embeds: message.embeds, components: [] })
            else
                await message.edit({ embeds: message.embeds, components: message.components })

            const embed = new EmbedBuilder()
                .setTitle('Вы преобрели товар ' + item.item.name + ' за ' + item.price + ' Flow Coin! :)')
                .setColor("Green")

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
    }
}