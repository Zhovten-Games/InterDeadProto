const e="Добро пожаловать!",t="Далее",o="Записать",n="Ваше местонахождение",s="Определить местоположение",r="Пожалуйста, определите ваше местонахождение",i="Локальный режим",_="Запущена детекция, ожидаем человека…",a="Человек обнаружен!",l="Человек не найден, попробуйте ещё раз.",c="Главный экран",d="Добро пожаловать на главный экран!",p="Сделать фото",g="Завершить",u="Загрузка...",f="Приложение уже открыто в другой вкладке",m="Наша система защиты заблокировала запуск во второй вкладке. Если это ложное срабатывание, вы можете отключить защиту. При одновременной работе в двух вкладках возможны проблемы.",h="Отключить защиту и продолжить",b="Поиск...",k="Камера",y="Открыть мессенджер",A="Войдите, чтобы открыть чат",E="CONTACT ...",w="ИИ загружается ☕. Камера будет доступна после загрузки.",N="ИИ не загрузился. Повторить?",T="ИИ готов.",R="Повторить",I="ИИ загружается — камера будет доступна после загрузки.",B="ИИ не загрузился. Повторите попытку в лоадере.",D="ИИ",O="Регистрация профиля",x="Введите ваше имя",v="Начать анализ",q="Сделать селфи",C="Проверка...",S="Объект не найден, повторите попытку.",j="Импорт профиля",P="Выберите зашифрованный файл профиля и введите пароль, который использовался при экспорте.",L="Файл профиля",U="Пароль",G="Импортировать",M="Пожалуйста, выберите файл профиля.",K="Экспорт профиля",Y="Введите пароль для шифрования экспорта. Сохраните его, чтобы восстановить духов позже.",F="Пароль",H="Экспортировать",J="Профиль экспортирован",V="Профиль импортирован",W="Ошибка переноса профиля",Z="Отмена",z="Сброс данных",Q="Выберите, что сбросить.",X="Сбросить текущего духа",$="Сбросить всё приложение",ee="Отмена",te="Добавить реакцию",oe="Сменить реакцию",ne="Реакция выбрана духом",se="Подтвердить реакцию",re="Переключить заметку",ie="Открыть настройки",_e="InterDead — тизерный прототип.",ae="Система может работать нестабильно и допускать ошибки интерпретации. Взаимодействие осуществляется строго по протоколу и не является доказательством фактического контакта.",le="Рекомендуемые материалы:",ce="О приложении",de="Протокол общения",pe="Wiki",ge="Сообщить о баге",ue="https://interdead.fandom.com/ru/wiki/%D0%9F%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5_InterDead",fe="https://interdead.fandom.com/ru/wiki/Emoji_Protocol",me="https://interdead.fandom.com/ru/wiki/Interdead_%D0%92%D0%B8%D0%BA%D0%B8",he="Условия использования",be="https://interdead.phantom-draft.com/ru/pages/terms-of-use/#9a-proto-приложение--функции-noir",ke="https://github.com/Zhovten-Games/InterDeadProto/issues",ye="Ребут текущего духа",Ae="Есть новые сообщения",Ee="Контакт",we="Контакт с НИРО",Ne="Контакт приостановлен",Te="Открыть настройки профиля",Re="Я",Ie="Настройки профиля",Be="Управление экспортом профиля и настройками поведения мембраны.",De="Скачать конфиг профиля",Oe="Отключить движение мембраны при наведении",xe="Полностью отключить мембрану",ve="Текущий логин",qe="Не задан",Ce={welcome:e,continue:"Продолжить",next:t,post:o,your_location:n,detect_location:s,detect_location_prompt:r,detect_location_local:i,detection_in_progress:_,person_detected:a,no_person_detected:l,main_title:c,main_welcome:d,import:"Импорт",export:"Экспорт профиля",capture:p,finish:g,loading:u,app_already_open:f,app_already_open_warning:m,app_already_open_disable_guard:h,searching:b,open_camera:k,open_messenger:y,launcher_auth_required:A,ai_contact_line:E,ai_loading_status:w,ai_failed_status:N,ai_ready_status:T,ai_retry:R,ai_loading_camera:I,ai_failed_camera:B,ai_loading_badge:D,register_profile:O,enter_name_label:x,start_analysis:v,create_selfie:q,"guide.start":"👋🧭","guide.reply":"Готов!","guide.end":"📝🏁","guide.start.note1":"Версия A: Дружелюбное приветствие проводника.","guide.start.note2":"Версия B: Тёплый сигнал с компасом.","guide.end.note1":"Версия A: Проводник завершает инструкции.","guide.end.note2":"Версия B: Финальный акцент проводника.","guide.stage1":`Меня зовут NIRO. Я — интерфейсный ассистент в NOIR-мессенджере. Я не являюсь контактной стороной и не "вижу" узел: моя задача — провести вас через процедуру корректно и безопасно.

Нажмите Я (👤), чтобы скачать свои данные или отключить визуальные эффекты системы.

Нажмите Записать (✉️), чтобы начать гайд.`,"guide.stage2":`В этой версии приложения ответы пользователя формируются автоматически. Причина прагматичная: число неудачных бесед росло из-за непонимания протокола и попыток "ответить от себя" там, где требуется строгое соблюдение контракта (RANGE).

В будущем возможна версия, где вы сможете отвечать узлу вручную. Сейчас — не вмешивайтесь в работу приложения.

Важно: любые попытки модификации клиента (root/jailbreak, патчинг сборки, подмена логики, обход ограничений, вмешательство в маршрутизацию/проверки) приводят к снятию гарантий и отключают предпосылки безопасной эксплуатации.

Нажмите Записать (✉️), чтобы перейти к описанию формата и цикла.`,"guide.stage3":`Сообщения вне данного чата в подавляющем числе случаев будут выглядеть как эмодзи-формы протокола. Каждое сообщение — это контракт шага: что допустимо как ответ (RANGE), какое подтверждение считается успешным (ACK), и что будет дальше.

Цикл в этой сборке выглядит так:
1. Мы начинаем разговор с узлом нажатием Записать (✉️).
2. Узел отвечает (фиксируется ответная активность).
3. Мы запрашиваем историю/память узла.
4. Узел отвечает и формулирует первый контракт-задание.
5. Мы выполняем задания строго в пределах контракта: чаще всего — изображением, без лишнего текста.
6. Узел подтверждает шаг реакцией (ACK) и выдаёт следующий запрос.
7. После серии шагов — финал: результат (например, ссылка), затем завершение.

Нажмите Записать (✉️), чтобы узнать подробности работы с камерой в этой сборке.`,"guide.stage4":`В ходе цепочки узел может просить сфотографировать объект/сцену в пределах текущего RANGE. Вам нужно нажать Камера (📷) и сделать снимок строго того, что указано в контракте.

После съёмки приложение выполнит детекцию. Когда детекция успешна, становится доступна кнопка «Начать анализ» (🔍) — нажмите её, чтобы запустить обработку кадра.

Далее откроется окно с результатом анализа. Это окно фиксирует, что система приняла артефакт и обработала его по контракту.

Чтобы вернуться в диалог, нажмите «Открыть мессенджер» (💬) прямо в окне результата — вы окажетесь обратно в чате, где цикл продолжится (ACK/следующий запрос узла).

Если запрос подразумевает съёмку, но допустимость передачи изображения неочевидна, допускается опциональный шаг уточнения перед отправкой кадра (не для «торга», а для снятия неоднозначности). Я формирую подобные сообщения автоматически; вам нужно лишь нажимать Записать (✉️), когда он доступен.

Пример типичного запроса на поиск человека (шаблон):

MODE 🎭E
INTENT ❓
TARGET 🔎👤
RANGE 🧊🖼️⛓️🙈
POLICY 🧱
OUTPUT 🖼️

Смысл: узел требует строго изображение, затем подтверждает шаг реакцией (ACK).

Теперь откройте Камера (📷) и сделайте первый снимок (например, фото человека). После этого вернитесь в мессенджер и нажмите Записать (✉️), чтобы продолжить гайд.`,"guide.stage5":`Ключевой момент: узел может быть в любом состоянии и «думать» о происходящем что угодно — но выражать мысль он будет теми формами, которые допускает протокол.

Интерпретация остаётся вашим риском: протокол проверяет адмиссимость, а не «истину».

Пример: толковать 🍆 как Башню — формально допустимо.

NOIR:NIRO STATUS UNSTABLE
NIRO:MESSAGE UNTYPE
«НЕ ОТКАЗЫВАЙТЕ СЕБЕ НИ В ЧЁМ, ОПЕРАТОР—»
NOIR:HALT. COMMERCIAL FILTER APPLIED. CONTENT ADJUSTED.
NOIR:NIRO STATUS STABLE

См. кейс: CASE-01 — MARIA_ARCANA / Blind Spot
https://interdead.phantom-draft.com/blog/maria-arcana-blind-spot/

Нажмите Записать (✉️), чтобы перейти к предупреждениям и завершению.`,"guide.stage6":`Нюдсы и «кокетство» с узлом следует рассматривать как boundary-risk behaviour. Это не регламентировано протоколом как безопасная практика.

При этом важно: NIRO не интерпретирует содержание и не «отсекает» такие вещи за вас автоматически. Я фиксирую допустимость формата и напоминаю о границах. Если узел уводит контракт в интимные требования — корректный ответ: остановка и санитарное завершение без обсуждения — Сброс (♻️).

Также учитывайте: контакт может быть завершён самой системой, когда она считает это необходимым (риск, эскалация, нарушение границ, затяжная неопределённость, таймаут/срыв цикла).

Если вы последовательно и корректно разблокируете все фрагменты памяти узла, финальным результатом может стать феномен типа EVP — условно говоря, «узел споёт» (обычно это приходит как ссылка/аудио-артефакт).

Если артефакты бесед будут иметь ценность для сообщества, они могут быть зафиксированы в нашем блоге в разделе Артефакты:
https://interdead.phantom-draft.com/blog/

NIRO does not interpret. NIRO only fixes admissibility.
И отдельно: мы никогда не передаём в публичные материалы персональные данные пользователей. Если какой-либо артефакт будет признан ценным для сообщества, в случае отсутствия явного согласия оператора на раскрытие его личных данных артефакт публикуется только в обезличенном виде и без частных идентификаторов оператора.

История переписки с узлами переключается через ▲/▼ в панели.

Спасибо, что используете приложение.

NOIR:NIRO STATUS COMPLETE`,"guide.user.reply1":"НОИР: ПОЛЬЗОВАТЕЛЬ ВЫПОЛНИЛ ЗАПРОШЕННОЕ ДЕЙСТВИЕ: нажал Записать (✉️), чтобы начать гайд. КОНТАКТ.","guide.user.reply2":"НОИР: ПОЛЬЗОВАТЕЛЬ ВЫПОЛНИЛ ЗАПРОШЕННОЕ ДЕЙСТВИЕ: нажал Записать (✉️), чтобы перейти к формату и циклу. КОНТАКТ.","guide.user.reply3":"НОИР: ПОЛЬЗОВАТЕЛЬ ВЫПОЛНИЛ ЗАПРОШЕННОЕ ДЕЙСТВИЕ: нажал Записать (✉️), чтобы узнать о работе камеры в этой сборке. КОНТАКТ.","guide.user.reply4":"НОИР: ПОЛЬЗОВАТЕЛЬ ВЫПОЛНИЛ ЗАПРОШЕННОЕ ДЕЙСТВИЕ: открыл Камеру (📷), сделал первый снимок, вернулся в мессенджер и нажал Записать (✉️), чтобы продолжить гайд. КОНТАКТ.","guide.user.reply5":"НОИР: ПОЛЬЗОВАТЕЛЬ ВЫПОЛНИЛ ЗАПРОШЕННОЕ ДЕЙСТВИЕ: нажал Записать (✉️), чтобы перейти к предупреждениям и завершению. КОНТАКТ.","guide.user.reply6":"НОИР: ПОЛЬЗОВАТЕЛЬ ВЫПОЛНИЛ ЗАПРОШЕННОЕ ДЕЙСТВИЕ: подтвердил уведомление о завершении. КОНТАКТ.","guest1.user1":"Привет!","guest1.ghost1":"👋🙂","guest1.user2":"Как дела?","guest1.ghost2":"👍😌","guest1.user3":"Что дальше?","guest1.ghost3":"🧭🚽❓","guest1.ghost4":"🙏☕️🔍","guest1.user4":"Уже ищу.","guest1.end":"✅🎉","guest1.video":"Присылаю ролик на YouTube — открой его в окне просмотра.","guest1.handshake.user1":`🧭R
👋
🌙⏸️💀
🌫️🧷
🧱
🧷`,"guest1.handshake.ghost1":`🎭E
👋
👤
🌫️🧷
🧱
🧷`,"guest1.handshake.user2":`🧭R
❓
👤
🌫️🧷
🧱
🧷`,"guest1.handshake.ghost2":`🎭E
✅
🌙⏸️💀
🌫️🧷
🌀
🧷`,"guest1.request.teddy":`🎭E
❓
🔎🧸
🧊🖼️⛓️🙈
🧱
🖼️`,"guest1.request.bed":`🎭E
❓
🔎🛏️
🧊🖼️⛓️🙈
🧱
🖼️`,"guest1.request.bottle":`🎭E
❓
🔎🍼
🧊🖼️⛓️🙈
🧱
🖼️`,"guest1.request.chair":`🎭E
❓
🔎🪑
🧊🖼️⛓️🙈
🧱
🖼️`,"guest1.request.clock":`🎭E
❓
🔎🕒
🧊🖼️⛓️🙈
🧱
🖼️`,"guest1.finale.song":`🎭E
✅
🎶
🧊🔗🎶
🧱
🔗🎶`,"guest1.finale.video":"Колыбельная передана (заглушка YouTube).","guest1.finale.goodbye":`🎭E
🛑
🌙⏸️💀
🧊🧷
🚫🧯
🧯

Артефакт зафиксирован: https://interdead.phantom-draft.com/ru/blog/lullaby-archive-pogost-sequence/
И вот другие языковые версии:
https://interdead.phantom-draft.com/blog/lullaby-archive-pogost-sequence/
https://interdead.phantom-draft.com/uk/blog/lullaby-archive-pogost-sequence/
https://interdead.phantom-draft.com/ja/blog/lullaby-archive-pogost-sequence/`,"guest1.ghost1.note1":"Версия A: Восторженный взмах на приветствие.","guest1.ghost1.note2":"Версия B: Приветствие с любопытным взглядом.","guest1.ghost2.note1":"Версия A: Уверенный жест «всё хорошо».","guest1.ghost2.note2":"Версия B: Спокойное подтверждение прогресса.","guest1.ghost3.note1":"Версия A: Просьба найти туалет.","guest1.ghost3.note2":"Версия B: Напоминание поискать туалет.","guest1.ghost4.note1":"Версия A: Благодарность перед просьбой о кружке.","guest1.ghost4.note2":"Версия B: Весёлый запрос найти кружку.","guest1.end.note1":"Версия A: Гость доволен результатом.","guest1.end.note2":"Версия B: Праздник завершённого визита.","boot.db":"База данных","boot.camera":"Камера","boot.lang":"Язык","boot.templates":"Шаблоны","boot.geo":"Геолокация","lang.en":"Английский","lang.ru":"Русский","lang.uk":"Украинский","lang.ja":"Японский",checking:C,object_not_found:S,profile_import_title:j,profile_import_description:P,profile_import_file_label:L,profile_import_password_label:U,profile_import_confirm:G,profile_import_file_required:M,profile_export_title:K,profile_export_description:Y,profile_export_password_label:F,profile_export_confirm:H,profile_export_success:J,profile_import_success:V,profile_transfer_error:W,profile_transfer_cancel:Z,reset_modal_title:z,reset_modal_message:Q,reset_modal_current:X,reset_modal_all:$,reset_modal_cancel:ee,reaction_add:te,reaction_change:oe,reaction_locked:ne,reaction_confirm:se,note_next:re,open_settings:ie,"reactions.finale.pending":"Пожалуйста, проставьте реакции ко всем воспоминаниям.","reactions.finale.recalculate":"Пересчитать","reactions.finale.guest1.title":"Все реакции на месте для 🌙 ⏸️ 💀!","reactions.finale.guest1.message":"🌙 ⏸️ 💀 отмечает каждое сохранённое воспоминание.","reactions.finale.guest1.image_alt":"🌙 ⏸️ 💀 растворяется на фоне конфетти.","reactions.finale.guide.title":"Сводка гайда готова","reactions.finale.guide.message":"Гайд подтверждает: каждое обучающее воспоминание отмечено.","reactions.finale.guide.image_alt":"Радостный карандаш-гайд приветливо улыбается.","ghost_switch.title":"Покинуть гайд?","ghost_switch.message":"Вы сможете вернуться к гайду в любой момент. Продолжить переключение духа?","ghost_switch.confirm":"Да","ghost_switch.cancel":"Остаться",footer_disclaimer_primary:_e,footer_disclaimer_secondary:ae,footer_recommended_label:le,footer_link_about:ce,footer_link_protocol:de,footer_link_wiki:pe,footer_link_issues:ge,footer_link_about_href:ue,footer_link_protocol_href:fe,footer_link_wiki_href:me,footer_link_terms:he,footer_link_terms_href:be,footer_link_issues_href:ke,"emoji_protocol.mode_label":"РЕЖИМ","emoji_protocol.intent_label":"НАМЕРЕНИЕ","emoji_protocol.target_label":"ЦЕЛЬ","emoji_protocol.range_label":"ДИАПАЗОН","emoji_protocol.policy_label":"ПОЛИТИКА","emoji_protocol.output_label":"ВЫХОД",reset_modal_reboot:ye,chat_new_messages:Ae,overlay_contact_loading:Ee,overlay_contact_ai:we,overlay_contact_blocked:Ne,profile_settings_open:Te,profile_settings_me:Re,profile_settings_title:Ie,profile_settings_description:Be,profile_settings_download:De,profile_settings_disable_hover:Oe,profile_settings_disable_membrane:xe,profile_settings_login_label:ve,profile_settings_login_empty:qe};export{E as ai_contact_line,B as ai_failed_camera,N as ai_failed_status,D as ai_loading_badge,I as ai_loading_camera,w as ai_loading_status,T as ai_ready_status,R as ai_retry,f as app_already_open,h as app_already_open_disable_guard,m as app_already_open_warning,p as capture,Ae as chat_new_messages,C as checking,q as create_selfie,Ce as default,s as detect_location,i as detect_location_local,r as detect_location_prompt,_ as detection_in_progress,x as enter_name_label,g as finish,_e as footer_disclaimer_primary,ae as footer_disclaimer_secondary,ce as footer_link_about,ue as footer_link_about_href,ge as footer_link_issues,ke as footer_link_issues_href,de as footer_link_protocol,fe as footer_link_protocol_href,he as footer_link_terms,be as footer_link_terms_href,pe as footer_link_wiki,me as footer_link_wiki_href,le as footer_recommended_label,A as launcher_auth_required,u as loading,c as main_title,d as main_welcome,t as next,l as no_person_detected,re as note_next,S as object_not_found,k as open_camera,y as open_messenger,ie as open_settings,we as overlay_contact_ai,Ne as overlay_contact_blocked,Ee as overlay_contact_loading,a as person_detected,o as post,H as profile_export_confirm,Y as profile_export_description,F as profile_export_password_label,J as profile_export_success,K as profile_export_title,G as profile_import_confirm,P as profile_import_description,L as profile_import_file_label,M as profile_import_file_required,U as profile_import_password_label,V as profile_import_success,j as profile_import_title,Be as profile_settings_description,Oe as profile_settings_disable_hover,xe as profile_settings_disable_membrane,De as profile_settings_download,qe as profile_settings_login_empty,ve as profile_settings_login_label,Re as profile_settings_me,Te as profile_settings_open,Ie as profile_settings_title,Z as profile_transfer_cancel,W as profile_transfer_error,te as reaction_add,oe as reaction_change,se as reaction_confirm,ne as reaction_locked,O as register_profile,$ as reset_modal_all,ee as reset_modal_cancel,X as reset_modal_current,Q as reset_modal_message,ye as reset_modal_reboot,z as reset_modal_title,b as searching,v as start_analysis,e as welcome,n as your_location};

