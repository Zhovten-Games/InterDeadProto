/**
 * Compute a stable content fingerprint for dialog messages.
 * If an explicit fingerprint is provided it is returned as-is.
 * Otherwise the fingerprint is composed from ghost/author/type/text
 * and an optional source (src or media id) for multimedia messages.
 *
 * @param {object} msg message data
 * @returns {string} stable fingerprint
 */
export default function messageFingerprint(msg = {}) {
  const {
    fingerprint,
    ghost = '',
    author = '',
    type = '',
    text = '',
    src = '',
    media = null,
    youtubeId = '',
    youtube = null
  } = msg;
  if (fingerprint) return String(fingerprint);
  const videoId = youtubeId || (youtube && (youtube.id || youtube.src)) || '';
  const source = src || (media && (media.id || media.src)) || videoId;
  return `${ghost}:${author}:${type}:${text}:${source}`;
}
