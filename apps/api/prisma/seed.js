const { PrismaClient, PriceType, ProductStatus, ProductUnit, StoreStatus } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  { slug: 'geyim', name: 'Geyim', icon: 'shirt', sortOrder: 10 },
  { slug: 'ayaqqabi', name: 'Ayaqqabi', icon: 'footprints', sortOrder: 20 },
  { slug: 'aksesuar', name: 'Aksesuar', icon: 'watch', sortOrder: 30 },
  { slug: 'kosmetika', name: 'Kosmetika', icon: 'badge-check', sortOrder: 40 },
  { slug: 'elektronika', name: 'Elektronika', icon: 'headphones', sortOrder: 50 },
  { slug: 'ev-mehsullari', name: 'Ev mehsullari', icon: 'house', sortOrder: 60 },
  { slug: 'insaat-materiallari', name: 'Insaat materiallari', icon: 'drill', sortOrder: 70 },
  { slug: 'qida-mehsullari', name: 'Qida mehsullari', icon: 'utensils', sortOrder: 80 },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: category,
    });
  }

  const textileCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'geyim' } });
  const electronicsCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'elektronika' } });
  const shoesCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'ayaqqabi' } });
  const constructionCategory = await prisma.category.findUniqueOrThrow({ where: { slug: 'insaat-materiallari' } });

  const bakuTextile = await prisma.store.upsert({
    where: { slug: 'baku-tekstil-mmc' },
    create: {
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
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
    },
  });
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
