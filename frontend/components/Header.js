'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect({
    connector: injected(),
  });
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
      default:
        return `Chain ${id}`;
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
            <button onClick={() => connect()} className="connect-btn">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
