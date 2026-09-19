import React from 'react';
import { CommodityTicker } from './CommodityTicker';

export const OrbitHeader: React.FC = () => {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '48px',
        padding: '0 20px',
        backgroundColor: '#020617',
        borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
        boxSizing: 'border-box',
        zIndex: 50,
      }}
    >
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: '#22d3ee',
            fontFamily: 'monospace',
          }}
        >
          ORBIT
        </h1>
      </div>

      {/* Marquee Ticker */}
      <CommodityTicker />

      {/* Live Feed Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: 'rgba(6, 182, 212, 0.8)',
          letterSpacing: '1px',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#22d3ee',
          }}
        ></span>
        LIVE FEED
      </div>
    </header>
  );
};