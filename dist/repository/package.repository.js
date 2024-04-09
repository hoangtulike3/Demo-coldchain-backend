"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
class PackageRepo {
    // 패키지 전체 조회
    async getPackages(page, pageSize, placeId, categoryId, contentId, statusId, wareId, searchName) {
        const offset = (page - 1) * pageSize;
        const params = [pageSize, offset, placeId, categoryId, contentId, statusId, wareId];
        if (searchName !== undefined) {
            params.push(searchName);
        }
        // const search = searchName ? `AND p.name LIKE '%' || $${params.length} || '%'` : "";
        const query = `
      SELECT 
        p.id,
        p.name AS package_id,
        p.title,
        p.description,
        p.place_id,
        place.name AS place_name,
        place.latitude,
        place.longitude,
        p.temp,
        p.min_temp,
        p.max_temp,
        b.id AS box_id,
        b.description AS box_description,
        pc.name AS content_name,
        p.net_weight,
        p.price,
        p.currency,
        array_agg(DISTINCT pt.photo_url) AS photo_urls,
        (
          SELECT json_agg(json_build_object('id', pc_cat.id, 'name', pc_cat.name))
          FROM unnest(p.category::int[]) AS c(id)
          JOIN package_category pc_cat ON pc_cat.id = c.id
        ) AS category,
        p.participants AS owner,
        p.content_id,
        p.status_id,
        p.ware_id,
        p.created_at,
        p.updated_at,
        COUNT(*) OVER() AS total_count
      FROM "package" p
      LEFT JOIN membership m ON m.package_id = p.id
      LEFT JOIN place ON place.id = p.place_id
      LEFT JOIN box b ON b.id = p.box_id
      LEFT JOIN package_content pc ON pc.id = p.content_id
      LEFT JOIN photos pt ON pt.package_id = p.id
      WHERE
        ($3::int[] IS NULL OR $3 = '{}' OR p.place_id = ANY($3))
      AND 
        ($4::int[] IS NULL OR $4 = ARRAY[]::int[] OR p.category::int[] && $4)
      AND 
        ($5::int[] IS NULL OR $5 = '{}' OR p.content_id = ANY($5))
      AND 
        ($6::int[] IS NULL OR $6 = '{}' OR p.status_id = ANY($6))
      AND 
        ($7::int[] IS NULL OR $7 = '{}' OR p.ware_id = ANY($7))
      AND
        p.title LIKE '%' || $${params.length} || '%'
      GROUP BY p.id, p.place_id, place.name, place.latitude, place.longitude, b.id, b.description, pc.name, p.net_weight, p.price, p.currency, p.participants, p.created_at, p.updated_at
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
        const packages = await db_1.db.manyOrNone(query, params);
        if (!packages.length) {
            return { packages: [], totalCount: 0 };
        }
        const totalCount = packages[0].total_count;
        return { packages, totalCount };
    }
    // 패키지 디테일 조회
    async getPackage(packageId) {
        const result = await db_1.db.one(`
      SELECT 
        p.id,
        p.name AS package_id,
        p.title,
        p.description,
        p.place_id,
        place.name AS place_name,
        place.latitude,
        place.longitude,
        p.temp,
        p.min_temp,
        p.max_temp,
        b.id AS box_id,
        b.description AS box_description,
        pc.name AS content_name,
        p.net_weight,
        p.price,
        p.currency,
        array_agg(DISTINCT pt.photo_url) AS photo_urls,
        (
          SELECT array_agg(pc_cat.name)
          FROM unnest(p.category::int[]) AS c(id)
          JOIN package_category pc_cat ON pc_cat.id = c.id
        ) AS category,
        pc_con.name AS content_name,
        pc_sta.name AS status_name,
        pc_ware.name AS ware_name,
        p.participants AS owner,
        p.created_at,
        p.updated_at
      FROM "package" p
      LEFT JOIN place ON place.id = p.place_id
      LEFT JOIN box b ON b.id = p.box_id
      LEFT JOIN package_content pc ON pc.id = p.content_id
      LEFT JOIN photos pt ON pt.package_id = p.id
      LEFT JOIN package_content pc_con ON pc_con.id = p.content_id
      LEFT JOIN package_status pc_sta ON pc_sta.id = p.status_id
      LEFT JOIN package_ware pc_ware ON pc_ware.id = p.ware_id
      WHERE 
        p.id = $1
      GROUP BY p.id, p.place_id, place.name, place.latitude, place.longitude, p.temp, p.min_temp, p.max_temp, b.id, b.description, pc.name, p.net_weight, p.price, p.currency, p.participants, pc_con.name, pc_sta.name, pc_ware.name, p.created_at, p.updated_at
      ORDER BY p.created_at DESC
      LIMIT 1
    `, [packageId]);
        return result;
    }
    // Delete Package
    async deletePackage(packageId) {
        const result = await db_1.db.oneOrNone(`
      DELETE
      FROM package
      WHERE 
        package.id = $1
    `, [packageId]);
        return result;
    }
    // Delete Package
    async deletePhotoOnPackageDeleted(packageId) {
        const result = await db_1.db.oneOrNone(`
      DELETE
      FROM photos
      WHERE 
      photos.package_id = $1
    `, [packageId]);
        return result;
    }
    // Delete Package
    async deletePhoto(packageId, values) {
        const result = await db_1.db.oneOrNone(`DELETE FROM photos WHERE package_id = $1 and photo_url NOT IN ($2:csv)`, [
            packageId,
            values,
        ]);
        return result;
    }
    async deleteAllPhoto(packageId) {
        const result = await db_1.db.oneOrNone(`DELETE FROM photos WHERE package_id = $1`, [packageId]);
        return result;
    }
    // 패키지 추가
    async addPackage(packageObj) {
        const result = await db_1.db.oneOrNone(`SET TIME ZONE 'Asia/Seoul'; ` +
            `INSERT INTO package (name, title, description, net_weight, price, currency, participants, place_id, box_id, category, content_id, status_id, ware_id, temp, min_temp, max_temp, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
      RETURNING *
      `, [
            packageObj.name,
            packageObj.title,
            packageObj.description,
            packageObj.net_weight,
            packageObj.price,
            packageObj.currency,
            packageObj.participants,
            packageObj.place_id,
            packageObj.box_id,
            packageObj.category,
            packageObj.content_id,
            packageObj.status_id,
            packageObj.ware_id,
            packageObj.temp,
            packageObj.min_temp,
            packageObj.max_temp,
        ]);
        return result;
    }
    // 패키지 수정
    async modifyPackage(packages, packageId) {
        await db_1.db.any(db_1.pgp.helpers.update(packages, null, "package") +
            `, updated_at = current_timestamp WHERE id = '${packageId}' RETURNING *`);
        return this.getPackage(packageId);
    }
    // 패키지 이름 조회
    async getPackageName() {
        const result = await db_1.db.manyOrNone(`
        SELECT
          p.name
        FROM "package" p
        ORDER BY p.created_at DESC
      `);
        return result;
    }
    // 패키지 카테고리 조회
    async getPackageFilterList() {
        const packageCategories = await db_1.db.manyOrNone(`
      SELECT id, name FROM package_category
      ORDER BY created_at DESC
    `);
        const packageContents = await db_1.db.manyOrNone(`
      SELECT id, name FROM package_content
      ORDER BY created_at DESC
    `);
        const packageWares = await db_1.db.manyOrNone(`
      SELECT id, name FROM package_ware
      ORDER BY created_at DESC
    `);
        const packageStatus = await db_1.db.manyOrNone(`
    SELECT id, name FROM package_status
    ORDER BY created_at DESC
  `);
        return {
            packageCategories,
            packageContents,
            packageWares,
            packageStatus,
        };
    }
    // 패키지 사진 추가
    async addPackagePhoto(photo_url, package_id) {
        const result = await db_1.db.oneOrNone(`SET TIME ZONE 'Asia/Seoul'; ` +
            `INSERT INTO "photos" (photo_url, package_id)
          VALUES ($1, $2)
          RETURNING *
          `, [photo_url, package_id]);
        return result;
    }
    // 패키지 박스 조회
    async getPackageBox() {
        const result = await db_1.db.manyOrNone(`
        SELECT
          b.id,
          b.name
        FROM "box" b
        ORDER BY b.created_at DESC
      `);
        return result;
    }
}
exports.default = PackageRepo;
//# sourceMappingURL=package.repository.js.map