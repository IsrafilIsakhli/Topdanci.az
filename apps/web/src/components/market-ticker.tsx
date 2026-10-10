import { MessageCircle, Package, Store } from 'lucide-react';

const tickerItems = [
  { icon: Store, text: 'Mağazaları şəhər və kateqoriyaya görə tapın', accent: 'fresh' },
  { icon: Package, text: 'Topdansatış məhsullarını müqayisə edin', accent: 'hot' },
  { icon: MessageCircle, text: 'Qiyməti və şərtləri birbaşa satıcı ilə razılaşdırın', accent: 'verified' },
];

export function MarketTicker() {
  return (
    <div className="market-ticker" aria-label="Topdansatış əlaqəsi">
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
