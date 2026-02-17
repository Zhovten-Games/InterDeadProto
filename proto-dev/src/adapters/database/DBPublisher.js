import IDatabasePublisher from '../../ports/IDatabasePublisher.js';

export default class DBPublisher extends IDatabasePublisher {
  constructor(databaseService, logger) {
    super();
    this.db = databaseService;
    this.logger = logger;
  }

  async boot() {
    this.logger.info('DBPublisher booted');
  }

  async registerUser(name) {
    const now = new Date().toISOString();
    await this.db.exec(
      `INSERT INTO users(name, created_at) VALUES(?,?)`,
      [name, now]
    );
    this.logger.info(`User registered: ${name}`);
  }

  async publishPost(userId, content) {
    const now = new Date().toISOString();
    await this.db.exec(
      `INSERT INTO posts(user_id, content, created_at) VALUES(?,?,?)`,
      [userId, content, now]
    );
    this.logger.info(`Post published by user ${userId}`);
  }

  async fetchPosts(userId) {
    return this.db.get(
      `SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
  }
}
