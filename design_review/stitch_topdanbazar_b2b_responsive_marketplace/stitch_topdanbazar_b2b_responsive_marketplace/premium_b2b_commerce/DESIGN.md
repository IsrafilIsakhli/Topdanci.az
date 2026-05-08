---
name: Premium B2B Commerce
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4945'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707975'
  outline-variant: '#bfc9c4'
  surface-tint: '#29695b'
  primary: '#00342b'
  on-primary: '#ffffff'
  primary-container: '#004d40'
  on-primary-container: '#7ebdac'
  inverse-primary: '#94d3c1'
  secondary: '#006d2f'
  on-secondary: '#ffffff'
  secondary-container: '#5dfd8a'
  on-secondary-container: '#007232'
  tertiary: '#4e2013'
  on-tertiary: '#ffffff'
  tertiary-container: '#693527'
  on-tertiary-container: '#e89f8c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#afefdd'
  primary-fixed-dim: '#94d3c1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#065043'
  secondary-fixed: '#66ff8e'
  secondary-fixed-dim: '#3de273'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005322'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a1'
  on-tertiary-fixed: '#370e04'
  on-tertiary-fixed-variant: '#6d382a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  h1:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  price-display:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is built for a professional wholesale ecosystem where efficiency meets a high-end catalog aesthetic. The brand personality is authoritative yet accessible, positioning the platform as a reliable partner for Azerbaijani businesses. 

The style is rooted in **Minimalism** with a **Corporate Modern** execution. By utilizing generous white space and a restricted, high-quality color palette, the UI disappears to let the product data and wholesale pricing take center stage. The emotional response is one of trust and clarity, ensuring that high-volume buyers feel they are using a sophisticated tool rather than a cluttered retail site. 

Key principles include:
- **Professionalism over Playfulness:** Every element serves a functional purpose for a business owner.
- **Transparency:** Clear borders and structured layouts reflect the transparency of a fair marketplace.
- **Precision:** Perfect alignment and consistent spacing to reduce cognitive load during bulk ordering.

## Colors

This design system utilizes a sophisticated green-scale palette to anchor the B2B experience. The primary brand color, **Deep Green (#004D40)**, provides a sense of stability and institutional trust. It is used for primary actions, navigation, and structural elements.

**Vibrant Green (#25D366)** is reserved exclusively for high-conversion communication channels, specifically WhatsApp integration, ensuring it stands out as the primary method for negotiation and support. 

The background strategy employs a "layered light" approach: a base of **Light Gray (#F8FAFA)** provides contrast for the **White (#FFFFFF)** cards and containers. **Light Mint (#E0F2F1)** is used sparingly for accents, such as selected states or badge backgrounds, to soften the interface without introducing distracting hues.

## Typography

The typography system relies on **Inter** to deliver a neutral, utilitarian, and highly legible experience across all Azerbaijani text. The scale is designed for high-density information environments typical of wholesale catalogs.

- **Headlines:** Use tighter letter spacing and heavier weights to create clear hierarchy.
- **Body Text:** Optimized for readability in product descriptions and technical specifications.
- **Price Display:** Specially weighted for maximum visibility, ensuring that "AZN" or currency symbols are slightly smaller than the numerical value but equally bold.
- **Language Support:** Full support for Azerbaijani glyphs (ə, ş, ç, ğ, ö, ü) is mandatory across all levels.

## Layout & Spacing

This design system follows a **Fixed Grid** model for desktop to maintain a premium catalog feel, while transitioning to a fluid layout for mobile devices. The layout is structured around a 12-column grid with a 1280px maximum width.

The spacing rhythm is strictly based on a **4px baseline**. 
- **Margins:** 24px internal margins for cards ensure content has breathing room.
- **Stacking:** Use `xl` (40px) or `xxl` (64px) spacing between major sections to emphasize the minimalist aesthetic.
- **Alignment:** All elements must align to the grid edges to reinforce the "professional marketplace" feeling.

## Elevation & Depth

Hierarchy in this design system is established through subtle layering rather than dramatic shadows. The goal is to create a "tactile paper" effect.

- **Surface Levels:** The primary background is the lowest level. White cards sit one level above this.
- **Shadows:** Use extremely soft, ambient shadows. A typical shadow for a product card should use a large blur radius (20px+) with a very low opacity (3-5%) tinted with the primary Deep Green color to ensure it feels integrated rather than "floating."
- **Borders:** Cards and inputs use a 1px solid border (#E2E8F0). In hover states, this border may transition to a slightly darker shade or the primary brand color to signal interactivity.
- **Interactions:** Premium hover states are critical. When a user hovers over a product card, a subtle upward translation (2-4px) combined with a slight shadow intensification provides immediate feedback.

## Shapes

The shape language balances professional rigidity with modern approachability. Using the **Rounded (Level 2)** setting, the UI avoids the clinical feel of sharp corners while remaining more serious than fully pill-shaped consumer apps.

- **Standard Elements:** 0.5rem (8px) corner radius for cards, input fields, and standard buttons.
- **Small Elements:** 0.25rem (4px) for smaller badges or selection indicators.
- **Large Elements:** 1rem (16px) for major modal containers or featured hero sections.
- **Images:** Product photography must always follow the container's corner radius to maintain the clean, minimalist aesthetic.

## Components

### Buttons
- **Primary:** Deep Green background, White text. High-contrast, bold, and reliable.
- **WhatsApp Action:** Vibrant Green background with the WhatsApp icon. Used only for "Sifariş üçün yazın" (Write for order) or "Məsləhət alın" (Get advice).
- **Secondary:** Transparent background with Deep Green border and text.

### Cards
- **Product Card:** White background, 1px subtle border, soft shadow. Top section for image, bottom for info. Azerbaijani text should be used: "Topdan satış" (Wholesale), "Stokda var" (In stock).
- **Hover State:** Subtle lift and border color shift.

### Input Fields & Controls
- **Bulk Quantity Selector:** A specialized input allowing users to type or use +/- buttons, designed for quick quantity adjustments.
- **Search Bar:** Large, clean with a subtle mint tint when focused. Placeholder: "Məhsul və ya kateqoriya axtar..."

### Chips & Badges
- **Status Badges:** Use the Mint accent for "Yeni" (New) or "Endirim" (Discount) with Deep Green text to maintain readability without using "alert" colors that break the minimalist feel.

### Lists & Tables
- Wholesale marketplaces rely on data. Tables should have generous row heights (56px+) and clean dividers. Header labels should use the `label-caps` typography style.

### Imagery
- No AI-generated content. Use high-quality, clear-cut product photography on white or very light gray backgrounds to maintain the catalog's professional integrity.