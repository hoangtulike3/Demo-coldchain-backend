import pgFunction from "pg-promise";
declare const pgp: pgFunction.IMain<{}, import("pg-promise/typescript/pg-subset").IClient>;
declare const db: pgFunction.IDatabase<{}, import("pg-promise/typescript/pg-subset").IClient>;
export { pgp, db };
