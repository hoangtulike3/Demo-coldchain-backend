export declare enum Code {
    PARAMETER_NOT_FOUND = 1000,
    PARAMETER_INVALID = 1001,
    CLIENT_TYPE_INVALID = 1002,
    PLACE_NAME_DUPLICATED = 1003,
    ACCESS_TOKEN_EXPIRED = 1100,
    ACCESS_TOKEN_NOT_EXPIRED = 1101,
    ACCESS_TOKEN_INVALID = 1102,
    REFRESH_TOKEN_EXPIRED = 1103,
    REFRESH_TOKEN_INVALID = 1104,
    INVALID_CREDENTIAL = 1200,
    NOT_FOUND_USER = 1300,
    DUPLICATE_EMAIL = 1301,
    UN_AUTHORIZE = 1401,
    FORBIDDEN = 1403,
    NOT_FOUND = 1302,
    UNKNOWN_ERROR = 9999
}
export declare const errorMessage: {
    [key in Code]: string;
};
export declare class ErrorEx extends Error {
    readonly code: Code;
    readonly message: string;
    constructor(code: Code, message: string);
}
export declare function getError(code: Code, ...args: unknown[]): ErrorEx;
