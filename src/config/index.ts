import dotenv from "dotenv";

// check NODE_ENV
const ENV = process.env.NODE_ENV;
if (!ENV) throw new Error(`NODE_ENV is required.`);
if (!["development", "production", "local"].includes(ENV)) throw new Error(`Unknown NODE_ENV: ${ENV}`);

// load .env files
if (dotenv.config({ path: `.env/.env.${ENV}` }).error) throw new Error(`Environment file not found (.env.${ENV})`);
if (dotenv.config({ path: `.env/.env` }).error) throw new Error(`Environment file not found (.env)`);

// set default value
if (!process.env.TZ) process.env.TZ = "UTC";
if (!process.env.LOG_LEVEL) process.env.LOG_LEVEL = ENV === "production" ? "info" : "debug";

const config = {
  env: process.env.NODE_ENV,
  appId: process.env.APP_ID,
  projectId: process.env.PROJECT_ID,
  tz: process.env.TZ,
  log: {
    // default: info
    level: process.env.LOG_LEVEL,
    // default: YYYY-MM-DD
    datePattern: process.env.LOG_DATE_PATTERN,
    // default: null
    maxSize: process.env.LOG_MAX_SIZE,
    // default: null
    maxFiles: process.env.LOG_MAX_FILES,
    // default: false
    zippedArchive: process.env.LOG_ZIPPED_ARCHIVE?.booleanify(),
    // default: false
    errorFiles: process.env.LOG_ERROR_FILES?.booleanify(),
  },
  api: {
    port: parseInt(process.env.API_PORT),
    urls: process.env.API_URLS.split(","),
    sslEnabled: process.env.API_SSL_ENABLED.booleanify(),
    sslCertsPath: "./certs" as const,
    rateLimitWindowMs: parseInt(process.env.API_RATELIMIT_WINDOWMS),
    rateLimitMax: parseInt(process.env.API_RATELIMIT_MAX),
    swaggerEnabled: process.env.SWAGGER_ENABLED.booleanify(),
  },
  jwt: {
    secretKey: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    database: parseInt(process.env.REDIS_DATABASE || "0"),
  },
  pgsql: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
  },
  google: {
    clientIdWeb: process.env.GOOGLE_CLIENT_ID_WEB,
    clientIdIos: process.env.GOOGLE_CLIENT_ID_IOS,
    clientIdAndroid: process.env.GOOGLE_CLIENT_ID_ANDROID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    loginRedirectUrl: process.env.LOGIN_REDIRECT_URL,
  },
  s3: {
    bucket: process.env.S3_BUCKET || "",
    region: process.env.S3_REGION || "",
    accessKey: process.env.S3_ACCESS_KEY || "",
    secretKey: process.env.S3_SECRET_KEY || "",
  },
};

export default config;
