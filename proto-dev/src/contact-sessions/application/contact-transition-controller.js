/** Latest requested context is prepared off-state and committed synchronously. */
export default class ContactTransitionController {
  constructor() {
    this.revision = 0;
    this.requested = null;
    this.committed = null;
  }
  cancel() {
    this.revision += 1;
    this.requested = null;
  }
  async request(ghost, prepare, commit) {
    const revision = ++this.revision;
    this.requested = ghost;
    const isCurrent = () => revision === this.revision && this.requested === ghost;
    try {
      const candidate = await prepare({ ghost, revision, isCurrent });
      if (!isCurrent()) return { status: 'stale', revision };
      // commit is deliberately synchronous: no partial async state mutation.
      const result = commit(candidate, { ghost, revision });
      if (result?.then) throw new Error('Context commit must be synchronous');
      this.committed = ghost;
      return { status: 'committed', ghost, revision };
    } catch (error) {
      if (!isCurrent()) return { status: 'stale', revision };
      throw error;
    }
  }
}
