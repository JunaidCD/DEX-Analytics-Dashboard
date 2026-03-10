'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { parseUnits, formatUnits, parseEventLogs } from 'viem';
import { CONTRACTS } from '../../config/wagmi';
import { ERC20_ABI, ROUTER_ABI, PAIR_ABI, FACTORY_ABI } from '../../config/abis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TradeHistory from '../../components/TradeHistory';

// Swap Event ABI for parsing logs
const SWAP_EVENT_ABI = {
  anonymous: false,
  inputs: [
    { indexed: true, name: 'sender', type: 'address' },
    { indexed: false, name: 'amount0In', type: 'uint256' },
    { indexed: false, name: 'amount1In', type: 'uint256' },
    { indexed: false, name: 'amount0Out', type: 'uint256' },
    { indexed: false, name: 'amount1Out', type: 'uint256' },
    { indexed: true, name: 'to', type: 'address' }
  ],
  name: 'Swap',
  type: 'event'
};

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const [mounted, setMounted] = useState(false);
  const [slippageInput, setSlippageInput] = useState('100');
  const [lpAmount, setLpAmount] = useState('10');
  const [priceHistory, setPriceHistory] = useState([]);
  const [swapEvents, setSwapEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get pair address
  const { data: pairAddress } = useReadContract({
    address: CONTRACTS.factory,
    abi: FACTORY_ABI,
    functionName: 'getPair',
    args: [CONTRACTS.USDC, CONTRACTS.MTK].sort(),
  });

  // Get reserves
  const { data: reserves, refetch: refetchReserves } = useReadContract({
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

  // Fetch swap events from the blockchain
  useEffect(() => {
    async function fetchSwapEvents() {
      if (!publicClient || !pairAddress) return;
      
      setLoadingEvents(true);
      try {
        const logs = await publicClient.getLogs({
          address: pairAddress,
          event: SWAP_EVENT_ABI,
          fromBlock: 0n,
          toBlock: 'latest',
        });
        
        setSwapEvents(logs);
        
        // Process swap events to get price history
        if (logs.length > 0 && reserves && token0) {
          const isUSDC0 = token0.toLowerCase() === CONTRACTS.USDC.toLowerCase();
          
          // Get last 7 swaps for price history
          const recentSwaps = logs.slice(-7);
          const history = recentSwaps.map((log, i) => {
            const amount0In = log.args.amount0In || 0n;
            const amount1In = log.args.amount1In || 0n;
            const amount0Out = log.args.amount0Out || 0n;
            const amount1Out = log.args.amount1Out || 0n;
            
            const usdcIn = isUSDC0 ? amount0In : amount1In;
            const usdcOut = isUSDC0 ? amount0Out : amount1Out;
            const mtkIn = isUSDC0 ? amount1In : amount0In;
            const mtkOut = isUSDC0 ? amount1Out : amount0Out;
            
            const totalUSDC = usdcIn + usdcOut;
            const totalMTK = mtkIn + mtkOut;
            
            let price;
            if (totalUSDC > 0n && totalMTK > 0n) {
              price = Number(formatUnits(totalUSDC, 6)) / Number(formatUnits(totalMTK, 18));
            } else {
              price = 3250; // default
            }
            
            return {
              time: `T${i + 1}`,
              price: price,
              swap: true
            };
          });
          
          setPriceHistory(history);
        } else {
          // Generate mock data if no events
          const mockData = [];
          let price = 3250;
          for (let i = 6; i >= 0; i--) {
            price = price + (Math.random() - 0.5) * 100;
            mockData.push({
              time: `T${7 - i}`,
              price: price,
              swap: false
            });
          }
          setPriceHistory(mockData);
        }
      } catch (error) {
        console.log('Error fetching swap events:', error);
        // Fall back to mock data
        const mockData = [];
        let price = 3250;
        for (let i = 6; i >= 0; i--) {
          price = price + (Math.random() - 0.5) * 100;
          mockData.push({
            time: `T${7 - i}`,
            price: price,
            swap: false
          });
        }
        setPriceHistory(mockData);
      } finally {
        setLoadingEvents(false);
      }
    }
    
    if (mounted && pairAddress) {
      fetchSwapEvents();
    }
  }, [mounted, pairAddress, publicClient, reserves, token0]);

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
    
    const amountIn = parseUnits(slippageInput, 6);
    const isUSDC0 = token0.toLowerCase() === CONTRACTS.USDC.toLowerCase();
    const reserveIn = isUSDC0 ? reserves[0] : reserves[1];
    const reserveOut = isUSDC0 ? reserves[1] : reserves[0];
    
    if (reserveIn <= 0n || reserveOut <= 0n) return { impact: 0, output: 0 };
    
    const amountInWithFee = amountIn * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;
    const output = numerator / denominator;
    
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
    const totalSupply = parseUnits('1000', 18);
    const poolValueUSDC = Number(formatUnits(reserves[0], 6));
    const poolValueMTK = Number(formatUnits(reserves[1], 18));
    
    const userShare = Number(lpTokens) / Number(totalSupply);
    const initialUSDC = poolValueUSDC * 0.5 * userShare;
    const initialMTK = poolValueMTK * 0.5 * userShare;
    const initialValueUSD = initialUSDC + (initialMTK * currentPrice);
    
    const currentUSDC = poolValueUSDC * userShare;
    const currentMTK = poolValueMTK * userShare;
    const currentValueUSD = currentUSDC + (currentMTK * currentPrice);
    
    const impermanentLoss = ((currentValueUSD / initialValueUSD) - 1) * 100;
    const feesEarned = Number(lpAmount) * 0.003 * currentPrice;
    
    return {
      impermanentLoss,
      feesEarned,
      totalPnL: impermanentLoss + (feesEarned / initialValueUSD * 100),
    };
  }, [lpAmount, reserves, token0, currentPrice, lpBalance]);

  // 24h volume from swap events
  const volume24h = useMemo(() => {
    if (swapEvents.length === 0) return '0';
    // Estimate volume from events
    const total = swapEvents.reduce((acc, log) => {
      const isUSDC0 = token0?.toLowerCase() === CONTRACTS.USDC.toLowerCase();
      const amount0In = log.args.amount0In || 0n;
      const amount0Out = log.args.amount0Out || 0n;
      const usdcAmount = isUSDC0 ? amount0In + amount0Out : (log.args.amount1In || 0n) + (log.args.amount1Out || 0n);
      return acc + Number(formatUnits(usdcAmount, 6));
    }, 0);
    return total.toFixed(2);
  }, [swapEvents, token0]);

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

          {/* Price Chart - from Swap Events */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>📈 Price from Swap Events</h3>
              {loadingEvents && <span className="loading-badge">Loading...</span>}
              {swapEvents.length > 0 && <span className="event-badge">{swapEvents.length} swaps</span>}
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
                  formatter={(value, name, props) => [`$${value.toFixed(2)}`, props.payload.swap ? 'Swap Price' : 'Est. Price']}
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
            {swapEvents.length === 0 && (
              <p className="chart-note">No swap events found. Make some swaps to see the price chart!</p>
            )}
          </div>

          {/* Slippage Estimator */}
          <div className="analytics-section">
            <div className="analytics-card">
              <h3>🔮 Slippage Estimator</h3>
              <p className="analytics-desc">Calculate price impact using AMM formula</p>
              
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
              <h3>📊 LP PnL Calculator</h3>
              <p className="analytics-desc">Calculate impermanent loss + fees earned</p>
              
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
            <h3>🏊 Top Pools</h3>
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

          {/* Trade History */}
          <TradeHistory pairAddress={pairAddress} token0={token0} />
        </>
      )}
    </div>
  );
}
