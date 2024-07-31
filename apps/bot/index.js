import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { globalConfig, botConfig, debuggerConfig, dashboardConfig, globalPermissions } from "@nyxia/config";
import { createErrorEmbed } from "@nyxia/util/embeds";
import { Logger, chalk } from "@nyxia/util/functions/util";
import { Client, GatewayIntentBits } from "discord.js";
import giveaway from "./util/giveaway/core.js";
import loadCommands from "./util/loaders/loadCommands.js";
import loadEmojis from "./util/loaders/loadEmojis.js";
import loadEvents from "./util/loaders/loadEvents.js";
import loadFonts from "./util/loaders/loadFonts.js";
import loadModals from "./util/loaders/loadModals.js";

Logger("info", "Waking up Nyxia...");

const client = new Client({
    autoReconnect: true,
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.GuildMember,
        Discord.Partials.Message,
        Discord.Partials.Reaction,
        Discord.Partials.User,
        Discord.Partials.GuildScheduledEvent 
    ],
    intents: [
        Discord.GatewayIntentBits.AutoModerationConfiguration,
        Discord.GatewayIntentBits.AutoModerationExecution,
        Discord.GatewayIntentBits.DirectMessagePolls,
        Discord.GatewayIntentBits.DirectMessageReactions,
        Discord.GatewayIntentBits.DirectMessageTyping,
        Discord.GatewayIntentBits.DirectMessages,
       // Discord.GatewayIntentBits.GuildBans, // is now in GuildModeration
        Discord.GatewayIntentBits.GuildEmojisAndStickers,
        Discord.GatewayIntentBits.GuildIntegrations,
        Discord.GatewayIntentBits.GuildInvites,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessagePolls,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildMessageTyping,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildModeration, // Includes GUILD_AUDIT_LOG_ENTRY_CREATE, GUILD_BAN_ADD, GUILD_BAN_REMOVE
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildScheduledEvents,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildWebhooks,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.MessageContent
    ],
    restTimeOffset: 0
});

client.config = {
 ...botConfig,
 ...globalPermissions,
 ...globalConfig,
 ...debuggerConfig,
 ...dashboardConfig,
};

client.commandsRan = 0;

client.giveawaysManager = giveaway(client);

client.errorMessages = {
 internalError: (interaction, error) => {
  Logger("error", error?.toString() ?? "Unknown error occured");
  const embed = createErrorEmbed("An error occured while executing this command. Please try again later.", "Unknown error occured");
  return interaction.followUp({ embeds: [embed], ephemeral: true });
 },
 createSlashError: (interaction, description, title) => {
  const embed = createErrorEmbed(description, title);
  embed.setFooter({
   text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
   iconURL: interaction.member.user.displayAvatarURL({ dynamic: true }),
  });

  return interaction.followUp({ embeds: [embed], ephemeral: true });
 },
};

client.debugger = Logger;

client.performance = (time) => {
 const run = Math.floor(performance.now() - time);
 return run > 500 ? chalk.underline.red(`${run}ms`) : chalk.underline(`${run}ms`);
};

await loadCommands(client);
await loadModals(client);
await loadFonts(client);
await loadEvents(client);
await loadEmojis(client);

Logger("info", "Logging in...");

process.on("unhandledRejection", (reason) => {
 Logger("error", reason);
});

process.on("uncaughtException", (error) => {
 Logger("error", error);
});

process.on("warning", (warning) => {
 Logger("warn", warning);
});

await client.login(process.env.TOKEN);

export default client;
