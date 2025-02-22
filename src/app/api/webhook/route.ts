import { NextRequest } from 'next/server';
import { Telegraf } from 'telegraf';
// import axios from 'axios';

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
// const HTTPS_ENDPOINT = 'https://your-api-endpoint.com/data';

const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string);

bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  const data = { user_id: ctx.message.from.id, message: userMessage };

  try {
    // await axios.post(HTTPS_ENDPOINT, data);
    console.log(data);
    await ctx.reply('Data sent successfully!');
  } catch (error) {
    await ctx.reply(`Failed to send data: ${error.message}`);
  }
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  await bot.handleUpdate(body);
  return new Response(null, { status: 200 });
}
