const { Client, Collection, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, Events, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, GatewayIntentBits, ActionRowBuilder, PermissionsBitField } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const config = require('./json/config.json')
const json = require('./json.js')
const {getApplications, getApplicationByMessageId} = require("./json");
const {button} = require("./button");
const {modal} = require("./modal");
const {selectMenu} = require("./selectMenu");
const {meow} = require("./meow");
const {getUser} = require("./utils/db");

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

meow()

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

client.once(Events.ClientReady, async c => {
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
        await button(interaction)
    }
    else if (interaction.isModalSubmit()) {
        await modal(interaction)
    }
    else if (interaction.isStringSelectMenu()) {
        await selectMenu(interaction)
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