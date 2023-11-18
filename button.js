const json = require('./json')
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ButtonInteraction } = require('discord.js')
const config = require('./json/config.json')
const {getApplications} = require('./json.js')
const {logCreateTicket} = require("./log.js");
const {addTicket, closeTicket, getTicket} = require("./json");
const {logCloseTicket} = require("./log");


module.exports = {
    async button(interaction = new ButtonInteraction()) {
        if (interaction.customId === 'application') {
            if (await json.getApplication(interaction.member.id) !== undefined) {
                await interaction.reply({content: 'Вы уже отправили заявку!', ephemeral: true })
                return
            }

            const modal = new ModalBuilder()
                .setCustomId('application')
                .setTitle('Подать заявку')

            const server = new TextInputBuilder()
                .setCustomId('server')
                .setLabel('Как вы узнали о сервере?')
                .setStyle(TextInputStyle.Short)

            const friend = new TextInputBuilder()
                .setCustomId('friends')
                .setLabel('Напишите всех ваших врагов')
                .setStyle(TextInputStyle.Paragraph)

            const raid = new TextInputBuilder()
                .setCustomId('raid')
                .setLabel('Учавствовали ли вы в рейдах или крашах?')
                .setStyle(TextInputStyle.Short)

            const rules = new TextInputBuilder()
                .setCustomId('rules')
                .setLabel('Ознакомились ли вы с правилами?')
                .setStyle(TextInputStyle.Short)

            const serverRow = new ActionRowBuilder().addComponents(server)
            const friendRow = new ActionRowBuilder().addComponents(friend)
            const raidRow = new ActionRowBuilder().addComponents(raid)
            const rulesRow = new ActionRowBuilder().addComponents(rules)

            modal.addComponents(serverRow, friendRow, raidRow, rulesRow)

            await interaction.showModal(modal)
        }
        else if (interaction.customId === 'acceptApplication') {
            let application = await json.getApplicationByMessageId(interaction.message.id)
            let member = await interaction.guild.members.fetch(application.author)
            let role = await interaction.guild.roles.fetch(config.acceptRole)

            await member.roles.add(role)

            let channel = await member.createDM()

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle(config.acceptMessage)

            channel.send({ embeds: [embed] })

            await logAccept(interaction.member, member, interaction.guild)

            await interaction.message.delete()

            await json.deleteApplication(member.id)

            let avatar = 'https://cdn.discordapp.com/avatars/' + member.user.id + '/' + member.user.avatar

            const acceptEmbed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({ name: `Вы одобрили заявку пользователя ${member.displayName}`, iconURL: avatar })

            await interaction.reply({ embeds: [acceptEmbed], ephemeral: true })
        }
        else if (interaction.customId === 'denyApplication') {
            let application = await json.getApplicationByMessageId(interaction.message.id)
            application['moderator'] = interaction.member.id
            json.editApplication(application.author, application)
            let member = await interaction.guild.members.fetch(application.author)

            const modal = new ModalBuilder()
                .setCustomId('denyApplication')
                .setTitle('Отклонить заявку пользователя ' + member.displayName)

            const reason = new TextInputBuilder()
                .setCustomId('reason')
                .setLabel('Причина отклонения')
                .setStyle(TextInputStyle.Paragraph)

            const reasonRow = new ActionRowBuilder().addComponents(reason)

            modal.addComponents(reasonRow)

            await interaction.showModal(modal)
        }
        else if (interaction.customId === 'createTicket') {
            let application = await json.getApplicationByMessageId(interaction.message.id)
            let member = await interaction.guild.members.fetch(application.author)
            let channel = await interaction.guild.channels.create({
                name: 'тикет',
                permissionOverwrites: [
                    {
                        id: config.adminRole,
                        allow: [PermissionsBitField.Flags.SendMessages]
                    },
                    {
                        id: application.author,
                        allow: [PermissionsBitField.Flags.SendMessages]
                    }
                ]
            })

            application['ticketChannel'] = channel.id
            await json.editApplication(application.author, application)

            const button = new ButtonBuilder()
                .setCustomId('closeTicket')
                .setLabel('Закрыть тикет')
                .setStyle(ButtonStyle.Success)

            const row = new ActionRowBuilder().addComponents(button)

            const adminRole = await interaction.guild.roles.fetch(config.adminRole)

            await logCreateTicket(member, interaction.guild, interaction.member)

            await channel.send({ content: `<@${application.author}> ${adminRole}`, components: [row] })
        }
        else if (interaction.customId === 'closeTicket') {
            let application = await getApplications()
            application = application.find(a => a.ticketChannel === interaction.channel.id)
            let member = await interaction.guild.members.fetch(application.author)

            if (interaction.member.roles.cache.find(a => a.id === config.adminRole) === undefined) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle('Это может сделать только администратор!')

                await interaction.reply({ embeds: [embed], ephemeral: true })
                return
            }

            await logCloseTicket(interaction.member, member, interaction.guild)

            await interaction.channel.delete()
        }
        else if (interaction.customId === 'code') {
            const modal = new ModalBuilder()
                .setCustomId('code')
                .setTitle('Пройти с кодом')

            const code = new TextInputBuilder()
                .setCustomId('code')
                .setLabel('Введите одноразовый код')
                .setStyle(TextInputStyle.Short)

            const row = new ActionRowBuilder().addComponents(code)

            modal.addComponents(row)

            await interaction.showModal(modal)
        }
        else if (interaction.customId === 'create_ticket') {
            let member = interaction.member
            let channel = await interaction.guild.channels.create({
                name: '✧🎫୧・Тикет',
                permissionOverwrites: [
                    {
                        id: config.adminRole,
                        allow: [PermissionsBitField.Flags.SendMessages]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.SendMessages]
                    }
                ]
            })

            let ticket = {
                author: interaction.user.id,
                channel: channel.id
            }

            await addTicket(ticket)

            const button = new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Закрыть тикет')
                .setStyle(ButtonStyle.Success)

            const row = new ActionRowBuilder().addComponents(button)

            const adminRole = await interaction.guild.roles.fetch(config.adminRole)

            await logCreateTicket(member, interaction.guild)

            await channel.send({ content: `<@${interaction.user.id}> ${adminRole}`, components: [row] })

            let embed = new EmbedBuilder()
                .setTitle('Вы создали тикет!')
                .setColor("Green")

            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
        else if (interaction.customId === 'close_ticket') {
            let ticket = await getTicket(interaction.channel.id)
            let member = await interaction.guild.members.fetch(ticket.author)

            if (interaction.member.roles.cache.find(a => a.id === config.adminRole) !== undefined) {
                await logCloseTicket(member, interaction.guild, interaction.member)
                await closeTicket(interaction.channel.id)

                await interaction.channel.delete()
                return
            }

            await logCloseTicket(member, interaction.guild)
            await closeTicket(interaction.channel.id)

            await interaction.channel.delete()
        }
    }
}