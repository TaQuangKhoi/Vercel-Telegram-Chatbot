import type { IBotAdapter, WebhookResult } from '@/domain/ports/IBotAdapter';

// Zalo OA webhook update format:
// { event_name: string; sender: { id: string }; recipient: { id: string }; message: { text: string } }
//
// NOTE: Zalo OA does not support programmatic webhook registration.
// Configure the webhook URL in the Zalo OA admin panel instead:
// https://oa.zalo.me → Settings → Webhook

export class ZaloBotAdapter implements IBotAdapter {
  async handleUpdate(rawUpdate: unknown): Promise<void> {
    void rawUpdate;
    throw new Error('ZaloBotAdapter: not yet implemented');
  }

  async registerWebhook(webhookUrl: string): Promise<WebhookResult> {
    void webhookUrl;
    throw new Error(
      'ZaloBotAdapter: webhook registration must be done through the Zalo OA admin panel',
    );
  }

  async healthCheck(): Promise<'ok' | 'error'> {
    throw new Error('ZaloBotAdapter: not yet implemented');
  }
}
