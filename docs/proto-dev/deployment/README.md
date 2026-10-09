# Source, distribution и каналы публикации

main содержит canonical source/governance/tooling. proto — generated deployment
branch для Pages; она не редактируется как исходники. Butler публикует тот же
проверенный tree в zhovten-games/interdead:web. Текущую связь NOIR/Cloudflare с
proto оператор подтверждает отдельным host evidence; workflow не доказывает её.

Полный `npm --prefix proto-dev run check` создаёт в изолированном workspace
production distribution и ZIP, связывает source SHA/tree, normative pins, toolchain,
lockfile/mapping/transformation hashes, historical manifest и exact artifact bytes.
Deployment jobs скачивают этот output и проверяют consumption gate, затем используют
его без rebuild. Все automatic и manual gates должны пройти; candidate CI отделён
от release verdict. Изменения нормативного candidate не публикуются автоматически.

Source capability paths и public URLs — отдельные контракты. Все 17 templates
сохраняют src/presentation/templates/\*; locales — src/i18n/locales; bundles —
src/[name]-[hash].js; runtime/model — assets/libs и assets/models. Полная карта:
[artifact-map.json](../../../build/artifact-map.json). Source исправляет business
behavior; declared plugin/static copy/build-ID transformations изменяют только
производную поставку. Shell wrapper не содержит business substitutions.

Local Build Lab использует общий assembler с diagnostic=true и optional local
package provenance. Инструкции: [Local Build Lab](../../../proto-dev/tests/local-build-lab/README.md).
Исходный profile/reset lifecycle сохраняется; rollback требует data backup и проверки
[save migration](../technical/save-migration.md), а не очистки localStorage.
