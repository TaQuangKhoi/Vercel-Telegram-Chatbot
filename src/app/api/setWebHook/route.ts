export default async function handler(req, res) {
    
  
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/setWebhook?url=${webhookUrl}`
    );
  
    const data = await response.json();
    res.status(200).json(data);
  }

export async function GET(req: NextRequest) {
    console.log(req);
    
    const webhookUrl = 'https://napkin-one-telegram-chatbot.vercel.app/api/webhook';

    const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/setWebhook?url=${webhookUrl}`
    );

    const data = await response.json();
    
    return new Response(null, { status: 200 });
}