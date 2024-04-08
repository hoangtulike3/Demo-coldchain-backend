export {};

declare global {
  type UnitOfDate = "year" | "month" | "day" | "hour" | "min" | "sec" | "ms";

  interface Date {
    format(tz?: string, format?: string): string;
    add(amount: number, unit: UnitOfDate): Date;
  }

  interface String {
    booleanify(): boolean;
    dateify(tz?: string): Date;
  }
}
