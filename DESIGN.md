# Design System Inspired by Tramway Rabat Salé

## 1. Visual Theme & Atmosphere

The Tramway Rabat Salé design system embodies modern urban mobility with an elegant, accessible aesthetic. It combines deep burgundy and purple tones with bright magenta accents, creating a sophisticated yet energetic visual identity that reflects contemporary transportation services. The design prioritizes clarity and directness, using a neutral, professional foundation that ensures content readability across all platforms. Geometric simplicity, generous whitespace, and strategic use of accent colors guide user attention toward primary actions and essential information. The overall mood is progressive and welcoming, designed to communicate efficiency, reliability, and ease of use for a diverse user base across web and mobile platforms.

**Key Characteristics**
- Deep burgundy and plum primary palette with vibrant magenta accents
- Clean, minimal aesthetic with strong typographic hierarchy
- Generous whitespace and breathing room around content
- High contrast between dark neutrals and bright interactive elements
- Modern, accessible, and service-oriented visual language
- Emphasis on clear call-to-action elements in pink/magenta
- Professional and trustworthy tone through neutral grounding colors

## 2. Color Palette & Roles

### Primary
- **Deep Brown** (`#1A0E03`): Brand anchor color, primary text, dark UI foundations—used extensively for body text, subtle borders, and main interface elements
- **Primary Purple** (`#55356D`): Secondary brand color, icon accents, and visual interest elements for supporting interface components

### Accent Colors
- **Magenta Primary CTA** (`#EA3D8F`): Primary call-to-action buttons, key interactive elements, high-priority user actions
- **Magenta Light** (`#E7468F`): Subtle variations and hover states for primary CTA elements
- **Purple Dark** (`#49146D`): Deep accent for emphasis, badges, and high-priority visual markers
- **Purple Muted** (`#AC6899`): Softer accent for secondary UI elements, supportive visual components
- **Deep Purple** (`#492563`): Alternative accent for specific component variants and thematic elements

### Interactive
- **Link Text** (`#1A0E03`): Default link color matching primary body text for consistency
- **Link Light** (`#FFFFFF`): Links in dark backgrounds or footer contexts for contrast

### Neutral Scale
- **Dark Text** (`#2D2D2D`): Primary text color, most readable on light backgrounds, used for body copy and main content
- **Dark Overlay** (`#000000`): High contrast text, overlay backgrounds, and emphasis states
- **Medium Gray** (`#8A8A8A`): Secondary text, placeholders, disabled states, reduced emphasis
- **Light Gray** (`#706F6F`): Tertiary text, subtle borders, very low emphasis
- **Pale Gray Accent** (`#ABB8C3`): Soft borders and subtle dividers

### Surface & Borders
- **Off-White** (`#F8F8F8`): Subtle background tint, card backgrounds, minimal visual separation
- **Cloud** (`#F5F4F4`): Very light background, subtle surface variation
- **Light Border** (`#E1E8ED`): Border color for cards, inputs, and layout dividers
- **White** (`#FFFFFF`): Primary surface background, modal overlays, clean canvas areas

### Semantic / Status
- **Warning** (`#F5AB32`): Warning states, alerts requiring user attention
- **Warning Secondary** (`#FCB900`): Alternative warning indicator for subtle notices
- **Error** (`#CF2E2E`): Error messages, validation failures, critical alerts

## 3. Typography Rules

### Font Family
**Primary:** Arial, sans-serif
**Fallback stack:** Arial, Helvetica, sans-serif

### Hierarchy
| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|-----------------|-------|
| Display | Arial | 28px | 700 | 1.2 | 0px | Large headlines, page titles |
| H2 - Heading Large | Arial | 20px | 700 | 1.0 | 0px | Section headers, major content divisions |
| H3 - Heading Medium | Arial | 18px | 400 | 1.0 | 0px | Subsection titles, card headers |
| H5 - Heading Small | Arial | 15px | 400 | 1.0 | 0px | Component headers, labels |
| Body - Regular | Arial | 14px | 400 | 1.4 | 0px | Primary body copy, standard text content |
| Body - Small | Arial | 12px | 400 | 1.4 | 0px | Secondary text, captions, metadata |
| Button - CTA | Arial | 15px | 400 | 1.0 | 0px | Call-to-action buttons, primary actions |
| Button - Secondary | Arial | 14px | 400 | 1.0 | 0px | Secondary buttons, less critical actions |
| Link | Arial | 14px | 400 | 1.0 | 0px | Navigation links, inline links |
| Code | Arial | 13px | 400 | 1.4 | 0px | Monospaced content, technical text |

### Principles
- Maintain a single sans-serif family (Arial) throughout all text for consistency and reliability
- Use weight to establish hierarchy rather than font changes—700 for emphasis, 400 for body
- Preserve line-height of 1.0 for tight, modern headlines and 1.4 for readable body text
- Ensure minimum 14px for body text to guarantee accessibility across all devices
- Apply generous bottom padding to typography elements (15px-40px) for vertical breathing room
- Prioritize contrast through color choice over font size increases for secondary information

## 4. Component Stylings

### Buttons

#### Primary CTA Button
- **Background:** `#EA3D8F`
- **Text Color:** `#FFFFFF`
- **Font Size:** `15px`
- **Font Weight:** `400`
- **Font Family:** `Arial`
- **Padding:** `13px 0px`
- **Height:** `45px`
- **Width:** `100%` (full width on mobile/standard layouts)
- **Border Radius:** `3px`
- **Border:** `none`
- **Box Shadow:** `none`
- **Line Height:** `normal`
- **Hover State:** Darken background to `#D63378` (reduce saturation by ~10%)
- **Active State:** Background `#C11C60` with pressed appearance
- **Disabled State:** Background `#ABB8C3`, Text `#FFFFFF` at 60% opacity

#### Secondary Button
- **Background:** `transparent`
- **Text Color:** `#2D2D2D`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Font Family:** `Arial`
- **Padding:** `4px 4px`
- **Height:** `10px`
- **Width:** `10px`
- **Border Radius:** `0px`
- **Border:** `1px solid #E1E8ED`
- **Box Shadow:** `none`
- **Hover State:** Background `#F8F8F8`, Border `#D0D5DB`
- **Active State:** Background `#E1E8ED`, Border `#2D2D2D`

#### Ghost Button
- **Background:** `transparent`
- **Text Color:** `#1A0E03`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Font Family:** `Arial`
- **Padding:** `12px 16px`
- **Border Radius:** `0px`
- **Border:** `1px solid #E1E8ED`
- **Box Shadow:** `none`
- **Hover State:** Background `#F5F4F4`, Text `#EA3D8F`
- **Active State:** Background `#E1E8ED`, Border `#EA3D8F`

### Cards & Containers

#### Card Base
- **Background:** `#FFFFFF`
- **Border:** `1px solid #E1E8ED`
- **Border Radius:** `3px`
- **Padding:** `24px`
- **Box Shadow:** `0px 2px 4px rgba(0, 0, 0, 0.08)`
- **Hover Shadow:** `0px 4px 12px rgba(0, 0, 0, 0.12)`

#### Card with Accent
- **Background:** `#FFFFFF`
- **Border Top:** `4px solid #EA3D8F`
- **Border:** `1px solid #E1E8ED`
- **Border Radius:** `3px`
- **Padding:** `24px`
- **Box Shadow:** `0px 2px 4px rgba(0, 0, 0, 0.08)`

#### Section Container
- **Background:** `#F8F8F8`
- **Padding:** `40px 24px`
- **Border Radius:** `0px`
- **Border:** `none`

### Inputs & Forms

#### Text Input Base
- **Background:** `#FFFFFF`
- **Border:** `1px solid #E1E8ED`
- **Border Radius:** `3px`
- **Padding:** `12px 16px`
- **Font Size:** `14px`
- **Font Family:** `Arial`
- **Text Color:** `#2D2D2D`
- **Line Height:** `1.4`
- **Placeholder Color:** `#8A8A8A`
- **Focus State:** Border `#EA3D8F` (2px), Box Shadow `0px 0px 0px 3px rgba(234, 61, 143, 0.1)`
- **Error State:** Border `#CF2E2E`, Background `#FFFFFF` with subtle red tint
- **Disabled State:** Background `#F8F8F8`, Text Color `#8A8A8A`, Border `#E1E8ED`

#### Label
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Text Color:** `#2D2D2D`
- **Margin Bottom:** `8px`
- **Line Height:** `1.0`

#### Helper Text
- **Font Size:** `12px`
- **Text Color:** `#8A8A8A`
- **Margin Top:** `4px`
- **Line Height:** `1.4`

#### Error Message
- **Font Size:** `12px`
- **Text Color:** `#CF2E2E`
- **Margin Top:** `4px`
- **Line Height:** `1.4`

### Navigation

#### Navigation Link (Dark Background)
- **Background:** `transparent`
- **Text Color:** `#FFFFFF`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Font Family:** `Arial`
- **Padding:** `15px 0px 15px 25px`
- **Line Height:** `normal`
- **Border Left:** `none` (default)
- **Hover State:** Background `rgba(255, 255, 255, 0.1)`, Border Left `3px solid #EA3D8F`, Padding Left adjusted to `22px`
- **Active State:** Background `rgba(234, 61, 143, 0.15)`, Text `#EA3D8F`, Border Left `3px solid #EA3D8F`

#### Navigation Link (Submenu)
- **Background:** `transparent`
- **Text Color:** `#FFFFFF`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Font Family:** `Arial`
- **Padding:** `12px 0px 12px 40px`
- **Line Height:** `normal`
- **Hover State:** Color `#EA3D8F`
- **Active State:** Color `#EA3D8F`, Font Weight `700`

#### Navigation Item (Header)
- **Background:** `transparent`
- **Text Color:** `#2D2D2D`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Font Family:** `Arial`
- **Padding:** `8px 12px`
- **Border Radius:** `0px`
- **Hover State:** Color `#EA3D8F`, underline decoration
- **Active State:** Color `#EA3D8F`, Border Bottom `2px solid #EA3D8F`

### Badges & Status Indicators

#### Badge - Primary
- **Background:** `#EA3D8F`
- **Text Color:** `#FFFFFF`
- **Font Size:** `12px`
- **Font Weight:** `700`
- **Padding:** `4px 12px`
- **Border Radius:** `12px`
- **Display:** `inline-block`

#### Badge - Warning
- **Background:** `#F5AB32`
- **Text Color:** `#FFFFFF`
- **Font Size:** `12px`
- **Font Weight:** `700`
- **Padding:** `4px 12px`
- **Border Radius:** `12px`

#### Badge - Error
- **Background:** `#CF2E2E`
- **Text Color:** `#FFFFFF`
- **Font Size:** `12px`
- **Font Weight:** `700`
- **Padding:** `4px 12px`
- **Border Radius:** `12px`

#### Status Dot
- **Width:** `8px`
- **Height:** `8px`
- **Border Radius:** `50%`
- **Display:** `inline-block`
- **Margin Right:** `8px`

### Modal & Overlays

#### Modal Backdrop
- **Background:** `rgba(0, 0, 0, 0.5)`
- **Position:** `fixed`
- **Z-Index:** `1000`

#### Modal Container
- **Background:** `#FFFFFF`
- **Border Radius:** `3px`
- **Padding:** `32px`
- **Box Shadow:** `0px 10px 40px rgba(0, 0, 0, 0.2)`
- **Max Width:** `600px` (desktop), `90vw` (mobile)
- **Position:** `absolute`
- **Z-Index:** `1001`

#### Modal Close Button
- **Background:** `transparent`
- **Border:** `none`
- **Font Size:** `24px`
- **Color:** `#2D2D2D`
- **Cursor:** `pointer`
- **Padding:** `0px`
- **Position:** `absolute`
- **Top:** `16px`
- **Right:** `16px`
- **Hover State:** Color `#EA3D8F`

## 5. Layout Principles

### Spacing System

**Base Unit:** `4px`

**Spacing Scale:**
- `4px`: Micro spacing for tight components, icon margins
- `8px`: Minimal spacing between inline elements
- `12px`: Default small padding for form inputs and small components
- `16px`: Standard margin between inline/block elements
- `20px`: Comfortable padding within medium components
- `24px`: Standard card/container internal padding
- `28px`: Section separation (small sections)
- `32px`: Large container padding, major section separation
- `36px`: Extra padding for spacious components
- `40px`: Large margin between major sections
- `60px`: Hero section margins, dramatic visual breaks
- `84px`: Extra-large spacing for header/footer separation

**Usage Context:**
- **Micro (`4px`):** Icon to icon, tight button groups
- **Small (`8px-12px`):** Form field internal padding, small component spacing
- **Standard (`16px-24px`):** Button padding, card margins, general component spacing
- **Large (`28px-40px`):** Section margins, container padding
- **Extra-Large (`60px-84px`):** Hero sections, major layout breaks

### Grid & Container

**Max Width:** `1200px` (desktop layout)
**Container Padding:** `24px` on sides (desktop), `16px` (tablet), `12px` (mobile)
**Column Strategy:** 12-column flexible grid with adaptive column spans
**Gutter:** `24px` between columns (desktop), `16px` (tablet), `12px` (mobile)

**Section Patterns:**
- Hero sections: Full-width with centered container inside
- Content sections: Max-width container with centered alignment
- Multi-column layouts: 2-3 columns on desktop, stack on mobile
- Feature cards: 3-column grid (desktop), 2-column (tablet), single-column (mobile)

### Whitespace Philosophy

Prioritize generous whitespace to create visual hierarchy and improve scanability. Use vertical rhythm by maintaining consistent spacing between elements. Avoid cluttering interfaces; give breathing room around interactive elements. Create visual zones through spacing rather than borders when possible. Use whitespace strategically to guide user attention toward primary CTAs and important content. On mobile, maintain sufficient spacing to prevent accidental taps while reducing scale proportionally.

### Border Radius Scale

- `0px`: Buttons (secondary), navigation items, modal/overlay elements with sharp edges
- `3px`: Primary buttons, cards, containers, inputs, badges (square-ish with minimal rounding)
- `12px`: Pill buttons (if used), circular badge indicators
- `50%`: Perfect circles for status indicators, avatars

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (0) | No shadow | Navigation, flat text elements, typography-only content |
| Level 1 | `0px 2px 4px rgba(0, 0, 0, 0.08)` | Cards, contained components, standard UI surfaces |
| Level 2 | `0px 4px 12px rgba(0, 0, 0, 0.12)` | Floating action buttons, hover states on cards, tooltips |
| Level 3 | `0px 10px 40px rgba(0, 0, 0, 0.2)` | Modals, dropdown menus, popovers, major overlays |
| Level 4 | `0px 20px 60px rgba(0, 0, 0, 0.3)` | Extended modals, full-page overlays, top-level navigation drawers |

**Shadow Philosophy:**
Shadows provide subtle depth cues without overwhelming the interface. Use minimal shadows (Level 1) as the default for most components. Reserve stronger shadows (Level 3+) for modal overlays and high-priority floating elements. Shadows should always use black with appropriate opacity rather than gray—this ensures consistency across backgrounds. Avoid layering multiple shadows; instead, select the appropriate level for each component's hierarchy.

## 7. Do's and Don'ts

### Do
- Use `#EA3D8F` (magenta) for all primary call-to-action buttons to create consistent visual priority
- Maintain `15px` minimum font size for body text to ensure accessibility across all devices
- Apply consistent `3px` border radius to buttons, cards, and inputs for visual coherence
- Use `#2D2D2D` for primary text color on light backgrounds—it provides optimal contrast
- Provide at least `24px` of internal padding to all cards and container elements
- Stack buttons vertically on mobile (100% width) and reserve horizontal arrangements for desktop
- Use the semantic color palette (`#CF2E2E` for errors, `#F5AB32` for warnings) consistently
- Group related navigation links with hierarchical padding levels (`15px` main, `12px` submenu with `40px` left)
- Implement focus states on all interactive elements using the `#EA3D8F` outline
- Maintain line-height of `1.4` for body copy to ensure readability

### Don't
- Don't use colors outside the defined palette without explicit design justification
- Don't apply shadow effects to text elements or create artificial depth through filters
- Don't mix font families—Arial is the single source of truth throughout the system
- Don't reduce button padding below `12px`; maintain minimum `45px` height for touch targets
- Don't apply borders and shadows simultaneously on the same element—choose one depth strategy
- Don't use `#FFFFFF` for text on light backgrounds—contrast will fail accessibility standards
- Don't create new spacing values outside the defined scale without system documentation
- Don't reduce font sizes below `12px` for any UI text, including captions and helper text
- Don't apply border radius greater than `3px` to standard components (reserve `12px`/`50%` for specialized use)
- Don't forget to include loading, disabled, and error states for all interactive components

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | 320px–599px | Single-column layouts, full-width buttons (`100%`), reduced padding (`12px`), hidden secondary navigation, stacked cards |
| Tablet | 600px–999px | 2-column grids, adjusted padding (`16px-24px`), visible primary navigation, optimized touch targets |
| Desktop | 1000px+ | 3-column grids, full padding system (`24px-40px`), horizontal layouts, expanded navigation menus, max-width containers (`1200px`) |

### Touch Targets

- **Minimum size:** `44px × 44px` (all interactive elements)
- **Recommended size:** `48px × 48px` (buttons, link targets)
- **Spacing between targets:** Minimum `8px` to prevent accidental taps
- **Target padding:** Add minimum `12px` internal padding to expand touch area
- **Text links:** Wrap in `16px` vertical padding when primary action

### Collapsing Strategy

**Navigation:**
- Desktop: Horizontal header navigation with visible menu items
- Tablet: Primary items visible, secondary items in dropdown menus
- Mobile: Hamburger menu drawer (full-screen overlay), stack navigation links vertically with `15px` padding

**Buttons:**
- Desktop: Horizontal button groups with `12px` spacing
- Tablet: Maintain groups, reduce horizontal spacing to `8px`
- Mobile: Stack buttons vertically, `100%` width, `16px` vertical spacing between

**Grid Layouts:**
- Desktop: 3-column feature grids, 2-column content sections
- Tablet: 2-column feature grids, single-column content sections
- Mobile: Single-column layouts for all grids, increase vertical spacing to `24px`

**Typography:**
- Desktop: Maintain all sizes and weights (H2 at `20px`, body at `14px`)
- Tablet: Reduce display heading to `24px`, maintain body (`14px`)
- Mobile: Reduce H2 to `18px`, body to `13px` (minimum readable size)

**Containers:**
- Desktop: Max-width `1200px` with `24px` side padding
- Tablet: Adjust to `90vw` with `16px` side padding
- Mobile: Full-width with `12px` side padding, max-width `100vw`

**Spacing Adjustments:**
- Desktop: Use full spacing scale (`24px-40px` standard)
- Tablet: Reduce standard spacing to `16px-24px`
- Mobile: Use compact spacing (`8px-16px` standard), maintain `12px` minimum

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA:** Magenta Primary (`#EA3D8F`) — use for all primary buttons and high-priority interactive elements
- **Secondary CTA:** Magenta Light (`#E7468F`) — hover and focus states on primary buttons
- **Background (Dark UI):** Deep Brown (`#1A0E03`) — dark mode backgrounds, deep text anchors
- **Background (Light UI):** White (`#FFFFFF`) — primary surface background
- **Background (Section):** Off-White (`#F8F8F8`) — subtle background tint, section containers
- **Primary Text:** Dark Text (`#2D2D2D`) — body copy, primary content on light backgrounds
- **Secondary Text:** Medium Gray (`#8A8A8A`) — placeholders, disabled states, reduced emphasis
- **Accent (Purple):** Primary Purple (`#55356D`) — secondary brand accent, icon elements
- **Borders:** Light Border (`#E1E8ED`) — input borders, card dividers
- **Error State:** Error (`#CF2E2E`) — validation failures, error messages
- **Warning State:** Warning (`#F5AB32`) — warning alerts, attention-required states
- **Link Text:** Deep Brown (`#1A0E03`) — default link color on light backgrounds

### Iteration Guide

1. **Start with semantic color mapping:** Always map component types to the primary palette first—magenta for CTAs, dark brown for text, off-white for surfaces. Never introduce new colors without system documentation.

2. **Apply typography hierarchy systematically:** Use the table as your source of truth—H2 is always `20px` bold, body is always `14px` regular, buttons are always `15px` regular. Maintain these proportions across breakpoints (reduce by 1-2px on mobile only).

3. **Enforce spacing discipline:** Use only values from the defined scale (`4px, 8px, 12px, 16px, 20px, 24px, 28px, 32px, 36px, 40px, 60px, 84px`). Never create intermediate values. Standard component spacing is `24px` internal, `16px` external unless specifically noted.

4. **Maintain consistent button styling:** Primary buttons are always `#EA3D8F` background, `#FFFFFF` text, `15px` font, `45px` height, `3px` border radius, `13px` vertical padding, `100%` width. Secondary and ghost buttons follow their variant specs exactly.

5. **Implement elevation through shadow levels:** Don't create new shadow values. Use Level 1 (`0px 2px 4px rgba(0, 0, 0, 0.08)`) for cards, Level 3 (`0px 10px 40px rgba(0, 0, 0, 0.2)`) for modals. Shadows should always use black with opacity.

6. **Design for touch first on mobile:** Minimum touch target is `44px × 44px`. Buttons stack vertically at `100%` width on mobile with `16px` vertical spacing. All interactive elements must be easily tappable—no smaller than `12px` font on mobile.

7. **Use focus states for keyboard navigation:** All interactive elements require visible focus indicators using `#EA3D8F` border or outline. Never remove default focus states; make them part of the designed interaction model.

8. **Apply consistent border radius:** Buttons, cards, inputs use `3px`. Reserve `12px` for pill-shaped elements and `50%` for circles only. No arbitrary border radius values.

9. **Test contrast and accessibility:** Primary text (`#2D2D2D`) on white (`#FFFFFF`) must pass WCAG AA. Ensure error (`#CF2E2E`) and warning (`#F5AB32`) colors are distinguishable beyond color alone—pair with icons or text labels.

10. **Maintain responsive proportions:** Desktop max-width is `1200px` with `24px` padding. Tablet uses `90vw` with `16px` padding. Mobile uses full-width with `12px` padding. Never exceed these constraints without explicit breakpoint documentation.