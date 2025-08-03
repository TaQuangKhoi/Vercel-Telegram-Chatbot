# Next.js Telegram Bot Template for Vercel

This is a template for bootstrapping a Telegram bot using the [Next.js App Router](https://nextjs.org/docs/app), ready to be hosted on [Vercel](https://vercel.com/). It uses [Upstash Redis](https://upstash.com/redis) for persistent data storage (e.g., user settings) and [Telegraf](https://telegraf.js.org/) as the Telegram bot framework.

## Features

- **Next.js 15:** Utilizes the App Router for API routes.
- **Vercel Edge Functions:** The webhook logic is designed to run on Vercel's Edge Network for fast responses.
- **Telegraf:** A powerful and modern framework for building Telegram bots.
- **Upstash Redis:** Serverless Redis database for storing state, included in Vercel's free plan.
- **TypeScript:** Fully typed codebase.
- **Easy Setup:** Get your bot running in minutes.

## Setup and Deployment

### 1. Prerequisites

- A [Telegram Bot](https://core.telegram.org/bots#how-do-i-create-a-bot). Talk to [@BotFather](https://t.me/BotFather) to create one and get your `TELEGRAM_TOKEN`.
- A [Vercel Account](https://vercel.com/signup).
- An [Upstash Redis Database](https://console.upstash.com/redis). You can create one for free from the Upstash console or via the Vercel marketplace.

### 2. Click to Deploy

The easiest way to get started is to click the button below to deploy this template directly to Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTaQuangKhoi%2FNapkin.one-Telegram-Chatbot&env=TELEGRAM_TOKEN,KV_REST_API_URL,KV_REST_API_TOKEN&project-name=my-telegram-bot&repository-name=my-telegram-bot)

Vercel will guide you through cloning the repository and setting up the required environment variables.

### 3. Manual Setup

If you prefer to set it up manually:

**a. Clone the repository:**

```bash
git clone [https://github.com/TaQuangKhoi/Napkin.one-Telegram-Chatbot.git](https://github.com/TaQuangKhoi/Napkin.one-Telegram-Chatbot.git) my-telegram-bot
cd my-telegram-bot
```

**b. Create an environment file:**

Copy the `.env.example` file to a new file named `.env.local`:

```bash
cp .env.example .env.local
```

**c. Fill in your environment variables in `.env.local`:**

- `TELEGRAM_TOKEN`: Your token from BotFather.
- `KV_REST_API_URL`: Your Upstash Redis REST API URL.
- `KV_REST_API_TOKEN`: Your Upstash Redis REST API Token.
- `VERCEL_URL`: For local development, set this to your ngrok or equivalent tunnelling service URL. When deploying to Vercel, this is set automatically.

**d. Install dependencies and run locally:**

```bash
npm install
npm run dev
```

### 4. Set the Webhook

After you have deployed your project to Vercel, you need to tell Telegram where to send updates.

Open your browser and visit the following URL:

`https://<YOUR_VERCEL_DEPLOYMENT_URL>/api/setWebHook`

This will register your bot's webhook with the Telegram API. You only need to do this once.

## Customizing the Bot

All the core bot logic is located in `/src/app/api/webhook/route.ts`.

You can add new commands or listeners easily using Telegraf's methods.

```typescript
// in /src/app/api/webhook/route.ts

// Add a new command
bot.command('custom', (ctx) => {
  ctx.reply('This is a custom command!');
});

// Listen for photo messages
bot.on(message('photo'), (ctx) => {
  ctx.reply('Nice picture!');
});
```
