import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { globalConfig, botConfig, debuggerConfig, dashboardConfig, globalPermissions } from "@nyxia/config";
import { createErrorEmbed } from "@nyxia/util/embeds";
import { Logger, chalk } from "@nyxia/util/functions/util";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import giveaway from "./util/giveaway/core.js";
import loadCommands from "./util/loaders/loadCommands.js";
import loadEmojis from "./util/loaders/loadEmojis.js";
import loadEvents from "./util/loaders/loadEvents.js";
import loadFonts from "./util/loaders/loadFonts.js";
import loadModals from "./util/loaders/loadModals.js";
import syncCommands from "./util/loaders/syncCommands.js";

Logger("info", "Waking up Nyxia...");

const client = new Client({
    autoReconnect: true,
    partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.GuildScheduledEvent 
    ],
    intents: [
       GatewayIntentBits.AutoModerationConfiguration,
       GatewayIntentBits.AutoModerationExecution,
       GatewayIntentBits.DirectMessagePolls,
       GatewayIntentBits.DirectMessageReactions,
       GatewayIntentBits.DirectMessageTyping,
       GatewayIntentBits.DirectMessages,
       //GatewayIntentBits.GuildBans, // is now in GuildModeration
       GatewayIntentBits.GuildEmojisAndStickers,
       GatewayIntentBits.GuildIntegrations,
       GatewayIntentBits.GuildInvites,
       GatewayIntentBits.GuildMembers,
       GatewayIntentBits.GuildMessagePolls,
       GatewayIntentBits.GuildMessageReactions,
       GatewayIntentBits.GuildMessageTyping,
       GatewayIntentBits.GuildMessages,
       GatewayIntentBits.GuildModeration, // Includes GUILD_AUDIT_LOG_ENTRY_CREATE, GUILD_BAN_ADD, GUILD_BAN_REMOVE
       GatewayIntentBits.GuildPresences,
       GatewayIntentBits.GuildScheduledEvents,
       GatewayIntentBits.GuildVoiceStates,
       GatewayIntentBits.GuildWebhooks,
       GatewayIntentBits.Guilds,
       GatewayIntentBits.MessageContent
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
syncCommands(client);



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
