const DEFAULT_BUILD_ID = 'dev';

const resolveCacheBuildIdFromScript = documentRef => {
  if (!documentRef?.querySelector) return '';
  const explicit = documentRef.querySelector('[data-interdead-cache-build-id]');
  const value =
    explicit?.getAttribute?.('data-interdead-cache-build-id') ||
    explicit?.dataset?.interdeadCacheBuildId ||
    '';
  return typeof value === 'string' ? value.trim() : '';
};

const resolveCacheBuildIdFromGlobal = windowRef => {
  if (!windowRef) return '';
  const value = windowRef.__CACHE_BUILD_ID__ || windowRef.CACHE_BUILD_ID || '';
  return typeof value === 'string' ? value.trim() : '';
};

const resolveCacheBuildIdFromEnv = () => {
  const fromMeta = import.meta?.env?.VITE_CACHE_BUILD_ID;
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim();
  if (typeof process !== 'undefined') {
    const fromProcess = process.env?.CACHE_BUILD_ID || process.env?.VITE_CACHE_BUILD_ID;
    if (typeof fromProcess === 'string' && fromProcess.trim()) return fromProcess.trim();
  }
  return '';
};

export const resolveCacheBuildId = ({
  windowRef = typeof window !== 'undefined' ? window : null,
  documentRef = typeof document !== 'undefined' ? document : null
} = {}) => {
  const fromGlobal = resolveCacheBuildIdFromGlobal(windowRef);
  if (fromGlobal) return fromGlobal;
  const fromScript = resolveCacheBuildIdFromScript(documentRef);
  if (fromScript) return fromScript;
  const fromEnv = resolveCacheBuildIdFromEnv();
  if (fromEnv) return fromEnv;
  return DEFAULT_BUILD_ID;
};

export const cacheBuildId = resolveCacheBuildId();

export const appendCacheBuildParam = (url, buildId = cacheBuildId) => {
  if (!buildId) return url;
  if (typeof url !== 'string') return url;
  const base =
    typeof window !== 'undefined' && window.location
      ? window.location.href
      : 'https://localhost';
  const resolved = new URL(url, base);
  resolved.searchParams.set('v', buildId);
  return resolved.toString();
};
