import type { LucideIcon } from 'lucide-react';
import {
  Baby,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Car,
  GraduationCap,
  Headphones,
  House,
  PawPrint,
  Package,
  Shirt,
  Smartphone,
  Store,
  Watch,
  WashingMachine,
  Wrench,
} from 'lucide-react';

export type CategoryCard = {
  slug: string;
  name: string;
  productCount: string;
  storeCount: string;
  icon: LucideIcon;
  children?: string[];
};

export type ProductPreview = {
  slug: string;
  title: string;
  store: string;
  city: string;
  category: string;
  categorySlug: string;
  price: string;
  minOrder: string;
  badge: string;
  imageUrl: string;
  imageAlt: string;
};

export type StorePreview = {
  slug: string;
  name: string;
  category: string;
  productCount: string;
  city: string;
  views: string;
  coverImageUrl: string;
  description: string;
  verified: boolean;
};

export const heroImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2200&q=82';

export const categories: CategoryCard[] = [
  {
    slug: 'neqliyyat',
    name: 'Nəqliyyat',
    productCount: '28K+',
    storeCount: '210',
    icon: Car,
    children: [
      'Ehtiyat hissələri və aksesuarlar',
      'Avtomobillər',
      'Tikinti texnikası',
      'Motosikletlər və mopedlər',
      'Yük maşınları və qoşqular',
      'Qeydiyyat nişanları',
      'Aqrotexnika',
      'Su nəqliyyatı',
      'Avtobuslar',
    ],
  },
  {
    slug: 'elektronika',
    name: 'Elektronika',
    productCount: '50K+',
    storeCount: '150',
    icon: Headphones,
    children: [
      'Telefonlar',
      'Audio və video',
      'Noutbuklar və netbuklar',
      'Komponentlər və monitorlar',
      'Kompüter aksesuarları',
      'Oyunlar, pultlar və proqramlar',
      'Televizorlar və aksesuarlar',
      'Şəbəkə və server avadanlığı',
      'Nömrələr və SIM-kartlar',
      'Ofis avadanlığı və istehlak materialları',
      'Fototexnika',
      'Planşet və elektron kitablar',
      'Smart saat və qolbaqlar',
      'Masaüstü kompüterlər',
    ],
  },
  {
    slug: 'ev-ve-bag-ucun',
    name: 'Ev və bağ üçün',
    productCount: '46K+',
    storeCount: '180',
    icon: House,
    children: [
      'Məişət texnikası',
      'Mebellər',
      'Təmir və tikinti',
      'Qab-qacaq və mətbəx ləvazimatları',
      'Dekor və interyer',
      'Bağ və bostan',
      'Ev və bağ üçün işıqlandırma',
      'Ev tekstili',
      'Bitkilər',
      'Xalçalar və aksesuarlar',
      'Ev təsərrüfatı malları',
      'Ərzaq',
    ],
  },
  {
    slug: 'ehtiyat-hisseleri-ve-aksesuarlar',
    name: 'Ehtiyat hissələri və aksesuarlar',
    productCount: '18K+',
    storeCount: '95',
    icon: Wrench,
  },
  {
    slug: 'dasinmaz-emlak',
    name: 'Daşınmaz əmlak',
    productCount: '12K+',
    storeCount: '80',
    icon: Building2,
    children: ['Mənzillər', 'Həyət evləri, bağ evləri', 'Torpaq', 'Obyektlər və ofislər', 'Qarajlar', 'Xaricdə əmlak'],
  },
  {
    slug: 'xidmetler-ve-biznes',
    name: 'Xidmətlər və biznes',
    productCount: '34K+',
    storeCount: '260',
    icon: BriefcaseBusiness,
    children: [
      'Biznes üçün avadanlıq',
      'Təhlükəsizlik sistemləri',
      'Təmir və tikinti',
      'Texnika təmiri',
      'Nəqliyyat vasitələrinin icarəsi',
      'Avadanlığın icarəsi',
      'Reklam, dizayn və poliqrafiya',
      'Logistika',
      'Təlim, hazırlıq kursları',
      'IT, internet, telekom',
      'Digər',
      'Mebel yığılması və təmiri',
      'Avtoservis və diaqnostika',
      'Təmizlik',
      'Avadanlıqların quraşdırılması',
      'Musiqi, əyləncə və tədbirlər',
      'Qidalanma, keyterinq',
      'Mühasibat xidmətləri',
      'Foto və video çəkiliş xidmətləri',
      'Gözəllik, sağlamlıq',
      'Dayələr, baxıcılar',
      'Tibbi xidmətlər',
      'Hüquq xidmətləri',
      'Tərcümə',
      'Sığorta xidmətləri',
    ],
  },
  {
    slug: 'sexsi-esyalar',
    name: 'Şəxsi əşyalar',
    productCount: '38K+',
    storeCount: '170',
    icon: Shirt,
    children: [
      'Geyim və ayaqqabılar',
      'Sağlamlıq və gözəllik',
      'Saat və zinət əşyaları',
      'Aksesuarlar',
      'Tütün qızdırıcıları və aksesuarları',
      'İtmiş əşyalar',
    ],
  },
  {
    slug: 'hobbi-ve-asude',
    name: 'Hobbi və asudə',
    productCount: '16K+',
    storeCount: '90',
    icon: Watch,
    children: [
      'İdman və asudə',
      'Velosipedlər',
      'Kolleksiyalar',
      'Musiqi alətləri',
      'Kitab və jurnallar',
      'Kempinq, ovçuluq və balıqçılıq',
      'Tanışlıq',
      'Biletlər və səyahət',
    ],
  },
  { slug: 'meiset-texnikasi', name: 'Məişət texnikası', productCount: '22K+', storeCount: '120', icon: WashingMachine },
  { slug: 'telefonlar', name: 'Telefonlar', productCount: '30K+', storeCount: '140', icon: Smartphone },
  {
    slug: 'usaq-alemi',
    name: 'Uşaq aləmi',
    productCount: '20K+',
    storeCount: '110',
    icon: Baby,
    children: [
      'Oyuncaqlar',
      'Uşaq geyimi',
      'Çarpayılar və beşiklər',
      'Uşaq arabaları',
      'Məktəblilər üçün',
      'Uşaq avtomobilləri',
      'Uşaq mebeli',
      'Qidalanma oturacaqları',
      'Avtomobil oturacaqları',
      'Yürütəclər',
      'Hamam və gigiyena',
      'Sürüşkənlər və meydançalar',
      'Uşaq daşıyıcıları',
      'Manejlər',
      'Uşaq qidası və bəslənməsi',
      'Uşaq tekstili',
      'Digər',
    ],
  },
  {
    slug: 'heyvanlar',
    name: 'Heyvanlar',
    productCount: '11K+',
    storeCount: '70',
    icon: PawPrint,
    children: [
      'Quşlar',
      'İtlər',
      'Heyvanlar üçün məhsullar və yemlər',
      'Pişiklər',
      'Akvariumlar və balıqlar',
      'K/t heyvanları',
      'Dovşanlar',
      'Gəmiricilər',
      'Digər heyvanlar',
      'Atlar',
    ],
  },
  { slug: 'is-elanlari', name: 'İş elanları', productCount: '9K+', storeCount: '60', icon: BriefcaseBusiness, children: ['Vakansiyalar', 'İş axtarıram'] },
  { slug: 'mektebliler-ucun', name: 'Məktəblilər üçün', productCount: '7K+', storeCount: '45', icon: GraduationCap },
];

export const products: ProductPreview[] = [
  {
    slug: 'kis-qis-godekceleri-model-402',
    title: 'Kişi qış gödəkçələri Model 402',
    store: 'Baku Tekstil MMC',
    city: 'Bakı',
    category: 'Geyim və Tekstil',
    categorySlug: 'sexsi-esyalar',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 50 ədəd',
    badge: 'Yeni',
    imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=82',
    imageAlt: 'Topdansatış geyim məhsulları',
  },
  {
    slug: 'qadin-deri-cekmeleri-stok-500-cut',
    title: 'Qadın dəri çəkmələri Stok 500 cüt',
    store: 'Shoes Import Trade',
    city: 'Sumqayıt',
    category: 'Ayaqqabı',
    categorySlug: 'sexsi-esyalar',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 100 cüt',
    badge: 'Stokda var',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=82',
    imageAlt: 'Topdansatış ayaqqabı məhsulları',
  },
  {
    slug: 'agilli-saatlar-x-series',
    title: 'Ağıllı saatlar X-Series Minimum sifariş 50',
    store: 'TechWholesale AZ',
    city: 'Bakı',
    category: 'Elektronika',
    categorySlug: 'elektronika',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 50 ədəd',
    badge: 'Top seller',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=82',
    imageAlt: 'Topdansatış ağıllı saat məhsulları',
  },
  {
    slug: 'akkumulyatorlu-drel-desti',
    title: 'Akkumulyatorlu drel dəsti Topdan satış',
    store: 'Mega İnşaat Supply',
    city: 'Gəncə',
    category: 'İnşaat materialları',
    categorySlug: 'ev-ve-bag-ucun',
    price: 'Razılaşma yolu ilə',
    minOrder: 'Min: 20 ədəd',
    badge: 'Yeni partiya',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=82',
    imageAlt: 'Topdansatış elektrik alətləri',
  },
];

export const stores: StorePreview[] = [
  {
    slug: 'baku-tekstil-mmc',
    name: 'Baku Tekstil MMC',
    category: 'Geyim və Tekstil',
    productCount: '1,250+',
    city: 'Bakı',
    views: '12.5K',
    coverImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2200&q=82',
    description:
      'Baku Tekstil MMC Azərbaycanda topdansatış geyim və tekstil məhsulları üzrə işləyən yoxlanılmış təchizatçılardan biridir. Mağaza alıcılarla birbaşa WhatsApp və telefon üzərindən əlaqə saxlayır.',
    verified: true,
  },
  {
    slug: 'shoes-import-trade',
    name: 'Shoes Import Trade',
    category: 'Ayaqqabı və dəri məmulatları',
    productCount: '840+',
    city: 'Sumqayıt',
    views: '8.2K',
    coverImageUrl: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437d1?auto=format&fit=crop&w=2200&q=82',
    description:
      'Shoes Import Trade topdan ayaqqabı və dəri məmulatları təklif edir. Satıcı ilə qiymət, minimum sifariş və çatdırılma şərtləri platformadan kənar razılaşdırılır.',
    verified: true,
  },
  {
    slug: 'techwholesale-az',
    name: 'TechWholesale AZ',
    category: 'Elektronika və aksesuarlar',
    productCount: '3,100+',
    city: 'Bakı',
    views: '21.4K',
    coverImageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=2200&q=82',
    description:
      'TechWholesale AZ elektronika və aksesuarların topdansatış təchizatı üçün biznes alıcılarla işləyir. Məhsul sorğuları birbaşa mağaza nümayəndəsinə yönləndirilir.',
    verified: true,
  },
];

export const stats = [
  { label: 'təsdiqlənmiş mağaza', value: '400+', icon: Store },
  { label: 'aktiv məhsul', value: '200K+', icon: Package },
  { label: 'birbaşa əlaqə', value: '24/7', icon: BriefcaseBusiness },
  { label: 'yoxlanılmış satıcı', value: '100%', icon: BadgeCheck },
];
