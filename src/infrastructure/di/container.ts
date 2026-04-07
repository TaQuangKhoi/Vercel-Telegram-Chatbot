import type { IBotAdapter } from '@/domain/ports/IBotAdapter';
import type { IMessageRepository } from '@/domain/ports/IMessageRepository';
import { UpstashMessageRepository } from '@/infrastructure/repositories/UpstashMessageRepository';
import { TelegrafBotAdapter } from '@/infrastructure/adapters/telegram/TelegrafBotAdapter';
import { ZaloBotAdapter } from '@/infrastructure/adapters/zalo/ZaloBotAdapter';
import { EchoMessageUseCase } from '@/application/usecases/EchoMessageUseCase';

interface Container {
  botAdapter: IBotAdapter;
  messageRepository: IMessageRepository;
}

function createContainer(): Container {
  const redisUrl = process.env.KV_REST_API_URL;
  const redisToken = process.env.KV_REST_API_TOKEN;

  if (!redisUrl || !redisToken) {
    throw new Error('KV_REST_API_URL and KV_REST_API_TOKEN must be set');
  }

  const messageRepository = new UpstashMessageRepository(redisUrl, redisToken);
  const provider = process.env.BOT_PROVIDER ?? 'telegram';

  let botAdapter: IBotAdapter;

  switch (provider) {
    case 'telegram': {
      const token = process.env.TELEGRAM_TOKEN;
      if (!token) throw new Error('TELEGRAM_TOKEN must be set');
      const echoUseCase = new EchoMessageUseCase(messageRepository);
      botAdapter = new TelegrafBotAdapter(token, echoUseCase);
      break;
    }
    case 'zalo': {
      botAdapter = new ZaloBotAdapter();
      break;
    }
    default:
      throw new Error(`Unknown BOT_PROVIDER: "${provider}". Expected "telegram" or "zalo".`);
  }

  return { botAdapter, messageRepository };
}

let instance: Container | undefined;

export function getContainer(): Container {
  if (!instance) {
    instance = createContainer();
  }
  return instance;
}
