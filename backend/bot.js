// DiscordJS
const { Client, GatewayIntentBits } = require("discord.js");

// Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// CLient OnReady()
client.once("ready", () => {
    console.log("Bot is online");
});

client.login(process.env.BOT_TOKEN);

module.exports = client;
