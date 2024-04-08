import moment from "moment-timezone";
import * as redis from "../config/redis";

moment.tz.setDefault("Asia/Seoul");

async function getValue(key: string) {
  return await redis.client.get(key);
}

async function setValue(key: string, value: string, expireSecond?: number) {
  await redis.client.set(key, value);
  console.log(`Token set in Redis: key=${key}, value=${value}, expireSeconds=${expireSecond}`);

  if (expireSecond !== undefined) {
    await redis.client.expire(key, expireSecond);
  } else {
    await redis.client.expire(key, 14 * 24 * 60 * 60); // 14일
  }

  // 저장된 토큰 바로 조회하여 로그 출력
  const storedValue = await redis.client.get(key);
  console.log(`Stored token in Redis after set: ${storedValue}`);
}

async function delKey(key: string) {
  await redis.client.del(key);
}

export { getValue, setValue, delKey };
