function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getSupabaseConfig() {
  return {
    url: requireEnv("SUPABASE_URL").replace(/\/$/, ""),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  };
}

function buildHeaders(serviceRoleKey, extraHeaders = {}) {
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extraHeaders
  };

  if (!headers.Accept) {
    headers.Accept = "application/json";
  }

  if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

function appendQueryParams(url, query = {}) {
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }
      continue;
    }

    url.searchParams.set(key, String(value));
  }
}

async function supabaseRequest(path, options = {}) {
  const { url: supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const {
    method = "GET",
    query,
    body,
    headers
  } = options;
  const url = new URL(`${supabaseUrl}/rest/v1/${path}`);

  appendQueryParams(url, query);

  const response = await fetch(url, {
    method,
    headers: buildHeaders(serviceRoleKey, headers),
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(
      payload?.message || payload?.error_description || payload?.error || "Supabase request failed."
    );
    error.statusCode = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
}

function buildInFilter(values) {
  const serializedValues = values.map((value) => `"${String(value).replace(/"/g, '\\"')}"`);
  return `in.(${serializedValues.join(",")})`;
}

function now() {
  return new Date().toISOString();
}

module.exports = {
  buildInFilter,
  now,
  supabaseRequest
};
