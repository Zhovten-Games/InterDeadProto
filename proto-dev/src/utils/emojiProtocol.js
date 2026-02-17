const PROTOCOL_LINE_COUNT = 6;

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const EMOJI_PROTOCOL_LABEL_KEYS = [
  'emoji_protocol.mode_label',
  'emoji_protocol.intent_label',
  'emoji_protocol.target_label',
  'emoji_protocol.range_label',
  'emoji_protocol.policy_label',
  'emoji_protocol.output_label'
];

export const splitEmojiProtocolLines = text =>
  String(text || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line !== '');

export const isEmojiProtocolText = text => {
  const lines = splitEmojiProtocolLines(text);
  return lines.length === PROTOCOL_LINE_COUNT;
};

export const buildEmojiProtocolHtml = (lines, labels = []) => {
  const safeLines = Array.isArray(lines) ? lines : [];
  const safeLabels = Array.isArray(labels) ? labels : [];
  return safeLines
    .map((line, idx) => {
      const label = escapeHtml(safeLabels[idx] || '');
      const value = escapeHtml(line);
      return `
        <span class="dialog__protocol-line">
          <span class="dialog__protocol-label">${label}</span>
          <span class="dialog__protocol-value">${value}</span>
        </span>
      `;
    })
    .join('');
};
