export declare enum UserRole {
    Admin = "admin",
    User = "user"
}
export declare function isInstance<T extends object>(value: string | number, type: T): type is T;
