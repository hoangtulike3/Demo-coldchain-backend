import { db, pgp } from "../config/db";

export class RoomRepo {
  // 채팅방 전체 조회
  async getRooms(userId: string, page: number, pageSize: number, searchName: string) {
    const search = searchName ? `AND r.name LIKE '%' || $4 || '%'` : "";
    const offset = (page - 1) * pageSize;

    const query = `
      WITH last_message AS (
        SELECT
          m.room_id,
          m.message AS last_message,
          m.created_at
        FROM message m
        WHERE
          m.id IN (
            SELECT
              MAX(m2.id)
            FROM message m2
            GROUP BY m2.room_id
          )
      ),
      room_data AS (
        SELECT
          r.*,
          lm.last_message,
          (
            SELECT 
              array_agg(json_build_object(
                'id', task.id,
                'name', task.name,
                'description', task.description,
                'status', task.status,
                'created_at', task.created_at,
                'updated_at', task.updated_at,
                'rtp', task.rtp,
                'participants', 
                  (
                    SELECT 
                      array_agg(json_build_object(
                        'id', public.user.id,
                        'name', public.user.name,
                        'email', public.user.email,
                        'phone', public.user.phone,
                        'status', public.user.status,
                        'role', public.user.role,
                        'work_id', public.user.work_id,
                        'avatar_url', public.user.avatar_url,
                        'display_name', public.user.display_name,
                        'type', public.user.type,
                        'description', public.user.description,
                        'work_position', public.user.position
                      )) 
                    FROM public.user
                    WHERE public.user.id IN (SELECT DISTINCT(unnest(array_agg(user_task.user_id)::int[])) from user_task WHERE user_task.task_id = task.id)
                  )
              ))
            FROM task
            WHERE task.room_id = r.id
          ) as tasks_info,
          (
            SELECT array_agg(json_build_object(
              'id', public.user.id,
              'name', public.user.name,
              'email', public.user.email,
              'phone', public.user.phone,
              'status', public.user.status,
              'role', public.user.role,
              'work_id', public.user.work_id,
              'avatar_url', public.user.avatar_url,
              'display_name', public.user.display_name,
              'type', public.user.type,
              'description', public.user.description,
              'work_position', public.user.position
            ))
            FROM public.user
            WHERE public.user.id IN (SELECT DISTINCT(unnest(room.participants::int[])) FROM room WHERE room.id = r.id)
          ) as participants_info,
          COUNT(*) OVER() AS total_count
        FROM "room" r
        JOIN user_room ur ON ur.room_id = r.id
        LEFT JOIN last_message lm ON lm.room_id = r.id
        LEFT JOIN package p ON p.id = r.package_id
        LEFT JOIN membership m ON m.place_id = p.place_id
        WHERE 
          ur.user_id = $1
        ${search}
        GROUP BY r.id, lm.last_message
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3
      )
      SELECT rd.*, rd.total_count FROM room_data rd
    `;

    const rooms = await db.manyOrNone(query, [userId, pageSize, offset, searchName]);

    if (!rooms.length || rooms.length === 0) {
      return { rooms: [], totalCount: 0 };
    }

    const totalCount = parseInt(rooms[0].total_count);

    return { rooms, totalCount };
  }

  // 채팅방 개설
  async addRoom(room: any) {
    const { name, participants, description, id } = room;
    let createdRoom: any;

    await db.tx(async (t) => {
      const roomInsertQuery =
        `SET TIME ZONE 'Asia/Seoul'; ` +
        `
          INSERT INTO public.room (name, participants, description, tasks)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
      createdRoom = await t.one(roomInsertQuery, [name, participants, description, id]);

      for (const user_id of participants) {
        await t.none(
          `SET TIME ZONE 'Asia/Seoul'; ` +
            `
            INSERT INTO public.user_room (user_id, room_id) 
            VALUES ($1, $2)
          `,
          [user_id, createdRoom.id]
        );
      }
    });

    return this.getRoom(createdRoom.id);
  }

  // 채팅방 수정
  async modifyRoom(room: object, roomId: string, taskId: string) {
    const currentRoom = await this.getRoom(roomId);
    const updatedTasks = currentRoom.tasks || [];
    updatedTasks.push(taskId);

    await db.any(`UPDATE room SET tasks = $1, updated_at = current_timestamp WHERE id = $2 RETURNING *`, [
      updatedTasks,
      roomId,
    ]);

    return this.getRoom(roomId);
  }

  // 채팅방 조회
  async getRoom(roomId: string) {
    const result = await db.one(
      `
        SELECT
          r.*,
          (
            SELECT 
              array_agg(json_build_object(
                'id', task.id,
                'name', task.name,
                'description', task.description,
                'status', task.status,
                'created_at', task.created_at,
                'updated_at', task.updated_at,
                'rtp', task.rtp,
                'participants', 
                  (
                    SELECT 
                      array_agg(json_build_object(
                        'id', public.user.id,
                        'name', public.user.name,
                        'email', public.user.email,
                        'phone', public.user.phone,
                        'status', public.user.status,
                        'role', public.user.role,
                        'work_id', public.user.work_id,
                        'avatar_url', public.user.avatar_url,
                        'display_name', public.user.display_name,
                        'type', public.user.type,
                        'description', public.user.description,
                        'work_position', public.user.position
                      )) 
                    FROM public.user
                    WHERE public.user.id IN (SELECT DISTINCT(unnest(array_agg(user_task.user_id)::int[])) from user_task WHERE user_task.task_id = task.id)
                  )
              ))
            FROM task
            WHERE task.room_id = r.id
          ) as tasks_info,
          (
            SELECT array_agg(json_build_object(
              'id', public.user.id,
              'name', public.user.name,
              'email', public.user.email,
              'phone', public.user.phone,
              'status', public.user.status,
              'role', public.user.role,
              'work_id', public.user.work_id,
              'avatar_url', public.user.avatar_url,
              'display_name', public.user.display_name,
              'type', public.user.type,
              'description', public.user.description,
              'work_position', public.user.position
            ))
            FROM public.user
            WHERE public.user.id IN (SELECT DISTINCT(unnest(room.participants::int[])) FROM room WHERE room.id = r.id)
          ) as participants_info
        FROM "room" r
        JOIN user_room ur ON ur.room_id = r.id
        LEFT JOIN package p ON p.id = r.package_id
        LEFT JOIN membership m ON m.place_id = p.place_id
        WHERE
          r.id = $1
        GROUP BY r.id
        ORDER BY r.created_at DESC
    `,
      [roomId]
    );
    return result;
  }

  // 채팅방 참여자 조회
  async getRoomParticipants(roomId: string) {
    const result = await db.any(
      `
        SELECT 
          r.id AS room_id,
          r.name AS room_name,
          r.created_at AS room_created_at,
          r.status AS room_status,
          ur.user_id AS participant_user_id
        FROM "room" r
        LEFT JOIN user_room ur ON ur.room_id = r.id
        WHERE
          r.id = $1
        ORDER BY r.created_at DESC
    `,
      [roomId]
    );
    return result;
  }

  // 채팅방 참여자 확인
  static async isParticipant(userId: string, roomId: string): Promise<boolean> {
    const result = await db.oneOrNone(
      `
      SELECT 
        1 
      FROM "user_room"
      WHERE 
        user_id = $1 
      AND 
        room_id = $2
    `,
      [userId, roomId]
    );
    return result !== null;
  }

  // 전체 채팅방 중 본인 확인
  static async isParticipantById(userId: string): Promise<boolean> {
    const result = await db.oneOrNone(
      `
      SELECT 
        1 
      FROM "user_room"
      WHERE 
        user_id = $1
    `,
      [userId]
    );
    return result !== null;
  }
}
