# main.css

Consolidated stylesheet that imports custom fonts and establishes the design tokens driving panel geometry, button scaling, and the animated chat drum palette across the app shell.[^1]

Dialog markup now supports multi-note callouts for ghosts: `.dialog__message-note` defines stacked or inline layouts, `data-js="dialog-note-toggle"` buttons get circular neon styling, and inline emoji text sizing keeps the primary message legible alongside the rotating notes.[^2]

Panel effects integrate with the electric border widget through `.panel__bottom--has-effect` and `.panel__effect-canvas`, which reserve a z-indexed canvas while suppressing the static gradient frame when the animation is active.[^3]

[^1]: Font imports and CSS variables governing layout and theming [assets/css/main.css#L1-L69](../../../assets/css/main.css#L1-L69)
[^2]: Note containers, toggle controls, and inline emoji sizing [assets/css/main.css#L323-L400](../../../assets/css/main.css#L323-L400)
[^3]: Effect canvas container and modifier classes [assets/css/main.css#L800-L844](../../../assets/css/main.css#L800-L844)
