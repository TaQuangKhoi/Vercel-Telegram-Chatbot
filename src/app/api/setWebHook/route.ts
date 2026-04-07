import { NextResponse } from 'next/server';
import { getContainer } from '@/infrastructure/di/container';

export async function GET() {
  const vercelUrl = process.env.VERCEL_URL;

  if (!vercelUrl) {
    return new NextResponse('VERCEL_URL is not set. Are you running on Vercel?', { status: 500 });
  }

  const webhookUrl = `https://${vercelUrl}/api/webhook`;

  try {
    const result = await getContainer().botAdapter.registerWebhook(webhookUrl);
    if (!result.ok) {
      return NextResponse.json({ message: 'Failed to set webhook', details: result.details }, { status: 500 });
    }
    return NextResponse.json({ message: 'Webhook set successfully!', url: result.url, details: result.details });
  } catch (error) {
    console.error('Error setting webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}