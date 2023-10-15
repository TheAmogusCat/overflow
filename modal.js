const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder, ModalSubmitInteraction} = require('discord.js')
const json = require('./json')
const config = require('./json/config.json')


module.exports = {
    async modal(interaction = new ModalSubmitInteraction()) {
        if (interaction.customId === 'application') {
            const select = new StringSelectMenuBuilder()
                .setCustomId('application')
                .setPlaceholder('Выберите один или несколько вариантов')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Барсик')
                        .setDescription('Мистер Барсик, Кленовый Барс, Тропический Барс, Новогодний Барс')
                        .setValue('bars'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Гривус 24')
                        .setValue('grivus'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Усман')
                        .setValue('usman'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Пупсень')
                        .setDescription('Хэллуинский пупсень')
                        .setValue('pupsen'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Матордев')
                        .setDescription('Ящер')
                        .setValue('matordev'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Mahjong')
                        .setValue('mahjong'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Маодзидун')
                        .setValue('maodzidun'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Никого')
                        .setValue('none')
                )
                .setMinValues(1)
                .setMaxValues(7)

            const row = new ActionRowBuilder().addComponents(select)

            let application = {
                id: await json.getId(),
                author: interaction.member.id,
                fields: {
                    server: interaction.fields.getTextInputValue('server'),
                    friends: interaction.fields.getTextInputValue('friends'),
                    raid: interaction.fields.getTextInputValue('raid'),
                    rules: interaction.fields.getTextInputValue('rules')
                },
                timestamp: new Date(),
                doYouKnowAnyoneFromList: [],
                messageId: ''
            }

            await json.addApplication(application)

            await interaction.reply({
                content: 'Знаете ли вы кого нибудь из этого списка?',
                components: [row],
                ephemeral: true
            })
        } else if (interaction.customId === 'denyApplication') {
            try {
                let application = await json.getApplications()
                application = application.find(a => a.moderator === interaction.member.id)
                let member = await interaction.guild.members.fetch(application.author)

                const channel = await member.createDM()

                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle(config.denyMessage)
                    .addFields(
                        {name: 'Причина отклонения', value: interaction.fields.getTextInputValue('reason')}
                    )
                await channel.send({embeds: [embed]})

                let avatar = 'https://cdn.discordapp.com/avatars/' + member.user.id + '/' + member.user.avatar

                const embedDeny = new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({name: 'Вы отклонили заявку пользователя ' + member.displayName, iconURL: avatar})
                    .addFields(
                        {name: 'Причина отклонения', value: interaction.fields.getTextInputValue('reason')}
                    )

                await logDeny(interaction.member, member, interaction.guild, interaction.fields.getTextInputValue('reason'))

                await json.deleteApplication(application.author)

                await interaction.message.delete()

                await interaction.reply({embeds: [embedDeny], ephemeral: true})
            } catch (error) {
            }
        } else if (interaction.customId === 'code') {
            let code = interaction.fields.getTextInputValue('code')
            let receiver = await json.getCode(code)
            let codeByReceiver = await json.getCodeByReceiver(interaction.member.user.username)

            if (receiver === undefined) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle('Данного кода не существует!')
                await interaction.reply({embeds: [embed], ephemeral: true})
                return
            }

            receiver = receiver.receiver

            if (receiver === interaction.member.user.username) {
                let role = await interaction.guild.roles.fetch(config.acceptRole)
                interaction.member.roles.add(role)
                json.removeCode(code)

                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle('Добро пожаловать на сервер! :)')

                await interaction.reply({embeds: [embed], ephemeral: true})
            } else if (codeByReceiver !== undefined) {
                const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle('Вам преднозначен другой код: ' + codeByReceiver.code)
                await interaction.reply({embeds: [embed], ephemeral: true})
            } else {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle('Данный код преднозначен не для вас!')
                await interaction.reply({embeds: [embed], ephemeral: true})
            }
        }
    }
}