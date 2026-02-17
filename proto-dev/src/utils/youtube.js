const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com'
]);

const extractIdFromUrl = raw => {
  try {
    const url = new URL(raw);
    if (!YOUTUBE_HOSTS.has(url.hostname)) {
      return '';
    }
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace('/', '').trim();
      return id;
    }
    const paramsId = url.searchParams.get('v');
    if (paramsId) return paramsId.trim();
    const parts = url.pathname.split('/').filter(Boolean);
    const embedIndex = parts.indexOf('embed');
    if (embedIndex >= 0 && parts[embedIndex + 1]) {
      return parts[embedIndex + 1].trim();
    }
    const shortsIndex = parts.indexOf('shorts');
    if (shortsIndex >= 0 && parts[shortsIndex + 1]) {
      return parts[shortsIndex + 1].trim();
    }
    return '';
  } catch {
    return '';
  }
};

const normalizeCandidate = candidate => {
  if (typeof candidate !== 'string') return '';
  const trimmed = candidate.trim();
  if (!trimmed) return '';
  const urlId = extractIdFromUrl(trimmed);
  if (urlId) return urlId;
  return trimmed;
};

export const resolveYoutubeId = (...candidates) => {
  for (const candidate of candidates) {
    const id = normalizeCandidate(candidate);
    if (id) return id;
  }
  return '';
};
