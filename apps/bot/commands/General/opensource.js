import { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, time } from "discord.js";
import fetch from "node-fetch";

export default {
 name: "opensource",
 description: "📚 Check out my source code",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 usage: "/contact",
 dm_permission: true,
 run: async (client, interaction, guildSettings) => {
  try {
   const response = await fetch("https://api.github.com/repos/dreamwxve/nyxia/commits?per_page=1").then((res) => res.json());
   const lastTimestamp = Math.floor(new Date(response[0].commit.committer.date) / 1000);

   const embed = new EmbedBuilder() // Prettier
    .setTitle(`🐙 ${client.user.username} Github Repository`)
    .setDescription("**This project is open source: [@Dreamwxve/Nyxia](https://github.com/dreamwxve/nyxia)**\n\n> 🛠️ Latest commit ${time(lastTimestamp)} (${time(lastTimestamp, \"R\")})")
    .setFooter({
     text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({
      size: 256,
     }),
    })
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp();

   const row = new ActionRowBuilder()
    .addComponents(
     new ButtonBuilder() // Prettier
      .setURL("https://github.com/Dreamwxve/Nyxia")
      .setLabel("Repository")
      .setStyle(ButtonStyle.Link)
    )
    .addComponents(
     new ButtonBuilder() // Prettier
      .setURL(response[0].html_url)
      .setLabel("Latest commit")
      .setStyle(ButtonStyle.Link)
    );
   return interaction.followUp({ ephemeral: false, embeds: [embed], components: [row] });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
