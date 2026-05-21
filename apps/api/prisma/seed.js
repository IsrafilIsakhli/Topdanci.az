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
const adminPasswordHash = '$2a$10$31WD4STobdOzFNQ8bJLzJOrZu..w/J21gnUtKtH14NayDTmVTQCZ2';
const sellerPasswordHash = '$2a$10$dQsja4DxBdEcr6aOWskOrOVaF/Yl2VctnnPXBIFa9V6hXNcLeIKIW';
const demoSellerPasswordHash = bcrypt.hashSync('SellerDemo123!', 10);

const categoryTree = [
  {
    slug: 'son-elanlar',
    name: 'Son elanlar',
    icon: 'layout-list',
    sortOrder: 0,
    children: [
      {
        slug: 'neqliyyat',
        name: 'Nəqliyyat',
        icon: 'truck',
        children: [
          { slug: 'neqliyyat-ehtiyat-hisseleri-ve-aksesuarlar', name: 'Ehtiyat hissələri və aksesuarlar' },
          { slug: 'avtomobiller', name: 'Avtomobillər' },
          { slug: 'tikinti-texnikasi', name: 'Tikinti texnikası' },
          { slug: 'motosikletler-ve-mopedler', name: 'Motosikletlər və mopedlər' },
          { slug: 'yuk-masinlari-ve-qosqular', name: 'Yük maşınları və qoşqular' },
          { slug: 'qeydiyyat-nisanlari', name: 'Qeydiyyat nişanları' },
          { slug: 'aqrotexnika', name: 'Aqrotexnika' },
          { slug: 'su-neqliyyati', name: 'Su nəqliyyatı' },
          { slug: 'avtobuslar', name: 'Avtobuslar' },
        ],
      },
      {
        slug: 'elektronika',
        name: 'Elektronika',
        icon: 'headphones',
        children: [
          { slug: 'elektronika-telefonlar', name: 'Telefonlar' },
          { slug: 'audio-ve-video', name: 'Audio və video' },
          { slug: 'noutbuklar-ve-netbuklar', name: 'Noutbuklar və netbuklar' },
          { slug: 'komponentler-ve-monitorlar', name: 'Komponentlər və monitorlar' },
          { slug: 'komputer-aksesuarlari', name: 'Kompüter aksesuarları' },
          { slug: 'oyunlar-pultlar-ve-proqramlar', name: 'Oyunlar, pultlar və proqramlar' },
          { slug: 'televizorlar-ve-aksesuarlar', name: 'Televizorlar və aksesuarlar' },
          { slug: 'sebeke-ve-server-avadanligi', name: 'Şəbəkə və server avadanlığı' },
          { slug: 'nomreler-ve-sim-kartlar', name: 'Nömrələr və SIM-kartlar' },
          { slug: 'ofis-avadanligi-ve-istehlak-materiallari', name: 'Ofis avadanlığı və istehlak materialları' },
          { slug: 'fototexnika', name: 'Fototexnika' },
          { slug: 'planset-ve-elektron-kitablar', name: 'Planşet və elektron kitablar' },
          { slug: 'smart-saat-ve-qolbaqlar', name: 'Smart saat və qolbaqlar' },
          { slug: 'masaustu-komputerler', name: 'Masaüstü kompüterlər' },
        ],
      },
      {
        slug: 'ev-ve-bag-ucun',
        name: 'Ev və bağ üçün',
        icon: 'house',
        children: [
          { slug: 'ev-ve-bag-meiset-texnikasi', name: 'Məişət texnikası' },
          { slug: 'mebeller', name: 'Mebellər' },
          { slug: 'ev-ve-bag-temir-ve-tikinti', name: 'Təmir və tikinti' },
          { slug: 'qab-qacaq-ve-metbex-levazimatlari', name: 'Qab-qacaq və mətbəx ləvazimatları' },
          { slug: 'dekor-ve-interyer', name: 'Dekor və interyer' },
          { slug: 'bag-ve-bostan', name: 'Bağ və bostan' },
          { slug: 'ev-ve-bag-isiqlandirma', name: 'Ev və bağ üçün işiqlandırma' },
          { slug: 'ev-tekstili', name: 'Ev tekstili' },
          { slug: 'bitkiler', name: 'Bitkilər' },
          { slug: 'xalcalar-ve-aksesuarlar', name: 'Xalçalar və aksesuarlar' },
          { slug: 'ev-teserrufati-mallari', name: 'Ev təsərrüfatı malları' },
          { slug: 'erzaq', name: 'Ərzaq' },
        ],
      },
      { slug: 'ehtiyat-hisseleri-ve-aksesuarlar', name: 'Ehtiyat hissələri və aksesuarlar', icon: 'wrench' },
      {
        slug: 'dasinmaz-emlak',
        name: 'Daşınmaz əmlak',
        icon: 'building-2',
        children: [
          { slug: 'menziller', name: 'Mənzillər' },
          { slug: 'heyet-evleri-bag-evleri', name: 'Həyət evləri, bağ evləri' },
          { slug: 'torpaq', name: 'Torpaq' },
          { slug: 'obyektler-ve-ofisler', name: 'Obyektlər və ofislər' },
          { slug: 'qarajlar', name: 'Qarajlar' },
          { slug: 'xaricde-emlak', name: 'Xaricdə əmlak' },
        ],
      },
      {
        slug: 'xidmetler-ve-biznes',
        name: 'Xidmətlər və biznes',
        icon: 'briefcase-business',
        children: [
          { slug: 'biznes-ucun-avadanliq', name: 'Biznes üçün avadanlıq' },
          { slug: 'tehlukesizlik-sistemleri', name: 'Təhlükəsizlik sistemləri' },
          { slug: 'xidmetler-temir-ve-tikinti', name: 'Təmir və tikinti' },
          { slug: 'texnika-temiri', name: 'Texnika təmiri' },
          { slug: 'neqliyyat-vasitelerinin-icaresi', name: 'Nəqliyyat vasitələrinin icarəsi' },
          { slug: 'avadanligin-icaresi', name: 'Avadanlığın icarəsi' },
          { slug: 'reklam-dizayn-ve-poliqrafiya', name: 'Reklam, dizayn və poliqrafiya' },
          { slug: 'logistika', name: 'Logistika' },
          { slug: 'telim-hazirliq-kurslari', name: 'Təlim, hazırlıq kursları' },
          { slug: 'it-internet-telekom', name: 'IT, internet, telekom' },
          { slug: 'diger-xidmetler', name: 'Digər' },
          { slug: 'mebel-yigilmasi-ve-temiri', name: 'Mebel yığılması və təmiri' },
          { slug: 'avtoservis-ve-diaqnostika', name: 'Avtoservis və diaqnostika' },
          { slug: 'temizlik', name: 'Təmizlik' },
          { slug: 'avadanliqlarin-qurasdirilmasi', name: 'Avadanlıqların quraşdırılması' },
          { slug: 'musiqi-eylence-ve-tedbirler', name: 'Musiqi, əyləncə və tədbirlər' },
          { slug: 'qidalanma-keyterinq', name: 'Qidalanma, keyterinq' },
          { slug: 'muhasibat-xidmetleri', name: 'Mühasibat xidmətləri' },
          { slug: 'foto-ve-video-cekilis-xidmetleri', name: 'Foto və video çəkiliş xidmətləri' },
          { slug: 'gozellik-saglamliq', name: 'Gözəllik, sağlamlıq' },
          { slug: 'dayeler-baxicilar', name: 'Dayələr, baxıcılar' },
          { slug: 'tibbi-xidmetler', name: 'Tibbi xidmətlər' },
          { slug: 'huquq-xidmetleri', name: 'Hüquq xidmətləri' },
          { slug: 'tercume', name: 'Tərcümə' },
          { slug: 'sigorta-xidmetleri', name: 'Sığorta xidmətləri' },
        ],
      },
      {
        slug: 'sexsi-esyalar',
        name: 'Şəxsi əşyalar',
        icon: 'shirt',
        children: [
          { slug: 'geyim-ve-ayaqqabilar', name: 'Geyim və ayaqqabılar' },
          { slug: 'saglamliq-ve-gozellik', name: 'Sağlamlıq və gözəllik' },
          { slug: 'saat-ve-zinet-esyalari', name: 'Saat və zinət əşyaları' },
          { slug: 'aksesuarlar', name: 'Aksesuarlar' },
          { slug: 'tutun-qizdiricilari-ve-aksesuarlari', name: 'Tütün qızdırıcıları və aksesuarları' },
          { slug: 'itmis-esyalar', name: 'İtmiş əşyalar' },
        ],
      },
      {
        slug: 'hobbi-ve-asude',
        name: 'Hobbi və asudə',
        icon: 'music',
        children: [
          { slug: 'idman-ve-asude', name: 'İdman və asudə' },
          { slug: 'velosipedler', name: 'Velosipedlər' },
          { slug: 'kolleksiyalar', name: 'Kolleksiyalar' },
          { slug: 'musiqi-aletleri', name: 'Musiqi alətləri' },
          { slug: 'kitab-ve-jurnallar', name: 'Kitab və jurnallar' },
          { slug: 'kempinq-ovculuq-ve-baliqciliq', name: 'Kempinq, ovçuluq və balıqçılıq' },
          { slug: 'tanisliq', name: 'Tanışlıq' },
          { slug: 'biletler-ve-seyahet', name: 'Biletlər və səyahət' },
        ],
      },
      { slug: 'meiset-texnikasi', name: 'Məişət texnikası', icon: 'washing-machine' },
      { slug: 'telefonlar', name: 'Telefonlar', icon: 'smartphone' },
      {
        slug: 'usaq-alemi',
        name: 'Uşaq aləmi',
        icon: 'baby',
        children: [
          { slug: 'oyuncaqlar', name: 'Oyuncaqlar' },
          { slug: 'usaq-geyimi', name: 'Uşaq geyimi' },
          { slug: 'carpayilar-ve-besikler', name: 'Çarpayılar və beşiklər' },
          { slug: 'usaq-arabalari', name: 'Uşaq arabaları' },
          { slug: 'usaq-alemi-mektebliler-ucun', name: 'Məktəblilər üçün' },
          { slug: 'usaq-avtomobilleri', name: 'Uşaq avtomobilləri' },
          { slug: 'usaq-mebeli', name: 'Uşaq mebeli' },
          { slug: 'qidalanma-oturacaqlari', name: 'Qidalanma oturacaqları' },
          { slug: 'avtomobil-oturacaqlari', name: 'Avtomobil oturacaqları' },
          { slug: 'yuruteceler', name: 'Yürütəclər' },
          { slug: 'hamam-ve-gigiyena', name: 'Hamam və gigiyena' },
          { slug: 'suruskenler-ve-meydancalar', name: 'Sürüşkənlər və meydançalar' },
          { slug: 'usaq-dasiyicilari', name: 'Uşaq daşıyıcıları' },
          { slug: 'manejler', name: 'Manejlər' },
          { slug: 'usaq-qidasi-ve-beslenmesi', name: 'Uşaq qidası və bəslənməsi' },
          { slug: 'usaq-tekstili', name: 'Uşaq tekstili' },
          { slug: 'diger-usaq-alemi', name: 'Digər' },
        ],
      },
      {
        slug: 'heyvanlar',
        name: 'Heyvanlar',
        icon: 'paw-print',
        children: [
          { slug: 'quslar', name: 'Quşlar' },
          { slug: 'itler', name: 'İtlər' },
          { slug: 'heyvanlar-ucun-mehsullar-ve-yemler', name: 'Heyvanlar üçün məhsullar və yemlər' },
          { slug: 'pisikler', name: 'Pişiklər' },
          { slug: 'akvariumlar-ve-baliqlar', name: 'Akvariumlar və balıqlar' },
          { slug: 'kt-heyvanlari', name: 'K/t heyvanları' },
          { slug: 'dovsanlar', name: 'Dovşanlar' },
          { slug: 'gemiriciler', name: 'Gəmiricilər' },
          { slug: 'diger-heyvanlar', name: 'Digər heyvanlar' },
          { slug: 'atlar', name: 'Atlar' },
        ],
      },
      {
        slug: 'is-elanlari',
        name: 'İş elanları',
        icon: 'briefcase',
        children: [
          { slug: 'vakansiyalar', name: 'Vakansiyalar' },
          { slug: 'is-axtariram', name: 'İş axtarıram' },
        ],
      },
      { slug: 'mektebliler-ucun', name: 'Məktəblilər üçün', icon: 'graduation-cap' },
    ],
  },
];

const deprecatedCategorySlugs = [
  'geyim',
  'ayaqqabi',
  'aksesuar',
  'kosmetika',
  'ev-mehsullari',
  'insaat-materiallari',
  'qida-mehsullari',
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

async function main() {
  await upsertCategoryTree(categoryTree);

  const textileCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'geyim-ve-ayaqqabilar' } });
  const electronicsCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'elektronika' } });
  const shoesCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'geyim-ve-ayaqqabilar' } });
  const constructionCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'ev-ve-bag-temir-ve-tikinti' } });

  await prisma.user.upsert({
    where: { email: 'admin@topdanci.az' },
    create: {
      email: 'admin@topdanci.az',
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

  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@topdanci.az' },
    create: {
      email: 'seller@topdanci.az',
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
    where: { email: 'seller-demo@topdanci.az' },
    create: {
      email: 'seller-demo@topdanci.az',
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
      email: 'seller-demo@topdanci.az',
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
      email: 'seller-demo@topdanci.az',
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
