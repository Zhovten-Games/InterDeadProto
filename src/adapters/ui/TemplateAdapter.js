import ITemplateRenderer from '../../ports/ITemplateRenderer.js';
import { resolveTemplateBaseUrl } from '../../config/templateBaseUrl.js';

export default class TemplateService extends ITemplateRenderer {
  constructor(baseUrl = '/src/presentation/templates/', logger, moduleUrl = import.meta.url) {
    super();
    const resolvedBase = baseUrl || resolveTemplateBaseUrl(moduleUrl);
    this.baseUrl = resolvedBase.endsWith('/') ? resolvedBase : `${resolvedBase}/`;
    this.logger = logger;
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

  async renderSection(sectionId, name, data = {}) {
    try {
      const html = await this.render(name, data);
      const el =
        typeof sectionId === 'string' ? document.querySelector(sectionId) : sectionId;
      if (el) {
        el.innerHTML = html;
      }
      return html;
    } catch (err) {
      this.logger?.error(err.message);
      throw err;
    }
  }
}
