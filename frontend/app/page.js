import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <section className="hero">
        <h1>
          DEXplorer
          <br />
          <span>Next-Gen DEX</span>
        </h1>
        <p>
          Trade, earn, and build on the fastest decentralized exchange. 
          Powered by cutting-edge blockchain technology.
        </p>
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
          <div className="feature-icon">⚡</div>
          <h3>Lightning Fast</h3>
          <p>Instant swaps with sub-second transaction finality on the Pasoero network.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Deep Liquidity</h3>
          <p>Access the best trading rates with our sophisticated AMM algorithm.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Battle Tested</h3>
          <p>Audited smart contracts with industry-leading security standards.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💎</div>
          <h3>Yield Farming</h3>
          <p>Maximize your returns with automated liquidity mining rewards.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌐</div>
          <h3>Cross-Chain</h3>
          <p>Seamlessly bridge assets across multiple blockchain networks.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>Low Fees</h3>
          <p>Minimal gas fees and competitive trading fees maximize your profits.</p>
        </div>
      </section>
    </div>
  );
}
