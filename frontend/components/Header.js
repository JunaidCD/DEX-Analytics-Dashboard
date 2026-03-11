'use client';

import { useAccount, useConnect, useDisconnect, useBalance, useConnectors } from 'wagmi';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getChainName = (id) => {
    switch (id) {
      case 1:
        return 'Ethereum';
      case 11155111:
        return 'Sepolia';
      case 10000:
        return 'Pasoero';
      case 420420417:
        return 'Polkadot Hub';
      default:
        return `Chain ${id}`;
    }
  };

  const handleConnect = async () => {
    try {
      // Find the injected connector (MetaMask)
      const connector = connectors.find(c => c.type === 'injected');
      
      if (connector) {
        await connect({ connector });
      } else {
        // Fallback: try the first available connector
        if (connectors.length > 0) {
          await connect({ connector: connectors[0] });
        } else {
          alert('No wallet connector found. Please install MetaMask.');
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect wallet: ' + error.message);
    }
  };

  if (!mounted) {
    return (
      <header className="header">
        <div className="header-container">
          <Link href="/" className="logo">
            DEXplorer
          </Link>
          <nav className="nav">
            <Link href="/swap" className="nav-link">Swap</Link>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo">
          DEXplorer
        </Link>
        <nav className="nav">
          <Link href="/swap" className="nav-link">Swap</Link>
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
        </nav>
        <div className="wallet-section">
          {isConnected ? (
            <div className="wallet-info">
              <span className="chain-badge">{getChainName(chainId)}</span>
              <span className="balance">
                {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '...'}
              </span>
              <button onClick={() => disconnect()} className="disconnect-btn">
                {formatAddress(address)}
              </button>
            </div>
          ) : (
            <button onClick={handleConnect} className="connect-btn">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
