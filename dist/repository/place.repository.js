"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceRepo = void 0;
const db_1 = require("../config/db");
class PlaceRepo {
    // 내가 속한 플레이스 전체 조회
    async getPlaces(
    // userId: string,
    page, pageSize, searchName, userLongitude, userLatitude) {
        const offset = (page - 1) * pageSize;
        const params = [pageSize, offset];
        let locationFilter = "";
        let searchCondition = "";
        if (searchName) {
            searchCondition = `WHERE p.name LIKE '%' || $${params.length + 1} || '%'`;
            params.push(searchName);
        }
        if (userLongitude !== undefined && userLatitude !== undefined) {
            locationFilter = `
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326),
        ST_SetSRID(ST_MakePoint($5, $6), 4326),
        5000
      )`;
            params.push(userLongitude, userLatitude);
        }
        // const search = searchName ? `AND p.name LIKE '%' || $${params.length} || '%'` : "";
        const query = `
      WITH place_data AS (
        SELECT 
          p.id,
          p.name,
          p.latitude,
          p.longitude,
          (select COUNT(*) from package where package.place_id = p.id) AS rtp,
          (select COALESCE(SUM(package.net_weight),0) from package where package.place_id = p.id) AS net_weight,
          pc.name AS place_category_name,
          p.open_time,
          p.close_time,
          array_agg(DISTINCT pt.photo_url) AS photo_urls,
          (select array_agg(package_category.name) from package_category where package_category.id in (select DISTINCT(unnest(package.category::int[])) FROM package where package.place_id = p.id)) AS category,
          COUNT(*) OVER() AS total_count
          ${userLongitude !== undefined && userLatitude !== undefined
            ? ", ST_Distance(ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326), ST_SetSRID(ST_MakePoint($5, $6), 4326)) AS distance"
            : ""}
        FROM "place" p
        LEFT JOIN "membership" m ON m.place_id = p.id
        LEFT JOIN "place_category" pc ON pc.id = p.category_id
        LEFT JOIN "photos" pt ON pt.place_id = p.id
        ${searchCondition}
        ${locationFilter}
        GROUP BY p.id, pc.name, p.open_time, p.close_time, p.latitude, p.longitude
        ${userLongitude !== undefined && userLatitude !== undefined ? "" : ", p.name, p.open_time, p.close_time"} 
        ORDER BY p.created_at DESC
      )
      SELECT 
        pd.*, 
        pd.total_count 
      FROM place_data pd
      ${userLongitude !== undefined && userLatitude !== undefined ? "ORDER BY distance ASC" : ""}
      LIMIT $1 OFFSET $2
    `;
        const places = await db_1.db.manyOrNone(query, params);
        if (!places.length) {
            return { places: [], totalCount: 0 };
        }
        const totalCount = places[0].total_count;
        return { places, totalCount };
    }
    // 플레이스 디테일 조회
    async getPlace(placeId) {
        const result = await db_1.db.oneOrNone(`
      SELECT 
        p.*,
        pc.name AS place_type,
        psert.name AS service_type_name,
        pstat.name AS station_type_name,
        pwt.name AS warehouse_type_name,
        array_agg(DISTINCT pt.photo_url) AS photo_urls,
        array_agg(m.user_id) FILTER (WHERE m."type" = 'member') AS member_ids,
        array_agg(m.user_id) FILTER (WHERE m."type" = 'supporter') AS supporter_ids,
        array_agg(m.user_id) FILTER (WHERE m."type" = 'guest') AS guest_ids
      FROM "place" p
      LEFT JOIN "place_category" pc ON pc.id = p.category_id
      LEFT JOIN "place_service_type" psert ON psert.id = p.service_type_id
      LEFT JOIN "place_station_type" pstat ON pstat.id = p.station_type_id
      LEFT JOIN "place_warehouse_type" pwt ON pwt.id = p.warehouse_type_id
      LEFT JOIN "membership" m ON m.place_id = p.id
      LEFT JOIN "photos" pt ON pt.place_id = p.id
      WHERE
        p.id = $1
      GROUP BY p.id, pc.name, psert.name, pstat.name, pwt.name
      ORDER BY p.created_at DESC
      LIMIT 1
    `, [placeId]);
        return result;
    }
    // 플레이스 추가
    async addPlace(placeObj) {
        const result = await db_1.db.oneOrNone(`SET TIME ZONE 'Asia/Seoul'; ` +
            `INSERT INTO "place" (name, description, latitude, longitude, address, address2, zip_code, created_at, service_type_id, station_type_id, warehouse_type_id, category_id, status, open_time, close_time, notification)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8, $9, $10, $11, 'Open', 8, 22, 'On')
      RETURNING *
      `, [
            placeObj.name,
            placeObj.description,
            placeObj.latitude,
            placeObj.longitude,
            placeObj.address,
            placeObj.address2,
            placeObj.zip_code,
            placeObj.service_type_id,
            placeObj.station_type_id,
            placeObj.warehouse_type_id,
            placeObj.category_id,
        ]);
        return result;
    }
    // 플레이스 수정
    async modifyPlace(place, placeId) {
        await db_1.db.any(db_1.pgp.helpers.update(place, null, "place") + `, updated_at = current_timestamp WHERE id = '${placeId}' RETURNING *`);
        return this.getPlace(placeId);
    }
    // 플레이스 타입 조회
    async getPlaceType() {
        const serviceTypesResult = await db_1.db.manyOrNone(`
      SELECT id, name FROM place_service_type
      ORDER BY created_at DESC
    `);
        const stationTypesResult = await db_1.db.manyOrNone(`
      SELECT id, name FROM place_station_type
      ORDER BY created_at DESC
    `);
        const warehouseTypesResult = await db_1.db.manyOrNone(`
      SELECT id, name FROM place_warehouse_type
      ORDER BY created_at DESC
    `);
        return {
            serviceTypesResult,
            stationTypesResult,
            warehouseTypesResult,
        };
    }
    // 플레이스 이름 조회
    async getPlaceName() {
        const result = await db_1.db.manyOrNone(`
      SELECT
        p.name
      FROM "place" p
      ORDER BY p.created_at DESC
    `);
        return result;
    }
    // 플레이스 카테고리 조회
    async getPlaceCategory() {
        const result = await db_1.db.manyOrNone(`
      SELECT
        p.id,
        p.name
      FROM "place_category" p
      ORDER BY p.created_at DESC
    `);
        return result;
    }
    // 서비스 조회
    async getService() {
        const result = await db_1.db.manyOrNone(`
        SELECT 
          p.id,
          p.name
        FROM "procedure" p
        ORDER BY p.id DESC
      `);
        return result;
    }
    // 알람 토글
    async toggleNotification(placeId) {
        const result = await db_1.db.manyOrNone(`
        UPDATE "place"
        SET notification = NOT notification
        WHERE id = $1
        RETURNING id, notification
      `, [placeId]);
        return result;
    }
    // 플레이스 사진 추가
    async addPlacePhoto(photo_url, place_id) {
        const result = await db_1.db.oneOrNone(`SET TIME ZONE 'Asia/Seoul'; ` +
            `INSERT INTO "photos" (photo_url, place_id)
        VALUES ($1, $2)
        RETURNING *
        `, [photo_url, place_id]);
        return result;
    }
}
exports.PlaceRepo = PlaceRepo;
//# sourceMappingURL=place.repository.js.map