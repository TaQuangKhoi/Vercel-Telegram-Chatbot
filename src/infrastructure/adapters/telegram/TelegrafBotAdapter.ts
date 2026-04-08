import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import type { IBotAdapter, WebhookResult } from '@/domain/ports/IBotAdapter';
import type { EchoMessageUseCase } from '@/application/usecases/EchoMessageUseCase';

export class TelegrafBotAdapter implements IBotAdapter {
  private readonly bot: Telegraf;

  constructor(
    token: string,
    private readonly echoUseCase: EchoMessageUseCase,
  ) {
    this.bot = new Telegraf(token);
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.bot.start((ctx) => {
      const user = ctx.message.from;
      const userName = user.username ?? user.first_name ?? 'friend';
      console.log(`[telegram] /start executed by ${userName} (id=${user.id}) chat=${ctx.message.chat.id}`);
      ctx.reply(`Welcome ${userName}! 🚀\n\nI'm a bot template. Send /help to see what I can do.`);
    });

    this.bot.help((ctx) => {
      const user = ctx.message.from;
      const userName = user.username ?? user.first_name ?? 'friend';
      console.log(`[telegram] /help executed by ${userName} (id=${user.id}) chat=${ctx.message.chat.id}`);
      return ctx.reply(
        'Here are the available commands:\n\n/start - Welcome message\n/help - Show this help message\n/ping - Check if the bot is alive\n\nSend me any text, and I\'ll echo it back!',
      );
    });

    this.bot.command('ping', (ctx) => {
      const user = ctx.message.from;
      const userName = user.username ?? user.first_name ?? 'friend';
      console.log(`[telegram] /ping executed by ${userName} (id=${user.id}) chat=${ctx.message.chat.id}`);
      return ctx.reply(`Pong! 🏓 Latency: ${Date.now() - ctx.message.date * 1000}ms`);
    });

    this.bot.on(message('text'), async (ctx) => {
      const user = ctx.message.from;
      const userName = user.username ?? user.first_name ?? String(user.id);
      const text = ctx.message.text ?? '';
      if (text.startsWith('/')) {
        const cmd = text.split(' ')[0];
        console.log(`[telegram] command ${cmd} executed by ${userName} (id=${user.id}) chat=${ctx.message.chat.id} text="${text}"`);
      } else {
        console.log(`[telegram] text message from ${userName} (id=${user.id}) chat=${ctx.message.chat.id} text="${text}"`);
      }

      const incoming = {
        userId: String(user.id),
        chatId: String(ctx.message.chat.id),
        text,
      };
      const sendReply = async (chatId: string, text: string): Promise<void> => {
        await ctx.telegram.sendMessage(chatId, text);
      };
      await this.echoUseCase.execute(incoming, sendReply);
    });

    this.bot.on('message', (ctx) => {
      console.log(`[telegram] non-text message from ${ctx.message?.from?.id ?? 'unknown'} chat=${ctx.message?.chat?.id ?? 'unknown'}`);
      return ctx.reply('I can only process text messages for now.');
    });
  }

  async handleUpdate(rawUpdate: unknown): Promise<void> {
    type BotUpdate = Parameters<typeof this.bot.handleUpdate>[0];
    await this.bot.handleUpdate(rawUpdate as BotUpdate);
  }

  async registerWebhook(webhookUrl: string): Promise<WebhookResult> {
    const ok = await this.bot.telegram.setWebhook(webhookUrl);
    return { ok, url: webhookUrl };
  }

  async healthCheck(): Promise<'ok' | 'error'> {
    try {
      await this.bot.telegram.getMe();
      return 'ok';
    } catch {
      return 'error';
    }
  }
}
