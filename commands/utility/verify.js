const { SlashCommandBuilder } = require('discord.js');
const { zbd }  = require("@zbd/node");

const ZBD_API_KEY = '4DoIrzVXOiFrK8YSytRyvgPkbSOFr4kC';
const ZBD = new zbd(ZBD_API_KEY);

const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verifies ZEBEDEE gamertag and Discord account.'),
	async execute(interaction) {
		await interaction.reply('Checking to see if you went through verification process...');
		const member = interaction.member;
		const role = await db.get(interaction.guildId + "_role");
		const isVerified = await db.get(member.id + "_verify");

		if (!role) {
			await interaction.editReply("An administrator hasn't configured a role to set when verified.");
			return;
		}
		
		if (member.roles.cache.some(roleCheck => roleCheck.name === role.name)) {
			await interaction.editReply("You are already verified.")
			return;
		}

		if (!isVerified) {
		  await interaction.editReply(`To verify, please visit: https://verifierbot.josemoranurena.tech/login?discord=${member.id}.`);
		}

		await member.roles.add(role.id);
		await interaction.editReply('Gamertag verified! Role added.');
	},
};
