export type WebhookResult = {
  ok: boolean;
  url: string;
  details?: unknown;
};

export interface IBotAdapter {
  handleUpdate(rawUpdate: unknown): Promise<void>;
  registerWebhook(webhookUrl: string): Promise<WebhookResult>;
  healthCheck(): Promise<'ok' | 'error'>;
}
