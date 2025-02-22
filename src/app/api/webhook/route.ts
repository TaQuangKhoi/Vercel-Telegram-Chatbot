import { NextRequest } from 'next/server';
import { Telegraf } from 'telegraf';
import axios from 'axios';
import { message } from 'telegraf/filters';

const HTTPS_ENDPOINT = 'https://app.napkin.one/api/createThought';

const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string);

bot.start((ctx) => {
    const userMessage = ctx.message.text;
    const data = { user_id: ctx.message.from.id, message: userMessage };

    ctx.reply(`Welcome ${data.user_id}!`);
})
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
bot.command('token', Telegraf.reply('λ'))

bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  const data = { user_id: ctx.message.from.id, message: userMessage };
  console.log(data);

  try {
    const send_thought_data = await axios.post(HTTPS_ENDPOINT, {
        email: 'leonardo@davinci.it',
        token: 'macchina-dettatura-ec1air8wcr',
        thought: 'The natural desire of good men is knowledge.',
        sourceUrl: 'https://thevisualagency.com/works/decoding-leonardo-da-vinci-for-the-world/'
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
    });
    
    await ctx.reply(
        JSON.stringify(send_thought_data.data, null, 2)
    );
  } catch (error) {
    if (error instanceof Error) {
      await ctx.reply(`Failed to send data: ${error.message}`);
    } else {
      await ctx.reply('Failed to send data: Unknown error');
    }
  }
  
});


export async function POST(req: NextRequest) {
  const body = await req.json();
  await bot.handleUpdate(body);
  return new Response(null, { status: 200 });
}
