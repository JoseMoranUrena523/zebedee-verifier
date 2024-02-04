const { SlashCommandBuilder } = require('discord.js');
const { zbd }  = require("@zbd/node");

const ZBD_API_KEY = '4DoIrzVXOiFrK8YSytRyvgPkbSOFr4kC';
const ZBD = new zbd(ZBD_API_KEY);

const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verifies ZEBEDEE gamertag and Discord account.')
		.addStringOption(option =>
			option.setName('gamertag')
				.setDescription('The gamertag to verify.')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.reply('Verifying gamertag...');

		const gamertag = interaction.options.getString('gamertag').replace(/\s+/g, '');
		const data = await ZBD.validateLightningAddress(gamertag + "@zbd.gg");
		const role = await db.get(interaction.guildId + "_role");
		const member = interaction.member;
		
		if (member.roles.cache.some(roleCheck => roleCheck.name === role.name)) {
			await interaction.editReply("You are already verified.")
			return;
		}

		if (!role) {
			await interaction.editReply("An administrator hasn't configured a role to set when verified.");
			return;
		}

		if (!data.data.valid) {
			await interaction.editReply("The gamertag is invalid. Please try again.");
			return;
		}

		await member.roles.add(role.id);
		await interaction.editReply('Gamertag verified! Role added.');
	},
};
