const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ButtonBuilder, 
  ActionRowBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ButtonStyle 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const logChannelId = 'id'; // id روم اللوق

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.content === '!zajil') { // الأمر الي تكتبه
    const embed = new EmbedBuilder()
      .setColor('#2f3136')
      .setAuthor({
        name: `${message.guild.name}`,
        iconURL: message.guild.iconURL({ dynamic: true }),
      })
      .setTitle('إرسال زاجل')
      .setDescription('تقدر ترسل رسالة خاصة لأي شخص بالسيرفر بدون ما يعرف من اللي أرسلها، أضغط على زر إرسال زاجل')
      .setFooter({ text: 'zajil' })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('open_zajil_form')
      .setLabel('إرسال زاجل')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'open_zajil_form') {
      const modal = new ModalBuilder()
        .setCustomId('zajil_form')
        .setTitle('إرسال زاجل');

      const userIdInput = new TextInputBuilder()
        .setCustomId('user_id')
        .setLabel('أكتب ID الشخص')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('مثال : 86354338013570')
        .setRequired(true);

      const messageInput = new TextInputBuilder()
        .setCustomId('message')
        .setLabel('أكتب الرسالة')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('أكتب رسالتك هنا...')
        .setRequired(true);

      const row1 = new ActionRowBuilder().addComponents(userIdInput);
      const row2 = new ActionRowBuilder().addComponents(messageInput);

      modal.addComponents(row1, row2);

      await interaction.showModal(modal);
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'zajil_form') {
      const userId = interaction.fields.getTextInputValue('user_id');
      const message = interaction.fields.getTextInputValue('message');

      try {
        const user = await client.users.fetch(userId);
        const embed = new EmbedBuilder()
          .setColor('#3c3c3c')
          .setTitle('🕊 لديك رسالة زاجل')
          .setDescription(message)
          .setFooter({ text: 'تم إرسال هذه الرسالة بشكل مجهول' })
          .setTimestamp();

        
        await user.send({ content: `<@${userId}>`, embeds: [embed] });

        await interaction.reply({ content: '✅ تم إرسال الزاجل بنجاح', ephemeral: true });

        
        const logChannel = client.channels.cache.get(logChannelId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#3c3c3c')
            .setTitle('📩 سجل رسائل الزاجل')
            .addFields(
              { name: '👤 المرسل', value: `<@${interaction.user.id}>`, inline: true },
              { name: '📤 المستلم', value: `<@${userId}>`, inline: true },
              { name: '⏰ وقت الإرسال', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
              { name: '✉️ محتوى الرسالة', value: message, inline: false }
            )
            .setFooter({ text: `User ID: ${interaction.user.id}` })
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      } catch (error) {
        if (error.code === 50007) {
          await interaction.reply({ content: '⚠️ ما أقدر أرسل الرسالة، شكل الشخص مقفل الخاص عنده', ephemeral: true });
        } else {
          console.error(error);
          await interaction.reply({ content: '⚠️ صار خطأ أثناء إرسال الرسالة تأكد من إن ID المستخدم صحيح', ephemeral: true });
        }
      }
    }
  }
});

client.login('توكن البوت');
