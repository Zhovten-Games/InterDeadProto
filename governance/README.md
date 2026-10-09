# Governance InterDeadProto

Status: candidate. Конституционная основа — `.code-constitution` at `220dc9c286ae06f8b6ed60cdda75112eed0408ed`.
Это закреплённый универсальный corpus; его repository-local DEVELOPMENT не
становится нашим Законодательством автоматически.

- [Учредительный профиль](PROFILE.md): все P01–P18, незавершённые человеческие значения явно отмечены.
- [Проектное Законодательство](legislation/DEVELOPMENT.md): IDP-DEV-001–015.
- [Выбор BASE](base-adoption.json): точная source revision и области адаптации.
- [Реестр актов](acts.json), [проверок](../manifest/rule-checks.json), [регуляторов](../manifest/technical-regulators.json).
- Licensing basis: `.licensing-policy` at `6e4c2627717c079827ed4aa9044a5346b3ea3ddb`; LICENSE.md и LICENSING-OVERRIDES.md непосредственно задают карту проекта.

Кандидаты не operative. См. P05/P10 и attestations/README.md. WARDEN технически
проверяет инженерный кандидат, но public release требует человеческой ратификации
и mandatory evidence. Исходный governance commit сохранён без переписывания.

```bash
git submodule update --init --recursive
npm --prefix proto-dev ci
npm --prefix proto-dev run check
```
