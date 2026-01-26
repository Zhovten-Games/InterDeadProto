export default class PostsService {
  constructor(database, ghostService) {
    this.db = database;
    this.ghostService = ghostService;
  }

  async publish(content = '') {
    await this.db.boot?.();
    const user = await this.db.loadUser();
    if (!user) return;
    const ghost = this.ghostService.getCurrentGhost();
    await this.db.executeQuery(
      `INSERT INTO posts(user_id, ghost_type, content, created_at) VALUES(?,?,?,?)`,
      [user.id, ghost.name, content, new Date().toISOString()]
    );
  }

  async getPostsForCurrent() {
    const user = await this.db.loadUser();
    const ghost = this.ghostService.getCurrentGhost();
    return this.db.fetchAll(
      `SELECT * FROM posts WHERE user_id=? AND ghost_type=? ORDER BY created_at DESC`,
      [user.id, ghost.name]
    );
  }

  async exportAllByGhost() {
    const user = await this.db.loadUser();
    if (!user) return {};
    const rows = await this.db.fetchAll(
      `SELECT ghost_type, content, created_at FROM posts WHERE user_id=? ORDER BY created_at ASC`,
      [user.id]
    );
    return rows.reduce((acc, row) => {
      const ghost = row.ghost_type || 'unknown';
      if (!acc[ghost]) acc[ghost] = [];
      acc[ghost].push({
        content: row.content,
        created_at: row.created_at
      });
      return acc;
    }, {});
  }

  async replaceAllByGhost(map = {}) {
    const user = await this.db.loadUser();
    if (!user) return;
    await this.db.exec(`DELETE FROM posts WHERE user_id=?`, [user.id]);
    const entries = Object.entries(map || {});
    for (const [ghost, posts] of entries) {
      if (!Array.isArray(posts)) continue;
      for (const post of posts) {
        const createdAt = post.created_at || new Date().toISOString();
        const content = post.content || '';
        await this.db.exec(
          `INSERT INTO posts(user_id, ghost_type, content, created_at) VALUES(?,?,?,?)`,
          [user.id, ghost, content, createdAt]
        );
      }
    }
  }
}

