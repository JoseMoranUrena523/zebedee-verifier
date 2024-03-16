const { SlashCommandBuilder } = require('discord.js');

const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verifies ZEBEDEE gamertag and Discord account.'),
	async execute(interaction) {
		const member = interaction.member;
		const role = await db.get(interaction.guildId + "_role");
		const isVerified = await db.get(member.id + "_verify");

		if (!role) {
		  await interaction.reply("An administrator hasn't configured a role to set when verified.");
		  return;
		}

		await interaction.reply('Checking to see if you went through the verification process...');
		
		if (member.roles.cache.some(roleCheck => roleCheck.name === role.name)) {
		  await interaction.editReply("You are already verified.")
		  return;
		}

		if (!isVerified) {
		  await interaction.editReply(`Please click [this link](https://zbdverifier.josemoranurena.tech/login?discord=${member.id}) in order to verify your ZEBEDEE account.`);
		  return;
		}

		await member.roles.add(role.id);
		await interaction.editReply('ZEBEDEE account verified! Role has been added.');
	},
};
