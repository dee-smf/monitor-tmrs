tailwind.config = {
    theme: {
        extend: {
            "colors": {
                "primary": "#008de8",
                "on-primary": "#ffffff",
                "primary-container": "#004775",
                "on-primary-container": "#d1e4ff",
                "secondary": "#a00000",
                "background": "#f7f9fb",
                "on-surface": "#1a1c1e",
                "on-surface-variant": "#43474e",
                "outline-variant": "#c3c7cf",
                "surface-container-lowest": "#ffffff",
                "surface-container-low": "#f2f4f6",
                "surface-container": "#eceef0",
                "surface-container-highest": "#e1e2e4"
            },
            "borderRadius": {
                "DEFAULT": "4px",
                "lg": "8px",
                "xl": "12px",
                "full": "9999px"
            },
            "spacing": {
                "container-max": "1280px",
                "margin-page": "64px",
                "gutter": "24px"
            },
            "fontFamily": {
                "body-md": ["Hanken Grotesk"],
                "headline-md": ["Hanken Grotesk"],
                "headline-xl": ["Hanken Grotesk"]
            },
            "fontSize": {
                "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                "headline-xl": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "800" }],
                "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }]
            }
        }
    }
}
