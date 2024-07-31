import { EmbedBuilder } from "discord.js";

export async function getMemberInfo(client, interaction, color) {
  try {
    let user = interaction.options.getMember("user");

    if (!user) {
      return client.errorMessages.createSlashError(interaction, "❌ You need to provide a user to check info");
    }

    try {
      user = await interaction.guild.members.fetch(user.id); // Use fetch to ensure latest data
    } catch {
      return client.errorMessages.createSlashError(interaction, "❌ You need to provide a user that is in the server");
    }

    const flags = {
      "": "None!",
      Staff: client.config.emojis.discord_employee,
      Partner: client.config.emojis.discord_partner,
      BugHunterLevel1: client.config.emojis.bug_hunter_1,
      BugHunterLevel2: client.config.emojis.bug_hunter_2,
      HypesquadEvents: client.config.emojis.hypesquad,
      HypeSquadOnlineHouse1: client.config.emojis.hypesquad_brilliance,
      HypeSquadOnlineHouse2: client.config.emojis.hypesquad_bravery,
      HypeSquadOnlineHouse3: client.config.emojis.hypesquad_balance,
      PremiumEarlySupporter: client.config.emojis.early_supporter,
      TeamPseudoUser: "Team User",
      VerifiedBot: `${client.config.emojis.bot_badge_part_1}${client.config.emojis.bot_badge_part_2}`,
      VerifiedDeveloper: client.config.emojis.verified_bot_developer,
    };

    const userFlags = user.user.flags.toArray().map(flag => flags[flag])
    if (userFlags.length === 0) userFlags.push("None!");

    const presence = user.presence;
    let clientStatusString = 'No client status';
    let activities = 'Not doing anything';

    if (presence) {
      const activityTypeNames = {
        0: 'Playing',
        1: 'Streaming',
        2: 'Listening to',
        3: 'Watching',
        4: 'Custom',
        5: 'Competing'
      };

      activities = presence.activities
      .map(activity => {
        const isSpecialType = activity.type === 4; // Adjust this to the correct value if necessary
    
        // Set the type label
        const type = isSpecialType
          ? '**Type:** Custom'
          : `**${activityTypeNames[activity.type]}**: ${activity.name}`;
    
        // Format message, details, and state based on activity type
        const details = activity.details ? `**Details:** ${activity.details}` : '';
        const state = activity.state ? `**State:** ${activity.state}` : '';
    
        // For non-special types, include type, details, and state
        const message = isSpecialType
          ? `${activity.state || ''}` // For special type, use state as the message
          : ''; // No message for non-special types
    
        // Combine type, details, and state with proper handling for new lines
        return [
          type,
          details,
          state
        ]
        .filter(part => part) // Filter out empty parts
        .join('\n'); // Join with a single new line
      })
      .join('\n\n') || 'Not doing anything';

      const clientStatus = presence.clientStatus || {};
      const clientStatusEmojis = {
        desktop: 'On PC ',
        mobile: 'On mobile ',
        web: 'On browser '
      };

      clientStatusString = Object.entries(clientStatus).map(([platform, status]) => {
        let statusEmoji;
        switch (status) {
          case 'online':
            statusEmoji = 'currently online';
            break;
          case 'idle':
            statusEmoji = 'currently idle';
            break;
          case 'dnd':
            statusEmoji = 'currently on do not disturb';
            break;
          case 'offline':
          default:
            statusEmoji = 'currently offline';
            break;
        }
        return `${clientStatusEmojis[platform] || ''}${statusEmoji}`;
      }).join(', ');
    }

    const statusEmojis = {
      online: '<:online:1267273623656468495>',
      idle: '<:idle:1267273613640335481>',
      dnd: '<:dnd:1267273602496073739>',
      offline: '<:offline:1267273634964181043>'
    };

    const statusEmoji1 = statusEmojis[presence?.status] || statusEmojis.offline;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTimestamp()
      .setThumbnail(user.user.displayAvatarURL({ size: 256 }))
      .setTitle(`${user.user.globalName || user.user.username} ${user.user.bot ? client.config.emojis.bot_badge_part_1 + client.config.emojis.bot_badge_part_2 : ""}`)
      .setFooter({
        text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
        iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
      });

    const fields = [
      {
        name: `${client.config.emojis.role} ID`,
        value: `> \`${user.user.id}\``,
        inline: true,
      },
      {
        name: `${client.config.emojis.role} Username`,
        value: `> \`${user.user.username} ${user.user.globalName ? `[ ${user.user.globalName} ]` : ""}\``,
        inline: true,
      },
      {
        name: `${client.config.emojis.stopwatch} Joined server at`,
        value: `> <t:${parseInt(user.joinedTimestamp / 1000)}> (<t:${parseInt(user.joinedTimestamp / 1000)}:R>)`,
        inline: false,
      },
      {
        name: `${client.config.emojis.stopwatch} Account created at`,
        value: `> <t:${parseInt(user.user.createdAt / 1000)}> (<t:${parseInt(user.user.createdAt / 1000)}:R>)`,
        inline: false,
      },
      {
        name: `${client.config.emojis.role} Highest role`,
        value: `> ${user.roles.highest || "None"}`,
        inline: true,
      },
      {
        name: `${client.config.emojis.discord_badges} Badges`,
        value: `> ${userFlags.join(' ') || "None"}`,
        inline: true,
      },
      {
        name: `<:allinonestatus:1267274460201877554> Status`,
        value: `> ${clientStatusString}`,
        inline: true,
      },
      {
        name: `<:gaming_squidward:1267274096178368655> Activity`,
        value: `>>> ${activities}`,
        inline: false,
      },
    ];

    
// Insert nickname field at the 3rd position (index 2)
if (user.nickname) {
    fields.splice(2, 0, {
      name: `${client.config.emojis.role} Nickname`,
      value: `> ${user.nickname}`,
      inline: false,
    });
  }

    embed.addFields(fields);

    return interaction.followUp({ embeds: [embed] });
  } catch (err) {
    client.errorMessages.internalError(interaction, err);
  }
}
