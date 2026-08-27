---
name: Civic Transparency System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#404752'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#707883'
  outline-variant: '#bfc7d4'
  surface-tint: '#0061a3'
  primary: '#005f9f'
  on-primary: '#ffffff'
  primary-container: '#0078c7'
  on-primary-container: '#fdfcff'
  inverse-primary: '#9dcaff'
  secondary: '#a00000'
  on-secondary: '#ffffff'
  secondary-container: '#dd2f27'
  on-secondary-container: '#fffbff'
  tertiary: '#515c71'
  on-tertiary: '#ffffff'
  tertiary-container: '#6a758a'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#9dcaff'
  on-primary-fixed: '#001d36'
  on-primary-fixed-variant: '#00497c'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4aa'
  on-secondary-fixed: '#410001'
  on-secondary-fixed-variant: '#930007'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  DEFAULT: 4px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-page: 64px
---

## Brand & Style

The design system is engineered for institutional authority and public trust. It adopts a **Modern Corporate** aesthetic blended with **Functional Minimalism** to ensure that complex data remains the focal point. The brand personality is objective, reliable, and transparent.

The visual direction draws inspiration from neoclassical civic architecture—structured, balanced, and enduring. It prioritizes high legibility and intentional whitespace to reduce cognitive load when navigating dense transparency reports. The emotional response should be one of professional assurance and clarity, moving away from bureaucratic clutter toward streamlined digital governance.

## Colors

The palette uses a high-contrast foundation to meet accessibility standards and reinforce authority. 

- **Primary Blue (#008DE8):** Used for primary actions, navigation indicators, and branding elements. It evokes stability and technology.
- **Accent Red (#A00000):** Reserved strictly for critical alerts, fiscal deficits, or "live" status indicators to maintain its psychological impact.
- **Neutrals:** A range of cool grays and pure white are used for structural backgrounds and data surfaces. 
- **Data Visualization:** Beyond the primary colors, use a systematic scale of blues and muted grays for charts to ensure color-blind accessibility while maintaining a professional "financial" look.

## Typography

The design system uses **Hanken Grotesk** as the sole typeface for all content — headlines, body text, and UI labels. This provides a consistent, contemporary look across the entire interface.

For financial tables and technical data, a monospaced font (JetBrains Mono) is intended for the `data-mono` role to ensure numerical values align vertically, but is not yet implemented.

## Layout & Spacing

The design system employs a **2-column editorial grid** for desktop (primary content + sidebar), transitioning to a single-column layout on smaller screens. 

- **Desktop (>1100px):** 2-column grid (`1fr 300px`), 48px column gap, 64px outer margins, 1280px max-width.
- **Mobile (≤1100px):** Single column, content stacks vertically.

Spacing follows an 8px geometric scale with a 24px gutter. Generous vertical padding (64px) is used between sections to emphasize content hierarchy.

## Elevation & Depth

To maintain a minimalist and professional character, the design system avoids heavy shadows. Hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines**:

- **Level 0 (Background):** Ultra-light gray (`#f7f9fb`).
- **Level 1 (Cards/Sections):** White background with a 1px `border-outline-variant` border. No shadow.
- **Level 2 (Interactive):** White background with `shadow-sm`. Active state uses `shadow-md`.

Surfaces use sharp, clean transitions rather than blurs to maintain the institutional "printed paper" feel in a digital format.

## Shapes

The shape language is conservative and geometric. A **4px (DEFAULT)** rounding is applied to buttons, input fields, and small UI elements. This provides just enough softness to feel modern without compromising the serious, institutional tone. Larger containers like cards use the **rounded-lg (8px)** token to create a clear containerized feel for data sets.

## Components

### Mode Selector Cards
Card-style buttons with icon, title, and description. Active state uses `bg-primary-container` with `border-primary` and `shadow-sm`. Inactive state uses `bg-surface-container-lowest` with `border-outline-variant` and `hover:border-primary`.

### Data Tables
Tables are the core of the transparency system. Flat design with subtle horizontal dividers (`border-outline-variant`). Headers use `bg-surface-container-low` with bold text. Numeric columns are right-aligned. Status column uses colored badge chips (green for "FECHADO", amber for "ABERTO").

### Input Fields
Strictly rectangular with 1px `border-outline-variant` borders. Year selector uses `rounded-lg`. Focus states not yet defined.

### Status Chips
Use high-saturation text on low-saturation backgrounds (e.g., `bg-green-100 text-green-800` for "FECHADO", `bg-amber-100 text-amber-800` for "ABERTO") to indicate status without overpowering the page layout.