'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { time: 'Mon', volume: 4000, liquidity: 2400 },
  { time: 'Tue', volume: 3000, liquidity: 1398 },
  { time: 'Wed', volume: 2000, liquidity: 9800 },
  { time: 'Thu', volume: 2780, liquidity: 3908 },
  { time: 'Fri', volume: 1890, liquidity: 4800 },
  { time: 'Sat', volume: 2390, liquidity: 3800 },
  { time: 'Sun', volume: 3490, liquidity: 4300 },
];

const mockPools = [
  { name: 'ETH/USDC', fee: '0.3%', tvl: '$12.5M', change: '+5.2%' },
  { name: 'STEP/USDC', fee: '0.3%', tvl: '$8.2M', change: '+3.8%' },
  { name: 'ETH/STEP', fee: '0.3%', tvl: '$5.1M', change: '+12.4%' },
];

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const [chartTimeframe, setChartTimeframe] = useState('7D');

  return (
    <div>
      {!isConnected ? (
        <div className="not-connected">
          <h2>Connect Your Wallet</h2>
          <p>Connect your wallet to view your dashboard and track your positions.</p>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-label">Total Value Locked</div>
              <div className="stat-value">$25.8M</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Your Portfolio Value</div>
              <div className="stat-value">$0.00</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">24h Trading Volume</div>
              <div className="stat-value positive">$4.2M</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Your Fees Earned</div>
              <div className="stat-value">$0.00</div>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Protocol Volume</h3>
              <div className="chart-tabs">
                {['24H', '7D', '30D', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    className={`chart-tab ${chartTimeframe === tf ? 'active' : ''}`}
                    onClick={() => setChartTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="time" stroke="#9090a0" />
                <YAxis stroke="#9090a0" />
                <Tooltip
                  contentStyle={{
                    background: '#12121a',
                    border: '1px solid #2a2a3a',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#6366f1"
                  fill="url(#volumeGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pools-list">
            <h3>Top Pools</h3>
            {mockPools.map((pool) => (
              <div key={pool.name} className="pool-item">
                <div className="pool-tokens">
                  <div className="pool-token-icons">
                    <div className="pool-token-icon">{pool.name.split('/')[0][0]}</div>
                    <div className="pool-token-icon">{pool.name.split('/')[1][0]}</div>
                  </div>
                  <div>
                    <div className="pool-name">{pool.name}</div>
                    <div className="pool-fee">Fee: {pool.fee}</div>
                  </div>
                </div>
                <div className="pool-tvl">
                  <div className="pool-tvl-value">{pool.tvl}</div>
                  <div className="pool-tvl-change">{pool.change}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
