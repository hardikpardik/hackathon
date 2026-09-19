import React, { useEffect, useState } from 'react';

interface Commodity {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const DEFAULT_COMMODITIES: Commodity[] = [
  { symbol: 'WTI', name: 'CRUDE OIL', price: 74.71, change: 1.42 },
  { symbol: 'BRENT', name: 'BRENT CRUDE', price: 78.33, change: 0.91 },
  { symbol: 'GOLD', name: 'GOLD', price: 2650.28, change: -0.38 },
  { symbol: 'SILVER', name: 'SILVER', price: 31.37, change: 2.89 },
  { symbol: 'NG', name: 'NATURAL GAS', price: 2.33, change: -1.16 },
];

export const CommodityTicker: React.FC = () => {
  const [commodities, setCommodities] = useState<Commodity[]>(DEFAULT_COMMODITIES);

  useEffect(() => {
    const interval = setInterval(() => {
      setCommodities((prev) =>
        prev.map((item) => {
          const delta = (Math.random() - 0.48) * 0.1;
          return {
            ...item,
            price: Number((item.price + delta).toFixed(2)),
            change: Number((item.change + delta * 0.2).toFixed(2)),
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const tickerItems = [...commodities, ...commodities, ...commodities];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '560px',
        height: '30px',
        backgroundColor: 'rgba(8, 47, 73, 0.25)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '11px',
      }}
    >
      {/* Label Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          height: '100%',
          backgroundColor: '#020617',
          borderRight: '1px solid rgba(6, 182, 212, 0.3)',
          color: '#22d3ee',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          letterSpacing: '1px',
        }}
      >
        MARKETS
      </div>

      {/* Marquee Track Container */}
      <div style={{ display: 'flex', overflow: 'hidden', width: '100%' }}>
        <div
          className="orbit-ticker-track"
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            gap: '28px',
            paddingLeft: '16px',
          }}
        >
          {tickerItems.map((item, index) => {
            const isPositive = item.change >= 0;
            return (
              <div
                key={`${item.symbol}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ color: '#a5f3fc', opacity: 0.8 }}>{item.name}</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>
                  ${item.price.toFixed(2)}
                </span>
                <span
                  style={{
                    color: isPositive ? '#34d399' : '#f87171',
                    fontWeight: 'bold',
                  }}
                >
                  {isPositive ? '▲+' : '▼'}
                  {item.change}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes orbitMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
        .orbit-ticker-track {
          animation: orbitMarquee 18s linear infinite;
        }
        .orbit-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};