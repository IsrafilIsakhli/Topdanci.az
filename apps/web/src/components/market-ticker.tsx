import { BadgeCheck, MessageCircle, Package, PackagePlus, Store, Truck, UserRound } from 'lucide-react';

const tickerItems = [
  { icon: PackagePlus, text: '8 dəq əvvəl: Sumqayıt Tekstil 2 lot yerləşdirdi', accent: 'fresh' },
  { icon: UserRound, text: '15 dəq əvvəl: Bakıdan alıcı 800 ədəd papaq axtarır', accent: 'demand' },
  { icon: Store, text: 'Bu saat: Gəncə Market Təchizatı yeni anbar açdı', accent: 'fresh' },
  { icon: BadgeCheck, text: '1 saat əvvəl: 3 yeni mağaza təsdiqləndi', accent: 'verified' },
  { icon: Package, text: '2 saat əvvəl: Telefon aksesuarları partiyası ən çox baxılan oldu', accent: 'hot' },
  { icon: Truck, text: '14 şəhərdən həftəlik 1.2K yeni topdan təklif', accent: 'hot' },
  { icon: MessageCircle, text: 'Bu gün: 340+ WhatsApp əlaqəsi quruldu', accent: 'verified' },
];

export function MarketTicker() {
  return (
    <div className="market-ticker" aria-label="Canlı bazar axını">
      <div className="market-ticker-track">
        {[0, 1].map((copy) => (
          <div className="market-ticker-row" key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {tickerItems.map(({ icon: Icon, text, accent }) => (
              <span className={`market-ticker-item market-ticker-${accent}`} key={text}>
                <Icon size={15} />
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
