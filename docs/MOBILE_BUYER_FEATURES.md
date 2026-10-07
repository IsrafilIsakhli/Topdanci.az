# Mobil alıcı imkanları və xidmətlərin qoşulması

## Hazır imkanlar

- Məhsul və mağaza seçilmişləri, son baxılanlar, son 8 axtarış, kataloq filtrləri və görünüş seçimi cihazda saxlanır. Qonaq, hər hesab, nümunə və canlı rejim ayrı saxlanır. Canlı rejimdə məhsul və mağaza seçimləri hesaba köçürülür və cihazlar arasında yenilənir. Son baxılanlar, axtarışlar və filtrlər cihazda qalır.
- Seçilmiş məhsul/mağaza açılarkən canlı məlumat yenidən alınır. Köhnə elan silinibsə, təfərrüat ekranı bunu bildirir.
- Ümumi axtarış məhsul, mağaza və kateqoriyanı ayırır. Təkliflər yazarkən gecikmə ilə alınır. Nəticə yoxdursa uyğun kateqoriya adları, uyğunluq yoxdursa əsas kateqoriyalar göstərilir.
- Alıcı hesab açmadan tələb yerləşdirə bilər. Tələb 30 gün aktivdir. İdarə açarı yalnız yerləşdirmə cavabında qaytarılır və telefonda SecureStore-da saxlanır. Alıcının əlaqə məlumatları tələb olunmur. Tətbiqi silmək/cihazı dəyişmək qonağın tələb idarəsini itirməsinə səbəb olur.
- Satıcı yalnız üzvü olduğu aktiv mağazadan təklif verir. Bir mağaza bir tələbə bir təklif saxlayır; yenidən göndərmək onu yeniləyir. Təklif qiyməti seçilmiş vahid üçündür.
- Təkliflər idarə açarı və ya tələb sahibinin hesabı ilə görünür; ümumi tələb səhifəsi yalnız təklif sayını qaytarır. Alıcı mağaza profilindən əlaqə saxlayır.
- Kateqoriyalı yeni tələblər uyğun kateqoriyanın aktiv mağaza sahiblərinə tətbiqdaxili bildiriş yaradır. Hesabla yerləşdirilmiş tələbə yeni təklif həmin hesaba bildiriş yaradır. Qonaq təklifləri tələb ekranında yeniləyərək görür.
- Nümunə tələbləri və satıcı təklifləri yalnız cihazda saxlanır, həqiqi satıcıya göndərilmir.

## API — əlavə endpointlər

Hamısı mövcud /api/v1 prefiksindədir. Əvvəlki endpointlər saxlanılıb.

| Metod və yol | Giriş | Məqsəd |
| --- | --- | --- |
| GET /library | Hesab | Hesabın seçilmiş məhsul və mağazaları |
| PATCH /library | Hesab | changes: [{kind: product/store, id, saved}] — ən çox 200 dəyişiklik; hər növdə son 100 seçim |
| GET /buyer-requests/mine | Hesab | Öz aktiv və bağlı tələbləri; cursor, limit |
| GET /buyer-requests/:id/owned | Hesab | Sahibin şəxsi təklifləri |
| POST /buyer-requests/:id/owned/close | Hesab | Öz tələbini bağlayır |
| POST /buyer-requests/:id/claim | Hesab + idarə açarı | Body: token; sahibsiz qonaq tələbini hesaba bağlayır, başqa hesabı bloklayır |
| POST /support/reports | Açıq | kind, targetId, reason, message; mövcud aktiv məhsul/mağaza, IP üzrə 5/saat |
| GET /buyer-requests | Açıq | Aktiv tələblər; q, city, category, cursor, limit (20, maksimum 50) |
| GET /buyer-requests/:id | Açıq | İctimai tələb məlumatı |
| POST /buyer-requests | Açıq; istəyə bağlı Bearer | title, quantity, unit, city; category slug və description istəyə bağlı. Cavab: request + managementToken |
| POST /buyer-requests/:id/manage | İdarə açarı | Body: token; özəl təkliflər |
| POST /buyer-requests/:id/close | İdarə açarı | Body: token; tələbi bağlayır |
| POST /buyer-requests/:id/offers | SELLER | storeId, message, istəyə bağlı price |
| POST /auth/forgot-password | Açıq | email; tanınan/tanınmayan hesab üçün eyni neytral cavab |
| POST /auth/reset-password | Açıq | email, code (6 rəqəm), password |
| GET /notifications/push/status | Bearer | Xidmətin aktivliyi və hesabın cihaz sayı |
| POST /notifications/push/register | Bearer | token, platform (ios/android) |
| POST /notifications/push/unregister | Bearer | token |

GET /notifications üçün əlavə cursor parametri və meta.nextCursor mövcuddur. Oxunmamış sayı meta.unreadCount-dadır. Mobil çıxışa istəyə bağlı pushToken əlavə olunub.

## 1. Məlumat bazası

Əvvəlcə hədəf bazanın ehtiyat nüsxəsini yaradın və adi deploy prosedurunu tətbiq edin.
Miqrasiya: apps/api/prisma/migrations/20261003120000_buyer_features/migration.sql.
Əlavə seçim miqrasiyası: apps/api/prisma/migrations/20261008120000_account_favorites/migration.sql.
Bu miqrasiyalar yalnız yeni cədvəllər, indekslər və əlaqələr əlavə edir. İstehsal bazasına avtomatik tətbiq edilməyib.

Backend kökündə:

~~~sh
npm run prisma:generate
npm run prisma:deploy
npm run build:api
~~~

API prosesini yeni versiya ilə yenidən başladın. Canlı tətbiqdə EXPO_PUBLIC_DEMO_CATALOG=false və real HTTPS API ünvanını istifadə edin.

## 2. Şifrə bərpa məktubları

Resend-də göndərən domeni təsdiqləyin. Serverin gizli mühit dəyişənlərinə bunları əlavə edin:

- RESEND_API_KEY: Resend API açarı.
- MAIL_FROM: təsdiqlənmiş göndərən, məsələn TopdanBazar <hesab@oz-domeniniz.az>.

Bunları EXPO_PUBLIC_* dəyişənlərinə və mobil paketə daxil etməyin.
Ayar olmayanda API 503 və Azərbaycan dilində xidmətin qoşulmadığı barədə mesaj verir.
Həqiqi hesabla məktub çatdırılmasını ayrıca yoxlayın.

Kod 15 dəqiqə və 5 səhv cəhd üçün etibarlıdır. Yeni kod əvvəlkini bağlayır. Yenidən göndərmə ən tez 60 saniyə sonra mümkündür. Bir kod eyni vaxtda iki sorğuda istifadə edilə bilməz. Şifrə ən az 8 simvol, böyük/kiçik hərf və rəqəm tələb edir. Şifrə yenilənəndə bütün refresh sessiyaları və push qeydiyyatları bağlanır. Əvvəl verilmiş access tokenlər mövcud API siyasətinə uyğun olaraq öz qısa müddətlərinin sonunda bitir.

Kodlar və məktublar jurnala yazılmır. Provider xətası serverdə password_reset_delivery_failed hadisəsi kimi qeyd olunur; e-poçtun hesabla əlaqəsini açıqlamamaq üçün cavab neytral qalır. İstifadəçi məktubu almasa yenidən kod istəyə bilər.
Mail API sənədi: https://resend.com/docs/api-reference/emails/send-email

## 3. Push bildirişləri

1. Expo/EAS hesabı və bu tətbiq üçün layihə yaradın: npx eas-cli login, sonra npx eas-cli init.
2. EAS project ID-ni mobil mühitdə EXPO_PUBLIC_EAS_PROJECT_ID kimi əlavə edin. Bu identifikator sirr deyil.
3. Android üçün Firebase layihəsi yaradın. Android tətbiqinin paket adı az.topdanbazar.mobile olmalıdır. google-services.json faylını versiya nəzarətindən kənarda saxlayın; GOOGLE_SERVICES_FILE dəyişəni onun yolunu göstərməlidir.
4. EAS credentials ilə Android FCM V1 servis açarını və iOS APNs açarını qoşun. Açarları mobil kodda və söhbətdə paylaşmayın.
5. Serverdə PUSH_ENABLED=true qoyun. Expo push access token müdafiəsi aktivdirsə EXPO_ACCESS_TOKEN gizli dəyişənini əlavə edin.
6. Native layihəni yeni plugin ilə yaradın: npx expo prebuild; sonra EAS development/preview build hazırlayın. Öz cihazında bildiriş testləri üçün uyğun native build istifadə edin. Expo Go Android-də uzaq push dəstəyi yoxdur; yerli UI-ni Expo Go-da yoxlamaq olar.
7. Tətbiqdə hesabınıza daxil olun → Hesab → Bildirişlər → Bu cihazda bildirişləri aç. İcazə yalnız istifadəçi düyməyə toxunanda soruşulur.
8. Tətbiq açıq, arxa planda və bağlı ikən real məhsul təsdiqi/tələb təklifi hadisəsini yoxlayın. Bildiriş düzgün səhifəyə keçməlidir. İcazə rəddi, qeydiyyatın söndürülməsi, hesab dəyişməsi və çıxış da yoxlanmalıdır.

Ayar və provider olmadan tətbiq push açıldığını iddia etmir.
Server cihazları bazada saxlayır; çatdırılma işlərini 15 saniyəlik dövr ilə götürür, sorğuları məhdud sayda təkrar edir, təxminən 15 dəqiqədən sonra qəbzləri yoxlayır və DeviceNotRegistered cihazlarını silir. İşlərin bazada olması API yenidən açılanda davam etməyə imkan verir. Çatdırılma uğursuzluğu tətbiqdaxili bildirişi silmir. Köhnə push işləri 7 gündən sonra silinir.

Çıxış zamanı cihaz qeydiyyatı serverdən silinir. İnternet yoxdursa çıxış sorğusu SecureStore-da saxlanaraq şəbəkə bərpa ediləndə təkrar göndərilir; şəbəkə bərpa edilənə qədər server köhnə qeydiyyatı dərhal silə bilməz. Push yalnız ümumi yenilik mətnini göstərir, hesab identifikatoru uyğun gəlməyəndə tətbiq köhnə bildirişin keçidini açmır. İdarə açarları push payload-a daxil edilmir.

Expo sənədləri:
- https://docs.expo.dev/push-notifications/push-notifications-setup/
- https://docs.expo.dev/push-notifications/sending-notifications/

## Yoxlamalar

Mobil: npm run typecheck, npm run lint, npm run test, npx expo export --platform android.
Backend: npm run typecheck, npm run lint, npm run test --workspace @topdanbazar/api.
Əlavə inteqrasiya testləri üçün:

~~~powershell
node scripts/verify-buyer-features.cjs
~~~

Köməkçi yalnız localhost/127.0.0.1:5433-də ayrıca codex_buyer_* bazası yaradır, miqrasiyaları və testləri işlədir, sonra yaratdığı bazanı silir. Mövcud bazalar təmizlənmir. E-poçt və push providerləri testlərdə əvəz olunur, xaricə mesaj göndərilmir.
