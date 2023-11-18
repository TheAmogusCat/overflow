const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./json/config.json');

const rest = new REST().setToken(token);

// ...

let commandId = '1165990294605537330'

// for guild-based commands
rest.delete(Routes.applicationGuildCommand(clientId, guildId, commandId))
    .then(() => console.log('Successfully deleted guild command'))
    .catch(console.error);

// for global commands
rest.delete(Routes.applicationCommand(clientId, commandId))
    .then(() => console.log('Successfully deleted application command'))
    .catch(console.error);