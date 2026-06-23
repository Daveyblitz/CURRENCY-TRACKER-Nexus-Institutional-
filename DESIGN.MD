---
name: Nexus Financial Intelligence (Light Mode)
colors:
  surface: '#fbf8ff'
  surface-dim: '#d9d9e6'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2ff'
  surface-container: '#ededfa'
  surface-container-high: '#e7e7f4'
  surface-container-highest: '#e2e1ef'
  on-surface: '#191b24'
  on-surface-variant: '#434656'
  inverse-surface: '#2e303a'
  inverse-on-surface: '#f0effd'
  outline: '#747688'
  outline-variant: '#c4c5d9'
  surface-tint: '#104af0'
  primary: '#0040df'
  on-primary: '#ffffff'
  primary-container: '#2d5bff'
  on-primary-container: '#efefff'
  inverse-primary: '#b8c3ff'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#993100'
  on-tertiary: '#ffffff'
  tertiary-container: '#c24100'
  on-tertiary-container: '#ffece6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c3ff'
  on-primary-fixed: '#001355'
  on-primary-fixed-variant: '#0035bd'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#812900'
  background: '#fbf8ff'
  on-background: '#191b24'
  surface-variant: '#e2e1ef'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style
This design system translates high-density financial intelligence into a "light terminal" aesthetic. The brand personality is clinical, precise, and authoritative. It targets institutional analysts and high-frequency traders who require extreme clarity and rapid information processing.

The style is a hybrid of **Minimalism** and **Modern Corporate**, utilizing high-contrast ratios and a strictly disciplined layout to evoke the reliability of a physical terminal while maintaining the breathability of a modern SaaS interface. The emotional response should be one of absolute control and mathematical certainty.

## Colors
The palette is built on an inverted terminal logic. The foundation is pure white, ensuring maximum backlight efficiency and readability.

- **Primary Action:** Vibrant Blue (#2D5BFF) is used exclusively for primary calls to action, active navigation states, and upward financial trends.
- **Surface Logic:** A tiered gray scale (#F5F5F5 for secondary surfaces, #E5E5E5 for borders) provides structural depth without relying on shadows.
- **Typography:** Deep Black (#131313) is used for all primary data points to ensure a high-contrast, "ink-on-paper" feel.
- **Semantic Accents:** Success and error states use high-saturation tones to pop against the monochromatic base.

## Typography
The system utilizes **Geist** for its technical, neo-grotesque clarity in headlines and body copy. This is paired with **JetBrains Mono** for labels, data tables, and financial figures to reinforce the terminal aesthetic and ensure tabular numerals align perfectly for comparison.

Text should follow a strict hierarchy: 
1. **Headlines:** Bold, tight tracking, deep black.
2. **Body:** Regular weight, generous line height for readability.
3. **Data/Labels:** Monospaced, uppercase where appropriate, providing a rhythmic "grid" feel to the interface.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop (12 columns, 1200px max-width) and switches to a **Fluid Grid** on mobile (4 columns). 

The spacing rhythm is strictly 4px-based. Elements should be grouped with `8px` or `16px` of internal padding, while major sections are separated by `40px` or `64px` to create a clear visual break. Information density is kept high but organized, prioritizing vertical stacking of data cards and side-by-side comparison of metrics.

## Elevation & Depth
In this light terminal system, depth is achieved through **Tonal Layers** and **Low-contrast outlines** rather than traditional shadows.

- **Level 0 (Base):** #FFFFFF.
- **Level 1 (Cards/Surfaces):** #F5F5F5 with a 1px border of #E5E5E5.
- **Level 2 (Popovers/Modals):** #FFFFFF with a crisp 1px border of #131313 and a very slight, sharp 4px offset shadow (#000000 at 10% opacity) to simulate physical stacking.
- **Interactive States:** Hovering over a surface should subtly change the background to #EDEDED or brighten the border to the primary blue.

## Shapes
The design system employs a **Rounded** (Level 2) shape language to soften the high-contrast technicality of the interface. 

- **Standard Elements:** Buttons, input fields, and tags use a `0.5rem` (8px) radius.
- **Large Containers:** Content cards and modals use a `1rem` (16px) radius.
- **Data Points:** Small indicator dots or status chips may use pill-shapes to distinguish them from structural layout elements.

## Components
- **Buttons:** Primary buttons are solid #2D5BFF with white text. Secondary buttons are #FFFFFF with a 1px #131313 border and black text.
- **Chips:** Monospaced text inside #F5F5F5 backgrounds with no borders.
- **Lists:** Clean rows separated by 1px #E5E5E5 dividers. Alternate row striping is discouraged; use hover states instead.
- **Checkboxes/Radios:** Use the primary blue for active states. Checkbox shapes remain slightly rounded (4px).
- **Input Fields:** #FFFFFF background with a 1px #E5E5E5 border. Focus state triggers a 1px #2D5BFF border and a subtle blue glow.
- **Cards:** White or light gray backgrounds with defined 1px borders. Header areas within cards should be visually separated by a horizontal rule.
- **Data Visualizations:** Use primary blue for main data series. Use a neutral gray for axes and grid lines to keep the focus on the data.