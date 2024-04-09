"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepo = void 0;
const db_1 = require("../config/db");
class UserRepo {
    /** 사용자 등록 */
    async addUser(users) {
        const query = `SET TIME ZONE 'Asia/Seoul'; ` +
            `
        INSERT INTO "user" (name, status, role, email, phone, avatar_url, type, created_at)
          VALUES ('${users.name}', 'Available', '${users.role}', '${users.email}', '${users.phone}', '${users.avatar_url}', '${users.email ? 1 : 2}', current_timestamp)
        RETURNING id, name, status, role, email, phone, avatar_url, created_at, updated_at;
      `;
        const result = await db_1.db.one(query);
        return result;
    }
    /** 사용자 수정 */
    async modifyUser(users, userId) {
        const result = await db_1.db.oneOrNone(db_1.pgp.helpers.update(users, null, "user") + `, updated_at = current_timestamp WHERE id = '${userId}' RETURNING *`);
        return result;
    }
    // /** 사용자 삭제 (비활성) */
    //  async deleteUser(userId: string): Promise<User | null> {
    //   await db.oneOrNone<User>(`DELETE FROM "user" where id = '${userId}'`);
    //   return null;
    // }
    /** 사용자 조회 by 사용자 ID */
    async getUserById(id) {
        const query = `
      SELECT 
        id, 
        email, 
        role,
        phone,
        avatar_url,
        created_at, 
        updated_at
      FROM "user" 
      WHERE 
        id = $1
      ORDER BY created_at ASC
      LIMIT 1
    `;
        const result = await db_1.db.oneOrNone(query, [id]);
        return result;
    }
    /** 사용자 조회 by 사용자 ID */
    async getUserProfileById(id) {
        const query = `
      SELECT 
        id, 
        email, 
        role,
        phone,
        avatar_url,
        created_at, 
        updated_at,
        status,
        role,
        country,
        name,
        work_id,
        position,
        avatar_url,
        display_name,
        type,
        description
      FROM "user" 
      WHERE 
        id = $1
      ORDER BY created_at ASC
      LIMIT 1
    `;
        const result = await db_1.db.oneOrNone(query, [id]);
        return result;
    }
    /** 사용자 조회 by 이메일 */
    async getUserByEmail(email) {
        const query = `
      SELECT 
        id, 
        email, 
        role, 
        phone,
        avatar_url,
        created_at, 
        updated_at
      FROM "user" 
      WHERE 
        email = $1
      ORDER BY created_at ASC
      LIMIT 1
    `;
        const result = await db_1.db.oneOrNone(query, [email]);
        return result;
    }
    /** 사용자 목록 조회 */
    async findUsers(keyword) {
        const query = `
      SELECT 
        id, 
        email,
        name,
        role, 
        phone,
        avatar_url,
        created_at, 
        updated_at
      FROM "user"
      WHERE 
        email LIKE '%' || $1 || '%' OR
        phone LIKE '%' || $1 || '%' OR
        name LIKE '%' || $1 || '%'
      ORDER BY coalesce(updated_at, created_at) DESC
    `;
        keyword = keyword || "";
        const result = await db_1.db.manyOrNone(query, [keyword]);
        return result;
    }
    /** 사용자 목록 조회 */
    async findUserByWorkID(work_id) {
        const query = `
      SELECT 
        id,
        work_id
      FROM "user"
      WHERE 
        work_id = $1
    `;
        const result = await db_1.db.oneOrNone(query, [work_id]);
        return result;
    }
    /** 사용자 목록 조회 */
    async findUserByEmail(email) {
        const query = `
      SELECT 
        id,
        work_id
      FROM "user"
      WHERE 
        email = $1
    `;
        const result = await db_1.db.oneOrNone(query, [email]);
        return result;
    }
    /** 사용자 로그인 */
    async authenticate(email) {
        const query = `
      SELECT 
        id, 
        email, 
        role, 
        name, 
        phone,
        avatar_url,
        created_at, 
        updated_at
      FROM "user" 
      WHERE 
        email = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
        const result = await db_1.db.oneOrNone(query, [email]);
        return result;
    }
    /** 사용자 id 조회 */
    async getUserId(id) {
        const query = `
      SELECT 
        id
      FROM "user" 
      WHERE 
        id = $1
      ORDER BY created_at ASC
      LIMIT 1
    `;
        const result = await db_1.db.oneOrNone(query, [id]);
        return result;
    }
    /** 전체 사용자 조회 */
    async getUsers() {
        const query = `
      SELECT 
        *
      FROM "user" 
      ORDER BY created_at ASC
    `;
        const result = await db_1.db.manyOrNone(query);
        return result;
    }
    /** 전체 사용자 조회 */
    async getUsersName(userId) {
        const query = `
      SELECT 
        id,
        name
      FROM "user" 
      WHERE
        id = $1
      ORDER BY created_at ASC
    `;
        const result = await db_1.db.manyOrNone(query, [userId]);
        return result;
    }
}
exports.UserRepo = UserRepo;
//# sourceMappingURL=users.repository.js.map