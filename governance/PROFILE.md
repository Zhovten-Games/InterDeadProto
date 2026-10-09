# Учредительный профиль InterDeadProto

ID: `idp-profile-001`. Revision: `1.0.0-candidate`. Status: `candidate`.
Canonical language: `ru`. Prepared: `2026-10-09`.

Это полный инженерный кандидат P01–P18. Он не удостоверяет согласие человека.
При применении diff статус остаётся candidate. Для operative-статуса требуются
заполненные учредительные значения, решение и удостоверение по P10.

## P01. Идентичность и область

Официальный репозиторий: https://github.com/Zhovten-Games/InterDeadProto.
Проект: браузерный игровой прототип InterDead, включая `proto-dev/src`, assets,
tooling, документацию, governance и проверяемые производные поставки.
Namespace локальных актов: `IDP-DEV-*`; решений: `IDP-DEC-*`; regressions:
`IDP-WH-*`. `ghost` означает духа/контакт; техническое имя capability —
`spirit-contacts`. Сеанс духа имеет собственный progression и timeline.

## P02. Внешний порядок

Публичные лицензии определяются LICENSE.md, LICENSING-OVERRIDES.md и pinned
licensing policy. Условия GitHub, itch.io, хостов и обязательное применимое
право сохраняют свою область. Исключительная юрисдикция не устанавливается.
Носитель прав и применимый организационный порядок: **UNRESOLVED**, заполняются
правообладателем; сведения соседних репозиториев не назначают его автоматически.
Исторические выданные MIT-разрешения не отзываются новой лицензионной картой.

## P03. Источники намерения

Основания инженерного перехода: IDP-SPEC-STABILIZATION-001, issues #1–#6,
проверенные исходники и согласованные требования сохранности данных, lifecycle,
semantic topology и source/artifact compatibility. Studio ownership определяет
цели и права; product/narrative authority — смысл игрового опыта; technical
authority — реализацию и проверяемые ограничения. Пользователи и contributors
могут заявлять затронутые интересы и возражения по P06/P08. Конкретные носители
этих полномочий и порядок разрешения конфликта намерений: **UNRESOLVED**.
Приоритет: обязательный внешний предел, принятые Конституция/Профиль,
защищённые положения, действующее Законодательство, удостоверенное проектное
решение. AI не становится источником полномочия.

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

Обязательные роли перехода: автор предложения, редактор нормативного текста,
эксперт проверки оснований и технического перевода, организатор процедуры,
ратификатор, удостоверяющий и исполнитель перехода. Технические функции
maintainer исходников, release operator и custodian evidence назначаются
исполнителю в конкретном scope. Конкретные люди, допустимое совмещение,
преемство, отзыв и способ проверки полномочий: **UNRESOLVED**.
Подготовитель patch не назначает себя ни одной ролью. До P10 public release
блокируется; исполнение инженерного кандидата не удостоверяет его принятие.

## P06. Нормотворчество

Кандидат процедуры: предложение → scope/основание → объявление затрагиваемым
участникам → review нормы и технического перевода → рассмотрение возражений →
согласие компетентных носителей → удостоверение в governance/decisions → запись
acts.json → вступление в силу. Срок рассмотрения, единицы согласия, порядок
возражения и замещения отсутствующего/отведённого участника: **UNRESOLVED**.
Человеческие подпись и согласие runner не генерирует. Состав согласующих — по
P05/P10. Изменение смысла нормы не маскируется обновлением hash или настройкой CI.
Локальное отклонение указывает основание, scope, причину и проверку; временный
waiver дополнительно содержит владельца, expiry и compensating checks и до
использования регистрируется в governance/waivers.json. По умолчанию реестр пуст.
JavaScript/ESM — выбранная среда, а не бессрочный TypeScript waiver.

## P07. Исполнение и проверка

Maintainer реализует принятые контракты. WARDEN — экспериментальный технический
регулятор с устойчивым наблюдательным driver. Он проверяет нормы, не создаёт их,
не ратифицирует Профиль и не выдаёт waivers. Reviewer оценивает exact source и
artifact identity, включая физические browsers и исторические saves.

## P08. Споры и восстановление

Норма читается вместе с scope, revision, evidence и намерением. Инстанция спора,
её компетенция, порядок отвода, апелляции и восстановления нарушенного состояния:
**UNRESOLVED**. До их назначения спор не разрешается самоназначением AI или
переименованием проверки. Спорный semantic boundary записывается в refactor-log;
path сам по себе не доказывает правдивость контракта. Технический отказ проверки
исправляется основанной поправкой либо исправлением кода. Evidence спорного
результата и предыдущая пригодная версия сохраняются для пересмотра по P11/P14.

## P09. Юрисдикции и совместные изменения

Runtime ведает поведением приложения и пользовательскими данными; tooling —
производством и преобразованием артефактов; governance — применимостью и силой
норм; WARDEN — наблюдением и свидетельством по объявленному интерфейсу.
Каталог capability обозначает предметную ответственность, но автоматически
не создаёт автономную юрисдикцию, полномочия или право на shared resource.
Изменение общей event vocabulary, database schema, public artifact topology,
лицензионного scope или verification boundary требует совместного review
затронутых областей и одной записи перехода. Владельцы shared resources и
конкретные согласующие назначаются по P05/P13, сейчас **UNRESOLVED**.
WARDEN не изменяет runtime state ради прохождения проверки и не ратифицирует
нормы; tooling не переносит business fixes из canonical source в CI rewrites.
Защищённые integrity/history/data-loss правила не отменяются debug flags.

## P10. Ратификация и удостоверение

Замораживается пакет PROFILE, DEVELOPMENT, BASE selection, registries, licenses,
pins и technical translations. Конкретные подписанты, quorum, свидетельство
согласия и момент вступления в силу: **UNRESOLVED**. Ратификация требует
заполнить эти значения и governance/attestations/ratification.json с actual
reviewer/date/decision и hashes пакета, перевести acts/profile в operative.
Применение patch и инженерное согласие не подменяют эту процедуру.

## P11. Поправка

Обычная поправка проходит P06 с old/new revision, impact, переходом и проверкой.
Изменение конституционной основы/pins — отдельное решение. Изменение protected
WARDEN interface/runner/history — control-change record со сравнением hashes и
negative tests. Право инициативы, threshold и удостоверитель — **UNRESOLVED**
до завершения P05/P10. Git history предыдущих актов сохраняет provenance.

## P12. Защищённые положения

Защищены сохранность production user data и backup миграции, права на материалы,
неподдельная evidence, immutable historical tests, единственная canonical
chronology и пределы человеческих/технических полномочий. Специальное согласие
для поправки защищённых условий: **UNRESOLVED**. Пока его нет, waiver не разрешён.

## P13. Ресурсы

Ресурсы: repository/main, generated proto, pinned sources, CI artifacts,
Butler channel zhovten-games/interdead:web, NOIR host, domain, deployment keys,
локальные profiles/media/database, third-party runtime/model. Owners и пороги
доступа: **UNRESOLVED**. Secrets находятся в GitHub secrets, не в patch/evidence.
Связь NOIR/Cloudflare с proto требует отдельного host evidence; она не выводится
из workflow. Ни пользователь, ни CI не правят generated proto как source.

## P14. Аварийный порядок

Кандидат: остановить публикацию, сохранить source/artifact/data snapshots,
закрыть неисправный runtime ресурс, восстановить предыдущий verified artifact,
оформить incident/review. User saves не удаляются ради rollback. Кто объявляет
аварию, срок и special threshold — **UNRESOLVED**. Emergency не выдаёт runner
право переписывать нормы и историю проверки.

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
postbuild → mandatory manual evidence → aggregation. Любой incomplete mandatory
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
