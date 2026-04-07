export interface IncomingMessage {
  userId: string;
  chatId: string;
  text: string;
}

export type SendReplyFn = (chatId: string, text: string) => Promise<void>;
