# Qlobal stillər (globals)

Bu qovluq əvvəl tək `apps/web/src/app/globals.css` faylında olan ~22 000 sətirlik CSS-in
məntiqi hissələrə bölünmüş variantıdır. Fayllar `apps/web/src/app/layout.tsx`-də ardıcıl
import olunur və **bu sıra CSS kaskadını təyin edir** — fayl əlavə edərkən və ya sıranı
dəyişərkən ehtiyatlı olun.

| Fayl | Köhnə `globals.css`-də sətir aralığı | Məzmun |
| --- | --- | --- |
| `01-tokens-and-base.css` | 1–2452 | CSS dəyişənləri, reset, header/footer, ümumi komponentlər |
| `02-public-marketplace.css` | 2453–4696 | Kataloq idarəetmələri, homepage premium keçidi, mobil hardening |
| `03-seller-panel-and-dashboard.css` | 4697–6702 | Seller panel, seller settings, dashboard |
| `04-marketplace-refinements.css` | 6703–9175 | Kateqoriya/menyu/hero düzəlişləri, stores və products səhifələri |
| `05-auth-contact-login.css` | 9176–9916 | Auth, mağaza açma, əlaqə və login səhifələri |
| `06-mobile-surfaces.css` | 9917–12841 | Mobil səthlər, mobil marketplace redesign v2 |
| `07-admin-responsive.css` | 12842–14475 | Seller/admin responsive keçidləri, moderasiya alətləri |
| `08-theme-and-dark-layers.css` | 14476–14988 | Tema idarəetmələri və dark qat |
| `09-homepage-final-passes.css` | 14989–18368 | Homepage final keçidləri (ticker, vitrin, city strip, tələb taxtası) |
| `10-seller-dashboard-and-forms.css` | 18369–21982 | Panel/KPI/bento, seller formaları, ümumi responsivlik |
| `12-review-refinements.css` | Yeni | Səhifə icmalı üzrə ortaq yerləşim, kartlar, formalar və mobil oxunaqlılıq düzəlişləri |
| `13-tickets.css` | Yeni | Dəstək müraciətlərinin siyahısı, yazışması, statusları və mobil formaları |

Bölmə **bayt-bayt eynilik** şərti ilə aparılıb: 10 faylın ardıcıl birləşməsi köhnə
`globals.css` ilə tam eynidir (414 035 bayt, SHA-256 eyni), yəni CSS kaskadı dəyişməyib.

## Yeni stil əlavə etmək

1. Mövcud hissəyə uyğun faylı seçin (məsələn, public marketplace düzəlişi → `02`/`04`).
2. Yalnız həmin faylın sonuna əlavə edin ki, ardıcıllıq pozulmasın.
3. Yeni fayl lazımdırsa, adını nömrə ilə verin və `layout.tsx`-də **sonda** import edin.
