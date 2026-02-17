export default class MessengerPostsWidget {
  constructor(container, languageManager) {
    this.container = container;
    this.languageManager = languageManager;
  }

  clear() {
    if (!this.container) return;
    this.container.replaceChildren();
  }

  async render(posts = []) {
    if (!this.container) return;
    this.container.replaceChildren();
    for (const post of posts) {
      const item = document.createElement('div');
      item.classList.add('messenger__post');

      const body = document.createElement('p');
      body.classList.add('messenger__post-content');

      if (post?.content) {
        body.setAttribute('data-i18n', post.content);
        const translated = await this.languageManager.translate(post.content, 'ui');
        body.textContent = translated;
      }

      item.appendChild(body);
      this.container.appendChild(item);
    }
    await this.languageManager.applyLanguage(this.container);
  }
}

