const { Client, Collection, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, Events, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, GatewayIntentBits, ActionRowBuilder,
    PermissionsBitField
} = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const config = require('./config.json')
const json = require('./json.js')
const {getApplications, getApplicationByMessageId} = require("./json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.once(Events.ClientReady, c => {
    console.log('Мяу :)')
})

async function logAccept(administrator, member, guild) {
    let channel = await guild.channels.fetch(config.logChannel)

    let adminAvatar = 'https://cdn.discordapp.com/avatars/' + administrator.user.id + '/' + administrator.user.avatar
    let avatar = 'https://cdn.discordapp.com/avatars/' + member.user.id + '/' + member.user.avatar

    const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: `Администратор ${administrator.displayName} одобрил заявку пользователя ${member.displayName}`, iconURL: avatar })
        .setFooter({ text: administrator.displayName, iconURL: adminAvatar })

    await channel.send({ embeds: [embed] })
}

async function logDeny(administrator, member, guild, reason) {
    let channel = await guild.channels.fetch(config.logChannel)

    let adminAvatar = 'https://cdn.discordapp.com/avatars/' + administrator.user.id + '/' + administrator.user.avatar
    let avatar = 'https://cdn.discordapp.com/avatars/' + member.user.id + '/' + member.user.avatar

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setAuthor({ name: `Администратор ${administrator.displayName} отклонил заявку пользователя ${member.displayName}`, iconURL: avatar })
        .addFields(
            { name: 'Причина отклонения', value: reason }
        )
        .setFooter({ text: administrator.displayName, iconURL: adminAvatar })

    await channel.send({ embeds: [embed] })
}

async function logCreateTicket(administrator, member, guild) {
    let channel = await guild.channels.fetch(config.logChannel)

    let adminAvatar = 'https://cdn.discordapp.com/avatars/' + administrator.user.id + '/' + administrator.user.avatar
    let avatar = 'https://cdn.discordapp.com/avatars/' + member.user.id + '/' + member.user.avatar

    const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: `Администратор ${administrator.displayName} создал тикет с пользователем ${member.displayName}`, iconURL: avatar })
        .setFooter({ text: administrator.displayName, iconURL: adminAvatar })

    await channel.send({ embeds: [embed] })
}

async function logCloseTicket(administrator, member, guild) {
    let channel = await guild.channels.fetch(config.logChannel)

    let adminAvatar = 'https://cdn.discordapp.com/avatars/' + administrator.user.id + '/' + administrator.user.avatar
    let avatar = 'https://cdn.discordapp.com/avatars/' + member.user.id + '/' + member.user.avatar

    const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: `Администратор ${administrator.displayName} закрыл тикет с пользователем ${member.displayName}`, iconURL: avatar })
        .setFooter({ text: administrator.displayName, iconURL: adminAvatar })

    await channel.send({ embeds: [embed] })
}

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'application') {
            if (await json.getApplication(interaction.member.id) !== undefined) {
                await interaction.reply({content: 'Вы уже отправили заявку!', ephemeral: true })
                return
            }

            const modal = new ModalBuilder()
                .setCustomId('application')
                .setTitle('Подать заявку')

            const cat = new TextInputBuilder()
                .setCustomId('cat')
                .setLabel('Ты кот?')
                .setStyle(TextInputStyle.Short)

            const server = new TextInputBuilder()
                .setCustomId('server')
                .setLabel('Как вы узнали о сервере?')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)

            const friend = new TextInputBuilder()
                .setCustomId('friends')
                .setLabel('Напишите всех ваших врагов')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)

            const raid = new TextInputBuilder()
                .setCustomId('raid')
                .setLabel('Учавствовали ли вы в рейдах или крашах?')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)

            const rules = new TextInputBuilder()
                .setCustomId('rules')
                .setLabel('Ознакомились ли вы с правилами?')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)

            const row = new ActionRowBuilder().addComponents(cat)
            const serverRow = new ActionRowBuilder().addComponents(server)
            const friendRow = new ActionRowBuilder().addComponents(friend)
            const raidRow = new ActionRowBuilder().addComponents(raid)
            const rulesRow = new ActionRowBuilder().addComponents(rules)

            modal.addComponents(row, serverRow, friendRow, raidRow, rulesRow)

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

            await logCreateTicket(interaction.member, member, interaction.guild)

            await channel.send({ content: `<@${application.author}> ${adminRole}`, components: [row] })
        }
        else if (interaction.customId === 'closeTicket') {
            let application = await getApplications()
            application = application.find(a => a.ticketChannel === interaction.channel.id)
            let member = await interaction.guild.members.fetch(application.author)
            const adminRole = await interaction.guild.roles.fetch(config.adminRole)

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
    }
    else if (interaction.isModalSubmit()) {
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
                    cat: interaction.fields.getTextInputValue('cat'),
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
        }
        else if (interaction.customId === 'denyApplication') {
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
            }
            catch (error) {
            }
        }
        else if (interaction.customId === 'code') {
            let code = interaction.fields.getTextInputValue('code')
            let receiver = await json.getCode(code)
            let codeByReceiver = await json.getCodeByReceiver(interaction.member.user.username)

            if (receiver === undefined) {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle('Данного кода не существует!')
                await interaction.reply({ embeds: [embed], ephemeral: true })
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

                await interaction.reply({ embeds: [embed], ephemeral: true })
            }
            else if (codeByReceiver !== undefined) {
                const embed = new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle('Вам преднозначен другой код: ' + codeByReceiver.code)
                await interaction.reply({embeds: [embed], ephemeral: true})
            }
            else {
                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle('Данный код преднозначен не для вас!')
                await interaction.reply({embeds: [embed], ephemeral: true})
            }
        }
    }
    else if (interaction.isStringSelectMenu()) {
        let message
        client.guilds.fetch(config.guildId).then(guild => {
            guild.channels.fetch(config.applicationChannel).then(async channel => {
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
                    .setAuthor({ name: interaction.member.displayName, iconURL: avatar})
                    .addFields(
                        { name: 'Ты кот?', value: fields['cat'] },
                        { name: 'Откуда вы узнали о сервере?', value: fields['server'] + '.' },
                        { name: 'Напишите всех своих врагов', value: fields['friends'] + '.' },
                        { name: 'Учавстовали ли вы в рейдах или крашах?', value: fields['raid'] + '.' },
                        { name: 'Ознакомились с правилами?', value: fields['rules'] + '.' },
                        { name: 'Знаете ли вы кого нибудь из этого списка?', value: values }
                    )

                message = await channel.send({
                    embeds: [ embed ],
                    components: [ buttons ]
                })

                let application = await json.getApplication(interaction.member.id)
                application['messageId'] = message.id
                application['doYouKnowAnyoneFromList'] = interaction.values

                await json.editApplication(interaction.member.id, application)
            })
        })

        await interaction.update({ content: 'Ваша заявка отправлена на рассмотрение', components: [], ephemeral: true })
    }
    else {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            } else {
                await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
            }
        }
    }
})

client.login(config.token)