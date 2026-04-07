export interface IMessageRepository {
  incrementUserMessageCount(userId: string): Promise<number>;
  getUserMessageCount(userId: string): Promise<number>;
  ping(): Promise<string>;
}
