const memoryCache = new Map();
const MEMORY_HIT_TTL_SECONDS = 60;

function getMemoryValue(key) {
  const cachedEntry = memoryCache.get(key);

  if (!cachedEntry) {
    return undefined;
  }

  if (Date.now() >= cachedEntry.expiresAt) {
    memoryCache.delete(key);
    return undefined;
  }

  return cachedEntry.value;
}

function setMemoryValue(key, value, ttlSeconds) {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + Math.max(ttlSeconds, 1) * 1000
  });
}

function getRedisConfig() {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!baseUrl || !token) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    token
  };
}

async function runRedisCommand(path, options = {}) {
  const redisConfig = getRedisConfig();

  if (!redisConfig) {
    return null;
  }

  const response = await fetch(`${redisConfig.baseUrl}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${redisConfig.token}`
    }
  });
  const payload = await response.json();

  if (!response.ok || payload?.error) {
    throw new Error(payload?.error || "Redis cache request failed.");
  }

  return payload?.result;
}

function serializeValue(value) {
  return encodeURIComponent(Buffer.from(JSON.stringify(value), "utf8").toString("base64url"));
}

function deserializeValue(serializedValue) {
  return JSON.parse(Buffer.from(serializedValue, "base64url").toString("utf8"));
}

async function getRedisValue(key) {
  try {
    const result = await runRedisCommand(`/get/${encodeURIComponent(key)}`);

    if (result === null || result === undefined) {
      return undefined;
    }

    const parsedValue = deserializeValue(result);
    setMemoryValue(key, parsedValue, MEMORY_HIT_TTL_SECONDS);
    return parsedValue;
  } catch (error) {
    return undefined;
  }
}

async function setRedisValue(key, value, ttlSeconds) {
  try {
    await runRedisCommand(
      `/setex/${encodeURIComponent(key)}/${Math.max(ttlSeconds, 1)}/${serializeValue(value)}`,
      {
        method: "POST"
      }
    );
  } catch (error) {
    // Fall back to in-memory caching only if Redis is unavailable.
  }
}

async function getOrSetJson(key, ttlSeconds, loader) {
  const memoryValue = getMemoryValue(key);

  if (memoryValue !== undefined) {
    return memoryValue;
  }

  const redisValue = await getRedisValue(key);

  if (redisValue !== undefined) {
    return redisValue;
  }

  const loadedValue = await loader();
  setMemoryValue(key, loadedValue, ttlSeconds);
  await setRedisValue(key, loadedValue, ttlSeconds);
  return loadedValue;
}

module.exports = {
  getOrSetJson
};
