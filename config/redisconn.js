import Redis from 'ioredis';
import { redisConnection } from './config.js';
import { configDotenv } from 'dotenv';
configDotenv()
const redis = new Redis({
  host: redisConnection.host,
  port: redisConnection.port,
  password: redisConnection.password,
  db:redisConnection.db
});

redis.on('connect', 
  () =>
    console.log('Redis connected' , redis.options.host)
  );

redis.on('error', (err) => console.error('Redis Cache Error:', err));

export default redis;
