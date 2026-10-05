import { useEffect, useState } from 'react';

function App() {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStory() {
      try {
        const res = await fetch('/api/story');
        const data = await res.json();
        setStory(data);
      } catch (error) {
        console.error('Failed to load story data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStory();
  }, []);

  if (loading) {
    return <div className="loading">Loading incident board...</div>;
  }

  if (!story) {
    return <div className="loading error">Unable to load case data.</div>;
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-overlay" />
        <nav className="topbar">
          <div className="brand-block">
            <span className="brand-mark">NF</span>
            <div>
              <p className="eyebrow">CASE FILE</p>
              <h1>{story.title}</h1>
            </div>
          </div>
          <div className="case-badges">
            <span>{story.caseId}</span>
            <span>{story.organization}</span>
            <span>{story.difficulty}</span>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-copy">
            <p className="kicker">PROJECT {story.subtitle.toUpperCase()}</p>
            <h2>“{story.finalReveal}”</h2>
            <p className="overview">{story.overview}</p>
            <div className="cta-row">
              <a href="#missions" className="primary-btn">Begin Investigation</a>
              <span className="status-pill">System Status: {story.status}</span>
            </div>
          </div>
          <aside className="incident-card">
            <p>Investigation Summary</p>
            <ul>
              <li>Organization: {story.organization}</li>
              <li>Mission count: {story.missionCount}</li>
              <li>Estimated duration: 40–50 minutes</li>
              <li>Case status: {story.status}</li>
            </ul>
          </aside>
        </div>
      </header>

      <main className="content">
        <section className="chain-section">
          <div className="section-heading">
            <p className="eyebrow">CHAIN OF EVENTS</p>
            <h3>One forgotten connection</h3>
          </div>
          <div className="chain-list">
            {story.chain.map((item, index) => (
              <div className="chain-item" key={item}>
                <span className="chain-index">0{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="missions" className="missions-section">
          <div className="section-heading">
            <p className="eyebrow">MISSIONS</p>
            <h3>Reconstruct the breach</h3>
          </div>
          <div className="mission-grid">
            {story.story.map((mission) => (
              <article className="mission-card" key={mission.id}>
                <div className="mission-header">
                  <span className="mission-icon">{mission.icon}</span>
                  <div>
                    <p className="mission-tag">{mission.topic}</p>
                    <h4>{mission.title}</h4>
                  </div>
                </div>
                <p className="mission-summary">{mission.summary}</p>
                <div className="meta-row">
                  <span>{mission.reward}</span>
                  <span>{mission.duration}</span>
                </div>
                <div className="evidence-box">
                  <strong>Evidence</strong>
                  <p>{mission.evidence}</p>
                </div>
                <p className="finding">Finding: {mission.finding}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="timeline-section">
          <div className="section-heading">
            <p className="eyebrow">TIMELINE</p>
            <h3>What happened when</h3>
          </div>
          <div className="timeline">
            {story.timeline.map((entry) => (
              <div className="timeline-item" key={entry.time}>
                <span className="time-stamp">{entry.time}</span>
                <p>{entry.event}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="report-section">
          <div className="section-heading">
            <p className="eyebrow">FINAL REPORT</p>
            <h3>Investigation concluded</h3>
          </div>
          <div className="report-panel">
            <div className="report-grid">
              <div><strong>NF-01</strong><span>SSO configuration accepted stale authentication state</span></div>
              <div><strong>NF-02</strong><span>Container configuration weakened isolation</span></div>
              <div><strong>NF-03</strong><span>Log input could be manipulated, compromising evidence integrity</span></div>
              <div><strong>NF-04</strong><span>Orphaned DNS mapping created a simulated subdomain takeover condition</span></div>
              <div><strong>NF-05</strong><span>Historical CI/CD configuration exposed a synthetic secret</span></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
