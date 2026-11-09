# Repository Licensing Policy

Version: `1.0.0`

This repository defines a reusable licensing policy for repositories managed
by **FOP Oksana Dubinetska** and related projects.

It is designed to be connected as a pinned Git submodule. The policy separates
editorial materials, reusable code, third-party materials, and branding instead
of applying one license indiscriminately to an entire mixed repository.

> This repository is a policy source, not an open-source package.
> Its own restricted license is defined in [`LICENSE`](./LICENSE).
> Standard licenses stored under [`LICENSES/`](./LICENSES/) are reference texts
> for consuming repositories and do not license this policy repository itself.

## Recommended installation

Use the submodule path `.licensing-policy/`:

```bash
git submodule add https://github.com/FOP-Oksana-Dubinetska/repository-licensing-policy.git .licensing-policy
git commit -m "Add shared repository licensing policy submodule"
```

Pin the submodule to a reviewed tag or commit. Update it deliberately:

```bash
git -C .licensing-policy fetch --tags
git -C .licensing-policy checkout <tag-or-commit>
git add .licensing-policy
git commit -m "Update shared repository licensing policy"
```

## Mandatory root declaration in each consuming repository

Connecting the submodule does **not** automatically apply a license to the
consuming repository.

After adding the submodule, create a root-level `LICENSE.md` file. Copy the
following text and replace `<tag or commit SHA>` with the pinned policy version:

```md
# Licensing

This repository applies the shared repository licensing policy published at:

- Policy source: `https://github.com/FOP-Oksana-Dubinetska/repository-licensing-policy`
- Git submodule path: `.licensing-policy/`
- Pinned policy version: `<tag or commit SHA>`

The policy submodule is incorporated by reference. Its presence does not
automatically license this repository: this file declares the licenses that
apply to this repository.

## Default licensing map

Unless a more specific third-party notice, subtree notice, file-level notice,
or project-specific override applies:

| Scope | Default license |
|---|---|
| Original articles, prose, documentation, publication sources, and original non-brand editorial materials | `CC-BY-SA-4.0` |
| Original source code, scripts, tests, examples, reusable schemas, and reusable templates | `MIT` |
| Names, logos, trademarks, brand assets, and visual identity elements | No license granted; all rights reserved |
| Third-party materials | Their original upstream licenses and notices |

## Project-specific overrides

See `LICENSING-OVERRIDES.md` if that file exists.

If `LICENSING-OVERRIDES.md` does not exist, this repository declares no
project-specific overrides.

## Precedence

Where multiple notices apply, use the following order:

1. mandatory third-party upstream terms and notices;
2. file-level notices and SPDX identifiers;
3. subtree-specific `LICENSE`, `LICENSE.md`, or `NOTICE` files;
4. `LICENSING-OVERRIDES.md`;
5. the default licensing map above.

A project-specific override may clarify or replace a default only for material
owned by the repository rights holder. It cannot weaken or replace third-party
upstream obligations.

## Reference texts

Reference license texts are available through the pinned policy submodule:

- `.licensing-policy/LICENSES/CC-BY-SA-4.0.txt`
- `.licensing-policy/LICENSES/MIT.txt`

## Branding

No permission to reuse names, logos, trademarks, brand assets, or visual
identity elements is granted unless explicitly stated in writing.
```

The same template is stored in
[`templates/LICENSE.md`](./templates/LICENSE.md).

## Predominant default

Unless a consuming repository explicitly overrides the policy:

| Scope | Default |
|---|---|
| Original articles, prose, documentation, publication sources, and original non-brand editorial materials | `CC-BY-SA-4.0` |
| Original source code, scripts, tests, examples, reusable schemas, and reusable templates | `MIT` |
| Names, logos, trademarks, brand assets, and visual identity elements | No license granted; all rights reserved |
| Third-party materials | Their original upstream licenses and notices |

The default is intentionally scoped. It is not a repository-wide
`CC-BY-SA-4.0 OR MIT` dual license.

## Overrides

A consuming repository may override the defaults for its own materials by
adding a root-level `LICENSING-OVERRIDES.md` file.

Copy [`templates/LICENSING-OVERRIDES.example.md`](./templates/LICENSING-OVERRIDES.example.md)
and declare only the paths that differ from the default map.

Precedence:

1. mandatory third-party upstream terms and notices;
2. file-level notices and SPDX identifiers;
3. subtree-specific `LICENSE`, `LICENSE.md`, or `NOTICE` files;
4. `LICENSING-OVERRIDES.md`;
5. the default map in the consuming repository's root `LICENSE.md`.

An override cannot weaken or replace third-party upstream obligations.

## Files

```text
repository-licensing-policy/
├── README.md
├── LICENSE
├── POLICY_VERSION
├── LICENSES/
│   ├── CC-BY-SA-4.0.txt
│   ├── MIT.txt
│   └── LicenseRef-FOPOD-Repository-Policy-1.0.txt
└── templates/
    ├── LICENSE.md
    ├── LICENSING-OVERRIDES.example.md
    └── README-LICENSING-SECTION.md
```

## Important limitation

This repository provides an operational policy scaffold, not legal advice.
Before applying the policy to material with third-party dependencies,
employment-related ownership questions, trademarks, sensitive source data, or
jurisdiction-specific constraints, obtain professional legal review.

<details>
<summary><strong>Українська</strong></summary>

# Політика ліцензування репозиторіїв

Версія: `1.0.0`

Цей репозиторій визначає багаторазово використовувану політику ліцензування
для репозиторіїв, якими керує **FOP Oksana Dubinetska**, а також для пов'язаних
проєктів.

Його слід підключати як закріплений Git-сабмодуль. Політика розділяє редакційні
матеріали, багаторазово використовуваний код, сторонні матеріали та брендинг,
замість того щоб механічно застосовувати одну ліцензію до всього змішаного
репозиторію.

> Цей репозиторій є джерелом політики, а не open-source пакетом.
> Його власна обмежувальна ліцензія міститься у файлі [`LICENSE`](./LICENSE).
> Стандартні ліцензії в каталозі [`LICENSES/`](./LICENSES/) є довідковими
> текстами для підключених репозиторіїв і не ліцензують цей policy-репозиторій.

## Рекомендоване підключення

```bash
git submodule add https://github.com/FOP-Oksana-Dubinetska/repository-licensing-policy.git .licensing-policy
git commit -m "Add shared repository licensing policy submodule"
```

Сабмодуль слід закріплювати на перевіреному тегу або commit hash.

## Обов'язковий файл у корені підключеного репозиторію

Саме підключення сабмодуля **не** застосовує ліцензію автоматично.

Після підключення створіть у корені репозиторію файл `LICENSE.md`. Канонічний
англомовний текст наведено вище в окремому code block і збережено у
[`templates/LICENSE.md`](./templates/LICENSE.md). Замініть
`<tag or commit SHA>` на фактичну закріплену версію політики.

## Переважний default

| Область | Типова ліцензія |
|---|---|
| Власні статті, проза, документація, публікаційні джерела та редакційні матеріали без брендингу | `CC-BY-SA-4.0` |
| Власний вихідний код, скрипти, тести, приклади, багаторазово використовувані схеми та шаблони | `MIT` |
| Назви, логотипи, торговельні марки, brand assets і елементи візуальної ідентичності | Ліцензія не надається; усі права збережено |
| Сторонні матеріали | Їхні вихідні upstream-ліцензії та notices |

Це не загальна подвійна ліцензія `CC-BY-SA-4.0 OR MIT` для всього
репозиторію. Ліцензії застосовуються відповідно до типу матеріалу.

## Override

Для явних винятків створіть у корені `LICENSING-OVERRIDES.md` на основі
[`templates/LICENSING-OVERRIDES.example.md`](./templates/LICENSING-OVERRIDES.example.md).

Override не може послаблювати або скасовувати вимоги сторонніх upstream-ліцензій.

## Важливе обмеження

Цей репозиторій містить операційний шаблон політики, а не юридичну консультацію.

</details>

<details>
<summary><strong>Русский</strong></summary>

# Политика лицензирования репозиториев

Версия: `1.0.0`

Этот репозиторий задаёт переиспользуемую политику лицензирования для
репозиториев, которыми управляет **FOP Oksana Dubinetska**, а также для
связанных проектов.

Его следует подключать как закреплённый Git-сабмодуль. Политика разделяет
редакционные материалы, переиспользуемый код, сторонние материалы и брендинг,
вместо того чтобы механически применять одну лицензию ко всему смешанному
репозиторию.

> Этот репозиторий является источником политики, а не open-source пакетом.
> Его собственная ограничительная лицензия содержится в файле
> [`LICENSE`](./LICENSE). Стандартные лицензии в каталоге
> [`LICENSES/`](./LICENSES/) являются справочными текстами для подключаемых
> репозиториев и не лицензируют сам policy-репозиторий.

## Рекомендуемое подключение

```bash
git submodule add https://github.com/FOP-Oksana-Dubinetska/repository-licensing-policy.git .licensing-policy
git commit -m "Add shared repository licensing policy submodule"
```

Сабмодуль следует закреплять на проверенном теге или commit hash.

## Обязательный файл в корне подключаемого репозитория

Само подключение сабмодуля **не** применяет лицензию автоматически.

После подключения создайте в корне репозитория файл `LICENSE.md`. Канонический
англоязычный текст приведён выше в отдельном code block и сохранён в
[`templates/LICENSE.md`](./templates/LICENSE.md). Замените
`<tag or commit SHA>` на фактически закреплённую версию политики.

## Преимущественный default

| Область | Типовая лицензия |
|---|---|
| Собственные статьи, проза, документация, публикационные исходники и редакционные материалы без брендинга | `CC-BY-SA-4.0` |
| Собственный исходный код, скрипты, тесты, примеры, переиспользуемые схемы и шаблоны | `MIT` |
| Названия, логотипы, товарные знаки, brand assets и элементы визуальной идентичности | Лицензия не предоставляется; все права сохранены |
| Сторонние материалы | Их исходные upstream-лицензии и notices |

Это не общая двойная лицензия `CC-BY-SA-4.0 OR MIT` для всего репозитория.
Лицензии применяются в зависимости от типа материала.

## Override

Для явных исключений создайте в корне `LICENSING-OVERRIDES.md` на основе
[`templates/LICENSING-OVERRIDES.example.md`](./templates/LICENSING-OVERRIDES.example.md).

Override не может ослаблять или отменять требования сторонних
upstream-лицензий.

## Важное ограничение

Этот репозиторий содержит операционный шаблон политики, а не юридическую
консультацию.

</details>
