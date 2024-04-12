import { db, pgp } from "../config/db";

export class TaskRepo {
  // 테스크 전체 조회
  async getTasks(userId: string, page: number, pageSize: number, searchName: string) {
    const search = searchName ? `AND r.name LIKE '%' || $4 || '%'` : "";
    const offset = (page - 1) * pageSize;

    const query = `
      WITH task_data AS (
        SELECT
          t.*,
          (
            SELECT
              json_build_object(
                'id', r.id,
                'name', r.name,
                'description', r.description,
                'status', r.status,
                'tasks_info',
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
                ),
                'participants_info',
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
                )
              )
              FROM "room" r
              JOIN user_room ur ON ur.room_id = r.id
              LEFT JOIN package p ON p.id = r.package_id
              LEFT JOIN membership m ON m.place_id = p.place_id
              WHERE
                r.id = t.room_id
              GROUP BY r.id
              ORDER BY r.created_at DESC
            ) as room_info,
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
                'description', public.user.description
            ))
            FROM public.user 
            WHERE public.user.id in
            (SELECT DISTINCT(unnest(array_agg(user_task.user_id)::int[])) FROM user_task WHERE user_task.task_id = t.id)
          ) as participants_info,

          COUNT(*) OVER() AS total_count
        FROM "task" t
        JOIN user_task ut ON ut.task_id = t.id
        LEFT JOIN room r ON r.id = t.room_id
        WHERE 
          ut.user_id = $1
        ${search}
        GROUP BY t.id
        ORDER BY t.created_at DESC
        LIMIT $2 OFFSET $3
      )
      SELECT td.*, td.total_count FROM task_data td
    `;

    const tasks = await db.manyOrNone(query, [userId, pageSize, offset, searchName]);

    if (!tasks.length || tasks.length === 0) {
      return { tasks: [], totalCount: 0 };
    }

    const totalCount = parseInt(tasks[0].total_count);

    return { tasks, totalCount };
  }

  // 테스크 생성
  async addTask(task: any, userId: string) {
    const { name, description, procedure_id, depart_place_id, arrive_place_id, rtp, status, room_id } = task;
    let createdTask: any;

    await db.tx(async (t) => {
      const roomInsertQuery =
        `SET TIME ZONE 'Asia/Seoul'; ` +
        `
          INSERT INTO public.task (name, description, procedure_id, depart_place_id, arrive_place_id, rtp, status, room_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *;
        `;
      createdTask = await t.one(roomInsertQuery, [
        name,
        description,
        procedure_id,
        depart_place_id,
        arrive_place_id,
        rtp,
        status,
        room_id,
      ]);

      await t.none(
        `SET TIME ZONE 'Asia/Seoul'; ` +
          `
            INSERT INTO public.user_task (user_id, task_id)
            VALUES ($1, $2)
          `,
        [userId, createdTask.id]
      );
    });

    return createdTask;
  }

  async modifyTask(task: any, taskId: string) {
    await db.tx(async (t) => {
      const updatedData = [];
      const values = [];

      for (const [key, value] of Object.entries(task)) {
        if (value !== undefined) {
          updatedData.push(`${key} = $${updatedData.length + 1}`);
          values.push(value);
        }
      }

      if (updatedData.length > 0) {
        const query =
          `SET TIME ZONE 'Asia/Seoul'; ` +
          `
          UPDATE public.task
          SET ${updatedData.join(", ")}, updated_at = NOW()
          WHERE id = $${updatedData.length + 1}
          RETURNING *;
        `;
        values.push(taskId);
        const updatedTask = await t.one(query, values);

        await t.none("DELETE FROM public.user_task WHERE task_id = $1", [taskId]);

        if (task.participants) {
          for (const user_id of task.participants) {
            await t.none(
              `SET TIME ZONE 'Asia/Seoul'; ` +
                `
              INSERT INTO public.user_task (user_id, task_id)
              VALUES ($1, $2);
              `,
              [user_id, taskId]
            );
          }
        }

        return updatedTask;
      }
    });

    return this.getTask(taskId);
  }

  // 테스크 조회
  async getTask(taskId: string) {
    const result = await db.one(`
        SELECT 
          t.*
        FROM "task" t
        WHERE
          id = '${taskId}'
        ORDER BY t.created_at DESC
    `);
    return result;
  }

  // 테스크 참여자 조회
  async getTaskParticipants(taskId: string) {
    const result = await db.any(`
        SELECT 
          t.id AS task_id,
          t.name AS task_name,
          t.created_at AS task_created_at,
          t.status AS task_status,
          ut.user_id AS participant_user_id
        FROM "task" t
        LEFT JOIN user_task ut ON ut.task_id = t.id
        WHERE
          t.id = '${taskId}'
        ORDER BY t.created_at DESC
    `);
    return result;
  }

  // 테스크 참여자 확인
  async isParticipant(userId: string, taskId: string): Promise<boolean> {
    const result = await db.oneOrNone(
      `
      SELECT 
        1 
      FROM "user_task"
      WHERE 
        user_id = $1 
      AND 
        task_id = $2`,
      [userId, taskId]
    );
    return result !== null;
  }

  // procedure 목록 조회
  async getProcedure() {
    const result = await db.manyOrNone(
      `
        SELECT 
          *
        FROM "procedure"
        ORDER BY id ASC
      `
    );
    return result;
  }

  // rtp 목록 조회
  async getRtp() {
    const result = await db.manyOrNone(
      `
          SELECT 
            *
          FROM "rtp"
          ORDER BY id ASC
        `
    );
    return result;
  }
}
