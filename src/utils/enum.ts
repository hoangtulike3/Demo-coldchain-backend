export enum UserRole {
  Admin = "admin",
  User = "user",
}

export function isInstance<T extends object>(value: string | number, type: T): type is T {
  return Object.values(type).includes(value);
}
