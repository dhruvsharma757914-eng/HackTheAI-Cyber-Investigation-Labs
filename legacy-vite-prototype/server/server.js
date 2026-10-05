import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const storyData = {
  title: 'Operation Black Relay',
  subtitle: 'Project Nightfall',
  caseId: 'NF-219',
  organization: 'Aurelia Systems',
  missionCount: 5,
  difficulty: 'Medium',
  status: 'Contained',
  overview:
    'A seemingly unrelated chain of identity misuse, container escape, log manipulation, orphaned DNS, and CI/CD secret exposure formed one hidden attack path. The investigation retraces the forgotten trust that survived after infrastructure was removed.',
  story: [
    {
      id: 'mission-01',
      title: 'Identity That Should Not Work',
      icon: '🔐',
      topic: 'SSO Misconfiguration & Authentication Abuse',
      reward: '+100 XP',
      duration: '8 minutes',
      summary:
        'A disabled deployment identity continued authenticating because a stale authentication assertion was still accepted by Orion Deployment Console.',
      evidence: 'Disabled identity → previously trusted assertion → accepted authentication',
      finding: 'SSO configuration accepted stale authentication state.'
    },
    {
      id: 'mission-02',
      title: 'Container That Opened the Wrong Door',
      icon: '🐳',
      topic: 'Container Escape Fundamentals',
      reward: '+150 XP',
      duration: '8–10 minutes',
      summary:
        'orion-worker-17 was over-privileged and demonstrated dangerous host interaction at the runtime boundary.',
      evidence: 'Excessive privilege → host interaction → runtime logs',
      finding: 'Container configuration weakened isolation.'
    },
    {
      id: 'mission-03',
      title: 'The Logs That Changed Their Story',
      icon: '📜',
      topic: 'Log Poisoning & Evidence Manipulation',
      reward: '+200 XP',
      duration: '8–10 minutes',
      summary:
        'Altered log timestamps and injected content distorted the timeline and pointed to a previously forgotten hostname.',
      evidence: 'Authentication → container → manipulated logs → legacy hostname',
      finding: 'Log input could be manipulated, compromising evidence integrity.'
    },
    {
      id: 'mission-04',
      title: 'The Subdomain That Belonged to Nobody',
      icon: '🌐',
      topic: 'Subdomain Takeover Simulation',
      reward: '+250 XP',
      duration: '8–10 minutes',
      summary:
        'An orphaned DNS record still pointed to an abandoned external service that connected directly to the build environment.',
      evidence: 'DNS record → orphaned service → legacy console → CI/CD integration',
      finding: 'Orphaned DNS mapping created a simulated subdomain takeover condition.'
    },
    {
      id: 'mission-05',
      title: 'The Secret Inside the Pipeline',
      icon: '⚙️',
      topic: 'CI/CD Pipeline Secret Exposure',
      reward: '+300 XP',
      duration: '8–10 minutes',
      summary:
        'A historical CI/CD configuration carried a leaked webhook token that remained available through version history.',
      evidence: 'Historical secret → automation chain → full system compromise path',
      finding: 'Historical CI/CD configuration exposed a synthetic secret.'
    }
  ],
  chain: [
    'SSO trust remained after the identity was disabled',
    'Container isolation failed at the host boundary',
    'Logs were manipulated to hide the real sequence',
    'An abandoned DNS record led to the legacy console',
    'A historical secret reopened the deployment path'
  ],
  finalReveal:
    'The breach did not hide inside one system. It survived in the connections between them. Security boundaries are only effective when identity, infrastructure, evidence, naming, and deployment systems are managed consistently.',
  timeline: [
    { time: '03:14 AM', event: 'SSO authentication alert for svc-deploy-orion triggers incident response.' },
    { time: '03:12 AM', event: 'orion-worker-17 shows unexpected host-level interaction.' },
    { time: '03:11 AM', event: 'Authentication logs are altered to distort the timeline.' },
    { time: '03:15 AM', event: 'legacy-console.aurelia-labs.example surfaces in manipulated evidence.' },
    { time: '04:07 AM', event: 'Investigation concludes: the chain was reconstructed and contained.' }
  ]
};

app.use(cors());
app.use(express.json());

app.get('/api/story', (_, res) => {
  res.json(storyData);
});

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', service: 'operation-black-relay' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));
  app.get('*', (_, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Operation Black Relay server listening on http://localhost:${port}`);
});
