import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Drill,
  Footprints,
  Headphones,
  House,
  Package,
  Shirt,
  Store,
  Utensils,
  Watch,
} from 'lucide-react';

export type CategoryCard = {
  slug: string;
  name: string;
  productCount: string;
  storeCount: string;
  icon: LucideIcon;
};

export const categories: CategoryCard[] = [
  { slug: 'geyim', name: 'Geyim', productCount: '45K+', storeCount: '120', icon: Shirt },
  { slug: 'ayaqqabi', name: 'Ayaqqabi', productCount: '20K+', storeCount: '85', icon: Footprints },
  { slug: 'aksesuar', name: 'Aksesuar', productCount: '15K+', storeCount: '60', icon: Watch },
  { slug: 'kosmetika', name: 'Kosmetika', productCount: '30K+', storeCount: '95', icon: BadgeCheck },
  { slug: 'elektronika', name: 'Elektronika', productCount: '50K+', storeCount: '150', icon: Headphones },
  { slug: 'ev-mehsullari', name: 'Ev mehsullari', productCount: '25K+', storeCount: '70', icon: House },
  { slug: 'insaat-materiallari', name: 'Insaat materiallari', productCount: '40K+', storeCount: '110', icon: Drill },
  { slug: 'qida-mehsullari', name: 'Qida mehsullari', productCount: '60K+', storeCount: '200', icon: Utensils },
];

export const products = [
  {
    slug: 'kis-qis-godekceleri-model-402',
    title: 'Kis qis godekceleri Model 402',
    store: 'Baku Tekstil MMC',
    city: 'Baki',
    price: 'Razilasma yolu ile',
    art: '',
  },
  {
    slug: 'qadin-dari-cakmalari-stok-500-cut',
    title: 'Qadin dari cakmalari Stok 500 cut',
    store: 'Shoes Import Trade',
    city: 'Sumqayit',
    price: 'Razilasma yolu ile',
    art: 'alt-1',
  },
  {
    slug: 'agilli-saatlar-x-series',
    title: 'Agilli saatlar X-Series Minimum sifaris 50',
    store: 'TechWholesale AZ',
    city: 'Baki',
    price: 'Razilasma yolu ile',
    art: 'alt-2',
  },
  {
    slug: 'akkumulyatorlu-drel-dasti',
    title: 'Akkumulyatorlu drel dasti Topdan satis',
    store: 'Mega Insaat Supply',
    city: 'Ganca',
    price: 'Razilasma yolu ile',
    art: 'alt-3',
  },
];

export const stores = [
  {
    slug: 'baku-tekstil-mmc',
    name: 'Baku Tekstil MMC',
    category: 'Geyim va Tekstil',
    productCount: '1,250+',
    city: 'Baki',
  },
  {
    slug: 'shoes-import-trade',
    name: 'Shoes Import Trade',
    category: 'Ayaqqabi va deri məmulatlari',
    productCount: '840+',
    city: 'Sumqayit',
  },
  {
    slug: 'techwholesale-az',
    name: 'TechWholesale AZ',
    category: 'Elektronika va aksesuarlar',
    productCount: '3,100+',
    city: 'Baki',
  },
];

export const stats = [
  { label: 'tesdiqlenmis magaza', value: '400+', icon: Store },
  { label: 'aktiv mehsul', value: '200K+', icon: Package },
  { label: 'birbasa elaqe', value: '24/7', icon: BriefcaseBusiness },
  { label: 'guvenli tedarukcu', value: '100%', icon: BadgeCheck },
];
