declare const config: {
    env: string | undefined;
    appId: string;
    projectId: string;
    tz: string;
    log: {
        level: string;
        datePattern: string | undefined;
        maxSize: string | undefined;
        maxFiles: string | undefined;
        zippedArchive: boolean | undefined;
        errorFiles: boolean | undefined;
    };
    api: {
        port: number;
        urls: string[];
        sslEnabled: boolean;
        sslCertsPath: "./certs";
        rateLimitWindowMs: number;
        rateLimitMax: number;
        swaggerEnabled: boolean;
    };
    jwt: {
        secretKey: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    redis: {
        host: string;
        port: number;
        database: number;
    };
    pgsql: {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
    };
    google: {
        clientIdWeb: string | undefined;
        clientIdIos: string | undefined;
        clientIdAndroid: string | undefined;
        clientSecret: string | undefined;
        loginRedirectUrl: string | undefined;
    };
    s3: {
        bucket: string;
        region: string;
        accessKey: string;
        secretKey: string;
    };
};
export default config;
