import pgFunction from "pg-promise";
import config from ".";

const initOptions = {
  query(e: any) {
    console.log(e.query);
  },
};

const pgp = pgFunction(initOptions);

const db = pgp({
  host: config.pgsql.host,
  port: config.pgsql.port,
  user: config.pgsql.username,
  password: config.pgsql.password,
  database: config.pgsql.database,
  ssl: false,
  max: 20,
  maxUses: 7500,
});

export { pgp, db };
