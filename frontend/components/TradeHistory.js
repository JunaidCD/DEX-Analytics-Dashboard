'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { getChainContracts } from '../config/wagmi';

// Swap Event ABI (from Pair contract)
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

export default function TradeHistory({ pairAddress, token0, chainId }) {
  const publicClient = usePublicClient();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isWatching, setIsWatching] = useState(false);

  // Get contracts for current chain
  const activeContracts = getChainContracts(chainId);

  // Format address
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Format timestamp
  const formatTime = (blockTimestamp) => {
    if (!blockTimestamp) return '';
    const date = new Date(Number(blockTimestamp) * 1000);
    return date.toLocaleTimeString();
  };

  // Fetch historical trades
  const fetchTrades = useCallback(async () => {
    if (!publicClient || !pairAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const logs = await publicClient.getLogs({
        address: pairAddress,
        event: SWAP_EVENT_ABI,
        fromBlock: 0n,
        toBlock: 'latest',
      });

      // Get block timestamps
      const blockNumbers = [...new Set(logs.map(log => log.blockNumber))];
      const blockTimestamps = await Promise.all(
        blockNumbers.map(async (blockNum) => {
          const block = await publicClient.getBlock({ blockNumber: blockNum });
          return { blockNum, timestamp: block.timestamp };
        })
      );
      
      const timestampMap = Object.fromEntries(
        blockTimestamps.map(({ blockNum, timestamp }) => [blockNum.toString(), timestamp])
      );

       // Process logs into trades
       const isUSDC0 = token0?.toLowerCase() === activeContracts.USDC.toLowerCase();
       
        const processedTrades = logs.slice(-20).reverse().map((log, index) => {
          const amount0In = log.args.amount0In || 0n;
          const amount1In = log.args.amount1In || 0n;
          const amount0Out = log.args.amount0Out || 0n;
          const amount1Out = log.args.amount1Out || 0n;
          
          // Calculate USDC and MTK amounts based on token0
          let usdcAmount = 0;
          let mtkAmount = 0;
          let type = 'swap';
          
          if (isUSDC0) {
            // token0 is USDC, token1 is MTK
            usdcAmount = Number(formatUnits(amount0In + amount0Out, 6));
            mtkAmount = Number(formatUnits(amount1In + amount1Out, 18));
            if (amount0In > 0n && amount1Out > 0n) type = 'buy'; // USDC -> MTK
            else if (amount0Out > 0n && amount1In > 0n) type = 'sell'; // MTK -> USDC
          } else {
            // token0 is MTK, token1 is USDC
            usdcAmount = Number(formatUnits(amount1In + amount1Out, 6));
            mtkAmount = Number(formatUnits(amount0In + amount0Out, 18));
            if (amount1In > 0n && amount0Out > 0n) type = 'buy';
            else if (amount1Out > 0n && amount0In > 0n) type = 'sell';
          }
   
          const price = mtkAmount > 0 ? (usdcAmount / mtkAmount) : 0;
          
          return {
            id: `${log.transactionHash}-${index}`,
            timestamp: timestampMap[log.blockNumber.toString()] || 0n,
            blockNumber: log.blockNumber,
            trader: log.args.sender,
            to: log.args.to,
            usdcAmount,
            mtkAmount,
            price,
            type,
            hash: log.transactionHash,
          };
        });

      setTrades(processedTrades);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to load trade history');
    } finally {
      setLoading(false);
    }
  }, [publicClient, pairAddress, token0]);

  // Set up event watching
  useEffect(() => {
    if (!publicClient || !pairAddress) return;

    let unwatch;
    
    const setupWatcher = async () => {
      try {
        unwatch = publicClient.watchContractEvent({
          address: pairAddress,
          event: SWAP_EVENT_ABI,
          onLogs: (logs) => {
            // Add new trades to the top
            const isUSDC0 = token0?.toLowerCase() === activeContracts.USDC.toLowerCase();
            
              logs.forEach(async (log) => {
                const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                
                const amount0In = log.args.amount0In || 0n;
                const amount1In = log.args.amount1In || 0n;
                const amount0Out = log.args.amount0Out || 0n;
                const amount1Out = log.args.amount1Out || 0n;
                
                // Calculate USDC and MTK amounts based on token0
                let usdcAmount = 0;
                let mtkAmount = 0;
                let type = 'swap';
                
                if (isUSDC0) {
                  // token0 is USDC, token1 is MTK
                  usdcAmount = Number(formatUnits(amount0In + amount0Out, 6));
                  mtkAmount = Number(formatUnits(amount1In + amount1Out, 18));
                  if (amount0In > 0n && amount1Out > 0n) type = 'buy'; // USDC -> MTK
                  else if (amount0Out > 0n && amount1In > 0n) type = 'sell'; // MTK -> USDC
                } else {
                  // token0 is MTK, token1 is USDC
                  usdcAmount = Number(formatUnits(amount1In + amount1Out, 6));
                  mtkAmount = Number(formatUnits(amount0In + amount0Out, 18));
                  if (amount1In > 0n && amount0Out > 0n) type = 'buy';
                  else if (amount1Out > 0n && amount0In > 0n) type = 'sell';
                }
                
                const price = mtkAmount > 0 ? (usdcAmount / mtkAmount) : 0;
                
                const newTrade = {
                  id: `${log.transactionHash}-new`,
                  timestamp: block.timestamp,
                  blockNumber: log.blockNumber,
                  trader: log.args.sender,
                  to: log.args.to,
                  usdcAmount,
                  mtkAmount,
                  price,
                  type,
                  hash: log.transactionHash,
                };
                
                setTrades(prev => [newTrade, ...prev.slice(0, 19)]);
              });
            
            setLastUpdated(new Date());
          },
        });
        
        setIsWatching(true);
      } catch (err) {
        console.error('Error setting up event watcher:', err);
      }
    };
    
    setupWatcher();
    
    return () => {
      if (unwatch) {
        unwatch();
        setIsWatching(false);
      }
    };
  }, [publicClient, pairAddress, token0]);

  // Auto-poll every 30 seconds as backup
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTrades();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchTrades]);

  // Initial fetch
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return (
    <div className="trade-history">
      <div className="trade-history-header">
        <h3>📜 Trade History</h3>
        <div className="trade-history-actions">
          <span className={`status-indicator ${isWatching ? 'live' : ''}`}>
            {isWatching ? '● Live' : '○'}
          </span>
          <button 
            onClick={fetchTrades} 
            className="refresh-btn"
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      
      {lastUpdated && (
        <p className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
      
      {loading && trades.length === 0 ? (
        <div className="loading-state">
          <p>Loading trade history...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={fetchTrades} className="retry-btn">Retry</button>
        </div>
      ) : trades.length === 0 ? (
        <div className="empty-state">
          <p>No trades yet. Be the first to trade!</p>
        </div>
      ) : (
        <>
          <div className="trade-table-wrapper">
            <table className="trade-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Trader</th>
                  <th>USDC</th>
                  <th>MTK</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id}>
                    <td className="time-cell">
                      {formatTime(trade.timestamp)}
                    </td>
                    <td>
                      <span className={`type-badge ${trade.type}`}>
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="address-cell" title={trade.trader}>
                      {formatAddress(trade.trader)}
                    </td>
                    <td className="amount-cell">
                      {trade.usdcAmount.toFixed(2)}
                    </td>
                    <td className="amount-cell">
                      {trade.mtkAmount.toFixed(4)}
                    </td>
                    <td className="price-cell">
                      ${trade.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
