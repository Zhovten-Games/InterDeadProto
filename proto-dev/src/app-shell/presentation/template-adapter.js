import ITemplateRenderer from '../ports/template-renderer-port.js';
import { resolveTemplateBaseUrl } from '../../asset-delivery/paths/template-base-url.js';

export default class TemplateService extends ITemplateRenderer {
  constructor(baseUrl = '/src/presentation/templates/', logger, moduleUrl = import.meta.url) {
    super();
    const resolvedBase = baseUrl || resolveTemplateBaseUrl(moduleUrl);
    this.baseUrl = resolvedBase.endsWith('/') ? resolvedBase : `${resolvedBase}/`;
    this.logger = logger;
    this._renders = new WeakMap();
  }

  async loadTemplate(name) {
    try {
      const res = await fetch(`${this.baseUrl}${name}.html`);
      if (!res.ok) throw new Error(`Template "${name}" not found`);
      return res.text();
    } catch (err) {
      this.logger?.error(err.message);
      throw err;
    }
  }

  fill(template, data = {}) {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => {
      return data[key] !== undefined ? data[key] : '';
    });
  }

  async render(name, data = {}) {
    const tpl = await this.loadTemplate(name);
    return this.fill(tpl, data);
  }

  async renderSection(sectionId, name, data = {}, { isCurrent = () => true } = {}) {
    const target = typeof sectionId === 'string' ? document.querySelector(sectionId) : sectionId;
    const revision = target ? (this._renders.get(target) || 0) + 1 : 0;
    if (target) this._renders.set(target, revision);
    try {
      const html = await this.render(name, data);
      const el = typeof sectionId === 'string' ? document.querySelector(sectionId) : sectionId;
      if (el && isCurrent() && this._renders.get(el) === revision) {
        el.innerHTML = html;
      }
      return html;
    } catch (err) {
      this.logger?.error(err.message);
      throw err;
    }
  }
}
