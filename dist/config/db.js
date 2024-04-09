"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pgp = void 0;
const pg_promise_1 = __importDefault(require("pg-promise"));
const _1 = __importDefault(require("."));
const initOptions = {
    query(e) {
        console.log(e.query);
    },
};
const pgp = (0, pg_promise_1.default)(initOptions);
exports.pgp = pgp;
const db = pgp({
    host: _1.default.pgsql.host,
    port: _1.default.pgsql.port,
    user: _1.default.pgsql.username,
    password: _1.default.pgsql.password,
    database: _1.default.pgsql.database,
    ssl: false,
    max: 20,
    maxUses: 7500,
});
exports.db = db;
//# sourceMappingURL=db.js.map