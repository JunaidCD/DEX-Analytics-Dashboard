'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { parseUnits, formatUnits, formatEther } from 'viem';
import { CONTRACTS } from '../../config/wagmi';
import { ERC20_ABI, ROUTER_ABI, PAIR_ABI, FACTORY_ABI } from '../../config/abis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock price history data
const generatePriceHistory = () => {
  const data = [];
  let price = 3250;
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    price = price + (Math.random() - 0.5) * 100;
    data.push({
      time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: price,
    });
  }
  return data;
};

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [slippageInput, setSlippageInput] = useState('100');
  const [lpAmount, setLpAmount] = useState('10');
  const [priceHistory, setPriceHistory] = useState([]);

  useEffect(() => {
    setMounted(true);
    setPriceHistory(generatePriceHistory());
  }, []);

  // Get pair address
  const { data: pairAddress } = useReadContract({
    address: CONTRACTS.factory,
    abi: FACTORY_ABI,
    functionName: 'getPair',
    args: [CONTRACTS.USDC, CONTRACTS.MTK].sort(),
  });

  // Get reserves
  const { data: reserves } = useReadContract({
    address: pairAddress,
    abi: PAIR_ABI,
    functionName: 'getReserves',
    query: { enabled: !!pairAddress }
  });

  // Get token0 to determine order
  const { data: token0 } = useReadContract({
    address: pairAddress,
    abi: PAIR_ABI,
    functionName: 'token0',
    query: { enabled: !!pairAddress }
  });

  // Get user's LP balance
  const { data: lpBalance } = useReadContract({
    address: pairAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && address && !!pairAddress }
  });

  // Calculate current price
  const currentPrice = useMemo(() => {
    if (!reserves || !token0) return 0;
    const isUSDC0 = token0.toLowerCase() === CONTRACTS.USDC.toLowerCase();
    const reserveUSDC = isUSDC0 ? reserves[0] : reserves[1];
    const reserveMTK = isUSDC0 ? reserves[1] : reserves[0];
    if (reserveMTK === 0n) return 0;
    return Number(formatUnits(reserveUSDC * parseUnits('1', 18), 6)) / Number(formatUnits(reserveMTK, 18));
  }, [reserves, token0]);

  // Calculate slippage impact
  const slippageImpact = useMemo(() => {
    if (!slippageInput || !reserves || !token0) return { impact: 0, output: 0 };
    
    const amountIn = parseUnits(slippageInput, 6); // USDC decimals
    const isUSDC0 = token0.toLowerCase() === CONTRACTS.USDC.toLowerCase();
    const reserveIn = isUSDC0 ? reserves[0] : reserves[1];
    const reserveOut = isUSDC0 ? reserves[1] : reserves[0];
    
    if (reserveIn <= 0n || reserveOut <= 0n) return { impact: 0, output: 0 };
    
    // AMM formula: amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
    const amountInWithFee = amountIn * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;
    const output = numerator / denominator;
    
    // Calculate price impact
    const spotPrice = (reserveOut * parseUnits('1', 6)) / reserveIn;
    const actualPrice = (output * parseUnits('1', 6)) / amountIn;
    const impact = ((spotPrice - actualPrice) / spotPrice) * 100;
    
    return {
      impact: Number(impact),
      output: Number(formatUnits(output, 18)),
    };
  }, [slippageInput, reserves, token0]);

  // Calculate LP PnL
  const lpPnL = useMemo(() => {
    if (!lpAmount || !reserves || !token0 || !lpBalance) {
      return { impermanentLoss: 0, feesEarned: 0, totalPnL: 0 };
    }

    const lpTokens = parseUnits(lpAmount, 18);
    const totalSupply = parseUnits('1000', 18); // Mock total supply
    const poolValueUSDC = Number(formatUnits(reserves[0], 6));
    const poolValueMTK = Number(formatUnits(reserves[1], 18));
    
    // User's share of pool
    const userShare = Number(lpTokens) / Number(totalSupply);
    
    // Initial values (assume 50/50 split)
    const initialUSDC = poolValueUSDC * 0.5 * userShare;
    const initialMTK = poolValueMTK * 0.5 * userShare;
    const initialValueUSD = initialUSDC + (initialMTK * currentPrice);
    
    // Current value
    const currentUSDC = poolValueUSDC * userShare;
    const currentMTK = poolValueMTK * userShare;
    const currentValueUSD = currentUSDC + (currentMTK * currentPrice);
    
    // Impermanent loss = (current / initial) - 1
    const impermanentLoss = ((currentValueUSD / initialValueUSD) - 1) * 100;
    
    // Mock fees earned (0.3% of volume)
    const feesEarned = Number(lpAmount) * 0.003 * currentPrice;
    
    return {
      impermanentLoss,
      feesEarned,
      totalPnL: impermanentLoss + (feesEarned / initialValueUSD * 100),
    };
  }, [lpAmount, reserves, token0, currentPrice, lpBalance]);

  // Mock 24h volume
  const volume24h = useMemo(() => {
    if (!reserves) return 0;
    // Calculate based on reserves change (mock)
    return (Number(formatUnits(reserves[0], 6)) * 0.15).toFixed(2);
  }, [reserves]);

  if (!mounted) {
    return (
      <div>
        <div className="dashboard-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card">
              <div className="stat-label">Loading...</div>
              <div className="stat-value">--</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {!isConnected ? (
        <div className="not-connected">
          <h2>Connect Your Wallet</h2>
          <p>Connect your wallet to view your dashboard and track your positions.</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-label">Current Price (USDC/MTK)</div>
              <div className="stat-value">${currentPrice.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">24h Trading Volume</div>
              <div className="stat-value positive">${volume24h}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Your LP Balance</div>
              <div className="stat-value">{lpBalance ? formatUnits(lpBalance, 18).slice(0, 8) : '0'} LP</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pool TVL</div>
              <div className="stat-value">
                ${reserves ? (Number(formatUnits(reserves[0], 6)) + Number(formatUnits(reserves[1], 18)) * currentPrice).toFixed(0) : '0'}
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Price History (USDC/MTK)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistory}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="time" stroke="#9090a0" />
                <YAxis stroke="#9090a0" domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    background: '#12121a',
                    border: '1px solid #2a2a3a',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Slippage Estimator */}
          <div className="analytics-section">
            <div className="analytics-card">
              <h3>🔮 Slippage Estimator</h3>
              <p className="analytics-desc">Calculate price impact for a given swap amount</p>
              
              <div className="input-group">
                <label>Swap Amount (USDC)</label>
                <input
                  type="number"
                  value={slippageInput}
                  onChange={(e) => setSlippageInput(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="analytics-result">
                <div className="result-row">
                  <span>Estimated Output:</span>
                  <span className="result-value">{slippageImpact.output.toFixed(4)} MTK</span>
                </div>
                <div className="result-row">
                  <span>Price Impact:</span>
                  <span className={`result-value ${slippageImpact.impact > 5 ? 'text-error' : slippageImpact.impact > 1 ? 'text-warning' : 'text-success'}`}>
                    {slippageImpact.impact.toFixed(2)}%
                  </span>
                </div>
                <div className="result-row">
                  <span>Slippage (0.3%):</span>
                  <span className="result-value">{(slippageImpact.output * 0.003).toFixed(4)} MTK</span>
                </div>
              </div>
            </div>

            {/* LP PnL Calculator */}
            <div className="analytics-card">
              <h3>📈 LP PnL Calculator</h3>
              <p className="analytics-desc">Calculate impermanent loss and fees earned</p>
              
              <div className="input-group">
                <label>LP Token Amount</label>
                <input
                  type="number"
                  value={lpAmount}
                  onChange={(e) => setLpAmount(e.target.value)}
                  placeholder="Enter LP tokens"
                />
              </div>
              
              <div className="analytics-result">
                <div className="result-row">
                  <span>Impermanent Loss:</span>
                  <span className={`result-value ${lpPnL.impermanentLoss >= 0 ? 'text-success' : 'text-error'}`}>
                    {lpPnL.impermanentLoss.toFixed(2)}%
                  </span>
                </div>
                <div className="result-row">
                  <span>Fees Earned (est.):</span>
                  <span className="result-value text-success">${lpPnL.feesEarned.toFixed(2)}</span>
                </div>
                <div className="result-row total">
                  <span>Total PnL:</span>
                  <span className={`result-value ${lpPnL.totalPnL >= 0 ? 'text-success' : 'text-error'}`}>
                    {lpPnL.totalPnL.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="pnl-note">
                * Fees estimated at 0.3% trading fee
              </div>
            </div>
          </div>

          {/* Top Pools */}
          <div className="pools-list">
            <h3>📊 Top Pools</h3>
            <div className="pool-item">
              <div className="pool-tokens">
                <div className="pool-token-icons">
                  <div className="pool-token-icon">U</div>
                  <div className="pool-token-icon">M</div>
                </div>
                <div>
                  <div className="pool-name">USDC/MTK</div>
                  <div className="pool-fee">Fee: 0.3%</div>
                </div>
              </div>
              <div className="pool-tvl">
                <div className="pool-tvl-value">
                  ${reserves ? (Number(formatUnits(reserves[0], 6)) + Number(formatUnits(reserves[1], 18)) * currentPrice).toFixed(0) : '0'}
                </div>
                <div className="pool-tvl-change">+2.4%</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
