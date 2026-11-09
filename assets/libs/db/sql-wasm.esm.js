let initSqlJs;

if (typeof window !== 'undefined') {
  if (!window.initSqlJs) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // Load the UMD bundle which exposes initSqlJs on the window object
      script.src = new URL('./sql-wasm.js', import.meta.url).toString();
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  initSqlJs = window.initSqlJs;
} else {
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  // Use the sql.js UMD bundle from node_modules when running under Node.js
  initSqlJs = require('sql.js/dist/sql-wasm.js');
}

export default initSqlJs;
