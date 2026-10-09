# Local Build Lab

Из корня repository используется Node.js 24.19.0 и npm 11.9.0:

```bash
npm --prefix proto-dev ci
npm --prefix proto-dev run local:pipeline:smoke
npm --prefix proto-dev run local:pipeline:serve
```

`build/local-lab.mjs` вызывает тот же `build/assemble.mjs`, что полный WARDEN и CI.
Assembler копирует source в `build/workspace/proto-dev`, выполняет npm ci и
build:deploy, копирует static resources по artifact-map, notices и pinned licensing,
формирует provenance, hashes и ZIP в build/output. Canonical source не изменяется.
Локальные .env/config.env исключаются. Perl/rsync/Python для assembler не требуются.

Вся Local Build Lab evidence имеет diagnostic=true: это подготовка и просмотр,
release разрешает только полный `npm --prefix proto-dev run check`. `--smoke`
дополнительно проверяет обязательные HTTP resources, status/MIME/JSON и 404.
`--serve --port 4273` запускает preview; `--output <empty-directory>` копирует
артефакт в пустой каталог. `--install-mode auto|ci` всегда использует npm ci.

Локальные пакеты: `--local-packages all|@scope/package[,name]`,
`--local-packages-root`, `--local-package-map`, `--local-packages-workspace`,
`--local-packages-prepare-mode copy|link`, `--skip-local-package-build`,
`--force-local-package-build`, `--cleanup-local-packages-workspace`.
Их hashes записываются в diagnostic provenance. По умолчанию copy изолирует
package sources; link — явный диагностический режим. В finally исходные npm
packages восстанавливаются, включая ошибку подготовки/сборки. CI принимает
только tracked lockfile и не использует local package overrides.

Проверка кеша должна сохранять user saves: сначала экспорт профиля/снимок storage,
затем удаление только cache ai-runtime:: или unregister service worker. Clear site
data удаляет профиль и не является исправлением или обязательным шагом проверки.

Никакие команды Lab не публикуют ветку proto и не вызывают Butler.
