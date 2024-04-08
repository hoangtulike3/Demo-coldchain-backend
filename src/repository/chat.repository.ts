import { db } from "../config/db";

export class ChatRepo {
  // 채팅 메시지 발송
  static async addMessage(message: string, userId: string, roomId: string) {
    const result = await db.one(
      `SET TIME ZONE 'Asia/Seoul'; ` +
        `INSERT INTO message (message, user_id, room_id) 
        VALUES ('${message}', '${userId}', '${roomId}') 
        RETURNING *`
    );
    return result;
  }

  // 채팅 메시지 조회(user_id, room_id)
  static async getMessages(roomId: string, search: string) {
    const searchText = search ? `AND m.message LIKE '%' || $2 || '%'` : "";

    const result = await db.any(
      `
      SELECT 
        m.* 
      FROM message m
      LEFT JOIN room r ON r.id = m.room_id
      WHERE
        room_id = $1
      ${searchText}
      ORDER BY m.created_at DESC
    `,
      [roomId, search]
    );
    return result;
  }

  static async markAsRead(messageId: string, userId: string) {
    const query = `
      UPDATE message
      SET read_by = array_append(read_by, '${messageId}')
      WHERE 
        message_id = '${messageId}'
      AND
        user_id = '${userId}'
      RETURNING *
    `;
    return db.one(query);
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
    return db.manyOrNone(query);
  }
}
