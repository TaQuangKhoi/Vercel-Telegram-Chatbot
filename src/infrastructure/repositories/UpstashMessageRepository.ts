import { Redis } from '@upstash/redis';
import type { IMessageRepository } from '@/domain/ports/IMessageRepository';

export class UpstashMessageRepository implements IMessageRepository {
  private readonly client: Redis;

  constructor(url: string, token: string) {
    this.client = new Redis({ url, token });
  }

  async incrementUserMessageCount(userId: string): Promise<number> {
    return this.client.incr(`user:${userId}:messages`);
  }

  async getUserMessageCount(userId: string): Promise<number> {
    return (await this.client.get<number>(`user:${userId}:messages`)) ?? 0;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }
}
