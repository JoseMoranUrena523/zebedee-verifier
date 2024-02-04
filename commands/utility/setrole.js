const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setrole')
		.setDescription('Sets a role to give to other users when their gamertag is verified.')
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('Please choose the role to give to verified users.')
				.setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
        await db.set(interaction.guildId + "_role", interaction.options.getRole('role'));
		await interaction.reply('Role has been saved!');
	},
};