import { EmbedBuilder, PermissionsBitField } from "discord.js";

export async function muteMember(client, interaction, color) {
 try {
  let user = interaction.options.getMember("user");
  const reason = interaction.options.getString("reason") || "No reason provided";
  let duration = interaction.options.getString("duration");
  let rawDuration = duration;
  duration = duration.toLowerCase().trim()

    const units = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };

    const match = duration.match(/(\d+)([smhd])/);
    if (!match) duration = null
    const value = parseInt(match[1]);
    const unit = match[2];
    duration = parseInt(value * units[unit]);
    duration = duration + 5000;

  if (!user) {
   return client.errorMessages.createSlashError(interaction, "❌ You need to provide a user to mute");
  }

  if (!duration || duration === NaN) {
    return client.errorMessages.createSlashError(interaction, "❌ Invalid duration format");
  }

  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
   return client.errorMessages.createSlashError(interaction, "❌ You need `Moderate Members` permission to mute this user");
  }

  if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
   return client.errorMessages.createSlashError(interaction, "❌ I need `Moderate Members` permission to mute this user");
  }

  if (user.id === interaction.member.user.id) {
   return client.errorMessages.createSlashError(interaction, "❌ I don't want to mute you..");
  }

  if (user.id === client.user.id) {
   return client.errorMessages.createSlashError(interaction, "❌ Why me..?");
  }

  if (user.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
   return client.errorMessages.createSlashError(interaction, "❌ This user has higher or equal roles than you");
  }

  if (user.roles.highest.comparePositionTo(interaction.guild.members.me.roles.highest) >= 0) {
   return client.errorMessages.createSlashError(interaction, "❌ This user has higher or equal roles than me");
  }

  if (user.id && !interaction.guild.members.cache.has(user.id)) {
    return client.errorMessages.createSlashError(interaction, "❌ This user is not in the server");
  }

  await user.timeout(duration, reason);

  const embed = new EmbedBuilder()
   .setColor(color)
   .setTimestamp()
   .setTitle("🔨 Member muted")
   .setDescription(`> **${user}** has been muted for **${rawDuration}**\n> **Reason:** ${reason}`)
   .setFooter({
    text: `Muted by ${interaction.member.user.globalName || interaction.member.user.username}`,
    iconURL: interaction.member.user.displayAvatarURL({
     size: 256,
    }),
   });

  interaction.followUp({ embeds: [embed] });
 } catch (err) {
  console.log(err)
  client.errorMessages.internalError(interaction, err);
 }
}
