import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <section className="hero">
        <h1>DEXplorer</h1>
        <p>Advanced Decentralized Exchange on Pasoero Network</p>
        <div className="cta-buttons">
          <Link href="/swap" className="cta-primary">
            Start Trading
          </Link>
          <Link href="/dashboard" className="cta-secondary">
            View Dashboard
          </Link>
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🔄</div>
          <h3>Instant Swaps</h3>
          <p>Trade tokens instantly with low slippage and minimal fees using our advanced AMM.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Real-time Analytics</h3>
          <p>Track market trends, volume, and liquidity with comprehensive charts and data.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💎</div>
          <h3>Liquidity Mining</h3>
          <p>Earn rewards by providing liquidity to your favorite trading pairs.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Secure & Audited</h3>
          <p>Built with security-first approach and thoroughly tested smart contracts.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌐</div>
          <h3>Multi-chain</h3>
          <p>Cross-chain swapping capabilities coming soon to connect different networks.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Fast Execution</h3>
          <p>Built on Pasoero for lightning-fast transaction finality and low gas fees.</p>
        </div>
      </section>
    </div>
  );
}
