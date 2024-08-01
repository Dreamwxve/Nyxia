import { ApplicationCommandType, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
 name: "suggestion",
 description: "📝 Send a suggestion to the developer",
 type: ApplicationCommandType.ChatInput,
 cooldown: 10000,
 dm_permission: false,
 defer: false,
 usage: "/suggestion",
 run: async (client, interaction) => {
    return interaction.reply("Currrently being built! :eyes: come back later or join our support server to get an ETA!")
  try {
   const modal = new ModalBuilder() // prettier
    .setCustomId("suggestion")
    .setTitle("📝 Suggestion");
   const suggestion = new TextInputBuilder() // prettier
    .setCustomId("suggestion")
    .setPlaceholder("Enter your suggestion here...")
    .setMinLength(5)
    .setMaxLength(500)
    .setRequired(true)
    .setStyle(TextInputStyle.Paragraph)
    .setLabel("Suggestion");

   const action = new ActionRowBuilder().addComponents(suggestion);

   modal.addComponents(action);
   await interaction.showModal(modal);
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
