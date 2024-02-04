const { SlashCommandBuilder } = require('discord.js');
const os = require("os");
const osu = require("node-os-utils");
const package = require('../../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Gives information about what the bot is running on and uptime.'),
    async execute(interaction) {
        const cpuInfo = await getCPUInfo();
        await interaction.reply(`***Information:***\n\n${getUptime()}\n\n${getAPIInfo()}\n\n${cpuInfo}\n\n${getMemoryInfo()}`);
    },
};

function getUptime() {
    const uptimeInSeconds = os.uptime();
    const days = Math.floor(uptimeInSeconds / (24 * 60 * 60));
    const hours = Math.floor((uptimeInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptimeInSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);

    return `**Computer Uptime:** ${days}d ${hours}h ${minutes}m ${seconds}s\n**Operating System:** ${os.type() + " " + os.arch()}`;
}

function getAPIInfo() {
    const nodeVersion = process.version.slice(1).split(".").join(".");
    const discordVersion = package.dependencies["discord.js"].replace('^', '');
    const zebedeeVersion = package.dependencies["@zbd/node"].replace('^', '');

    return `**Node.js Version:** ${nodeVersion}\n**Discord.js Version:** ${discordVersion}\n**ZEBEDEE API Version:** ${zebedeeVersion}`;
}

async function getCPUInfo() {
    var cpu = osu.cpu;

    const cpuModel = os.cpus()[0].model;
    const cpuCores = os.cpus().length;
    const cpuUsage = await cpu.usage();

    return `**CPU Model:** ${cpuModel}\n**Cores:** ${cpuCores}\n**Usage:** ${cpuUsage.toFixed(2)}%`;
}

function getMemoryInfo() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return `**Total Memory:** ${(totalMemory / 1e9).toFixed(2)} GB\n**Free Memory:** ${(freeMemory / 1e9).toFixed(2)} GB\n**Used Memory:** ${(usedMemory / 1e9).toFixed(2)} GB`;
}