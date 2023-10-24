const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const {getUser, addUser, editUser} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('job')
        .setDescription('Погладить котика :)'),
    async execute(interaction) {
        if (!await getUser(interaction.member.id)) {
            await addUser({
                member: interaction.member.id,
                balance: '0',
                experience: '0',
                inventory: []
            })
        }

        let user = await getUser(interaction.member.id)

        let reward = Math.floor(10 + Math.random() * (100 - 10))

        user.balance += reward

        await editUser(interaction.member.id, user)

        let embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle(`Ты заработал: ${reward}\nТвой баланс: ${user.balance} Flow`)

        await interaction.reply({ embeds: [embed], ephemeral: true })
    }
}