import { BadgeCheck, MessageCircle, Package, Store, Truck } from 'lucide-react';

const tickerItems = [
  { icon: Package, text: '200K+ aktiv məhsul' },
  { icon: Store, text: '400+ təsdiqlənmiş mağaza' },
  { icon: BadgeCheck, text: '100% yoxlanılmış satıcı' },
  { icon: Truck, text: '14 şəhərdən topdan təklif' },
  { icon: MessageCircle, text: 'WhatsApp ilə birbaşa əlaqə' },
];

export function MarketTicker() {
  return (
    <div className="market-ticker" aria-label="Platforma statistikası">
      <div className="market-ticker-track">
        {[0, 1].map((copy) => (
          <div className="market-ticker-row" key={copy} aria-hidden={copy === 1 ? true : undefined}>
            {tickerItems.map(({ icon: Icon, text }) => (
              <span className="market-ticker-item" key={text}>
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
