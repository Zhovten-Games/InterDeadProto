# main.css

Consolidated stylesheet that imports custom fonts and establishes the design tokens driving panel geometry, button scaling, and the animated chat drum palette across the app shell.[^1]

The file includes dedicated styling for the AI loader overlay (`.app__loader--ai`), including contact-line typography and action buttons used by `AiLoaderView`.[^2] Control buttons expose an `AI` badge that appears when the camera button is in a loading state, and the ghost switch confirmation modal uses its own card layout and action buttons to match the neon theme.[^3]

[^1]: Font imports and CSS variables governing layout and theming [assets/css/main.css#L1-L69](../../../assets/css/main.css#L1-L69)
[^2]: AI loader layout, status, and action button styles [assets/css/main.css#L287-L329](../../../assets/css/main.css#L287-L329)
[^3]: AI badge styling and ghost switch modal layout [assets/css/main.css#L1225-L1241](../../../assets/css/main.css#L1225-L1241); [assets/css/main.css#L1736-L1788](../../../assets/css/main.css#L1736-L1788)
