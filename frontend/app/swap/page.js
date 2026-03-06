'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function SwapPage() {
  const { isConnected } = useAccount();
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'STEP', name: 'Pasoero' },
  ];

  const handleSwap = () => {
    // Swap logic would go here
    console.log('Swap:', fromAmount, fromToken, '->', toAmount, toToken);
  };

  return (
    <div className="swap-container">
      <div className="swap-card">
        <div className="swap-header">
          <h2>Swap</h2>
          <button className="swap-settings">⚙️</button>
        </div>

        <div className="token-input">
          <button className="token-select">
            <span>{fromToken}</span>
            <span>▼</span>
          </button>
          <input
            type="number"
            className="token-amount"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
          />
        </div>

        <div className="swap-arrow">
          <button className="swap-arrow-btn" onClick={() => {
            const temp = fromToken;
            setFromToken(toToken);
            setToToken(temp);
          }}>
            ↓
          </button>
        </div>

        <div className="token-input">
          <button className="token-select">
            <span>{toToken}</span>
            <span>▼</span>
          </button>
          <input
            type="number"
            className="token-amount"
            placeholder="0.0"
            value={toAmount}
            onChange={(e) => setToAmount(e.target.value)}
          />
        </div>

        <div className="swap-details">
          <div className="swap-rate">
            <span>Rate</span>
            <span>1 ETH = 3,250 USDC</span>
          </div>
          <div className="swap-rate">
            <span>Price Impact</span>
            <span>0.05%</span>
          </div>
          <div className="swap-rate">
            <span>LP Fee</span>
            <span>0.3%</span>
          </div>
        </div>

        <button 
          className="swap-submit" 
          disabled={!isConnected || !fromAmount}
          onClick={handleSwap}
        >
          {!isConnected ? 'Connect Wallet' : !fromAmount ? 'Enter Amount' : 'Swap'}
        </button>
      </div>
    </div>
  );
}
