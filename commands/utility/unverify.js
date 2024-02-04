const { SlashCommandBuilder } = require('discord.js');

const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unverify')
		.setDescription('Unlinks the ZEBEDEE account set to your Discord.'),
	async execute(interaction) {
    const member = interaction.member;
    await db.delete(member.id + "_verify");
		await interaction.reply('ZEBEDEE account has been removed!');
	},
};
