import { NextResponse } from 'next/server';
import { getContainer } from '@/infrastructure/di/container';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { botAdapter, messageRepository } = getContainer();
    const [botStatus, redisPong] = await Promise.all([
      botAdapter.healthCheck(),
      messageRepository.ping(),
    ]);
    return NextResponse.json({
      status: botStatus === 'ok' ? 'ok' : 'error',
      time: new Date().toISOString(),
      redis: redisPong === 'PONG' ? 'ok' : 'error',
    });
  } catch {
    return NextResponse.json({ status: 'error', redis: 'disconnected' }, { status: 500 });
  }
}