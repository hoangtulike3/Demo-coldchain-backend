export declare class ChatRepo {
    static addMessage(message: string, userId: string, roomId: string): Promise<any>;
    static getMessages(roomId: string, search: string): Promise<any[]>;
    static markAsRead(messageId: string, userId: string): Promise<any>;
    getDefinedMessages(): Promise<any[]>;
}
