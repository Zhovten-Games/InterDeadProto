/** External boundary fixtures; production controllers/renderers remain under test. */
export const flushEvents = () => new Promise((resolve) => setImmediate(resolve));

export function adaptHistoryPort(port) {
  if (!port) return port;
  const acceptedByGhost = new Map();
  return Object.assign(Object.create(port), {
    clearUserRuntimeContext() {
      port.clearUserRuntimeContext?.();
      acceptedByGhost.clear();
    },
    load(ghost) {
      const rows = [...(port.load?.(ghost) || []), ...(acceptedByGhost.get(ghost) || [])];
      const identities = new Map(rows.map((row) => [row.fingerprint || JSON.stringify(row), row]));
      return [...identities.values()].map((row) => ({ ...row }));
    },
    appendUnique(ghost, messages) {
      const accepted = port.appendUnique?.(ghost, messages);
      if (Array.isArray(accepted)) return accepted;
      if (port.append) port.append(ghost, messages);
      else port.save?.(ghost, messages);
      acceptedByGhost.set(ghost, [...(acceptedByGhost.get(ghost) || []), ...messages]);
      return messages.map((message) => ({ ...message }));
    },
  });
}

export function cameraPort(port) {
  const defaults = {
    startStream: async () => {},
    stopStream() {},
    stop() {
      this.stopStream();
    },
    cancelPending() {},
  };
  port ||= {};
  for (const [name, implementation] of Object.entries(defaults))
    if (!port[name]) port[name] = implementation;
  return port;
}

export function cameraSessionPort(port) {
  return Object.assign(
    { getSessionToken: () => ({ session: 1 }), isSessionCurrent: (token) => token?.session === 1 },
    port,
  );
}
