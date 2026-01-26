/**
 * Contract for higher-level database publishers.
 */
export default class IDatabasePublisher {
  /**
   * Prepare the publisher for use.
   * @returns {Promise<void>}
   */
  async boot() {
    throw new Error('Method boot must be implemented by database publishers.');
  }

  /**
   * Register a new user record.
   * @param {string} name
   * @returns {Promise<void>}
   */
  async registerUser(name) {
    throw new Error('Method registerUser must be implemented by database publishers.');
  }

  /**
   * Publish a post for a user.
   * @param {number} userId
   * @param {string} content
   * @returns {Promise<void>}
   */
  async publishPost(userId, content) {
    throw new Error('Method publishPost must be implemented by database publishers.');
  }

  /**
   * Fetch posts for a user.
   * @param {number} userId
   * @returns {Promise<object|null>}
   */
  async fetchPosts(userId) {
    throw new Error('Method fetchPosts must be implemented by database publishers.');
  }
}
