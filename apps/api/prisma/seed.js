const {
  PrismaClient,
  ApplicationStatus,
  CategoryStatus,
  PriceType,
  ProductStatus,
  ProductUnit,
  StoreRole,
  StoreStatus,
  UserRole,
  UserStatus,
} = require('@prisma/client');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

for (const envPath of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env'), resolve(__dirname, '../../../.env')]) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false, quiet: true });
  }
}

const prisma = new PrismaClient();

const adminEmail = process.env.TOPDANBAZAR_ADMIN_EMAIL || 'admin@topdanci.az';
const adminPasswordHash = bcrypt.hashSync(process.env.TOPDANBAZAR_ADMIN_PASSWORD || 'Admin12345!', 10);
const superAdminEmail = process.env.TOPDANBAZAR_SUPERADMIN_EMAIL || 'superadmin@topdanci.az';
const superAdminPasswordHash = bcrypt.hashSync(process.env.TOPDANBAZAR_SUPERADMIN_PASSWORD || 'SuperAdmin123!', 10);
const sellerEmail = process.env.TOPDANBAZAR_SELLER_EMAIL || 'seller@topdanci.az';
const sellerPasswordHash = bcrypt.hashSync(process.env.TOPDANBAZAR_SELLER_PASSWORD || 'Seller12345!', 10);
const demoSellerEmail = process.env.TOPDANBAZAR_DEMO_SELLER_EMAIL || 'seller-demo@topdanci.az';
const demoSellerPasswordHash = bcrypt.hashSync(process.env.TOPDANBAZAR_DEMO_SELLER_PASSWORD || 'SellerDemo123!', 10);

const defaultCategories = require('../../../packages/shared/src/default-categories.json');

const categoryTree = [
  {
    slug: 'son-elanlar',
    name: 'Son elanlar',
    icon: 'layout-list',
    sortOrder: 0,
    children: defaultCategories,
  },
];

const deprecatedCategorySlugs = [
  'aksesuar',
  'aksesuarlar',
  'akvariumlar-ve-baliqlar',
  'aqrotexnika',
  'atlar',
  'avadanligin-icaresi',
  'avadanliqlarin-qurasdirilmasi',
  'avtobuslar',
  'avtomobil-oturacaqlari',
  'avtomobiller',
  'avtoservis-ve-diaqnostika',
  'ayaqqabi',
  'bag-ve-bostan',
  'biletler-ve-seyahet',
  'bitkiler',
  'biznes-ucun-avadanliq',
  'carpayilar-ve-besikler',
  'dasinmaz-emlak',
  'dayeler-baxicilar',
  'dekor-ve-interyer',
  'diger-heyvanlar',
  'diger-usaq-alemi',
  'diger-xidmetler',
  'dovsanlar',
  'ehtiyat-hisseleri-ve-aksesuarlar',
  'elektronika',
  'elektronika-telefonlar',
  'erzaq',
  'ev-mehsullari',
  'ev-teserrufati-mallari',
  'ev-ve-bag-isiqlandirma',
  'ev-ve-bag-meiset-texnikasi',
  'ev-ve-bag-temir-ve-tikinti',
  'ev-ve-bag-ucun',
  'foto-ve-video-cekilis-xidmetleri',
  'fototexnika',
  'gemiriciler',
  'geyim',
  'geyim-ve-ayaqqabilar',
  'gozellik-saglamliq',
  'hamam-ve-gigiyena',
  'heyet-evleri-bag-evleri',
  'heyvanlar',
  'heyvanlar-ucun-mehsullar-ve-yemler',
  'hobbi-ve-asude',
  'huquq-xidmetleri',
  'idman-ve-asude',
  'insaat-materiallari',
  'is-axtariram',
  'is-elanlari',
  'it-internet-telekom',
  'itler',
  'itmis-esyalar',
  'kempinq-ovculuq-ve-baliqciliq',
  'kitab-ve-jurnallar',
  'kolleksiyalar',
  'komponentler-ve-monitorlar',
  'komputer-aksesuarlari',
  'kt-heyvanlari',
  'logistika',
  'manejler',
  'masaustu-komputerler',
  'mebel-yigilmasi-ve-temiri',
  'mebeller',
  'mektebliler-ucun',
  'menziller',
  'motosikletler-ve-mopedler',
  'muhasibat-xidmetleri',
  'musiqi-aletleri',
  'musiqi-eylence-ve-tedbirler',
  'neqliyyat',
  'neqliyyat-ehtiyat-hisseleri-ve-aksesuarlar',
  'neqliyyat-vasitelerinin-icaresi',
  'nomreler-ve-sim-kartlar',
  'noutbuklar-ve-netbuklar',
  'obyektler-ve-ofisler',
  'ofis-avadanligi-ve-istehlak-materiallari',
  'oyunlar-pultlar-ve-proqramlar',
  'pisikler',
  'planset-ve-elektron-kitablar',
  'qab-qacaq-ve-metbex-levazimatlari',
  'qarajlar',
  'qeydiyyat-nisanlari',
  'qida-mehsullari',
  'qidalanma-keyterinq',
  'qidalanma-oturacaqlari',
  'quslar',
  'reklam-dizayn-ve-poliqrafiya',
  'saat-ve-zinet-esyalari',
  'saglamliq-ve-gozellik',
  'sebeke-ve-server-avadanligi',
  'sexsi-esyalar',
  'sigorta-xidmetleri',
  'smart-saat-ve-qolbaqlar',
  'su-neqliyyati',
  'suruskenler-ve-meydancalar',
  'tanisliq',
  'telefonlar',
  'televizorlar-ve-aksesuarlar',
  'telim-hazirliq-kurslari',
  'temizlik',
  'tercume',
  'texnika-temiri',
  'tibbi-xidmetler',
  'tikinti-texnikasi',
  'torpaq',
  'tutun-qizdiricilari-ve-aksesuarlari',
  'usaq-alemi',
  'usaq-alemi-mektebliler-ucun',
  'usaq-avtomobilleri',
  'usaq-dasiyicilari',
  'usaq-mebeli',
  'usaq-qidasi-ve-beslenmesi',
  'usaq-tekstili',
  'vakansiyalar',
  'velosipedler',
  'xalcalar-ve-aksesuarlar',
  'xaricde-emlak',
  'xidmetler-temir-ve-tikinti',
  'xidmetler-ve-biznes',
  'yuk-masinlari-ve-qosqular',
  'yuruteceler'
];

const showcaseStores = [
  {
    slug: 'absheron-food-supply',
    name: 'Absheron Food Supply',
    legalName: 'Absheron Food Supply MMC',
    categorySlug: 'qida-ve-icki',
    city: 'Baki',
    district: 'Binagadi',
    phone: '+994502101010',
    email: 'sales@absheronfood.az',
    description: 'Market, restoran ve kafe sebekeleri ucun qida ve icki topdan satisi.',
    products: [
      { slug: 'premium-un-50kg-paleti', title: 'Premium un 50 kq palet', categorySlug: 'un-seker-ve-duz', price: 32, unit: ProductUnit.PACKAGE, minOrderQuantity: 20 },
      { slug: 'qazli-icki-mix-24-lu-qutu', title: 'Qazli icki mix 24-lu qutu', categorySlug: 'sireler-ve-qazli-ickiler', price: 18.4, unit: ProductUnit.BOX, minOrderQuantity: 30 },
      { slug: 'cay-ve-qehve-horeca-seti', title: 'Cay ve qehve HoReCa seti', categorySlug: 'cay-ve-qehve', priceType: PriceType.NEGOTIABLE, unit: ProductUnit.BOX, minOrderQuantity: 15 },
    ],
  },
  {
    slug: 'caspian-electro-hub',
    name: 'Caspian Electro Hub',
    legalName: 'Caspian Electro Hub MMC',
    categorySlug: 'elektronika-ve-aksesuarlar',
    city: 'Baki',
    district: 'Nizami',
    phone: '+994552202020',
    email: 'orders@caspianelectro.az',
    description: 'Telefon aksesuarlari, smart cihazlar ve ofis texnikasi uzre topdan teklif.',
    products: [
      { slug: 'usb-c-kabel-100-ededlik-paket', title: 'USB-C kabel 100 ededlik paket', categorySlug: 'adapter-ve-kabeller', price: 145, unit: ProductUnit.PACKAGE, minOrderQuantity: 5 },
      { slug: 'powerbank-10000mah-topdan-partiya', title: 'Powerbank 10000mAh topdan partiya', categorySlug: 'powerbanklar', priceType: PriceType.NEGOTIABLE, unit: ProductUnit.PIECE, minOrderQuantity: 50 },
      { slug: 'ofis-printerleri-a4-stok', title: 'Ofis printerleri A4 stok', categorySlug: 'printerler', price: 285, unit: ProductUnit.PIECE, minOrderQuantity: 8 },
    ],
  },
  {
    slug: 'comfort-home-wholesale',
    name: 'Comfort Home Wholesale',
    legalName: 'Comfort Home Wholesale MMC',
    categorySlug: 'ev-bag-ve-mebel',
    city: 'Sumqayit',
    district: 'Merkez',
    phone: '+994703303030',
    email: 'hello@comforthome.az',
    description: 'Ev, ofis ve bag ucun mebel, tekstil ve saxlama helleri.',
    products: [
      { slug: 'ofis-stulu-model-slim-24-eded', title: 'Ofis stulu Model Slim 24 eded', categorySlug: 'ofis-stullari', price: 69, unit: ProductUnit.PIECE, minOrderQuantity: 24 },
      { slug: 'saxlama-qutulari-set-60-eded', title: 'Saxlama qutulari set 60 eded', categorySlug: 'saxlama-qutulari', price: 4.2, unit: ProductUnit.PIECE, minOrderQuantity: 60 },
      { slug: 'bag-mebeli-yay-kolleksiyasi', title: 'Bag mebeli yay kolleksiyasi', categorySlug: 'heyet-mebeli', priceType: PriceType.NEGOTIABLE, unit: ProductUnit.PIECE, minOrderQuantity: 10 },
    ],
  },
  {
    slug: 'probuild-materials',
    name: 'ProBuild Materials',
    legalName: 'ProBuild Materials MMC',
    categorySlug: 'tikinti-ve-temir',
    city: 'Ganca',
    district: 'Kepez',
    phone: '+994773404040',
    email: 'info@probuild.az',
    description: 'Tikinti briqadalari ve obyektler ucun material, boya ve elektrik levazimatlari.',
    products: [
      { slug: 'sement-m500-50kg-topdan', title: 'Sement M500 50 kq topdan', categorySlug: 'sement-ve-qum', price: 9.2, unit: ProductUnit.PIECE, minOrderQuantity: 120 },
      { slug: 'ag-divar-boyasi-18l-paleti', title: 'Ag divar boyasi 18L palet', categorySlug: 'divar-boyalari', price: 38, unit: ProductUnit.PIECE, minOrderQuantity: 24 },
      { slug: 'elektrik-kabeli-3x25-100m', title: 'Elektrik kabeli 3x2.5 100m', categorySlug: 'kabeller', priceType: PriceType.NEGOTIABLE, unit: ProductUnit.METER, minOrderQuantity: 500 },
    ],
  },
  {
    slug: 'auto-line-parts',
    name: 'Auto Line Parts',
    legalName: 'Auto Line Parts MMC',
    categorySlug: 'avto-neqliyyat-ve-ehtiyat-hisseleri',
    city: 'Baki',
    district: 'Xetai',
    phone: '+994504505050',
    email: 'parts@autoline.az',
    description: 'Servis merkezleri ucun avto ehtiyat hisseleri, yaglar ve aksesuarlar.',
    products: [
      { slug: 'hava-yag-filtri-mix-200-eded', title: 'Hava/yag filtri mix 200 eded', categorySlug: 'filtrler-ve-yaglar', priceType: PriceType.NEGOTIABLE, unit: ProductUnit.PIECE, minOrderQuantity: 200 },
      { slug: 'salon-aksesuar-seti-50-masin', title: 'Salon aksesuar seti 50 masin', categorySlug: 'salon-aksesuarlari', price: 22.5, unit: ProductUnit.PACKAGE, minOrderQuantity: 50 },
      { slug: 'yuk-masini-texniki-yag-20l', title: 'Yuk masini texniki yag 20L', categorySlug: 'texniki-yaglar', price: 76, unit: ProductUnit.PIECE, minOrderQuantity: 16 },
    ],
  },
  {
    slug: 'beauty-pro-distribution',
    name: 'Beauty Pro Distribution',
    legalName: 'Beauty Pro Distribution MMC',
    categorySlug: 'gozellik-saglamliq-ve-sexsi-qulluq',
    city: 'Baki',
    district: 'Yasamal',
    phone: '+994556606060',
    email: 'contact@beautypro.az',
    description: 'Salonlar, aptekler ve kosmetika magazalari ucun topdan dagitim.',
    products: [
      { slug: 'sac-baximi-professional-set', title: 'Sac baximi professional set', categorySlug: 'sac-baximi', price: 54, unit: ProductUnit.BOX, minOrderQuantity: 20 },
      { slug: 'dezinfeksiya-mehsullari-5l', title: 'Dezinfeksiya mehsullari 5L', categorySlug: 'dezinfeksiya-mehsullari', price: 11.8, unit: ProductUnit.PIECE, minOrderQuantity: 80 },
      { slug: 'salon-sterilizasiya-avadanligi', title: 'Salon sterilizasiya avadanligi', categorySlug: 'sterilizasiya-avadanligi', priceType: PriceType.NEGOTIABLE, unit: ProductUnit.PIECE, minOrderQuantity: 6 },
    ],
  },
  {
    slug: 'kidsmart-supply',
    name: 'KidSmart Supply',
    legalName: 'KidSmart Supply MMC',
    categorySlug: 'usaq-mehsullari',
    city: 'Baki',
    district: 'Sabuncu',
    phone: '+994707707070',
    email: 'sales@kidsmart.az',
    description: 'Ushaq magazalari ve bagcalar ucun oyuncaq, mekteb ve korpe mehsullari.',
    products: [
      { slug: 'tedris-oyuncaqlari-120-eded', title: 'Tedris oyuncaqlari 120 eded', categorySlug: 'tedris-oyuncaqlari', price: 7.5, unit: ProductUnit.PIECE, minOrderQuantity: 120 },
      { slug: 'mekteb-cantalari-sezon-stoku', title: 'Mekteb cantalari sezon stoku', categorySlug: 'cantalar', priceType: PriceType.NEGOTIABLE, unit: ProductUnit.PIECE, minOrderQuantity: 40 },
      { slug: 'korpe-gigiyena-topdan-paket', title: 'Korpe gigiyena topdan paket', categorySlug: 'usaq-gigiyenasi', price: 19.9, unit: ProductUnit.PACKAGE, minOrderQuantity: 35 },
    ],
  },
  {
    slug: 'packline-print',
    name: 'PackLine Print',
    legalName: 'PackLine Print MMC',
    categorySlug: 'qablasdirma-ve-reklam-mehsullari',
    city: 'Baki',
    district: 'Suraxani',
    phone: '+994508808080',
    email: 'order@packline.az',
    description: 'Brendli qablasdirma, promo mehsullar ve cap xidmetleri.',
    products: [
      { slug: 'karton-qutu-40x30x30-500-eded', title: 'Karton qutu 40x30x30 500 eded', categorySlug: 'karton-qutular', price: 0.72, unit: ProductUnit.PIECE, minOrderQuantity: 500 },
      { slug: 'brendli-paket-1000-eded', title: 'Brendli paket 1000 eded', categorySlug: 'brendli-paketler', priceType: PriceType.NEGOTIABLE, unit: ProductUnit.PACKAGE, minOrderQuantity: 1 },
      { slug: 'kagiz-stekan-12oz-2000-eded', title: 'Kagiz stekan 12oz 2000 eded', categorySlug: 'kagiz-stekanlar', price: 0.08, unit: ProductUnit.PIECE, minOrderQuantity: 2000 },
    ],
  },
  {
    slug: 'agroline-b2b',
    name: 'AgroLine B2B',
    legalName: 'AgroLine B2B MMC',
    categorySlug: 'kend-teserrufati-ve-heyvandarliq',
    city: 'Mingecevir',
    district: 'Merkez',
    phone: '+994559909090',
    email: 'agro@agroline.az',
    description: 'Fermerler ve teserrufatlar ucun toxum, gubre, yem ve avadanliq.',
    products: [
      { slug: 'terevez-toxumlari-yaz-seti', title: 'Terevez toxumlari yaz seti', categorySlug: 'terevez-toxumlari', price: 24, unit: ProductUnit.PACKAGE, minOrderQuantity: 25 },
      { slug: 'mineral-gubre-25kg-topdan', title: 'Mineral gubre 25 kq topdan', categorySlug: 'mineral-gubreler', price: 17.5, unit: ProductUnit.PIECE, minOrderQuantity: 80 },
      { slug: 'qusculuq-avadanligi-baslangic-seti', title: 'Qusculuq avadanligi baslangic seti', categorySlug: 'qusculuq-avadanligi', priceType: PriceType.NEGOTIABLE, unit: ProductUnit.PACKAGE, minOrderQuantity: 10 },
    ],
  },
  {
    slug: 'b2b-service-connect',
    name: 'B2B Service Connect',
    legalName: 'B2B Service Connect MMC',
    categorySlug: 'xidmetler-ve-b2b-heller',
    city: 'Baki',
    district: 'Narimanov',
    phone: '+994501001100',
    email: 'support@b2bconnect.az',
    description: 'Logistika, anbar, reklam ve IT xidmetleri ucun B2B elaqe merkezi.',
    products: [
      { slug: 'seherdaxili-dasinma-ayliq-paket', title: 'Seherdaxili dasinma ayliq paket', categorySlug: 'seherdaxili-dasinma', priceType: PriceType.NEGOTIABLE, unit: ProductUnit.PACKAGE, minOrderQuantity: 1 },
      { slug: 'anbar-xidmeti-100m2', title: 'Anbar xidmeti 100m2', categorySlug: 'anbar-xidmeti', price: 950, unit: ProductUnit.PACKAGE, minOrderQuantity: 1 },
      { slug: 'it-xidmetleri-magaza-start-paket', title: 'IT xidmetleri magaza start paket', categorySlug: 'it-xidmetleri', priceType: PriceType.NEGOTIABLE, unit: ProductUnit.PACKAGE, minOrderQuantity: 1 },
    ],
  },
];

async function upsertCategoryTree(nodes, parentId = null) {
  for (const [index, node] of nodes.entries()) {
    const sortOrder = node.sortOrder ?? (index + 1) * 10;
    const category = await prisma.category.upsert({
      where: { slug: node.slug },
      create: {
        slug: node.slug,
        name: node.name,
        icon: node.icon,
        sortOrder,
        parentId,
        status: CategoryStatus.ACTIVE,
      },
      update: {
        name: node.name,
        icon: node.icon,
        sortOrder,
        parentId,
        status: CategoryStatus.ACTIVE,
      },
    });

    if (node.children?.length) {
      await upsertCategoryTree(node.children, category.id);
    }
  }
}

async function seedShowcaseMarketplace(ownerUserId) {
  const categorySlugs = [
    ...new Set(
      showcaseStores.flatMap((store) => [
        store.categorySlug,
        ...store.products.map((product) => product.categorySlug),
      ]),
    ),
  ];
  const categories = await prisma.category.findMany({
    where: { slug: { in: categorySlugs } },
    select: { id: true, slug: true },
  });
  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]));
  const now = new Date();

  for (const storeSeed of showcaseStores) {
    const storeCategoryId = categoryIds.get(storeSeed.categorySlug);

    if (!storeCategoryId) {
      throw new Error(`Seed category not found: ${storeSeed.categorySlug}`);
    }

    const store = await prisma.store.upsert({
      where: { slug: storeSeed.slug },
      create: {
        ownerUserId,
        slug: storeSeed.slug,
        name: storeSeed.name,
        legalName: storeSeed.legalName,
        categoryId: storeCategoryId,
        city: storeSeed.city,
        district: storeSeed.district,
        description: storeSeed.description,
        status: StoreStatus.ACTIVE,
        verifiedAt: now,
        publishedAt: now,
        whatsappNumber: storeSeed.phone,
        phone: storeSeed.phone,
        email: storeSeed.email,
        workingHours: {
          workdays: '09:00 - 18:00',
          saturday: '10:00 - 15:00',
          sunday: 'Baglidir',
        },
      },
      update: {
        ownerUserId,
        categoryId: storeCategoryId,
        city: storeSeed.city,
        district: storeSeed.district,
        description: storeSeed.description,
        status: StoreStatus.ACTIVE,
        verifiedAt: now,
        publishedAt: now,
        whatsappNumber: storeSeed.phone,
        phone: storeSeed.phone,
        email: storeSeed.email,
        workingHours: {
          workdays: '09:00 - 18:00',
          saturday: '10:00 - 15:00',
          sunday: 'Baglidir',
        },
      },
    });

    const products = [
      {
        slug: `${storeSeed.slug}-katalog-teklifi`,
        title: `${storeSeed.name} topdan katalog teklifi`,
        categorySlug: storeSeed.categorySlug,
        priceType: PriceType.NEGOTIABLE,
        unit: ProductUnit.PACKAGE,
        minOrderQuantity: 1,
      },
      ...storeSeed.products,
    ];

    for (const productSeed of products) {
      const productCategoryId = categoryIds.get(productSeed.categorySlug);

      if (!productCategoryId) {
        throw new Error(`Seed category not found: ${productSeed.categorySlug}`);
      }

      await prisma.product.upsert({
        where: {
          storeId_slug: {
            storeId: store.id,
            slug: productSeed.slug,
          },
        },
        create: {
          storeId: store.id,
          categoryId: productCategoryId,
          slug: productSeed.slug,
          title: productSeed.title,
          description: `${storeSeed.name} terefinden topdan satis ucun demo mehsul.`,
          price: productSeed.price,
          priceType: productSeed.priceType ?? PriceType.FIXED,
          currency: 'AZN',
          unit: productSeed.unit,
          minOrderQuantity: productSeed.minOrderQuantity,
          stockStatus: 'IN_STOCK',
          status: ProductStatus.ACTIVE,
          publishedAt: now,
        },
        update: {
          storeId: store.id,
          categoryId: productCategoryId,
          title: productSeed.title,
          description: `${storeSeed.name} terefinden topdan satis ucun demo mehsul.`,
          price: productSeed.price,
          priceType: productSeed.priceType ?? PriceType.FIXED,
          currency: 'AZN',
          unit: productSeed.unit,
          minOrderQuantity: productSeed.minOrderQuantity,
          stockStatus: 'IN_STOCK',
          status: ProductStatus.ACTIVE,
          publishedAt: now,
        },
      });
    }
  }
}

async function main() {
  await upsertCategoryTree(categoryTree);

  const textileCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'geyim-ayaqqabi-ve-tekstil' } });
  const electronicsCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'elektronika-ve-aksesuarlar' } });
  const shoesCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'ayaqqabi' } });
  const constructionCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'tikinti-ve-temir' } });

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      fullName: 'Topdanci Admin',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    update: {
      fullName: 'Topdanci Admin',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    create: {
      email: superAdminEmail,
      fullName: 'Topdanci Super Admin',
      passwordHash: superAdminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
    update: {
      fullName: 'Topdanci Super Admin',
      passwordHash: superAdminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: sellerEmail },
    create: {
      email: sellerEmail,
      phone: '+994501234500',
      fullName: 'Baku Tekstil Seller',
      passwordHash: sellerPasswordHash,
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
    },
    update: {
      phone: '+994501234500',
      fullName: 'Baku Tekstil Seller',
      passwordHash: sellerPasswordHash,
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
    },
  });

  const demoSellerUser = await prisma.user.upsert({
    where: { email: demoSellerEmail },
    create: {
      email: demoSellerEmail,
      phone: '+994501119900',
      fullName: 'Demo Seller',
      passwordHash: demoSellerPasswordHash,
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
    },
    update: {
      phone: '+994501119900',
      fullName: 'Demo Seller',
      passwordHash: demoSellerPasswordHash,
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
    },
  });

  const bakuTextile = await prisma.store.upsert({
    where: { slug: 'baku-tekstil-mmc' },
    create: {
      ownerUserId: sellerUser.id,
      slug: 'baku-tekstil-mmc',
      name: 'Baku Tekstil MMC',
      legalName: 'Baku Tekstil MMC',
      categoryId: textileCategory.id,
      city: 'Baki',
      status: StoreStatus.ACTIVE,
      verifiedAt: new Date(),
      publishedAt: new Date(),
      whatsappNumber: '+994501234567',
      phone: '+994501234567',
    },
    update: {
      ownerUserId: sellerUser.id,
      categoryId: textileCategory.id,
      status: StoreStatus.ACTIVE,
      verifiedAt: new Date(),
      publishedAt: new Date(),
    },
  });

  const techWholesale = await prisma.store.upsert({
    where: { slug: 'techwholesale-az' },
    create: {
      slug: 'techwholesale-az',
      name: 'TechWholesale AZ',
      legalName: 'TechWholesale AZ MMC',
      categoryId: electronicsCategory.id,
      city: 'Baki',
      status: StoreStatus.ACTIVE,
      verifiedAt: new Date(),
      publishedAt: new Date(),
      whatsappNumber: '+994551112233',
      phone: '+994551112233',
    },
    update: {
      categoryId: electronicsCategory.id,
      status: StoreStatus.ACTIVE,
      verifiedAt: new Date(),
      publishedAt: new Date(),
    },
  });

  const shoesImport = await prisma.store.upsert({
    where: { slug: 'shoes-import-trade' },
    create: {
      slug: 'shoes-import-trade',
      name: 'Shoes Import Trade',
      legalName: 'Shoes Import Trade MMC',
      categoryId: shoesCategory.id,
      city: 'Sumqayit',
      status: StoreStatus.ACTIVE,
      verifiedAt: new Date(),
      publishedAt: new Date(),
      whatsappNumber: '+994552223344',
      phone: '+994552223344',
    },
    update: {
      categoryId: shoesCategory.id,
      status: StoreStatus.ACTIVE,
      verifiedAt: new Date(),
      publishedAt: new Date(),
    },
  });

  const constructionStore = await prisma.store.upsert({
    where: { slug: 'mega-insaat-supply' },
    create: {
      slug: 'mega-insaat-supply',
      name: 'Mega Insaat Supply',
      legalName: 'Mega Insaat Supply MMC',
      categoryId: constructionCategory.id,
      city: 'Ganca',
      status: StoreStatus.ACTIVE,
      verifiedAt: new Date(),
      publishedAt: new Date(),
      whatsappNumber: '+994703334455',
      phone: '+994703334455',
    },
    update: {
      categoryId: constructionCategory.id,
      status: StoreStatus.ACTIVE,
      verifiedAt: new Date(),
      publishedAt: new Date(),
    },
  });

  const demoStore = await prisma.store.upsert({
    where: { slug: 'demo-topdan-market' },
    create: {
      ownerUserId: demoSellerUser.id,
      slug: 'demo-topdan-market',
      name: 'Demo Topdan Market MMC',
      legalName: 'Demo Topdan Market MMC',
      categoryId: constructionCategory.id,
      city: 'Baki',
      district: 'Nerimanov',
      address: 'Ataturk prospekti 12',
      description: 'Demo seller paneli ucun test magazasi.',
      status: StoreStatus.ACTIVE,
      verifiedAt: new Date(),
      publishedAt: new Date(),
      whatsappNumber: '+994501119900',
      phone: '+994501119900',
      email: demoSellerEmail,
      workingHours: {
        workdays: '09:00 - 18:00',
        saturday: '10:00 - 15:00',
        sunday: 'Baglidir',
      },
    },
    update: {
      ownerUserId: demoSellerUser.id,
      categoryId: constructionCategory.id,
      city: 'Baki',
      district: 'Nerimanov',
      description: 'Demo seller paneli ucun test magazasi.',
      status: StoreStatus.ACTIVE,
      verifiedAt: new Date(),
      publishedAt: new Date(),
      whatsappNumber: '+994501119900',
      phone: '+994501119900',
      email: demoSellerEmail,
      workingHours: {
        workdays: '09:00 - 18:00',
        saturday: '10:00 - 15:00',
        sunday: 'Baglidir',
      },
    },
  });

  await prisma.storeMember.upsert({
    where: {
      storeId_userId: {
        storeId: bakuTextile.id,
        userId: sellerUser.id,
      },
    },
    create: {
      storeId: bakuTextile.id,
      userId: sellerUser.id,
      role: StoreRole.OWNER,
    },
    update: {
      role: StoreRole.OWNER,
    },
  });

  await prisma.storeMember.upsert({
    where: {
      storeId_userId: {
        storeId: demoStore.id,
        userId: demoSellerUser.id,
      },
    },
    create: {
      storeId: demoStore.id,
      userId: demoSellerUser.id,
      role: StoreRole.OWNER,
    },
    update: {
      role: StoreRole.OWNER,
    },
  });

  await prisma.product.upsert({
    where: {
      storeId_slug: {
        storeId: bakuTextile.id,
        slug: 'kis-qis-godekceleri-model-402',
      },
    },
    create: {
      storeId: bakuTextile.id,
      categoryId: textileCategory.id,
      slug: 'kis-qis-godekceleri-model-402',
      title: 'Kis qis godekceleri Model 402',
      description: 'Topdan satis ucun kis geyimleri. Qiymet birbasa satici ile razilashdirilir.',
      priceType: PriceType.NEGOTIABLE,
      unit: ProductUnit.PIECE,
      minOrderQuantity: 50,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
    update: {
      categoryId: textileCategory.id,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
  });

  await prisma.product.upsert({
    where: {
      storeId_slug: {
        storeId: techWholesale.id,
        slug: 'agilli-saatlar-x-series',
      },
    },
    create: {
      storeId: techWholesale.id,
      categoryId: electronicsCategory.id,
      slug: 'agilli-saatlar-x-series',
      title: 'Agilli saatlar X-Series',
      description: 'Topdan elektronika mehsulu. Platformada odeme ve checkout yoxdur.',
      priceType: PriceType.NEGOTIABLE,
      unit: ProductUnit.PIECE,
      minOrderQuantity: 50,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
    update: {
      categoryId: electronicsCategory.id,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
  });

  await prisma.product.upsert({
    where: { slug: 'qadin-dari-cakmalari-stok-500-cut' },
    create: {
      storeId: shoesImport.id,
      categoryId: shoesCategory.id,
      slug: 'qadin-dari-cakmalari-stok-500-cut',
      title: 'Qadin deri cakmalari Stok 500 cut',
      description: 'Ayaqqabi ve deri mehsullari uzre topdan teklif. Qiymet razilasma yolu ile.',
      priceType: PriceType.NEGOTIABLE,
      unit: ProductUnit.PIECE,
      minOrderQuantity: 100,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
    update: {
      categoryId: shoesCategory.id,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
  });

  await prisma.product.upsert({
    where: { slug: 'akkumulyatorlu-drel-dasti' },
    create: {
      storeId: constructionStore.id,
      categoryId: constructionCategory.id,
      slug: 'akkumulyatorlu-drel-dasti',
      title: 'Akkumulyatorlu drel dasti Topdan satis',
      description: 'Tikinti ve temir avadanliqlari ucun topdan satis mehsulu.',
      priceType: PriceType.NEGOTIABLE,
      unit: ProductUnit.PIECE,
      minOrderQuantity: 20,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
    update: {
      categoryId: constructionCategory.id,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
  });

  await prisma.product.upsert({
    where: { slug: 'baku-tekstil-yeni-mehsul-review' },
    create: {
      storeId: bakuTextile.id,
      categoryId: textileCategory.id,
      slug: 'baku-tekstil-yeni-mehsul-review',
      title: 'Baku Tekstil Yeni Mehsul Review',
      description: 'Admin moderation testleri ucun pending review mehsulu.',
      priceType: PriceType.NEGOTIABLE,
      unit: ProductUnit.PIECE,
      minOrderQuantity: 25,
      status: ProductStatus.PENDING_REVIEW,
    },
    update: {
      categoryId: textileCategory.id,
      status: ProductStatus.PENDING_REVIEW,
      publishedAt: null,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'demo-sement-m400-50kg' },
    create: {
      storeId: demoStore.id,
      categoryId: constructionCategory.id,
      slug: 'demo-sement-m400-50kg',
      title: 'Demo Sement M-400 50 kq',
      description: 'Demo seller paneli ucun aktiv mehsul. Minimum sifaris 100 eded.',
      price: 8.5,
      priceType: PriceType.FIXED,
      currency: 'AZN',
      unit: ProductUnit.PIECE,
      minOrderQuantity: 100,
      stockStatus: 'IN_STOCK',
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
    update: {
      storeId: demoStore.id,
      categoryId: constructionCategory.id,
      price: 8.5,
      priceType: PriceType.FIXED,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
  });

  await prisma.product.upsert({
    where: { slug: 'demo-armatur-12mm-topdan' },
    create: {
      storeId: demoStore.id,
      categoryId: constructionCategory.id,
      slug: 'demo-armatur-12mm-topdan',
      title: 'Demo Armatur 12mm Topdan',
      description: 'Topdan tikinti materiallari ucun demo aktiv mehsul.',
      priceType: PriceType.NEGOTIABLE,
      unit: ProductUnit.TON,
      minOrderQuantity: 10,
      stockStatus: 'IN_STOCK',
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
    update: {
      storeId: demoStore.id,
      categoryId: constructionCategory.id,
      priceType: PriceType.NEGOTIABLE,
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
  });

  await prisma.product.upsert({
    where: { slug: 'demo-qaralama-mehsul' },
    create: {
      storeId: demoStore.id,
      categoryId: constructionCategory.id,
      slug: 'demo-qaralama-mehsul',
      title: 'Demo Qaralama Mehsul',
      description: 'Seller panelinde redakte ve draft yoxlamasi ucun qaralama.',
      priceType: PriceType.NEGOTIABLE,
      unit: ProductUnit.PIECE,
      minOrderQuantity: 20,
      stockStatus: 'PREORDER',
      status: ProductStatus.DRAFT,
    },
    update: {
      storeId: demoStore.id,
      categoryId: constructionCategory.id,
      status: ProductStatus.DRAFT,
      publishedAt: null,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'demo-yoxlamada-mehsul' },
    create: {
      storeId: demoStore.id,
      categoryId: constructionCategory.id,
      slug: 'demo-yoxlamada-mehsul',
      title: 'Demo Yoxlamada Mehsul',
      description: 'Admin moderation flow ucun pending review demo mehsulu.',
      priceType: PriceType.NEGOTIABLE,
      unit: ProductUnit.PACKAGE,
      minOrderQuantity: 30,
      stockStatus: 'IN_STOCK',
      status: ProductStatus.PENDING_REVIEW,
    },
    update: {
      storeId: demoStore.id,
      categoryId: constructionCategory.id,
      status: ProductStatus.PENDING_REVIEW,
      publishedAt: null,
    },
  });

  await seedShowcaseMarketplace(demoSellerUser.id);

  await prisma.category.updateMany({
    where: {
      slug: { in: deprecatedCategorySlugs },
      products: { none: {} },
      stores: { none: {} },
      storeApplications: { none: {} },
    },
    data: {
      status: CategoryStatus.PASSIVE,
    },
  });

  const existingApplication = await prisma.storeApplication.findFirst({
    where: {
      companyName: 'Pending Wholesale MMC',
      status: ApplicationStatus.PENDING,
    },
    select: { id: true },
  });

  if (!existingApplication) {
    await prisma.storeApplication.create({
      data: {
        contactName: 'Pending Seller',
        contactPhone: '+994501112299',
        contactEmail: 'pending-seller@topdanci.az',
        companyName: 'Pending Wholesale MMC',
        taxNumber: '9900112233',
        categoryId: constructionCategory.id,
        city: 'Baki',
        district: 'Nerimanov',
        description: 'Admin approval flow ucun seed magazasi.',
        status: ApplicationStatus.PENDING,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
