export declare class RoomRepo {
    getRooms(userId: string, page: number, pageSize: number, searchName: string): Promise<{
        rooms: any[];
        totalCount: number;
    }>;
    addRoom(room: any): Promise<any>;
    modifyRoom(room: object, roomId: string, taskId: string): Promise<any>;
    getRoom(roomId: string): Promise<any>;
    getRoomParticipants(roomId: string): Promise<any[]>;
    static isParticipant(userId: string, roomId: string): Promise<boolean>;
    static isParticipantById(userId: string): Promise<boolean>;
}
