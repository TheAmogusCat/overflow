const config = require('./json/config.json')
const {ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, StringSelectMenuInteraction } = require('discord.js')
const json = require('./json')


module.exports = {
    async selectMenu(interaction = new StringSelectMenuInteraction()) {
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
            .setAuthor({ name: interaction.member.displayName, iconURL: avatar })
            .addFields(
                { name: 'Откуда вы узнали о сервере?', value: fields['server'] },
                { name: 'Напишите всех своих врагов', value: fields['friends'] },
                { name: 'Учавстовали ли вы в рейдах или крашах?', value: fields['raid'] },
                { name: 'Ознакомились с правилами?', value: fields['rules'] },
                { name: 'Знаете ли вы кого нибудь из этого списка?', value: values }
            )

        message = await channel.send({
            embeds: [embed],
            components: [buttons]
        })

        let application = await json.getApplication(interaction.member.id)
        application['messageId'] = message.id
        application['doYouKnowAnyoneFromList'] = interaction.values

        await json.editApplication(interaction.member.id, application)

        await interaction.update({content: 'Ваша заявка отправлена на рассмотрение', components: [], ephemeral: true})
    }
}