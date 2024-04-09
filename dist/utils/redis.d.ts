declare function getValue(key: string): Promise<string | null>;
declare function setValue(key: string, value: string, expireSecond?: number): Promise<void>;
declare function delKey(key: string): Promise<void>;
export { getValue, setValue, delKey };
