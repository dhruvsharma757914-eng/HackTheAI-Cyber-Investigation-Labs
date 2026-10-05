"use client";

import { useState } from "react";
import { Panel } from "@/components/ui";

interface SecretFinding {
  id: string;
  path: string;
  revision: string;
  line: string;
  severity: "high" | "critical";
  detail: string;
}

const WORKFLOW_HEAD = `name: deploy-orion
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Notify Orion automation
        env:
          ORION_WEBHOOK_TOKEN: \${{ secrets.ORION_WEBHOOK_TOKEN }}
        run: ./scripts/notify-orion.sh`;

const WORKFLOW_HISTORICAL = `name: deploy-orion
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Notify Orion automation
        env:
          ORION_WEBHOOK_TOKEN: TRAINING_ONLY_TOKEN
        run: ./scripts/notify-orion.sh`;

const DEPLOY_ENV_HISTORICAL = `# orion-platform deploy configuration
ORION_GATEWAY=https://orion-console.aurelia-labs.example
ORION_WEBHOOK_URL=https://orion-build-production.aurelia-labs.example/hooks
ORION_WEBHOOK_TOKEN=TRAINING_ONLY_TOKEN
ORION_ENV=production`;

const FINDINGS: SecretFinding[] = [
  {
    id: "s1",
    path: ".github/workflows/deploy.yml",
    revision: "b5c1d8f",
    line: "ORION_WEBHOOK_TOKEN: TRAINING_ONLY_TOKEN",
    severity: "critical",
    detail:
      "The workflow hardcoded the token value in plaintext. Anyone with repository read access could retrieve it from the workflow history.",
  },
  {
    id: "s2",
    path: "config/deploy.env",
    revision: "b5c1d8f",
    line: "ORION_WEBHOOK_TOKEN=TRAINING_ONLY_TOKEN",
    severity: "critical",
    detail:
      "The same value was stored in a configuration file that was later deleted from the branch — but remains recoverable from version history.",
  },
  {
    id: "s3",
    path: ".github/workflows/deploy.yml",
    revision: "HEAD",
    line: "ORION_WEBHOOK_TOKEN: ${{ secrets.ORION_WEBHOOK_TOKEN }}",
    severity: "high",
    detail:
      "The current workflow is correct, but the underlying secret was never rotated after it was exposed in history. The remediation is incomplete.",
  },
  {
    id: "s4",
    path: "scripts/notify-orion.sh",
    revision: "b5c1d8f",
    line: 'curl -H "X-Orion-Token: $ORION_WEBHOOK_TOKEN" ...',
    severity: "high",
    detail:
      "The token is transmitted as a static header with no timestamp or nonce, so a captured value is reusable indefinitely.",
  },
];

const SEV = {
  high: "border-signal-amber/40 bg-signal-amber/10 text-signal-amber",
  critical: "border-signal-red/40 bg-signal-red/10 text-signal-red",
} as const;

export function CicdSecretScanner() {
  const [scanned, setScanned] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function scan() {
    setBusy(true);
    window.setTimeout(() => {
      setScanned(true);
      setBusy(false);
    }, 650);
  }

  const finding = FINDINGS.find((f) => f.id === active);

  return (
    <div className="space-y-4">
      <Panel
        title="orion / orion-platform"
        right={
          <div className="flex items-center gap-2">
            <span className="chip border-void-500 bg-void-800 text-slate-500">
              main @ HEAD
            </span>
            <button
              type="button"
              className="btn-primary !px-3 !py-1.5"
              onClick={scan}
              disabled={busy || scanned}
            >
              {scanned
                ? `${FINDINGS.length} findings`
                : busy
                  ? "Scanning history..."
                  : "Scan secrets across history"}
            </button>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-slate-600">
              Current branch
            </div>
            <ul className="space-y-1 text-[11px] text-slate-500">
              {["README.md", "src/", "tests/", ".github/", ".gitignore"].map(
                (entry) => (
                  <li key={entry} className="flex items-center gap-2">
                    <span className="text-slate-700">·</span>
                    {entry}
                    <span className="ml-auto text-[10px] text-signal-green">
                      clean
                    </span>
                  </li>
                ),
              )}
            </ul>
            <p className="mt-3 text-[10px] leading-relaxed text-slate-600">
              Theo: “The current branch isn't where the problem is.”
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  .github/workflows/deploy.yml @ HEAD
                </span>
                <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
                  SECRET REFERENCE
                </span>
              </div>
              <pre className="code-block max-h-[160px] overflow-auto text-[11px]">
                {WORKFLOW_HEAD.split("\n").map((line, i) => (
                  <div key={i} className="text-slate-400">
                    {line || " "}
                  </div>
                ))}
              </pre>
            </div>

            {scanned && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                    .github/workflows/deploy.yml @ b5c1d8f
                  </span>
                  <span className="chip border-signal-red/40 bg-signal-red/10 text-signal-red">
                    HARDCODED VALUE
                  </span>
                </div>
                <pre className="code-block max-h-[160px] overflow-auto text-[11px]">
                  {WORKFLOW_HISTORICAL.split("\n").map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.includes("TRAINING_ONLY_TOKEN")
                          ? "bg-signal-red/10 text-signal-red"
                          : "text-slate-400"
                      }
                    >
                      {line || " "}
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Panel title="Secret scan results">
          {!scanned ? (
            <p className="text-[11px] leading-relaxed text-slate-600">
              Run the scan to walk every reachable revision of the repository and
              flag credentials that were committed at any point in its history.
            </p>
          ) : (
            <ul className="space-y-2">
              {FINDINGS.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setActive(active === f.id ? null : f.id)}
                    className={`w-full rounded border p-3 text-left transition ${
                      active === f.id
                        ? "border-signal-amber/50 bg-signal-amber/5"
                        : "border-void-600 hover:border-slate-500"
                    }`}
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className={`chip ${SEV[f.severity]}`}>
                        {f.severity.toUpperCase()}
                      </span>
                      <code className="text-[10px] text-slate-500">
                        {f.path}
                      </code>
                      <span className="text-[10px] text-slate-700">
                        @{f.revision}
                      </span>
                    </div>
                    <code className="block break-all text-[11px] text-signal-red">
                      {f.line}
                    </code>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                      {f.detail}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-4">
          {finding?.path === "config/deploy.env" && (
            <Panel
              title="config/deploy.env @ b5c1d8f"
              right={
                <span className="chip border-signal-red/40 bg-signal-red/10 text-signal-red">
                  DELETED FROM MAIN
                </span>
              }
              bodyClassName="p-0"
            >
              <pre className="code-block rounded-none border-0 text-[11px]">
                {DEPLOY_ENV_HISTORICAL.split("\n").map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.startsWith("ORION_WEBHOOK_TOKEN")
                        ? "text-signal-red"
                        : line.startsWith("#")
                          ? "text-slate-600"
                          : "text-slate-300"
                    }
                  >
                    {line || " "}
                  </div>
                ))}
              </pre>
            </Panel>
          )}

          {scanned && (
            <Panel
              title="Removal commit diff"
              right={
                <span className="chip border-signal-green/40 bg-signal-green/10 text-signal-green">
                  INCOMPLETE FIX
                </span>
              }
              bodyClassName="p-0"
            >
              <pre className="code-block rounded-none border-0 text-[11px]">
                {[
                  "@@ -12,1 +12,1 @@",
                  "-          ORION_WEBHOOK_TOKEN: TRAINING_ONLY_TOKEN",
                  "+          ORION_WEBHOOK_TOKEN: ${{ secrets.ORION_WEBHOOK_TOKEN }}",
                  "@@ -1,4 +0,0 @@ (config/deploy.env)",
                  "-ORION_WEBHOOK_TOKEN=TRAINING_ONLY_TOKEN",
                ].map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.startsWith("+")
                        ? "text-signal-green"
                        : line.startsWith("-")
                          ? "text-signal-red"
                          : "text-signal-cyan"
                    }
                  >
                    {line}
                  </div>
                ))}
              </pre>
              <p className="border-t border-void-600 px-4 py-3 text-[11px] leading-relaxed text-slate-500">
                The file was removed and the workflow modernised — but the exposed
                value was never rotated, and history still serves it.
              </p>
            </Panel>
          )}
        </div>
      </div>

      {scanned && (
        <Panel title="Remediation">
          <ul className="space-y-2 text-[11px]">
            {[
              "Rotate ORION_WEBHOOK_TOKEN immediately — assume the committed value is compromised.",
              "Purge the credential from history with git filter-repo or BFG, then force-push and re-clone.",
              "Enable secret scanning in the repository and as a pre-commit hook.",
              "Scope the pipeline token to the minimum required and shorten its lifetime.",
              "Add timestamp + nonce validation on the automation endpoint so a captured header cannot be replayed.",
            ].map((item) => (
              <li key={item} className="flex gap-3 rounded border border-void-600 p-3">
                <span className="text-signal-green">✓</span>
                <span className="text-slate-400">{item}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
