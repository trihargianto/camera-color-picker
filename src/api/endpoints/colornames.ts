const COLOR_NAME_API_URL = "https://api.color.pizza/v1/";
const REQUEST_TIMEOUT_MS = 8000;

type ColorNameApiResponse = {
  paletteTitle: string;
};

export async function getBasicColorNameByHex(hexCode: string) {
  const params = new URLSearchParams({
    values: hexCode,
    list: "basic",
    noduplicates: "true",
  });

  const response = await fetch(`${COLOR_NAME_API_URL}?${params}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Color name API responded with ${response.status}`);
  }

  const data: ColorNameApiResponse = await response.json();

  return data.paletteTitle;
}

const colorNameCache = new Map<string, Promise<string>>();

/**
 * Same as `getBasicColorNameByHex`, but caches results (and in-flight requests)
 * per hex code. Failed requests are removed from the cache so they can be retried.
 */
export function getCachedBasicColorNameByHex(hexCode: string) {
  const cached = colorNameCache.get(hexCode);

  if (cached) {
    return cached;
  }

  const request = getBasicColorNameByHex(hexCode);

  colorNameCache.set(hexCode, request);
  request.catch(() => colorNameCache.delete(hexCode));

  return request;
}
