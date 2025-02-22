import { NextRequest } from 'next/server';
import { Telegraf } from 'telegraf';
import axios from 'axios';
import { message } from 'telegraf/filters';
import { Redis } from '@upstash/redis'

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
})

const HTTPS_ENDPOINT = 'https://app.napkin.one/api/createThought';

const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string);

bot.start((ctx) => {
    const userMessage = ctx.message.text;
    const data = { 
        user_id: ctx.message.from.id, 
        user_name: ctx.message.from.username,
        message: userMessage 
    };

    ctx.reply(`Welcome ${data.user_name}!`);
})

bot.on(message('sticker'), async (ctx) => {
    const foo = await redis.get('foo');
    ctx.reply(`👍 ${foo}`);
})

// Define a type for your user data
type UserData = {
    token: string;
    email?: string;
};

bot.command('token', async (ctx) => {
    const user_name = ctx.message.from.username;

    if (!user_name) {
        return ctx.reply('⚠️ Please set a Telegram username first!');
    }

    // Get user data and assert its type safely
    const userData = await getUserData(user_name);

    const token = getValueOfCommand(ctx.message.text, '/token');

    userData.token = Math.random().toString(36).substring(7);

    await redis.set(user_name, userData);

    return ctx.reply(token ? `👍 Token set to: ${token}` : `👍 Token set to: ${userData.token}`);
})

bot.command('email', async (ctx) => {
    const user_name = ctx.message.from.username;

    if (!user_name) {
        return ctx.reply('⚠️ Please set a Telegram username first!');
    }

    return ctx.reply('doquyen');
});

async function getUserData(username: string): Promise<UserData> {
    // Get user data and assert its type safely
    let userData = await redis.get<UserData>(username);

    // If userData doesn't exist, initialize it
    if (!userData) {
        userData = { token: '', email: '' };
    }

    return userData;
}

function getValueOfCommand(message: string, command: string) : string | null {
    const parts = message.split(' ');
    if (parts[0] === command && parts.length > 1) {
        return parts[1];
    }
    return null; // or any default value you'd like
}

bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  const data = { user_id: ctx.message.from.id, message: userMessage };
  console.log(data);

//   await redis.incr('thoughts_sent');

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
    
    console.log('Status: ', send_thought_data.status);

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
