const { Client, Collection, EmbedBuilder, Events, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, GatewayIntentBits, ActionRowBuilder} = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const { token, guildId, applicationChannel } = require('./config.json')
const { addApplication, getApplication, getId } = require('./json.js')

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

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'application') {
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
    }
    else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'application') {
            let message
            client.guilds.fetch(guildId).then(guild => {
                guild.channels.fetch(applicationChannel).then(channel => {
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

                    let fields = interaction.fields
                    let avatar = 'https://cdn.discordapp.com/avatars/' + interaction.member.user.id + '/' + interaction.member.user.avatar

                    const embed = new EmbedBuilder()
                        .setColor("Green")
                        .setAuthor({ name: interaction.member.displayName, iconURL: avatar })
                        .addFields(
                            { name: 'Ты кот?', value: fields.getTextInputValue('cat') },
                            { name: 'Как узнали о сервере?', value: fields.getTextInputValue('server') },
                            { name: 'Напишите всех ваших врагов', value: fields.getTextInputValue('friends') },
                            { name: 'Учавстовали ли вы в рейдах или крашах?', value: fields.getTextInputValue('raid') },
                            { name: 'Ознакомились ли вы с правилами?', value: fields.getTextInputValue('rules') }
                        )

                    message = channel.send({
                        embeds: [ embed ],
                        components: [ buttons ]
                    })
                })
            })
            let application = {
                id: await getId(),
                cat: interaction.fields.getTextInputValue('cat')
            }
            await addApplication(application)

            await interaction.reply({ content: 'Мяу :)', ephemeral: true })
        }
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

client.login(token)