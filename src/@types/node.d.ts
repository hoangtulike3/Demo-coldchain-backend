declare namespace NodeJS {
  interface ProcessEnv {
    PROJECT_ID: string;
    APP_ID: string;
    API_PORT: string;
    API_URLS: string;
    API_SSL_ENABLED: string;
    API_RATELIMIT_WINDOWMS: string;
    API_RATELIMIT_MAX: string;
    API_MAX_DAYS: string;
    SWAGGER_ENABLED: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
    POSTGRES_HOST: string;
    POSTGRES_PORT: string;
    POSTGRES_DATABASE: string;
    POSTGRES_USERNAME: string;
    POSTGRES_PASSWORD: string;
  }
}
