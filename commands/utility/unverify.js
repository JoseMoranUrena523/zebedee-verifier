const { SlashCommandBuilder } = require('discord.js');

const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unverify')
		.setDescription('Unlinks the ZEBEDEE account set to your Discord.'),
	async execute(interaction) {
		const member = interaction.member;
    const role = await db.get(interaction.guildId + "_role");

		if (!role) {
			await interaction.reply('Role has not been set.');
			return;
		}

    if (member.roles.cache.some(checkRole => checkRole.name === role.name)) {
      await member.roles.remove(role.id)
	    await db.delete(member.id + "_verify");
		  await interaction.reply('ZEBEDEE account has been removed!');
      return;
    }

    await interaction.reply('You are not verified.');
	},
};
