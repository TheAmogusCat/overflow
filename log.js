const config = require("./json/config.json");
const {EmbedBuilder} = require("discord.js");

module.exports = {
    async logAccept(administrator, member, guild) {
        let channel = await guild.channels.fetch(config.logChannel)

        let adminAvatar = 'https://cdn.discordapp.com/avatars/' + administrator.user.id + '/' + administrator.user.avatar
        let avatar = 'https://cdn.discordapp.com/avatars/' + member.user.id + '/' + member.user.avatar

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({
                name: `Администратор ${administrator.displayName} одобрил заявку пользователя ${member.displayName}`,
                iconURL: avatar
            })
            .setFooter({text: administrator.displayName, iconURL: adminAvatar})

        await channel.send({embeds: [embed]})
    },

    async logDeny(administrator, member, guild, reason) {
        let channel = await guild.channels.fetch(config.logChannel)

        let adminAvatar = 'https://cdn.discordapp.com/avatars/' + administrator.user.id + '/' + administrator.user.avatar
        let avatar = 'https://cdn.discordapp.com/avatars/' + member.user.id + '/' + member.user.avatar

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setAuthor({
                name: `Администратор ${administrator.displayName} отклонил заявку пользователя ${member.displayName}`,
                iconURL: avatar
            })
            .addFields(
                {name: 'Причина отклонения', value: reason}
            )
            .setFooter({text: administrator.displayName, iconURL: adminAvatar})

        await channel.send({embeds: [embed]})
    },

    async logCreateTicket(member, guild, administrator = '') {
        let channel = await guild.channels.fetch(config.logChannel)

        let adminAvatar
        if (administrator !== '')
            adminAvatar = 'https://cdn.discordapp.com/avatars/' + administrator.user.id + '/' + administrator.user.avatar
        let avatar = 'https://cdn.discordapp.com/avatars/' + member.user.id + '/' + member.user.avatar

        let embed

        if (administrator !== '')
            embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({
                    name: `Администратор ${administrator.displayName} создал тикет с пользователем ${member.displayName}`,
                    iconURL: avatar
                })
                .setFooter({text: administrator.displayName, iconURL: adminAvatar})
        else
            embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({
                    name: `Пользователь ${member.displayName} создал тикет`,
                    iconURL: avatar
                })

        await channel.send({embeds: [embed]})
    },

    async logCloseTicket(member, guild, administrator = '') {
        let channel = await guild.channels.fetch(config.logChannel)

        let adminAvatar
        if (administrator !== '')
            adminAvatar = 'https://cdn.discordapp.com/avatars/' + administrator.user.id + '/' + administrator.user.avatar
        let avatar = 'https://cdn.discordapp.com/avatars/' + member.user.id + '/' + member.user.avatar

        let embed

        if (administrator !== '')
            embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({
                    name: `Администратор ${administrator.displayName} закрыл тикет с пользователем ${member.displayName}`,
                    iconURL: avatar
                })
                .setFooter({text: administrator.displayName, iconURL: adminAvatar})
        else
            embed = new EmbedBuilder()
                .setColor("Green")
                .setAuthor({
                    name: `Пользователь ${member.displayName} закрыл тикет`,
                    iconURL: avatar
                })

        await channel.send({embeds: [embed]})
    }
}