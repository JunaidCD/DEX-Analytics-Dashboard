'use client';

import { useState } from 'react';
import { formatUnits } from 'viem';

export default function MEVSimulator({ fromToken, toToken, fromAmount, expectedOutput, priceImpact }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const handleSimulate = () => {
    if (!fromAmount || !expectedOutput) return;
    
    setIsSimulating(true);
    setSimulationResult(null);

    // Simulate network delay for the MEV searcher to find the transaction
    setTimeout(() => {
      // Basic MEV sandwich math simulation
      const amountInNum = parseFloat(fromAmount);
      const outputNum = parseFloat(expectedOutput);
      
      // If price impact is high, MEV opportunity is higher
      const baseMevProfit = (amountInNum * (priceImpact || 0.1) / 100) * 0.8; 
      
      // The attack:
      // 1. Searcher front-runs by buying 'toToken' right before user
      // 2. User's transaction executes at a worse price (higher slippage)
      // 3. Searcher back-runs by selling 'toToken' at a higher price
      
      const victimLoss = outputNum * ((priceImpact || 0.1) / 100);
      const actualOutput = outputNum - victimLoss;
      
      setSimulationResult({
        searcherProfit: Math.max(0.001, baseMevProfit).toFixed(4),
        victimLoss: victimLoss.toFixed(4),
        actualOutput: actualOutput.toFixed(4),
        frontRunAmount: (amountInNum * 0.5).toFixed(4)
      });
      setIsSimulating(false);
    }, 1500);
  };

  if (!fromAmount || !expectedOutput) return null;

  return (
    <div className="analytics-card" style={{ marginTop: '20px', padding: '20px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h3 style={{ color: '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🕵️ MEV Visibility Dashboard
          </h3>
          <p className="analytics-desc" style={{ marginTop: '5px' }}>Simulate a Sandwich Attack on this trade</p>
        </div>
        <button 
          onClick={handleSimulate}
          disabled={isSimulating}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: isSimulating ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: isSimulating ? 0.7 : 1
          }}
        >
          {isSimulating ? 'Simulating...' : 'Simulate Attack'}
        </button>
      </div>

      {simulationResult && (
        <div style={{ marginTop: '20px', animation: 'fadeIn 0.5s' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <span style={{ color: '#9090a0' }}>1. Front-run (Buy before you)</span>
              <span style={{ color: '#ef4444' }}>Attacker buys {simulationResult.frontRunAmount} {fromToken.symbol}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <span style={{ color: '#9090a0' }}>2. Your Swap (Worse execution)</span>
              <span style={{ color: '#f59e0b' }}>You receive {simulationResult.actualOutput} {toToken.symbol}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <span style={{ color: '#9090a0' }}>3. Back-run (Sell after you)</span>
              <span style={{ color: '#10b981' }}>Attacker sells at inflated price</span>
            </div>
          </div>

          <div style={{ display: 'flex', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#9090a0' }}>Estimated Value Extracted (MEV)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
                + {simulationResult.searcherProfit} {fromToken.symbol}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#9090a0' }}>Your Lost Value (Slippage)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>
                - {simulationResult.victimLoss} {toToken.symbol}
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
