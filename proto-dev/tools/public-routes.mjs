import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Development routes share the assembler's source-to-artifact mapping. */
export default function publicRoutes() {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const map = JSON.parse(readFileSync(path.join(root, 'build/artifact-map.json'), 'utf8'));
  const routes = new Map(
    map.templates.map(({ source, publicPath }) => [`/${publicPath}`, path.join(root, source)]),
  );
  return {
    name: 'interdead-public-routes',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = request.url?.split('?')[0];
        let file = routes.get(url);
        if (
          !file &&
          url?.startsWith(`/${map.locales.publicPath}/`) &&
          /^\/[a-z/.-]+\.json$/.test(url)
        ) {
          const suffix = url.slice(map.locales.publicPath.length + 2);
          if (suffix.includes('..')) return next();
          file = path.join(root, map.locales.source, suffix);
        }
        if (!file) return next();
        try {
          response.setHeader(
            'Content-Type',
            file.endsWith('.json') ? 'application/json; charset=utf-8' : 'text/html; charset=utf-8',
          );
          response.end(readFileSync(file));
        } catch {
          response.statusCode = 404;
          response.end('Declared resource missing');
        }
      });
    },
  };
}
