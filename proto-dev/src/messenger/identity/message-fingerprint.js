/**
 * Compute a stable content fingerprint for dialog messages.
 * If an explicit fingerprint is provided it is returned as-is.
 * Otherwise the fingerprint is composed from ghost/stage/author/type/text
 * and an optional source (src or media id) for multimedia messages.
 *
 * @param {object} msg message data
 * @returns {string} stable fingerprint
 */
import { resolveYoutubeId } from '../../media/video/youtube.js';

export default function messageFingerprint(msg = {}) {
  const {
    fingerprint,
    occurrenceId,
    ghost = '',
    author = '',
    type = '',
    text = '',
    src = '',
    media = null,
    youtubeId = '',
    youtubeUrl = '',
    youtube = null,
    stageId = '',
  } = msg;
  if (fingerprint !== undefined && fingerprint !== null && fingerprint !== '')
    return String(fingerprint);
  if (occurrenceId) return `${ghost}:occurrence:${occurrenceId}`;
  const videoId = resolveYoutubeId(youtubeId, youtubeUrl, youtube?.id, youtube?.src);
  const source = src || (media && (media.id || media.src)) || videoId;
  const stage = typeof stageId === 'string' ? stageId : '';
  return `${ghost}:${stage}:${author}:${type}:${text}:${source}`;
}
