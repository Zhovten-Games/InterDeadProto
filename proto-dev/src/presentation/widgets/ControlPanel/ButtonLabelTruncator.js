/**
 * Truncates overflowing button labels with a trailing dot.
 * Works after localization has been applied.
 */
export default class ButtonLabelTruncator {
  constructor({ documentRef = document, getLanguage = () => '' } = {}) {
    this.documentRef = documentRef;
    this.getLanguage = getLanguage;
  }

  apply(container) {
    if (!container || !this.documentRef) return;
    const labels = container.querySelectorAll('.control-button__label');
    labels.forEach((label) => this._truncateIfOverflow(label));
  }

  _truncateIfOverflow(label) {
    if (!label) return;
    const style = this.documentRef.defaultView?.getComputedStyle?.(label);
    if (!style || style.display === 'none' || style.visibility === 'hidden') return;
    if (label.offsetParent === null || label.clientWidth <= 0) return;

    const language = String(this.getLanguage?.() || '');
    const previousLang = label.dataset.labelLang || '';
    if (!label.dataset.fullLabel || previousLang !== language) {
      label.dataset.fullLabel = (label.textContent || '').trim();
      label.dataset.labelLang = language;
    }

    const fullLabel = label.dataset.fullLabel || '';
    label.textContent = fullLabel;
    if (!fullLabel) return;
    if (label.scrollWidth <= label.clientWidth) return;

    let next = fullLabel;
    while (next.length > 1 && label.scrollWidth > label.clientWidth) {
      next = next.slice(0, -1);
      label.textContent = `${next}.`;
    }
  }
}
