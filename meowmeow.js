const { Client, Partials, Events, GatewayIntentBits } = require('discord.js')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction], })

client.once(Events.ClientReady, async c => {
    console.log('Мяу :)')
})

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.channel.id === '1162418319798845480') {
        let role = await reaction.message.guild.roles.fetch('1162074275046510724')
        let member = await reaction.message.guild.members.fetch(user.id)
        await member.roles.add(role)
    }
})

client.login('MTE2MjQ2MDg1MTM3NTE4NjAxMA.Gu799p.eD_2JgNxzqcYijFqQv_ANlToMwNLqSnz_srzJw')