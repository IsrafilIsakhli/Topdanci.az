# Dəstək Müraciətləri

Mağaza sahibi və üzvləri `/seller/tickets` bölməsindən müraciət açır. Superadmin
`/admin/tickets` bölməsində bütün mağazaların müraciətlərini görür. Adi adminin
dəstək yazışmalarına girişi yoxdur. Mövcud moderasiya şikayətləri və API-si
saxlanılır; keçmiş məlumatlar silinmir və avtomatik ticketə çevrilmir.

## Formanın sahələri

Mağaza, mövzu (5-200 simvol), açılma səbəbi, prioritet və problemin izahı
(10-5000 simvol) tələb olunur. Səbəblər: texniki problem, mağaza profili,
məhsul yoxlaması, şikayət, hesab və giriş, digər. Prioritetlər: aşağı, normal,
yüksək, təcili. Superadmin prioriteti dəyişə və müraciəti üzərinə götürə bilər.

## Statuslar

| API dəyəri        | Görünən ad                 |
| ----------------- | -------------------------- |
| `OPEN`            | Açıq                       |
| `IN_PROGRESS`     | İcradadır                  |
| `WAITING_SELLER`  | Mağazadan cavab gözlənilir |
| `WAITING_SUPPORT` | Dəstəkdən cavab gözlənilir |
| `CLOSED`          | Bağlı                      |

Superadmin cavabı mağazadan cavab gözlənilməsi statusuna keçirir. Mağaza cavabı
dəstəkdən cavab gözlənilməsi statusuna keçirir. Bağlı müraciətə cavab yazılmır;
yenidən açmaq mümkündür. Bağlama əməliyyatı səbəb tələb edir. Mağaza yalnız
bağlaya və bağlı müraciəti yenidən aça bilər. Yazışma və dəyişiklik tarixçəsi
silinmir, istifadəçi mətni HTML kimi icra edilmir.

## Əlavə API müqaviləsi

Aşağıdakı yollar `/api/v1` prefiksi ilə işləyir. Köhnə yollar dəyişməyib.

| Metod | Mağaza                         | Superadmin                    |
| ----- | ------------------------------ | ----------------------------- |
| GET   | `/seller/tickets`              | `/admin/tickets`              |
| POST  | `/seller/tickets`              | Yoxdur                        |
| GET   | `/seller/tickets/:id`          | `/admin/tickets/:id`          |
| GET   | `/seller/tickets/:id/messages` | `/admin/tickets/:id/messages` |
| POST  | `/seller/tickets/:id/messages` | `/admin/tickets/:id/messages` |
| PATCH | `/seller/tickets/:id`          | `/admin/tickets/:id`          |

Siyahı filtrləri: `q`, `status`, `reason`, `priority`, `page`, `pageSize` (maksimum
50). Cavabda `data` və sayları/səhifələməni saxlayan `meta` qaytarılır. Yazışma
tarixçəsi `cursor` və `limit` vasitəsilə səhifələnir; detal son 50 qeydi qaytarır.
Yeni cavabın gövdəsi `{ message, version }`, dəyişiklik gövdəsi
`{ version, status?, priority?, claim?, message? }` formasındadır.

`version` köhnədirsə `409` qaytarılır; istifadəçi səhifəni yeniləyərək təkrar
göndərir. Cavab mətni uğursuz göndərişdə formada qalır. Mesaj və status dəyişikliyi
bir verilənlər bazası əməliyyatında saxlanılır. Başqa mağazanın detalına giriş
`404`, superadmin bölməsinə icazəsiz giriş `403` qaytarır. Mövcud giriş, CSRF və
sorğu limitləri qorunur. Müraciət açma limiti saatda 10, mağaza cavabı dəqiqədə
30, superadmin cavabı dəqiqədə 60-dır. Bildirişlər qarşı tərəfə göndərilir.

## Quraşdırma və yoxlama

Prisma müştərisini yeniləmək və yalnız əlavə migrationları tətbiq etmək:

```powershell
npm run prisma:generate
npm run prisma:deploy
npm run build
```

İnteqrasiya testi əsas bazaya test məlumatı yazmır. `node scripts/test-tickets.cjs`
yalnız yerli PostgreSQL-də ayrıca `codex_ticket_<vaxt>` bazası yaradır və 9 icazə,
status, yazışma, səhifələmə və paralel dəyişiklik yoxlamasını işlədir. Standart
E2E işə salınmasında bu test ayrıca baza olmadan buraxılır.

Yerli əsas bazaya migrationdan əvvəl `backups/before-tickets-20261008.dump`
ehtiyat nüsxəsi götürülüb. Xarici mühitdə tətbiqdən əvvəl ayrıca ehtiyat nüsxə
götürülməlidir. Migration mövcud mağaza, məhsul və şikayət məlumatlarını silmir.
