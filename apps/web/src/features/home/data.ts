import { BadgeCheck, BriefcaseBusiness, Package, Store } from 'lucide-react';

export function homeStats(storeCount: number, productCount: number) {
  return [
    { label: 'kataloqda mağaza', value: String(storeCount), icon: Store },
    { label: 'kataloqda məhsul', value: String(productCount), icon: Package },
    { label: 'birbaşa əlaqə', value: 'WhatsApp', icon: BriefcaseBusiness },
    { label: 'qiymət razılaşması', value: 'Satıcı ilə', icon: BadgeCheck },
  ];
}

export const cityStrip = [
  { name: 'Bakı', storeCount: '180+' },
  { name: 'Sumqayıt', storeCount: '64+' },
  { name: 'Gəncə', storeCount: '52+' },
  { name: 'Şəki', storeCount: '23+' },
  { name: 'Quba', storeCount: '18+' },
  { name: 'Zaqatala', storeCount: '16+' },
  { name: 'Lənkəran', storeCount: '21+' },
  { name: 'Mingəçevir', storeCount: '14+' },
];

export const demandRequests = [
  {
    quantity: '500 ədəd',
    title: 'Yay papaqları mix modellər',
    city: 'Bakı',
    time: '12 dəq əvvəl',
    offers: 4,
  },
  {
    quantity: '1 palet',
    title: 'Yuyucu vasitə 5L qablar',
    city: 'Sumqayıt',
    time: '38 dəq əvvəl',
    offers: 2,
  },
  {
    quantity: '300 cüt',
    title: 'Uşaq məktəb ayaqqabısı 30-35 ölçü',
    city: 'Gəncə',
    time: '1 saat əvvəl',
    offers: 5,
  },
  {
    quantity: '1000 ədəd',
    title: 'Telefon cib qoruyucusu topdan',
    city: 'Bakı',
    time: '2 saat əvvəl',
    offers: 7,
  },
];
