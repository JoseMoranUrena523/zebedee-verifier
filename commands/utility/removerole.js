const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removerole')
		.setDescription('Removes the role set for verifying users.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
          if (!db.get(interaction.guildId + "_role")) {
	    await interaction.reply('You do not have a role set.');
	    return;
	  }
		
          await db.delete(interaction.guildId + "_role");
	  await interaction.reply('Role has been removed!');
	},
};
