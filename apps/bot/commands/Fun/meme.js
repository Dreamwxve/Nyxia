import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import fetch from "node-fetch";

export default {
 name: "meme",
 description: "😂 Get a random meme",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: true,
 usage: "/meme",
 options: [
  {
   name: "subreddit",
   description: "want a specific subreddit?",
   type: ApplicationCommandOptionType.User,
   required: false,
  },
 ],
 run: async (client, interaction, guildSettings) => {
  // get joke from reddit api (dankmemes)
  try {
   const sub = interaction.options.getString("subreddit") || "dankmemes"
   const meme = await fetch(`https://reddit.com/r/${sub}/random/.json`);
   const json = await meme.json();

   if (sub && (!json || !json[0] || !json[0].data || !json[0].data.children || !json[0].data.children[0] || !json[0].data.children[0].data || !json[0].data.children[0].data.title || !json[0].data.children[0].data.url)) {
    return client.errorMessages.createSlashError(interaction, `❌ No results found for \`r/${sub}\` `);
   }

   if (!json || !json[0] || !json[0].data || !json[0].data.children || !json[0].data.children[0] || !json[0].data.children[0].data || !json[0].data.children[0].data.title || !json[0].data.children[0].data.url) {
    return client.errorMessages.createSlashError(interaction, "❌ No results found.");
   }

   const embed = new EmbedBuilder()
    .setTitle(json[0].data.children[0].data.title)
    .setImage(json[0].data.children[0].data.url)
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp()
    .setFooter({
     text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
    });

   const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder() // prettier
     .setStyle(ButtonStyle.Link)
     .setLabel("View on Reddit")
     .setURL(`https://reddit.com${json[0].data.children[0].data.permalink}`)
   );

   return interaction.followUp({ embeds: [embed], components: [actionRow] });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
