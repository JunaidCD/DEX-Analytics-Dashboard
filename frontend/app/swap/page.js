'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseUnits, formatUnits, formatEther, parseEther } from 'viem';
import { getChainContracts } from '../../config/wagmi';
import { ERC20_ABI, ROUTER_ABI, PAIR_ABI, FACTORY_ABI } from '../../config/abis';

export default function SwapPage() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);
  
  // Get contracts for current chain
  const CONTRACTS = useMemo(() => {
    return getChainContracts(chainId);
  }, [chainId]);

  // Token list - update addresses after deployment
  const TOKENS = useMemo(() => [
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      decimals: 6, 
      address: CONTRACTS.USDC,
      logo: '💵'
    },
    { 
      symbol: 'MTK', 
      name: 'Mock Token', 
      decimals: 18, 
      address: CONTRACTS.MTK,
      logo: '🪙'
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      decimals: 18, 
      address: '0x0000000000000000000000000000000000000000',
      logo: 'Ξ'
    },
  ], [CONTRACTS]);

  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showFromSelect, setShowFromSelect] = useState(false);
  const [showToSelect, setShowToSelect] = useState(false);
  const [toast, setToast] = useState(null);
  const [priceImpact, setPriceImpact] = useState(0);

  // Get router address
  const routerAddress = CONTRACTS.router;

  // Fix hydration - only render client-specific content after mount
  useEffect(() => {
    setMounted(true);
  }, []);
   
  // Calculate minimum output with slippage
  const minOutput = useMemo(() => {
    if (!toAmount) return 0n;
    const amount = parseUnits(toAmount || '0', toToken.decimals);
    const slippageBps = BigInt(Math.floor(slippage * 100));
    return (amount * (10000n - slippageBps)) / 10000n;
  }, [toAmount, slippage, toToken.decimals]);

  // Read token balances
  const { data: fromBalance, refetch: refetchFromBalance } = useReadContract({
    address: fromToken.address === '0x0000000000000000000000000000000000000000' ? undefined : fromToken.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && address && fromToken.address !== '0x0000000000000000000000000000000000000000',
    }
  });

  const { data: toBalance, refetch: refetchToBalance } = useReadContract({
    address: toToken.address === '0x0000000000000000000000000000000000000000' ? undefined : toToken.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && address && toToken.address !== '0x0000000000000000000000000000000000000000',
    }
  });

  // Get pair address
  const { data: pairAddress } = useReadContract({
    address: CONTRACTS.factory,
    abi: FACTORY_ABI,
    functionName: 'getPair',
    args: [fromToken.address, toToken.address].sort(),
    query: {
      enabled: fromToken.address !== toToken.address && fromToken.address !== '0x0000000000000000000000000000000000000000' && toToken.address !== '0x0000000000000000000000000000000000000000',
    }
  });

  // Read reserves
  const { data: reserves } = useReadContract({
    address: pairAddress,
    abi: PAIR_ABI,
    functionName: 'getReserves',
    query: {
      enabled: !!pairAddress,
    }
  });

  // Get token0 from pair
  const { data: token0 } = useReadContract({
    address: pairAddress,
    abi: PAIR_ABI,
    functionName: 'token0',
    query: {
      enabled: !!pairAddress,
    }
  });

  // Calculate estimated output based on reserves
  useEffect(() => {
    if (!fromAmount || !reserves || !token0) {
      setToAmount('');
      setPriceImpact(0);
      return;
    }

    const amountIn = parseUnits(fromAmount, fromToken.decimals);
    if (amountIn <= 0n) {
      setToAmount('');
      setPriceImpact(0);
      return;
    }

    // Determine reserves based on token order
    const isFromToken0 = fromToken.address.toLowerCase() === token0.toLowerCase();
    const reserveIn = isFromToken0 ? reserves[0] : reserves[1];
    const reserveOut = isFromToken0 ? reserves[1] : reserves[0];

    if (reserveIn <= 0n || reserveOut <= 0n) {
      setToAmount('');
      return;
    }

    // Calculate output using AMM formula: amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
    const amountInWithFee = amountIn * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;
    const amountOut = numerator / denominator;

    // Calculate price impact
    const spotPriceNum = Number(formatUnits((reserveOut * parseUnits('1', fromToken.decimals)) / reserveIn, fromToken.decimals));
    const actualPriceNum = Number(formatUnits((amountOut * parseUnits('1', fromToken.decimals)) / amountIn, fromToken.decimals));
    const impact = ((spotPriceNum - actualPriceNum) / spotPriceNum) * 100;
    setPriceImpact(impact);

    setToAmount(formatUnits(amountOut, toToken.decimals));
  }, [fromAmount, reserves, token0, fromToken, toToken.decimals]);

  // Check and set allowance for token
  const { data: allowance } = useReadContract({
    address: fromToken.address === '0x0000000000000000000000000000000000000000' ? undefined : fromToken.address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && routerAddress ? [address, routerAddress] : undefined,
    query: {
      enabled: isConnected && address && routerAddress && fromToken.address !== '0x0000000000000000000000000000000000000000',
    }
  });

  // Approve token
  const { data: approveData, writeContract: writeApprove } = useWriteContract();
   
  const { isLoading: isApproveLoading, isConfirmed: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveData,
  });

  // Swap tokens
  const { data: swapData, writeContract: writeSwap } = useWriteContract();
   
  const { isLoading: isSwapLoading, isConfirmed: isSwapConfirmed } = useWaitForTransactionReceipt({
    hash: swapData,
  });

  // Handle approval
  const handleApprove = async () => {
    if (!fromToken.address || fromToken.address === '0x0000000000000000000000000000000000000000') return;
    
    try {
      writeApprove({
        address: fromToken.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [routerAddress, parseUnits(fromAmount || '999999999', fromToken.decimals)],
      });
    } catch (error) {
      showToast('Approval failed: ' + error.message, 'error');
    }
  };

  // Handle swap
  const handleSwap = async () => {
    if (!fromAmount || !toAmount) return;
    if (!pairAddress) {
      showToast('Trading pair does not exist. Please create liquidity first.', 'error');
      return;
    }
    if (routerAddress === '0x0000000000000000000000000000000000000000') {
      showToast('Router contract not deployed on this network.', 'error');
      return;
    }
    
    try {
      const amountIn = parseUnits(fromAmount, fromToken.decimals);
      const path = [fromToken.address, toToken.address];
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour

      writeSwap({
        address: routerAddress,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [amountIn, minOutput, path, address, deadline],
        value: 0n,
        gas: BigInt(500000),
      });
    } catch (error) {
      showToast('Swap failed: ' + error.message, 'error');
    }
  };

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Handle transaction confirmations
  useEffect(() => {
    if (isApproveConfirmed) {
      showToast('Token approved successfully!', 'success');
      refetchFromBalance();
    }
  }, [isApproveConfirmed]);

  useEffect(() => {
    if (isSwapConfirmed) {
      showToast('Swap completed successfully!', 'success');
      refetchFromBalance();
      refetchToBalance();
      setFromAmount('');
      setToAmount('');
    }
  }, [isSwapConfirmed]);

  // Check if approval is needed
  const needsApproval = useMemo(() => {
    if (fromToken.address === '0x0000000000000000000000000000000000000000') return false;
    if (!fromAmount) return false;
    const amountIn = parseUnits(fromAmount, fromToken.decimals);
    return !allowance || allowance < amountIn;
  }, [allowance, fromAmount, fromToken.decimals, fromToken.address]);

  const formatBalance = (balance, decimals) => {
    if (!balance) return '0.00';
    return formatUnits(balance, decimals);
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount('');
    setToAmount('');
  };

  return (
    <div className="swap-container">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
      
      <div className="swap-card">
        <div className="swap-header">
          <h2>Swap</h2>
          <div className="slippage-setting">
            <span>Slippage: </span>
            <input 
              type="number" 
              value={slippage} 
              onChange={(e) => setSlippage(Number(e.target.value))}
              step="0.1"
              min="0"
              max="50"
            />
            <span>%</span>
          </div>
        </div>

        {/* From Token Input */}
        <div className="token-input">
          <button className="token-select" onClick={() => setShowFromSelect(!showFromSelect)}>
            <span className="token-logo">{fromToken.logo}</span>
            <span>{fromToken.symbol}</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          <input
            type="number"
            className="token-amount"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
          />
        </div>
        
        {showFromSelect && (
          <div className="token-list">
            {TOKENS.filter(t => t.address !== toToken.address).map(token => (
              <button 
                key={token.symbol} 
                className="token-option"
                onClick={() => {
                  setFromToken(token);
                  setShowFromSelect(false);
                  setFromAmount('');
                  setToAmount('');
                }}
              >
                <span className="token-logo">{token.logo}</span>
                <div className="token-info">
                  <span className="token-symbol">{token.symbol}</span>
                  <span className="token-name">{token.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="swap-arrow">
          <button className="swap-arrow-btn" onClick={switchTokens}>
            ↓
          </button>
        </div>

        {/* To Token Input */}
        <div className="token-input">
          <button className="token-select" onClick={() => setShowToSelect(!showToSelect)}>
            <span className="token-logo">{toToken.logo}</span>
            <span>{toToken.symbol}</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          <input
            type="number"
            className="token-amount"
            placeholder="0.0"
            value={toAmount}
            readOnly
          />
        </div>

        {showToSelect && (
          <div className="token-list">
            {TOKENS.filter(t => t.address !== fromToken.address).map(token => (
              <button 
                key={token.symbol} 
                className="token-option"
                onClick={() => {
                  setToToken(token);
                  setShowToSelect(false);
                  setFromAmount('');
                  setToAmount('');
                }}
              >
                <span className="token-logo">{token.logo}</span>
                <div className="token-info">
                  <span className="token-symbol">{token.symbol}</span>
                  <span className="token-name">{token.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Swap Details */}
        <div className="swap-details">
          <div className="swap-rate">
            <span>Rate</span>
            <span>
              1 {fromToken.symbol} = {toAmount && fromAmount ? (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6) : '0'} {toToken.symbol}
            </span>
          </div>
          <div className="swap-rate">
            <span>Price Impact</span>
            <span className={priceImpact > 5 ? 'text-error' : priceImpact > 1 ? 'text-warning' : 'text-success'}>
              {priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="swap-rate">
            <span>Slippage Tolerance</span>
            <span>{slippage}%</span>
          </div>
          <div className="swap-rate">
            <span>Min. Received</span>
            <span>{formatUnits(minOutput, toToken.decimals)} {toToken.symbol}</span>
          </div>
        </div>

        {/* Balance Display */}
        {mounted && isConnected && (
          <div className="balance-display">
            <span>{fromToken.symbol} Balance: {formatBalance(fromBalance, fromToken.decimals)}</span>
          </div>
        )}

        {/* Action Button */}
        {!mounted ? (
          <button className="swap-submit" disabled>
            Loading...
          </button>
        ) : !isConnected ? (
          <button className="swap-submit" disabled>
            Connect Wallet
          </button>
        ) : needsApproval ? (
          <button 
            className="swap-submit approve-btn" 
            onClick={handleApprove}
            disabled={isApproveLoading}
          >
            {isApproveLoading ? 'Approving...' : `Approve ${fromToken.symbol}`}
          </button>
        ) : (
          <button 
            className="swap-submit" 
            onClick={handleSwap}
            disabled={!fromAmount || !toAmount || isSwapLoading || priceImpact > 20 || !pairAddress}
          >
            {isSwapLoading ? 'Swapping...' : priceImpact > 20 ? 'Price Impact Too High' : !pairAddress ? 'Create Pair First' : 'Swap'}
          </button>
        )}

        {priceImpact > 5 && priceImpact <= 20 && (
          <div className="warning-message">
            ⚠️ High price impact! You may lose more than {priceImpact.toFixed(1)}% due to slippage.
          </div>
        )}
      </div>
    </div>
  );
}
