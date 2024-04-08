import { db, pgp } from "../config/db";

export class MembershipRepo {
  // 모든 회원의 멤버십 조회
  async getMembership() {
    const result = await db.many(`
      SELECT 
        m.*
      FROM "membership" m
      ORDER BY m.created_at DESC
    `);
    return result;
  }

  // 멤버십 추가
  static async addMembership(userId: string, itemId: string, type: string, itemType: "place" | "package") {
    let query;
    if (itemType === "place") {
      query = `
        INSERT INTO "membership" (user_id, place_id, type, created_at)
        VALUES ($1, $2, $3, current_timestamp)
        RETURNING user_id, place_id, type, created_at;
      `;
    } else {
      // itemType === "package"
      query = `
        INSERT INTO "membership" (user_id, package_id, type, created_at)
        VALUES ($1, $2, $3, current_timestamp)
        RETURNING user_id, package_id, type, created_at;
      `;
    }
    const result = await db.one(query, [userId, itemId, type]);
    return result;
  }

  // 멤버십 수정
  static async modifyMembership(members: any, userId: string) {
    const result = await db.oneOrNone(
      pgp.helpers.update(members, null, "membership") +
        `, updated_at = current_timestamp WHERE user_id = '${userId}' RETURNING *`
    );
    return result;
  }

  // 멤버십 삭제
  static async deleteMembership(userId: string) {
    await db.oneOrNone(`DELETE FROM "membership" where user_id = '${userId}'`);
    return null;
  }

  // 멤버십의 각 타입별로 조회
  async getMembers(type?: string) {
    const membershipType = type ? `WHERE m.type = $1` : "";
    const result = await db.manyOrNone(
      `
      SELECT DISTINCT ON (u.id)
        m.user_id,
        u.name,
        m.type,
        m.place_id,
        m.package_id,
        u.work_id,
        u.position,
        m.created_at,
        m.updated_at
      FROM "membership" m
      LEFT JOIN "user" u ON u.id = m.user_id
      ${membershipType}
      ORDER BY u.id, m.created_at DESC
    `,
      [type || ""]
    );
    return result;
  }

  // 해당 플레이스에 속한 모든 멤버십 조회
  async getMembershipInPlace(placeId: string) {
    const result = await db.manyOrNone(
      `
      SELECT 
        m.*
      FROM "membership" m
      WHERE
        place_id = $1
      ORDER BY m.created_at DESC
    `,
      [placeId]
    );
    return result;
  }

  // 해당 플레이스에 속한 모든 멤버십 조회
  async getMembershipInPlaceByMember(placeId: string, type: string) {
    const result = await db.manyOrNone(
      `
      SELECT 
        m.*
      FROM "membership" m
      WHERE
        place_id = $1
      AND
        type = $2
      ORDER BY m.created_at DESC
    `,
      [placeId, type]
    );
    return result;
  }

  // 플레이스 멤버십 확인
  async isParticipantPlace(placeId: string, userId: string, type: string): Promise<boolean> {
    const result = await db.oneOrNone(
      `
      SELECT 
        1 
      FROM "membership"
      WHERE 
        place_id = $1
      AND
        user_id = $2
      AND
        type = $3
    `,
      [placeId, userId, type]
    );
    return result !== null;
  }

  // 해당 패키지에 속한 모든 멤버십 조회
  async getMembershipInPackage(packageId: string) {
    const result = await db.manyOrNone(
      `
        SELECT 
          m.*
        FROM "membership" m
        WHERE
          package_id = $1
        ORDER BY m.created_at DESC
      `,
      [packageId]
    );
    return result;
  }
}
