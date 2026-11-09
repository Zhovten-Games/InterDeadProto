# Учредительный профиль InterDeadProto

ID: `idp-profile-001`. Revision: `1.1.0`. Status: `operative`.
Canonical language: `ru`. Prepared: `2026-10-09`.

Инженерный профиль принят по прямому поручению Sam Starling от 2026-11-07. Поставка содержит точную запись принятия; сила наступает при локальном применении patch. Отдельное согласование Оксаны и выполненная приёмка физических устройств не заявляются.

## P01. Идентичность и область

Официальный репозиторий: https://github.com/Zhovten-Games/InterDeadProto.
Проект: браузерный игровой прототип InterDead, включая `proto-dev/src`, assets,
tooling, документацию, governance и проверяемые производные поставки.
Namespace локальных актов: `IDP-DEV-*`; решений: `IDP-DEC-*`; regressions:
`IDP-WH-*`. `ghost` означает духа/контакт; техническое имя capability —
`spirit-contacts`. Сеанс духа имеет собственный progression и timeline.

## P02. Внешний порядок

Публичные права определяются действующими LICENSE.md, LICENSING-OVERRIDES.md и pinned licensing policy. Организационный и юридический представитель студии — Oksana Dubinetska; Sam Starling отвечает за инженерное устройство и системный дизайн. Принятие профиля сохраняет авторство, ранее выданные разрешения, условия хостов и обязательное применимое право; передача имущественных прав этим актом не производится.

## P03. Источники намерения

Источники инженерного намерения: текущее поручение владельца от 2026-11-07, IDP-SPEC-STABILIZATION-001, issues #1–#6, исходники и согласованные ограничения сохранности данных. Sam Starling принимает технические решения; авторские источники и продуктовые решения сохраняют компетенцию их авторов. Приоритет: обязательный внешний предел, принятые Конституция/Профиль, защищённые положения, действующее Законодательство и удостоверенное проектное решение. AI исполняет делегированную работу.

## P04. Официальный корпус

Один Git commit задаёт canonical state. `proto-dev/src`, assets, build tooling,
governance и docs — source. `proto-dev/dist`, build reports, ZIP и branch `proto`
— generated/report. Runtime libs/models — external; frozen test examples —
fixture. README — навигация, technical/refactor-log — ненормативное evidence.
Русская Конституционная основа закреплена gitlink .code-constitution; английское
DEVELOPMENT и русский PROFILE самостоятельны в указанных языках, не переводы.
Подключённое repository-local DEVELOPMENT Конституции не является универсальной
Конституцией. Принятие переносимых BASE явно перечислено в base-adoption.json.

## P05. Учредительные роли

Sam Starling совмещает роли: автор предложения, редактор нормативного текста, эксперт инженерного предмета, организатор процедуры, ратификатор, удостоверяющий субъект и сопровождающий. Совмещение раскрыто в решении принятия. Oksana Dubinetska является организационным/юридическим представителем и хранителем доступов студии. Codex — делегированный исполнитель подготовки, реализации и технической проверки; его отчёт не является самостоятельным человеческим согласием. Передача либо отзыв роли требует атрибутированного решения Sam; изменение прав или авторского источника рассматривает компетентный носитель соответствующего полномочия.

## P06. Нормотворчество

Предложение содержит scope, основание, diff, последствия, проверку и откат. На первоначальном этапе единица согласия — Sam Starling, вес/кворум/порог 1. Текущее поручение прямо требует включить принятие инженерного профиля и делегирует подготовку. Обычный срок рассмотрения — семь календарных дней; учредитель вправе завершить его раньше с основанием, как в данном завершении ранее подготовленного кандидата. Возражения поступают через issue либо владельцу; они сохраняют точную редакцию и предмет. Waiver требует владельца, срока и компенсирующих проверок; protected data/history/evidence не отменяются им. Реестр waivers исходно пуст.

## P07. Исполнение и проверка

Maintainer реализует принятые контракты. WARDEN — традиционный технический
регулятор с устойчивым наблюдательным driver. Он проверяет нормы, не создаёт их,
не ратифицирует Профиль и не выдаёт waivers. Reviewer оценивает exact source и
artifact identity, включая физические browsers и исторические saves.

## P08. Споры и восстановление

Техническая компетенция по спорам принадлежит Sam Starling; спор рассматривается по revision, норме, expected/actual и последствиям. Организационные/правовые вопросы передаются Oksana Dubinetska в пределах её компетенции. Порядок отвода: заинтересованный участник раскрывает конфликт, второй сооснователь назначает компетентного reviewer; до назначения действует последняя проверенная версия. Порядок апелляции — повторное обращение с новым основанием. Порядок восстановления — сохранение спорной evidence и возврат последней проверенной реализации без удаления пользовательских данных. CI фиксирует отказ и не определяет авторскую истину.

## P09. Юрисдикции и совместные изменения

Runtime ведает приложением и данными; tooling — артефактами; governance — силой норм; WARDEN — наблюдением через устойчивый интерфейс. Sam Starling сопровождает общие event/schema/build границы. Совместные изменения API, схемы, public artifact topology и лицензирования требуют одной записи перехода и проверки всех затронутых потребителей. Владение каталогом не учреждает дополнительного человеческого полномочия. WARDEN сохраняет историю и не изменяет runtime ради прохождения теста.

## P10. Ратификация и удостоверение

Единица инженерного принятия — Sam Starling; вес 1, кворум 1, порог 1. Основание — его прямое поручение от 2026-11-07 включить принятие и самостоятельно подготовить профили. Заморожены профиль, DEVELOPMENT, BASE selection, registries, licensing и pins. Решение governance/decisions/2026-11-07-adoption.md и governance/attestations/ratification.json связывают точные hashes и атрибутированное основание. При локальном применении поставки профиль вступает в силу. Запись не заявляет отдельный голос Оксаны, подпись, заседание либо неисполненную человеческую техническую проверку.

## P11. Поправка

Sam Starling либо затронутый contributor предлагает поправку с old/new revision, impact, миграцией и откатом; Sam удостоверяет инженерную поправку по P06/P10. Protected control change сохраняет before/after hashes, неизменённые исторические drivers и новую запись решения с отрицательными проверками. Правовые/авторские границы требуют их компетентного владельца. Git сохраняет предыдущую редакцию.

## P12. Защищённые положения

Защищены production user data, backup миграции, права, достоверная evidence, immutable historical tests и canonical chronology. Изменение защищённого условия требует отдельного явного решения Sam и рассмотрения затронутых прав/авторских источников. Допуск публикации определяется действующим списком обязательных автоматических проверок и принятием норм. Физическая/внешняя приёмка ведётся отдельно по release-policy.json; её результаты сохраняют фактический статус.

## P13. Ресурсы

Sam Starling сопровождает repository/main, build contracts, proto и Butler channel; Oksana Dubinetska хранит организационные доступы. Локальный исполнитель получает только необходимые права в рамках задачи. Токены находятся в GitHub/Cloudflare secret stores. Существующие D1, deployment keys и локальные user profiles сохраняются. Generated proto не редактируется как source; Cloudflare/itch host state подтверждается отдельно.

## P14. Аварийный порядок

Sam Starling либо организационный хранитель доступов останавливает затронутую публикацию при угрозе данным/целостности, сохраняет source/artifact/data evidence, закрывает неисправный ресурс и восстанавливает последний проверенный artifact. Пересмотр происходит перед следующим выпуском либо в течение 72 часов. Сохранения не удаляются ради отката; авария не разрешает переписать историю или согласие.

## P15. Реестры и evidence

Официальные пути: governance/acts.json, base-adoption.json, waivers.json,
manifest/rule-checks.json, manifest/technical-regulators.json,
governance/decisions, governance/attestations,
constitutional-guard/manifest/history.json. build/results/warden-report.json — generated.
Исторические проверки immutable; supersession сохраняет old file/hash/decision.
Внешнее manual evidence — IRON_WARDEN_MANUAL_EVIDENCE_FILE, вне tracked source,
UTC RFC3339, freshness 30 дней, exact source/tree/ZIP/build identity.
refactor-log отмечает PREPARED/PARTIAL/BLOCKED/VERIFIED с конкретным scope.

## P16. Техническое принуждение

Browser gates имеют deadline 120 секунд; серия 20 публичных переходов — 300
секунд, включая реальные UI animations и восстановление. Истечение deadline
является failed, а не подтверждением прохождения сценария.

Язык — JavaScript ES modules. npm; Vite; SQL.js. Выбранная проверенная среда:
Node.js 24.19.0 и npm 11.9.0. Прежняя CI line Node 20 сохранена в baseline evidence;
переход описан в IDP-DEC-TOOLCHAIN-001. TypeScript-only BASE-T01/L01/L02 не приняты;
JS lint и format — реальные commands. Полный locked dependency audit требует
нулевой реестр vulnerabilities; недоступность registry даёт unavailable/failed,
публикация блокируется. Vite 8.3.4/Mocha 12.0.3 и прочие exact версии закреплены
в package.json/lockfile; источник миграции: https://vite.dev/guide/migration. Full interface из root:
`npm --prefix proto-dev run check`. Integrity → prebuild → isolated assembly →
postbuild → ratification and optional host evidence → aggregation. Любой incomplete mandatory
gate блокирует release; отдельный phase pass не является release pass.
Camera metadata/frame/play timeout 10 секунд; Worker requests 60 секунд;
одна выполняемая inference, CPU Worker backend, без hidden main-thread fallback.
Локальный browser gate измеряет interval heartbeat 16 мс: минимум два heartbeat,
maximum gap ≤250 мс во время реальных CPU warmup/inference; hardware Opera
проверяется отдельно с browser/OS/version и timing evidence.
Detection threshold default 0.5, bounds 0.1–0.95; UI может менять threshold через
declared port. Multi-tab storage: один writer под browser exclusive lock; без
lock API — declared recoverable refusal persistent writes, не unsafe snapshots.
Публичные templates/src namespace сохраняются по build/artifact-map.json.

## P17. Переход

Последовательность: baseline → governance/toolchain → verification foundation →
capability placement → kebab names → bootstrap → chronology/migration → camera →
switch/snapshot → AI/remaining flows → integrated candidate → user release.
Source topology — пересматриваемая hypothesis. Старые saves получают backup и
детерминированную legacy chronology; lost narrative truth не восстанавливается
по догадке. Контрольные точки internal review отделены от разрешения публикации.
Публикация использует exact artifact проверенного run без rebuild/mutation.

## P18. Неписаный порядок

Практика не получает normative force из повторения. Наследованные технические
контракты описаны в baseline, glossary, source-topology и artifact map.
Доказательство: source/issue/history/trace, scope и reviewers. Неписаная практика
кодифицируется по P06; её существование не снимает release gates.

Дополнение P16: transitive build-only overrides minimatch 11.0.5 и glob 14.0.4 приняты для устранения опубликованных advisory от октября–ноября 2026; версии и rationale закреплены в manifest/dependencies.json и lockfile. Полная проверка подтверждает совместимость.
