import type { IMessageRepository } from '@/domain/ports/IMessageRepository';
import type { IncomingMessage, SendReplyFn } from '@/domain/entities/IncomingMessage';

export class EchoMessageUseCase {
  constructor(private readonly repository: IMessageRepository) {}

  async execute(message: IncomingMessage, sendReply: SendReplyFn): Promise<void> {
    const count = await this.repository.incrementUserMessageCount(message.userId);
    await sendReply(message.chatId, `Echo: "${message.text}"\nThis is your message #${count}.`);
  }
}
