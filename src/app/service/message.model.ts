export interface Message {
    chatId: string;
    timestamp: number;
    senderId: string;
    text: string;
    isCurrentUser?: boolean;
  }