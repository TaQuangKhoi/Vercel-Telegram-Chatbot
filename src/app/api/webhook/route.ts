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

    if (data.user_name == 'TaQuangKhoi') {
      return ctx.reply(`
        Hi Anna! 🌟
        You're not just any user—you're the reason I exist!
        Excited to help you bring your amazing ideas to life in Napkin.
        Let's create something wonderful together! 🚀
      `);
    }

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

bot.command('setToken', async (ctx) => {
    const user_name = ctx.message.from.username;

    if (!user_name) {
        return ctx.reply('⚠️ Please set a Telegram username first!');
    }

    // Get user data and assert its type safely
    const userData = await getUserData(user_name);

    const value = getValueOfCommand(ctx.message.text, '/setToken');
    
    if (!value) {
      return ctx.reply('⚠️ Please provide a token!');
    }

    userData.token = value;

    await redis.set(user_name, userData);

    return ctx.reply(`👍 Token set to: ${value}`);
})

bot.command('setEmail', async (ctx) => {
    const user_name = ctx.message.from.username;

    if (!user_name) {
      return ctx.reply('⚠️ Please set a Telegram username first!');
    }

    const userData = await getUserData(user_name);
    const value = getValueOfCommand(ctx.message.text, '/setEmail');
    if (!value) {
      return ctx.reply('⚠️ Please provide a email!');
    }
    userData.email = value;
    await redis.set(user_name, userData);

    return ctx.reply(`👍 Email set to: ${value}`);
});

bot.help((ctx) => ctx.reply(
  `
  I can help you create thoughts in Napkin!

  You can control your thoughts by sending these commands:

  **Edit Settings:**
  /setToken <token> - Set your Napkin token
  /setEmail <email> - Set your Napkin email

  `
));

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

  try {
    const user_name = ctx.message.from.username;

    if (!user_name) {
      return ctx.reply('⚠️ Please set a Telegram username first!');
    }

    // Get user data and assert its type safely
    const userData = await getUserData(user_name);
    if (userData.email?.length == 0 || userData.token == '') {
      return ctx.reply('⚠️ Please set a token and an email first using /setToken and /setEmail');
    }

    const send_thought_data = await axios.post(HTTPS_ENDPOINT, {
        email: userData.email,
        token: userData.token,
        thought: data.message,
        sourceUrl: ''
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
    });
    
    console.log('Status: ', send_thought_data.status);

    if (send_thought_data.status === 200) {
      await redis.incr('thoughts');
      await ctx.reply(`Thought sent successfully! Direct link: ${send_thought_data.data.url}`);
    } else {
      await ctx.reply('Failed to send data');
    }
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
