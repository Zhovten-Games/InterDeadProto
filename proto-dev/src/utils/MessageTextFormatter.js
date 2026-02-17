const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default class MessageTextFormatter {
  constructor({ linkClass = 'dialog__message-link' } = {}) {
    this.linkClass = linkClass;
  }

  format(text = '') {
    const source = String(text);
    if (!source) {
      return { html: '', hasLinks: false };
    }
    let html = '';
    let hasLinks = false;
    let lastIndex = 0;
    for (const match of source.matchAll(URL_PATTERN)) {
      const urlIndex = match.index ?? 0;
      const rawUrl = match[0] ?? '';
      html += escapeHtml(source.slice(lastIndex, urlIndex));
      const { url, trailing } = this._splitTrailingPunctuation(rawUrl);
      if (url) {
        const escapedUrl = escapeHtml(url);
        html += `<a class="${this.linkClass}" href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${escapedUrl}</a>`;
        hasLinks = true;
      } else {
        html += escapeHtml(rawUrl);
      }
      if (trailing) {
        html += escapeHtml(trailing);
      }
      lastIndex = urlIndex + rawUrl.length;
    }
    html += escapeHtml(source.slice(lastIndex));
    return { html, hasLinks };
  }

  _splitTrailingPunctuation(value) {
    let url = value;
    let trailing = '';
    while (url && /[),.!?:;]+$/.test(url)) {
      trailing = url.slice(-1) + trailing;
      url = url.slice(0, -1);
    }
    return { url, trailing };
  }
}
