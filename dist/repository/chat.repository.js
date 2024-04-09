"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepo = void 0;
const db_1 = require("../config/db");
class ChatRepo {
    // 채팅 메시지 발송
    static async addMessage(message, userId, roomId) {
        const result = await db_1.db.one(`SET TIME ZONE 'Asia/Seoul'; ` +
            `INSERT INTO message (message, user_id, room_id) 
        VALUES ('${message}', '${userId}', '${roomId}') 
        RETURNING *`);
        return result;
    }
    // 채팅 메시지 조회(user_id, room_id)
    static async getMessages(roomId, search) {
        const searchText = search ? `AND m.message LIKE '%' || $2 || '%'` : "";
        const result = await db_1.db.any(`
      SELECT 
        m.* 
      FROM message m
      LEFT JOIN room r ON r.id = m.room_id
      WHERE
        room_id = $1
      ${searchText}
      ORDER BY m.created_at DESC
    `, [roomId, search]);
        return result;
    }
    static async markAsRead(messageId, userId) {
        const query = `
      UPDATE message
      SET read_by = array_append(read_by, '${messageId}')
      WHERE 
        message_id = '${messageId}'
      AND
        user_id = '${userId}'
      RETURNING *
    `;
        return db_1.db.one(query);
    }
    // 정의된 기본 메시지
    async getDefinedMessages() {
        const query = `
      SELECT
        id,
        message
      FROM defined_message
      ORDER BY id ASC
    `;
        return db_1.db.manyOrNone(query);
    }
}
exports.ChatRepo = ChatRepo;
//# sourceMappingURL=chat.repository.js.map